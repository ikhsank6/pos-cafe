import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'nama role harus diisi.' })
  name: string;

  @IsNotEmpty({ message: 'kode role harus diisi.' })
  code: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsNotEmpty({ message: 'nama role harus diisi.' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'kode role harus diisi.' })
  code?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}
