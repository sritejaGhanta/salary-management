import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { HRManager } from '../entities/hr-manager.entity';
import { HRManagerQueryDto } from './dto/hr-manager-query.dto';
import { UpdateHRManagerDto } from './dto/update-hr-manager.dto';

@Injectable()
export class HRManagersService {
  constructor(
    @InjectRepository(HRManager)
    private readonly hrManagerRepository: Repository<HRManager>,
    @InjectQueue('audit')
    private readonly auditQueue: Bull.Queue,
  ) {}

  async findAll(queryDto: HRManagerQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      is_active,
      sortBy = 'created_at',
      order = 'DESC',
    } = queryDto;

    const queryBuilder = this.hrManagerRepository.createQueryBuilder('hrManager');

    if (search) {
      queryBuilder.andWhere(
        '(hrManager.full_name LIKE :search OR hrManager.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere('hrManager.role = :role', { role });
    }

    if (is_active !== undefined && is_active !== '') {
      const active = is_active === 'true';
      queryBuilder.andWhere('hrManager.is_active = :active', { active });
    }

    const allowedSortFields = ['id', 'full_name', 'email', 'role', 'is_active', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? `hrManager.${sortBy}` : 'hrManager.created_at';
    queryBuilder.orderBy(sortField, order);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    data.forEach((manager) => {
      delete (manager as any).password;
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
    const manager = await this.hrManagerRepository.findOneBy({ id });
    if (!manager) {
      throw new NotFoundException(`HR Manager with ID ${id} not found`);
    }
    delete (manager as any).password;
    return manager;
  }

  async update(id: number, dto: UpdateHRManagerDto, currentUser: any) {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin users can update HR Managers');
    }

    const manager = await this.findOne(id); // Throws NotFoundException if not found

    if (id === currentUser.id && dto.role !== undefined && dto.role !== manager.role) {
      throw new ForbiddenException('You cannot change your own role to prevent self-demotion');
    }

    if (dto.email && dto.email !== manager.email) {
      const existing = await this.hrManagerRepository.findOneBy({ email: dto.email });
      if (existing) {
        throw new ConflictException(`HR Manager with email ${dto.email} already exists`);
      }
    }

    const updated = this.hrManagerRepository.create({
      ...manager,
      ...dto,
    });
    const saved = await this.hrManagerRepository.save(updated);

    await this.auditQueue.add({
      hr_id: currentUser.id,
      action: 'UPDATE',
      entity: 'hr_manager',
      entity_id: id,
      old_data: manager,
      new_data: saved,
      ip_address: null,
    });

    delete (saved as any).password;
    return saved;
  }

  async remove(id: number, currentUser: any) {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin users can delete HR Managers');
    }

    if (id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const manager = await this.findOne(id); // Throws NotFoundException if not found
    const oldData = { ...manager };

    try {
      await this.hrManagerRepository.remove(manager);
    } catch (err: any) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.message?.includes('foreign key') || err.message?.includes('a foreign key constraint fails')) {
        throw new ConflictException(
          'Cannot delete this HR Manager because they have associated employee profiles, salary histories, or audit logs. Please deactivate their account status instead.'
        );
      }
      throw err;
    }

    this.auditQueue.add({
      hr_id: currentUser.id,
      action: 'DELETE',
      entity: 'hr_manager',
      entity_id: id,
      old_data: oldData,
      new_data: null,
      ip_address: null,
    });

    return { message: 'HR Manager deleted successfully' };
  }
}
