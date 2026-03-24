import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MEMBER'])
  role?: string = 'MEMBER';
}
