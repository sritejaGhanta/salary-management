import { IsOptional, IsNumber, IsString, IsIn, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsIn([10, 20, 30, 50, 100])
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  department_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  job_title_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_salary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_salary?: number;
}
