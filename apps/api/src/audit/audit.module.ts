import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditProcessor } from './audit.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({
      name: 'audit',
    }),
  ],
  providers: [AuditProcessor],
  exports: [BullModule],
})
export class AuditModule {}
