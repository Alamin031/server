// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
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

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({
    description: 'role',
    example: Role.ADMIN,
  })
  role: Role;
}
