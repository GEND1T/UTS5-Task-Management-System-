import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignMembersDto {
  @IsArray({ message: 'Daftar ID anggota harus berupa array.' })
  @ArrayNotEmpty({ message: 'Daftar ID anggota tidak boleh kosong.' })
  @IsUUID('4', { each: true, message: 'Setiap ID anggota harus berupa UUID versi 4 yang valid.' })
  memberIds: string[];

  @IsString({ message: 'Catatan harus berupa teks.' })
  @IsOptional()
  notes?: string;
}