import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'alamin@gmail.com',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'password',
    example: '123456',
  })
  password: string;
}

export class AdminLoginDto {
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
}
