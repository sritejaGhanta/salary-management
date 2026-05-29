import { IsEmail, IsString, IsOptional, IsNumber, Min, IsDateString, IsEnum } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  job_title_id: number;

  @IsNumber()
  country_id: number;

  @IsOptional()
  @IsNumber()
  state_id?: number;

  @IsNumber()
  department_id: number;

  @IsNumber()
  @Min(0)
  salary: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsDateString()
  joining_date: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
