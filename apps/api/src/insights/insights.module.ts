import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { Employee } from '../entities/employee.entity';
import { Country } from '../entities/country.entity';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Country, Department, JobTitle]),
    AuthModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
