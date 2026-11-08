import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { MemberRole } from '../entities/member.entity.js';



export class CreateMemberDto {
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
}