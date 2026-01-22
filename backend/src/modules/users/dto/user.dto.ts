import { IsNotEmpty, IsEmail, IsOptional, IsBoolean, MinLength, IsUUID, Matches } from 'class-validator';

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

  @IsNotEmpty({ message: 'roleUuid harus diisi.' })
  @IsUUID('4', { message: 'roleUuid harus berupa UUID yang valid.' })
  roleUuid: string;

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
  @IsUUID('4', { message: 'roleUuid harus berupa UUID yang valid.' })
  roleUuid?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}
