import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString({ message: 'Nama tim harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama tim wajib diisi.' })
  @MaxLength(100, { message: 'Nama tim tidak boleh lebih dari 100 karakter.' })
  name: string;

  @IsString({ message: 'Deskripsi tim harus berupa teks.' })
  @IsOptional()
  description?: string;
}