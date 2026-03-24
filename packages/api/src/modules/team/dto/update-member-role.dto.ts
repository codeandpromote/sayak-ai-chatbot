import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsEnum(['OWNER', 'ADMIN', 'MEMBER'])
  role: string;
}
