import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}