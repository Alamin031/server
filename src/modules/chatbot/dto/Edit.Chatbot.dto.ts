/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString, IsArray, IsEnum } from 'class-validator';

export class EditChatbotDto {
  @IsString()
  @IsNotEmpty({ message: '😓  name should not be empty 😓' })
  @ApiProperty({
    description: 'name',
    example: 'voice Chatbot',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '😓  url should not be empty 😓' })
  @ApiProperty({
    description: 'url',
    example: 'bs-23.com',
  })
  url: string;

  @IsString()
  @IsNotEmpty({ message: '😓  titel should not be empty 😓' })
  @ApiProperty({
    description: 'titel',
    example: 'bs-23.com',
  })
  titel: string;
  @ApiProperty({
    description: 'isGreetings',
    example: true,
  })
  isGreetings: boolean;

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({
    description: 'role',
    example: Role.ADMIN,
  })
  role: Role;

  icone: string;
  greetingsSMS: string[];
  files: EditFileDto[];
}

export class EditFileDto {
  path: string;
}
// export class CreateGreetingsDto {
//   @IsString()
//   @IsNotEmpty({ message: '😓  text should not be empty 😓' })
//   text: string;
// }
