import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from '../entities/employee.entity';
import { SalaryHistory } from '../entities/salary-history.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, SalaryHistory, AuditLog, Country, State, Department, JobTitle]),
    AuditModule,
    AuthModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
