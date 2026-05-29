import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Employee } from '../entities/employee.entity';
import { HRManager } from '../entities/hr-manager.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(HRManager)
    private readonly hrManagerRepository: Repository<HRManager>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  private escapeCSV(val: any): string {
    if (val === null || val === undefined) return '';
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      str = `"${str}"`;
    }
    return str;
  }

  async exportEmployees(res: Response, format: 'csv' | 'excel' = 'excel') {
    const employees = await this.employeeRepository.find({
      relations: {
        jobTitle: true,
        country: true,
        state: true,
        department: true,
        addedBy: true,
      },
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');

      const headers = [
        'ID', 'Full Name', 'Email', 'Phone', 'Job Title', 'Country',
        'State', 'Department', 'Salary', 'Currency',
        'Joining Date', 'Status', 'Added By', 'Created At'
      ];
      res.write(headers.map(this.escapeCSV).join(',') + '\n');

      employees.forEach(emp => {
        const row = [
          emp.id,
          emp.full_name,
          emp.email,
          emp.phone || '',
          emp.jobTitle?.title || '',
          emp.country?.country || '',
          emp.state?.state || '',
          emp.department?.name || '',
          emp.salary,
          emp.currency || 'INR',
          emp.joining_date ? new Date(emp.joining_date).toISOString().split('T')[0] : '',
          emp.status,
          emp.addedBy?.full_name || '',
          emp.created_at ? new Date(emp.created_at).toISOString() : ''
        ];
        res.write(row.map(this.escapeCSV).join(',') + '\n');
      });

      res.end();
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="employees.xlsx"');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Full Name', key: 'full_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Job Title', key: 'job_title', width: 20 },
        { header: 'Country', key: 'country', width: 20 },
        { header: 'State', key: 'state', width: 20 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Joining Date', key: 'joining_date', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Added By', key: 'added_by', width: 25 },
        { header: 'Created At', key: 'created_at', width: 20 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
      });

      employees.forEach(emp => {
        worksheet.addRow({
          id: emp.id,
          full_name: emp.full_name,
          email: emp.email,
          phone: emp.phone || '',
          job_title: emp.jobTitle?.title || '',
          country: emp.country?.country || '',
          state: emp.state?.state || '',
          department: emp.department?.name || '',
          salary: parseFloat(emp.salary as any),
          currency: emp.currency || 'INR',
          joining_date: emp.joining_date ? new Date(emp.joining_date).toISOString().split('T')[0] : '',
          status: emp.status,
          added_by: emp.addedBy?.full_name || '',
          created_at: emp.created_at ? new Date(emp.created_at).toISOString() : '',
        });
      });

      await workbook.xlsx.write(res);
      res.end();
    }
  }

  async exportHRManagers(res: Response, format: 'csv' | 'excel' = 'excel') {
    const managers = await this.hrManagerRepository.find();

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hr-managers.csv"');

      const headers = ['ID', 'Full Name', 'Email', 'Role', 'Is Active', 'Created At'];
      res.write(headers.map(this.escapeCSV).join(',') + '\n');

      managers.forEach(mgr => {
        const row = [
          mgr.id,
          mgr.full_name,
          mgr.email,
          mgr.role,
          mgr.is_active ? 'Yes' : 'No',
          mgr.created_at ? new Date(mgr.created_at).toISOString() : ''
        ];
        res.write(row.map(this.escapeCSV).join(',') + '\n');
      });

      res.end();
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="hr-managers.xlsx"');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('HR Managers');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Full Name', key: 'full_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Is Active', key: 'is_active', width: 12 },
        { header: 'Created At', key: 'created_at', width: 20 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
      });

      managers.forEach(mgr => {
        worksheet.addRow({
          id: mgr.id,
          full_name: mgr.full_name,
          email: mgr.email,
          role: mgr.role,
          is_active: mgr.is_active ? 'Yes' : 'No',
          created_at: mgr.created_at ? new Date(mgr.created_at).toISOString() : '',
        });
      });

      await workbook.xlsx.write(res);
      res.end();
    }
  }

  async exportAuditLogs(res: Response, format: 'csv' | 'excel' = 'excel') {
    const logs = await this.auditLogRepository.find({
      relations: {
        hrManager: true,
      },
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');

      const headers = ['ID', 'HR Manager', 'Action', 'Entity', 'Entity ID', 'IP Address', 'Created At'];
      res.write(headers.map(this.escapeCSV).join(',') + '\n');

      logs.forEach(log => {
        const row = [
          log.id,
          log.hrManager?.full_name || '',
          log.action,
          log.entity,
          log.entity_id,
          log.ip_address || '',
          log.created_at ? new Date(log.created_at).toISOString() : ''
        ];
        res.write(row.map(this.escapeCSV).join(',') + '\n');
      });

      res.end();
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.xlsx"');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Audit Logs');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'HR Manager', key: 'hr_manager', width: 25 },
        { header: 'Action', key: 'action', width: 15 },
        { header: 'Entity', key: 'entity', width: 15 },
        { header: 'Entity ID', key: 'entity_id', width: 12 },
        { header: 'IP Address', key: 'ip_address', width: 20 },
        { header: 'Created At', key: 'created_at', width: 20 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
      });

      logs.forEach(log => {
        worksheet.addRow({
          id: log.id,
          hr_manager: log.hrManager?.full_name || '',
          action: log.action,
          entity: log.entity,
          entity_id: log.entity_id,
          ip_address: log.ip_address || '',
          created_at: log.created_at ? new Date(log.created_at).toISOString() : '',
        });
      });

      await workbook.xlsx.write(res);
      res.end();
    }
  }
}
