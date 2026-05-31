import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { Employee } from '../entities/employee.entity';
import { SalaryHistory } from '../entities/salary-history.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(SalaryHistory)
    private readonly salaryHistoryRepository: Repository<SalaryHistory>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(JobTitle)
    private readonly jobTitleRepository: Repository<JobTitle>,
    @InjectQueue('audit')
    private readonly auditQueue: Bull.Queue,
  ) {}

  async findAll(queryDto: EmployeeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      order = 'DESC',
      status,
      country_id,
      department_id,
      job_title_id,
      min_salary,
      max_salary,
    } = queryDto;

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    // Relations
    queryBuilder
      .leftJoinAndSelect('employee.jobTitle', 'jobTitle')
      .leftJoinAndSelect('employee.country', 'country')
      .leftJoinAndSelect('employee.state', 'state')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.addedBy', 'addedBy');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(employee.full_name LIKE :search OR employee.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filters
    if (status) {
      queryBuilder.andWhere('employee.status = :status', { status });
    }
    if (country_id) {
      queryBuilder.andWhere('employee.country_id = :country_id', { country_id });
    }
    if (department_id) {
      queryBuilder.andWhere('employee.department_id = :department_id', { department_id });
    }
    if (job_title_id) {
      queryBuilder.andWhere('employee.job_title_id = :job_title_id', { job_title_id });
    }

    // Salary Range
    if (min_salary !== undefined && min_salary !== null) {
      queryBuilder.andWhere('employee.salary >= :min_salary', { min_salary });
    }
    if (max_salary !== undefined && max_salary !== null) {
      queryBuilder.andWhere('employee.salary <= :max_salary', { max_salary });
    }

    // Sorting
    const allowedSortFields = [
      'id', 'full_name', 'email', 'phone', 'salary', 'joining_date', 'status', 'created_at', 'updated_at'
    ];
    const sortField = allowedSortFields.includes(sortBy) ? `employee.${sortBy}` : 'employee.created_at';
    queryBuilder.orderBy(sortField, order);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Strip password fields from HRManager relations
    data.forEach(emp => {
      if (emp.addedBy) {
        delete (emp.addedBy as any).password;
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: {
        jobTitle: true,
        country: true,
        state: true,
        department: true,
        addedBy: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (employee.addedBy) {
      delete (employee.addedBy as any).password;
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto, currentUser: any, ip?: string) {
    const existing = await this.employeeRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`Employee with email ${dto.email} already exists`);
    }

    const employee = this.employeeRepository.create({
      ...dto,
      joining_date: new Date(dto.joining_date),
      added_by: currentUser.id,
      status: dto.status || 'active',
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    await this.auditQueue.add({
      hr_id: currentUser.id,
      action: 'CREATE',
      entity: 'employee',
      entity_id: savedEmployee.id,
      old_data: null,
      new_data: savedEmployee,
      ip_address: ip || null,
    });

    return this.findOne(savedEmployee.id);
  }

  async update(id: number, dto: UpdateEmployeeDto, currentUser: any, ip?: string) {
    const existingEmployee = await this.findOne(id); // Throws NotFoundException if not found

    if (dto.email && dto.email !== existingEmployee.email) {
      const existing = await this.employeeRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException(`Employee with email ${dto.email} already exists`);
      }
    }

    // If salary changed, save to salary history
    if (dto.salary !== undefined && Number(dto.salary) !== Number(existingEmployee.salary)) {
      const salaryHistory = this.salaryHistoryRepository.create({
        employee_id: id,
        old_salary: existingEmployee.salary,
        new_salary: dto.salary,
        changed_by: currentUser.id,
      });
      await this.salaryHistoryRepository.save(salaryHistory);
    }

    const updatedEmployee = this.employeeRepository.create({
      ...existingEmployee,
      ...dto,
      joining_date: dto.joining_date ? new Date(dto.joining_date) : existingEmployee.joining_date,
      updated_by: currentUser.id,
    });

    const savedEmployee = await this.employeeRepository.save(updatedEmployee);

    await this.auditQueue.add({
      hr_id: currentUser.id,
      action: 'UPDATE',
      entity: 'employee',
      entity_id: id,
      old_data: existingEmployee,
      new_data: savedEmployee,
      ip_address: ip || null,
    });

    return this.findOne(id);
  }

  async remove(id: number, currentUser: any, ip?: string) {
    const employee = await this.findOne(id); // Throws NotFoundException if not found
    const oldData = { ...employee };

    employee.status = 'inactive';
    employee.updated_by = currentUser.id;
    const savedEmployee = await this.employeeRepository.save(employee);

    await this.auditQueue.add({
      hr_id: currentUser.id,
      action: 'DELETE',
      entity: 'employee',
      entity_id: id,
      old_data: oldData,
      new_data: savedEmployee,
      ip_address: ip || null,
    });

    return { message: 'Employee deleted successfully' };
  }

  async getCountries() {
    return this.countryRepository.find({ order: { country: 'ASC' } });
  }

  async getStates(countryId: number) {
    return this.stateRepository.find({
      where: { countryId },
      order: { state: 'ASC' },
    });
  }

  async getDepartments() {
    return this.departmentRepository.find({ order: { name: 'ASC' } });
  }

  async getJobTitles() {
    return this.jobTitleRepository.find({ order: { title: 'ASC' } });
  }

  async getSalaryHistory(employeeId: number) {
    const history = await this.salaryHistoryRepository.find({
      where: { employee_id: employeeId },
      relations: { changedBy: true },
      order: { changed_at: 'DESC' },
    });
    history.forEach((h) => {
      if (h.changedBy) {
        delete (h.changedBy as any).password;
      }
    });
    return history;
  }
}
