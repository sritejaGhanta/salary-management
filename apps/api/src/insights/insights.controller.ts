import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.insightsService.getDashboardStats();
  }

  @Get('salary-by-country')
  async getSalaryByCountry(@Query('countryId') countryId?: string) {
    const parsedId = countryId ? parseInt(countryId, 10) : undefined;
    return this.insightsService.getSalaryStatsByCountry(parsedId);
  }

  @Get('salary-by-job-title')
  async getSalaryByJobTitle(
    @Query('jobTitleId') jobTitleId?: string,
    @Query('countryId') countryId?: string,
  ) {
    const parsedJobTitleId = jobTitleId ? parseInt(jobTitleId, 10) : undefined;
    const parsedCountryId = countryId ? parseInt(countryId, 10) : undefined;
    return this.insightsService.getSalaryStatsByJobTitle(parsedJobTitleId, parsedCountryId);
  }

  @Get('salary-by-department')
  async getSalaryByDepartment() {
    return this.insightsService.getSalaryStatsByDepartment();
  }

  @Get('top-paid')
  async getTopPaid(
    @Query('countryId') countryId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedCountryId = countryId ? parseInt(countryId, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.insightsService.getTopPaidEmployees(parsedCountryId, parsedLimit);
  }

  @Get('salary-distribution')
  async getSalaryDistribution() {
    return this.insightsService.getSalaryDistribution();
  }
}
