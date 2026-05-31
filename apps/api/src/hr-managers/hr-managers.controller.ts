import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { HRManagersService } from './hr-managers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HRManagerQueryDto } from './dto/hr-manager-query.dto';
import { UpdateHRManagerDto } from './dto/update-hr-manager.dto';

@Controller('hr-managers')
@UseGuards(JwtAuthGuard)
export class HRManagersController {
  constructor(private readonly hrManagersService: HRManagersService) {}

  private checkAdmin(user: any) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Access denied: Admin role required');
    }
  }

  @Get()
  async findAll(@Query() query: HRManagerQueryDto, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.hrManagersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.hrManagersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHRManagerDto,
    @Req() req: any,
  ) {
    this.checkAdmin(req.user);
    return this.hrManagersService.update(id, dto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.hrManagersService.remove(id, req.user);
  }
}
