import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export class UpdateHRManagerDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(['admin', 'manager']) role?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
}
