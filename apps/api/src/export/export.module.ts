import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { Employee } from '../entities/employee.entity';
import { HRManager } from '../entities/hr-manager.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, HRManager, AuditLog]),
    AuthModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
