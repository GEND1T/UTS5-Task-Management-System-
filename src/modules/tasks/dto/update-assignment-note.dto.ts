import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateAssignmentNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  notes: string;
}