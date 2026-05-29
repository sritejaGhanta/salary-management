import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async getSalaryStatsByCountry(countryId?: number) {
    const qb = this.employeeRepository.createQueryBuilder('e')
      .innerJoin('e.country', 'c')
      .select('c.country', 'country')
      .addSelect('MIN(e.salary)', 'min_salary')
      .addSelect('MAX(e.salary)', 'max_salary')
      .addSelect('AVG(e.salary)', 'avg_salary')
      .addSelect('COUNT(e.id)', 'employee_count')
      .where("e.status = 'active'");

    if (countryId) {
      qb.andWhere('e.country_id = :countryId', { countryId });
    }

    qb.groupBy('e.country_id').addGroupBy('c.country');

    const results = await qb.getRawMany();
    return results.map(row => ({
      country: row.country,
      min_salary: parseFloat(row.min_salary || '0'),
      max_salary: parseFloat(row.max_salary || '0'),
      avg_salary: parseFloat(row.avg_salary || '0'),
      employee_count: parseInt(row.employee_count || '0', 10),
    }));
  }

  async getSalaryStatsByJobTitle(jobTitleId?: number, countryId?: number) {
    const qb = this.employeeRepository.createQueryBuilder('e')
      .innerJoin('e.jobTitle', 'jt')
      .innerJoin('e.country', 'c')
      .select('jt.title', 'job_title')
      .addSelect('c.country', 'country')
      .addSelect('AVG(e.salary)', 'avg_salary')
      .addSelect('COUNT(e.id)', 'employee_count')
      .where("e.status = 'active'");

    if (jobTitleId) {
      qb.andWhere('e.job_title_id = :jobTitleId', { jobTitleId });
    }
    if (countryId) {
      qb.andWhere('e.country_id = :countryId', { countryId });
    }

    qb.groupBy('e.job_title_id').addGroupBy('e.country_id').addGroupBy('jt.title').addGroupBy('c.country');

    const results = await qb.getRawMany();
    return results.map(row => ({
      job_title: row.job_title,
      country: row.country,
      avg_salary: parseFloat(row.avg_salary || '0'),
      employee_count: parseInt(row.employee_count || '0', 10),
    }));
  }

  async getSalaryStatsByDepartment() {
    const results = await this.employeeRepository.createQueryBuilder('e')
      .innerJoin('e.department', 'd')
      .select('d.name', 'department')
      .addSelect('AVG(e.salary)', 'avg_salary')
      .addSelect('MIN(e.salary)', 'min_salary')
      .addSelect('MAX(e.salary)', 'max_salary')
      .addSelect('COUNT(e.id)', 'employee_count')
      .where("e.status = 'active'")
      .groupBy('e.department_id')
      .addGroupBy('d.name')
      .getRawMany();

    return results.map(row => ({
      department: row.department,
      avg_salary: parseFloat(row.avg_salary || '0'),
      min_salary: parseFloat(row.min_salary || '0'),
      max_salary: parseFloat(row.max_salary || '0'),
      employee_count: parseInt(row.employee_count || '0', 10),
    }));
  }

  async getTopPaidEmployees(countryId?: number, limit: number = 10) {
    const qb = this.employeeRepository.createQueryBuilder('e')
      .leftJoinAndSelect('e.jobTitle', 'jobTitle')
      .leftJoinAndSelect('e.country', 'country')
      .leftJoinAndSelect('e.department', 'department')
      .where("e.status = 'active'");

    if (countryId) {
      qb.andWhere('e.country_id = :countryId', { countryId });
    }

    qb.orderBy('e.salary', 'DESC')
      .take(limit);

    const employees = await qb.getMany();
    return employees.map(emp => ({
      id: emp.id,
      full_name: emp.full_name,
      email: emp.email,
      salary: parseFloat(emp.salary as any),
      currency: emp.currency,
      job_title: emp.jobTitle?.title || null,
      country: emp.country?.country || null,
      department: emp.department?.name || null,
    }));
  }

  async getDashboardStats() {
    const statusCounts = await this.employeeRepository.createQueryBuilder('e')
      .select('e.status', 'status')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('e.status')
      .getRawMany();

    let activeCount = 0;
    let inactiveCount = 0;
    statusCounts.forEach(row => {
      if (row.status === 'active') {
        activeCount = parseInt(row.count || '0', 10);
      } else if (row.status === 'inactive') {
        inactiveCount = parseInt(row.count || '0', 10);
      }
    });

    const salaryStats = await this.employeeRepository.createQueryBuilder('e')
      .select('AVG(e.salary)', 'avg_salary')
      .addSelect('MIN(e.salary)', 'min_salary')
      .addSelect('MAX(e.salary)', 'max_salary')
      .where("e.status = 'active'")
      .getRawOne();

    const uniqueCounts = await this.employeeRepository.createQueryBuilder('e')
      .select('COUNT(DISTINCT e.country_id)', 'countries_count')
      .addSelect('COUNT(DISTINCT e.department_id)', 'departments_count')
      .where("e.status = 'active'")
      .getRawOne();

    return {
      active_employees_count: activeCount,
      inactive_employees_count: inactiveCount,
      avg_salary: parseFloat(salaryStats?.avg_salary || '0'),
      min_salary: parseFloat(salaryStats?.min_salary || '0'),
      max_salary: parseFloat(salaryStats?.max_salary || '0'),
      total_countries_with_employees: parseInt(uniqueCounts?.countries_count || '0', 10),
      total_departments_with_employees: parseInt(uniqueCounts?.departments_count || '0', 10),
    };
  }

  async getSalaryDistribution() {
    const totalActiveResult = await this.employeeRepository.createQueryBuilder('e')
      .select('COUNT(e.id)', 'total')
      .where("e.status = 'active'")
      .getRawOne();

    const totalActive = parseInt(totalActiveResult?.total || '0', 10);

    const qb = this.employeeRepository.createQueryBuilder('e');
    const results = await qb
      .select(`
        CASE
          WHEN e.salary < 30000 THEN '0-30k'
          WHEN e.salary >= 30000 AND e.salary < 60000 THEN '30k-60k'
          WHEN e.salary >= 60000 AND e.salary < 100000 THEN '60k-100k'
          WHEN e.salary >= 100000 AND e.salary < 150000 THEN '100k-150k'
          ELSE '150k+'
        END
      `, 'salary_range')
      .addSelect('COUNT(e.id)', 'count')
      .where("e.status = 'active'")
      .groupBy(`
        CASE
          WHEN e.salary < 30000 THEN '0-30k'
          WHEN e.salary >= 30000 AND e.salary < 60000 THEN '30k-60k'
          WHEN e.salary >= 60000 AND e.salary < 100000 THEN '60k-100k'
          WHEN e.salary >= 100000 AND e.salary < 150000 THEN '100k-150k'
          ELSE '150k+'
        END
      `)
      .getRawMany();

    const ranges = [
      { range: '0-30k', count: 0, percentage: 0 },
      { range: '30k-60k', count: 0, percentage: 0 },
      { range: '60k-100k', count: 0, percentage: 0 },
      { range: '100k-150k', count: 0, percentage: 0 },
      { range: '150k+', count: 0, percentage: 0 },
    ];

    results.forEach(row => {
      const match = ranges.find(r => r.range === row.salary_range);
      if (match) {
        match.count = parseInt(row.count || '0', 10);
      }
    });

    if (totalActive > 0) {
      ranges.forEach(r => {
        r.percentage = parseFloat(((r.count / totalActive) * 100).toFixed(2));
      });
    }

    return ranges;
  }
}
