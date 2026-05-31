import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: Repository<AuditLog>;

  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockAuditLogRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated audit logs', async () => {
    const mockLogs = [{ id: 1, action: 'CREATE', entity: 'employee' }];
    mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockLogs, 1]);

    const result = await service.getAuditLogs({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: mockLogs,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('should apply filters (action, entity, search, from, to)', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    await service.getAuditLogs({
      page: 2,
      limit: 20,
      action: 'UPDATE',
      entity: 'salary',
      search: 'John',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.action = :action', { action: 'UPDATE' });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.entity = :entity', { entity: 'salary' });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hrManager.full_name) LIKE :search', { search: '%john%' });
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
  });
});
