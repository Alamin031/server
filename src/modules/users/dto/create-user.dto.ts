// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'username',
    example: 'alamin09',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'alamin@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'password',
    example: '123456',
  })
  password: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'assetId',
    example: 1,
  })
  assetId: number | null;

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({
    description: 'role',
    example: Role.ADMIN,
  })
  role: Role;
}
