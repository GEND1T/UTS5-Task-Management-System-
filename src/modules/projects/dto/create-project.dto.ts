import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
// import { ProjectStatus } from '../entities/project.entity.js';

export class CreateProjectDto {
  @IsUUID(undefined, { message: 'ID tim harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'ID tim wajib diisi.' })
  teamId: string;

  @IsString({ message: 'Nama proyek harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama proyek wajib diisi.' })
  @MaxLength(150, { message: 'Nama proyek tidak boleh lebih dari 150 karakter.' })
  name: string;

  @IsString({ message: 'Deskripsi proyek harus berupa teks.' })
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, { message: 'Status proyek tidak valid.' })
  @IsOptional()
  status?: ProjectStatus;

  @IsDateString({}, { message: 'Tanggal mulai harus berupa tanggal yang valid.' })
  @IsNotEmpty({ message: 'Tanggal mulai wajib diisi.' })
  startDate: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berupa tanggal yang valid.' })
  @IsNotEmpty({ message: 'Tanggal selesai wajib diisi.' })
  endDate: string;
}