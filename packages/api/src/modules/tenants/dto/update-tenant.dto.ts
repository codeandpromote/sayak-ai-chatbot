import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @IsString() @IsOptional() @MaxLength(100) name?: string;
  @IsString() @IsOptional() logoUrl?: string;
  @IsString() @IsOptional() brandColor?: string;
}
