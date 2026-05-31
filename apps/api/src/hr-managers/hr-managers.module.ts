import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HRManager } from '../entities/hr-manager.entity';
import { HRManagersService } from './hr-managers.service';
import { HRManagersController } from './hr-managers.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HRManager]),
    AuditModule,
  ],
  controllers: [HRManagersController],
  providers: [HRManagersService],
})
export class HRManagersModule {}
