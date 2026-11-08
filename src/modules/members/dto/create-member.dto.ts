import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { MemberRole } from '../entities/member.entity.js';

export class CreateMemberDto {
  @IsUUID(undefined, { message: 'ID tim harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'ID tim wajib diisi.' })
  teamId: string;

  @IsString({ message: 'Nama anggota harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama anggota wajib diisi.' })
  @MaxLength(100, { message: 'Nama anggota tidak boleh lebih dari 100 karakter.' })
  name: string;

  @IsEmail({}, { message: 'Alamat email tidak valid.' })
  @IsNotEmpty({ message: 'Alamat email wajib diisi.' })
  email: string;

  @IsEnum(MemberRole, { message: 'Peran anggota tidak valid.' })
  @IsOptional()
  role?: MemberRole;
}