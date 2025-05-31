import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  isActive?: boolean = true;

  @IsOptional()
  emailVerified?: boolean = false;
}
