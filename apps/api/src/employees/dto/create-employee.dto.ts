import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  MinLength,
  MaxLength
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(150, { message: 'Full name cannot exceed 150 characters' })
  @Matches(/^[a-zA-Z\s.-]+$/, { message: 'Full name can only contain letters, spaces, dots, and hyphens' })
  full_name: string;

  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(100, { message: 'Email cannot exceed 100 characters' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @IsNotEmpty({ message: 'Job title is required' })
  @IsNumber({}, { message: 'Job title ID must be a number' })
  @Min(1, { message: 'Job title is required' })
  job_title_id: number;

  @IsNotEmpty({ message: 'Country is required' })
  @IsNumber({}, { message: 'Country ID must be a number' })
  @Min(1, { message: 'Country is required' })
  country_id: number;

  @IsOptional()
  @IsNumber({}, { message: 'State ID must be a number' })
  state_id?: number;

  @IsNotEmpty({ message: 'Department is required' })
  @IsNumber({}, { message: 'Department ID must be a number' })
  @Min(1, { message: 'Department is required' })
  department_id: number;

  @IsNotEmpty({ message: 'Salary is required' })
  @IsNumber({}, { message: 'Salary must be a number' })
  @Min(0.01, { message: 'Salary must be greater than 0' })
  @Max(9999999999.99, { message: 'Salary cannot exceed 9,999,999,999.99' })
  salary: number;

  @IsNotEmpty({ message: 'Currency is required' })
  @IsString({ message: 'Currency must be a string' })
  @Length(3, 3, { message: 'Currency must be exactly 3 characters' })
  @Matches(/^[A-Za-z]{3}$/, { message: 'Currency must be a 3-letter alphabetic ISO code' })
  currency: string;

  @IsNotEmpty({ message: 'Joining date is required' })
  @IsDateString({}, { message: 'Invalid joining date format' })
  joining_date: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'Status must be active or inactive' })
  status?: string;
}
