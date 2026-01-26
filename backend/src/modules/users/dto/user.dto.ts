import { IsNotEmpty, IsEmail, IsOptional, IsBoolean, MinLength, IsUUID, Matches, IsArray, ArrayMinSize } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username harus diisi.' })
  username: string;

  @IsNotEmpty({ message: 'nama lengkap harus diisi.' })
  fullName: string;

  @IsNotEmpty({ message: 'email harus diisi.' })
  @IsEmail({}, { message: 'format email tidak valid.' })
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password?: string;

  @IsArray({ message: 'roleUuids harus berupa array.' })
  @ArrayMinSize(1, { message: 'Minimal pilih 1 role.' })
  @IsUUID('4', { each: true, message: 'Setiap role harus berupa UUID yang valid.' })
  roleUuids: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'username harus diisi.' })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'nama lengkap harus diisi.' })
  fullName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'nama harus diisi.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'format email tidak valid.' })
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password?: string;

  @IsOptional()
  @IsArray({ message: 'roleUuids harus berupa array.' })
  @IsUUID('4', { each: true, message: 'Setiap role harus berupa UUID yang valid.' })
  roleUuids?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}
