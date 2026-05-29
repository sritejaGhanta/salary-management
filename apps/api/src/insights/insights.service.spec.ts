import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsightsService } from './insights.service';
import { Employee } from '../entities/employee.entity';

describe('InsightsService', () => {
  let service: InsightsService;
  let employeeRepository: Repository<Employee>;

  const mockQueryBuilder: any = {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getMany: jest.fn(),
  };

  const mockEmployeeRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return total active and inactive employee counts and overall salary stats', async () => {
      // 1. statusCounts (getRawMany)
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { status: 'active', count: '5' },
        { status: 'inactive', count: '2' },
      ]);
      // 2. salaryStats (getRawOne)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        avg_salary: '75000.50',
        min_salary: '35000.00',
        max_salary: '150000.00',
      });
      // 3. uniqueCounts (getRawOne)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        countries_count: '3',
        departments_count: '4',
      });

      const result = await service.getDashboardStats();

      expect(result).toEqual({
        active_employees_count: 5,
        inactive_employees_count: 2,
        avg_salary: 75000.5,
        min_salary: 35000,
        max_salary: 150000,
        total_countries_with_employees: 3,
        total_departments_with_employees: 4,
      });
    });
  });

  describe('getSalaryStatsByCountry', () => {
    it('should return salary stats grouped by country', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { country: 'India', min_salary: '40000', max_salary: '120000', avg_salary: '80000', employee_count: '10' },
      ]);

      const result = await service.getSalaryStatsByCountry();

      expect(result).toEqual([
        { country: 'India', min_salary: 40000, max_salary: 120000, avg_salary: 80000, employee_count: 10 },
      ]);
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('e.country_id');
      expect(mockQueryBuilder.addGroupBy).toHaveBeenCalledWith('c.country');
    });

    it('should filter by specific countryId when provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      await service.getSalaryStatsByCountry(12);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('e.country_id = :countryId', { countryId: 12 });
    });
  });

  describe('getSalaryStatsByDepartment', () => {
    it('should return salary stats for each department', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { department: 'Engineering', min_salary: '50000', max_salary: '150000', avg_salary: '95000', employee_count: '15' },
      ]);

      const result = await service.getSalaryStatsByDepartment();

      expect(result).toEqual([
        { department: 'Engineering', min_salary: 50000, max_salary: 150000, avg_salary: 95000, employee_count: 15 },
      ]);
    });
  });

  describe('getTopPaidEmployees', () => {
    it('should return top N employees sorted by salary DESC', async () => {
      const mockEmployees = [
        {
          id: 1,
          full_name: 'John Doe',
          email: 'john@company.com',
          salary: 150000.00,
          currency: 'USD',
          jobTitle: { title: 'Tech Lead' },
          country: { country: 'USA' },
          department: { name: 'Engineering' },
        },
      ];
      mockQueryBuilder.getMany.mockResolvedValueOnce(mockEmployees);

      const result = await service.getTopPaidEmployees(undefined, 5);

      expect(result).toEqual([
        {
          id: 1,
          full_name: 'John Doe',
          email: 'john@company.com',
          salary: 150000,
          currency: 'USD',
          job_title: 'Tech Lead',
          country: 'USA',
          department: 'Engineering',
        },
      ]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('e.salary', 'DESC');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should filter by countryId when provided', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.getTopPaidEmployees(3, 10);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('e.country_id = :countryId', { countryId: 3 });
    });
  });

  describe('getSalaryDistribution', () => {
    it('should return salary distribution with correct ranges and calculate percentages correctly', async () => {
      // 1. totalActiveResult (getRawOne)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '4' });
      // 2. results (getRawMany)
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { salary_range: '30k-60k', count: '2' },
        { salary_range: '100k-150k', count: '1' },
        { salary_range: '150k+', count: '1' },
      ]);

      const result = await service.getSalaryDistribution();

      expect(result).toEqual([
        { range: '0-30k', count: 0, percentage: 0 },
        { range: '30k-60k', count: 2, percentage: 50.00 },
        { range: '60k-100k', count: 0, percentage: 0 },
        { range: '100k-150k', count: 1, percentage: 25.00 },
        { range: '150k+', count: 1, percentage: 25.00 },
      ]);
    });
  });
});
