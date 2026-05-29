import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from '../entities/employee.entity';
import { SalaryHistory } from '../entities/salary-history.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: Repository<Employee>;
  let salaryHistoryRepository: Repository<SalaryHistory>;
  let auditQueue: any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockEmployeeRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSalaryHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_id' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(SalaryHistory),
          useValue: mockSalaryHistoryRepository,
        },
        {
          provide: getQueueToken('audit'),
          useValue: mockAuditQueue,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    salaryHistoryRepository = module.get<Repository<SalaryHistory>>(getRepositoryToken(SalaryHistory));
    auditQueue = module.get(getQueueToken('audit'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated employees list', async () => {
      const mockEmployees = [{ id: 1, full_name: 'John Doe', addedBy: { id: 1, password: 'pw' } }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([{ id: 1, full_name: 'John Doe', addedBy: { id: 1 } }]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should filter by status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ status: 'active' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.status = :status', { status: 'active' });
    });

    it('should filter by country_id', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ country_id: 5 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.country_id = :country_id', { country_id: 5 });
    });

    it('should search by full_name', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ search: 'John' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(employee.full_name LIKE :search OR employee.email LIKE :search)',
        { search: '%John%' }
      );
    });

    it('should sort by salary DESC', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ sortBy: 'salary', order: 'DESC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('employee.salary', 'DESC');
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      const mockEmployee = { id: 1, full_name: 'John Doe', addedBy: { id: 1, password: 'pw' } };
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1, full_name: 'John Doe', addedBy: { id: 1 } });
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          jobTitle: true,
          country: true,
          state: true,
          department: true,
          addedBy: true,
        },
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const currentUser = { id: 2, role: 'manager' };
    const createDto = {
      full_name: 'Alice',
      email: 'alice@salary.com',
      job_title_id: 1,
      country_id: 1,
      department_id: 1,
      salary: 50000,
      joining_date: '2026-01-01',
    };

    it('should create employee with added_by from currentUser', async () => {
      const mockCreated = { ...createDto, joining_date: new Date('2026-01-01'), added_by: 2, status: 'active' };
      mockEmployeeRepository.create.mockReturnValue(mockCreated);
      mockEmployeeRepository.save.mockResolvedValue({ id: 5, ...mockCreated });
      mockEmployeeRepository.findOne.mockResolvedValue({ id: 5, ...mockCreated });

      const result = await service.create(createDto, currentUser);

      expect(result.id).toBe(5);
      expect(mockEmployeeRepository.create).toHaveBeenCalledWith({
        ...createDto,
        joining_date: new Date('2026-01-01'),
        added_by: currentUser.id,
        status: 'active',
      });
    });

    it('should dispatch audit log to BullMQ queue', async () => {
      const mockCreated = { id: 5, ...createDto, joining_date: new Date('2026-01-01'), added_by: 2, status: 'active' };
      mockEmployeeRepository.create.mockReturnValue(mockCreated);
      mockEmployeeRepository.save.mockResolvedValue(mockCreated);
      mockEmployeeRepository.findOne.mockResolvedValue(mockCreated);

      await service.create(createDto, currentUser, '127.0.0.1');

      expect(mockAuditQueue.add).toHaveBeenCalledWith({
        hr_id: currentUser.id,
        action: 'CREATE',
        entity: 'employee',
        entity_id: 5,
        old_data: null,
        new_data: mockCreated,
        ip_address: '127.0.0.1',
      });
    });
  });

  describe('update', () => {
    const currentUser = { id: 2 };
    const existingEmployee = { id: 5, full_name: 'Alice', salary: 50000, joining_date: new Date('2026-01-01'), status: 'active' };
    const updateDto = { salary: 60000 };

    it('should update employee fields', async () => {
      mockEmployeeRepository.findOne
        .mockResolvedValueOnce(existingEmployee)
        .mockResolvedValueOnce({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.create.mockReturnValue({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.save.mockResolvedValue({ ...existingEmployee, ...updateDto });

      const result = await service.update(5, updateDto, currentUser);

      expect(result.salary).toBe(60000);
      expect(mockEmployeeRepository.save).toHaveBeenCalled();
    });

    it('should save salary history when salary changes', async () => {
      mockEmployeeRepository.findOne
        .mockResolvedValueOnce(existingEmployee)
        .mockResolvedValueOnce({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.create.mockReturnValue({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.save.mockResolvedValue({ ...existingEmployee, ...updateDto });

      mockSalaryHistoryRepository.create.mockReturnValue({ employee_id: 5, old_salary: 50000, new_salary: 60000, changed_by: 2 });

      await service.update(5, updateDto, currentUser);

      expect(mockSalaryHistoryRepository.create).toHaveBeenCalledWith({
        employee_id: 5,
        old_salary: 50000,
        new_salary: 60000,
        changed_by: 2,
      });
      expect(mockSalaryHistoryRepository.save).toHaveBeenCalled();
    });

    it('should dispatch audit log to BullMQ queue', async () => {
      mockEmployeeRepository.findOne
        .mockResolvedValueOnce(existingEmployee)
        .mockResolvedValueOnce({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.create.mockReturnValue({ ...existingEmployee, ...updateDto });
      mockEmployeeRepository.save.mockResolvedValue({ ...existingEmployee, ...updateDto });

      await service.update(5, updateDto, currentUser, '192.168.1.1');

      expect(mockAuditQueue.add).toHaveBeenCalledWith({
        hr_id: currentUser.id,
        action: 'UPDATE',
        entity: 'employee',
        entity_id: 5,
        old_data: existingEmployee,
        new_data: { ...existingEmployee, ...updateDto },
        ip_address: '192.168.1.1',
      });
    });
  });

  describe('remove', () => {
    const currentUser = { id: 2 };
    const existingEmployee = { id: 5, full_name: 'Alice', salary: 50000, status: 'active' };

    it('should soft delete employee by setting status inactive', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.save.mockResolvedValue({ ...existingEmployee, status: 'inactive' });

      const result = await service.remove(5, currentUser);

      expect(result.message).toBe('Employee deleted successfully');
      expect(existingEmployee.status).toBe('inactive');
      expect(mockEmployeeRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'inactive' }));
    });

    it('should dispatch audit log to BullMQ queue', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue({ ...existingEmployee });
      mockEmployeeRepository.save.mockResolvedValue({ ...existingEmployee, status: 'inactive' });

      await service.remove(5, currentUser, '10.0.0.1');

      expect(mockAuditQueue.add).toHaveBeenCalledWith(expect.objectContaining({
        hr_id: currentUser.id,
        action: 'DELETE',
        entity: 'employee',
        entity_id: 5,
        ip_address: '10.0.0.1',
      }));
    });
  });
});
