import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class HRManagerQueryDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsIn([10, 20, 30, 50, 100]) limit?: number = 10;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(['admin', 'manager']) role?: string;
  @IsOptional() @IsString() is_active?: string;
  @IsOptional() @IsString() sortBy?: string = 'created_at';
  @IsOptional() @IsIn(['ASC', 'DESC']) order?: 'ASC' | 'DESC' = 'DESC';
}
