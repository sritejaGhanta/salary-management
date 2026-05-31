import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditProcessor } from './audit.processor';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({
      name: 'audit',
    }),
  ],
  controllers: [AuditController],
  providers: [AuditProcessor, AuditService],
  exports: [BullModule, AuditService],
})
export class AuditModule {}
