import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';

export class UpdateTenantAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['FREE', 'PRO', 'ENTERPRISE'])
  plan?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyMessageQuota?: number;
}
