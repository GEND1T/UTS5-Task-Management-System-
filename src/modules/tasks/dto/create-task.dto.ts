import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TaskPriority } from '../entities/task.entity.js';

export class CreateTaskDto {
  @IsUUID(undefined, { message: 'ID proyek harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'ID proyek wajib diisi.' })
  projectId: string;

  @IsString({ message: 'Judul tugas harus berupa teks.' })
  @IsNotEmpty({ message: 'Judul tugas wajib diisi.' })
  @MaxLength(200, { message: 'Judul tugas tidak boleh lebih dari 200 karakter.' })
  title: string;

  @IsString({ message: 'Deskripsi tugas harus berupa teks.' })
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority, { message: 'Prioritas tugas tidak valid.' })
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString({}, { message: 'Tanggal jatuh tempo harus berupa tanggal yang valid.' })
  @IsNotEmpty({ message: 'Tanggal jatuh tempo wajib diisi.' })
  dueDate: string;
}