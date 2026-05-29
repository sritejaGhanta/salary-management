import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import * as Express from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('employees')
  async exportEmployees(
    @Query('format') format: 'csv' | 'excel' = 'excel',
    @Res() res: Express.Response,
  ) {
    return this.exportService.exportEmployees(res, format);
  }

  @Get('hr-managers')
  async exportHRManagers(
    @Query('format') format: 'csv' | 'excel' = 'excel',
    @Res() res: Express.Response,
  ) {
    return this.exportService.exportHRManagers(res, format);
  }

  @Get('audit-logs')
  async exportAuditLogs(
    @Query('format') format: 'csv' | 'excel' = 'excel',
    @Res() res: Express.Response,
  ) {
    return this.exportService.exportAuditLogs(res, format);
  }
}
