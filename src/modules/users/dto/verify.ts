import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class verifyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'password',
    example: '123456',
  })
  password: string;
}
