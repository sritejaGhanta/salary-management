import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { HRManagersService } from './hr-managers.service';
import { HRManager } from '../entities/hr-manager.entity';

describe('HRManagersService', () => {
  let service: HRManagersService;
  let hrManagerRepository: Repository<HRManager>;
  let auditQueue: any;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockHRManagerRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuditQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_id' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HRManagersService,
        {
          provide: getRepositoryToken(HRManager),
          useValue: mockHRManagerRepository,
        },
        {
          provide: getQueueToken('audit'),
          useValue: mockAuditQueue,
        },
      ],
    }).compile();

    service = module.get<HRManagersService>(HRManagersService);
    hrManagerRepository = module.get<Repository<HRManager>>(getRepositoryToken(HRManager));
    auditQueue = module.get(getQueueToken('audit'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated HR managers list', async () => {
      const mockManagers = [{ id: 1, full_name: 'Admin User', role: 'admin', password: 'pw' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockManagers, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([{ id: 1, full_name: 'Admin User', role: 'admin' }]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should filter by search', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ search: 'Admin' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(hrManager.full_name LIKE :search OR hrManager.email LIKE :search)',
        { search: '%Admin%' }
      );
    });

    it('should filter by role', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ role: 'admin' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('hrManager.role = :role', { role: 'admin' });
    });

    it('should filter by is_active', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ is_active: 'true' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('hrManager.is_active = :active', { active: true });
    });
  });

  describe('findOne', () => {
    it('should return hr manager by id without password', async () => {
      const mockManager = { id: 1, full_name: 'Admin', role: 'admin', password: 'pw' };
      mockHRManagerRepository.findOneBy.mockResolvedValue(mockManager);

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1, full_name: 'Admin', role: 'admin' });
      expect(mockHRManagerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when not found', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const currentUser = { id: 1, role: 'admin' };
    const existing = { id: 2, full_name: 'Manager', email: 'mgr@test.com', role: 'manager', password: 'pw' };

    it('should throw ForbiddenException if user is not admin', async () => {
      await expect(service.update(2, {}, { id: 2, role: 'manager' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if admin attempts to demote/change own role', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue({ id: 1, role: 'admin' });
      await expect(service.update(1, { role: 'manager' }, currentUser)).rejects.toThrow(ForbiddenException);
    });

    it('should update and log to audit queue', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(existing);
      mockHRManagerRepository.create.mockImplementation((obj) => obj);
      mockHRManagerRepository.save.mockResolvedValue({ ...existing, full_name: 'New Name' });

      const result = await service.update(2, { full_name: 'New Name' }, currentUser);

      expect(result.full_name).toBe('New Name');
      expect(mockAuditQueue.add).toHaveBeenCalledWith({
        hr_id: currentUser.id,
        action: 'UPDATE',
        entity: 'hr_manager',
        entity_id: 2,
        old_data: existing,
        new_data: { ...existing, full_name: 'New Name' },
        ip_address: null,
      });
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockHRManagerRepository.findOneBy
        .mockResolvedValueOnce(existing) // findOne in update
        .mockResolvedValueOnce({ id: 3 }); // findOneBy email check

      await expect(service.update(2, { email: 'dup@test.com' }, currentUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    const currentUser = { id: 1, role: 'admin' };
    const existing = { id: 2, full_name: 'Manager', role: 'manager' };

    it('should throw ForbiddenException if not admin', async () => {
      await expect(service.remove(2, { id: 2, role: 'manager' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user attempts to delete own account', async () => {
      await expect(service.remove(1, currentUser)).rejects.toThrow(ForbiddenException);
    });

    it('should remove and log to audit queue', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(existing);
      mockHRManagerRepository.remove.mockResolvedValue(existing);

      const result = await service.remove(2, currentUser);

      expect(result.message).toBe('HR Manager deleted successfully');
      expect(mockHRManagerRepository.remove).toHaveBeenCalledWith(existing);
      expect(mockAuditQueue.add).toHaveBeenCalledWith({
        hr_id: currentUser.id,
        action: 'DELETE',
        entity: 'hr_manager',
        entity_id: 2,
        old_data: existing,
        new_data: null,
        ip_address: null,
      });
    });

    it('should throw ConflictException on database foreign key violation', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(existing);
      const dbError = new Error('foreign key constraint fails');
      (dbError as any).code = 'ER_ROW_IS_REFERENCED_2';
      mockHRManagerRepository.remove.mockRejectedValue(dbError);

      await expect(service.remove(2, currentUser)).rejects.toThrow(ConflictException);
    });
  });
});
