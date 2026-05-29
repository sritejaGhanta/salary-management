import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  @Get('meta/countries')
  async getCountries() {
    return this.employeesService.getCountries();
  }

  @Get('meta/states')
  async getStates(@Query('countryId', ParseIntPipe) countryId: number) {
    return this.employeesService.getStates(countryId);
  }

  @Get('meta/departments')
  async getDepartments() {
    return this.employeesService.getDepartments();
  }

  @Get('meta/job-titles')
  async getJobTitles() {
    return this.employeesService.getJobTitles();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Get(':id/salary-history')
  async getSalaryHistory(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.getSalaryHistory(id);
  }

  @Post()
  async create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.employeesService.create(dto, req.user, req.ip);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    return this.employeesService.update(id, dto, req.user, req.ip);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.employeesService.remove(id, req.user, req.ip);
  }
}
