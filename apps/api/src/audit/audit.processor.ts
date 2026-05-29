import { Processor, Process } from '@nestjs/bull';
import * as Bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Processor('audit')
export class AuditProcessor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Process()
  async handleAuditLog(job: Bull.Job) {
    const { hr_id, action, entity, entity_id, old_data, new_data, ip_address } = job.data;
    await this.auditLogRepository.save({
      hr_id,
      action,
      entity,
      entity_id,
      old_data,
      new_data,
      ip_address,
    });
  }
}
