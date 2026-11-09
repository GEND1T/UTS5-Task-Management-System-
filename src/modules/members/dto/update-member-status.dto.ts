import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMemberStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}