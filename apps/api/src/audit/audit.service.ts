import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    search?: string;
    from?: string;
    to?: string;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));

    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.hrManager', 'hrManager');

    if (query.action) {
      queryBuilder.andWhere('auditLog.action = :action', { action: query.action });
    }

    if (query.entity) {
      queryBuilder.andWhere('auditLog.entity = :entity', { entity: query.entity });
    }

    if (query.search) {
      queryBuilder.andWhere('LOWER(hrManager.full_name) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    if (query.from && query.to) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('auditLog.created_at BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    } else if (query.from) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('auditLog.created_at >= :fromDate', { fromDate });
    } else if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('auditLog.created_at <= :toDate', { toDate });
    }

    queryBuilder.orderBy('auditLog.created_at', 'DESC');
    queryBuilder.addOrderBy('auditLog.id', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
