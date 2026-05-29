import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Express from 'express';
import { ExportService } from './export.service';
import { Employee } from '../entities/employee.entity';
import { HRManager } from '../entities/hr-manager.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Mock exceljs
jest.mock('exceljs', () => {
  const mockWorksheet = {
    columns: [],
    getRow: jest.fn().mockReturnValue({
      eachCell: jest.fn((cb) => cb({ font: {}, fill: {} })),
    }),
    addRow: jest.fn(),
  };
  const mockWorkbook = {
    addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
    xlsx: {
      write: jest.fn().mockResolvedValue(undefined),
    },
  };
  return {
    Workbook: jest.fn().mockImplementation(() => mockWorkbook),
  };
});

describe('ExportService', () => {
  let service: ExportService;
  let employeeRepository: Repository<Employee>;
  let hrManagerRepository: Repository<HRManager>;
  let auditLogRepository: Repository<AuditLog>;
  let mockResponse: any;

  const mockEmployeeRepository = {
    find: jest.fn(),
  };

  const mockHRManagerRepository = {
    find: jest.fn(),
  };

  const mockAuditLogRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    mockResponse = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(HRManager),
          useValue: mockHRManagerRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    hrManagerRepository = module.get<Repository<HRManager>>(getRepositoryToken(HRManager));
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportEmployees', () => {
    it('should set correct headers for CSV format', async () => {
      mockEmployeeRepository.find.mockResolvedValue([]);

      await service.exportEmployees(mockResponse, 'csv');

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="employees.csv"');
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should set correct headers for Excel format', async () => {
      mockEmployeeRepository.find.mockResolvedValue([]);

      await service.exportEmployees(mockResponse, 'excel');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="employees.xlsx"');
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should write employee data to response in CSV format', async () => {
      const mockEmployee = {
        id: 1,
        full_name: 'John Doe',
        email: 'john@company.com',
        phone: '+919999999999',
        salary: 80000.00,
        currency: 'USD',
        joining_date: new Date('2026-01-01'),
        status: 'active',
        jobTitle: { title: 'Software Engineer' },
        country: { country: 'USA' },
        state: { state: 'California' },
        department: { name: 'Engineering' },
        addedBy: { full_name: 'Super Admin' },
        created_at: new Date('2026-01-01'),
      };
      mockEmployeeRepository.find.mockResolvedValue([mockEmployee]);

      await service.exportEmployees(mockResponse, 'csv');

      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('ID,Full Name,Email,Phone,Job Title'));
      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('John Doe,john@company.com'));
    });
  });

  describe('exportHRManagers', () => {
    it('should set correct headers for CSV format', async () => {
      mockHRManagerRepository.find.mockResolvedValue([]);

      await service.exportHRManagers(mockResponse, 'csv');

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="hr-managers.csv"');
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should write HR manager data to response in CSV format', async () => {
      const mockManager = {
        id: 1,
        full_name: 'HR User',
        email: 'hr@company.com',
        role: 'manager',
        is_active: true,
        created_at: new Date('2026-01-01'),
      };
      mockHRManagerRepository.find.mockResolvedValue([mockManager]);

      await service.exportHRManagers(mockResponse, 'csv');

      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('ID,Full Name,Email,Role,Is Active'));
      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('HR User,hr@company.com,manager,Yes'));
    });
  });

  describe('exportAuditLogs', () => {
    it('should set correct headers for CSV format', async () => {
      mockAuditLogRepository.find.mockResolvedValue([]);

      await service.exportAuditLogs(mockResponse, 'csv');

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should write audit log data to response in CSV format', async () => {
      const mockLog = {
        id: 1,
        hrManager: { full_name: 'Super Admin' },
        action: 'CREATE',
        entity: 'employee',
        entity_id: 2,
        ip_address: '127.0.0.1',
        created_at: new Date('2026-01-01'),
      };
      mockAuditLogRepository.find.mockResolvedValue([mockLog]);

      await service.exportAuditLogs(mockResponse, 'csv');

      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('ID,HR Manager,Action,Entity'));
      expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('Super Admin,CREATE,employee,2,127.0.0.1'));
    });
  });
});
