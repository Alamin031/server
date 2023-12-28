/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatbotConfigDto {
  @IsString()
  @IsNotEmpty({ message: '😓  PromptInput should not be empty 😓' })
  @ApiProperty({
    description: 'name',
    example: 'voice Chatbot',
  })
  PromptInput: string;

  @IsString()
  @IsNotEmpty({ message: '😓  PromptOutput should not be empty 😓' })
  @ApiProperty({
    description: 'url',
    example: 'bs-23.com',
  })
  PromptOutput: string;
}

export class CounterQuestionDto {
  @IsString()
  @IsNotEmpty({ message: '😓  PromptInput should not be empty 😓' })
  @ApiProperty({
    description: 'text',
    example: 'voice Chatbot',
  })
  text: string;
}

export class UserAssignDto {
  @IsString()
  @IsNotEmpty({ message: '😓  email should not be empty 😓' })
  @ApiProperty({
    description: 'text',
    example: 'mridoy031@gmail.com',
  })
  userEmail: string;
}
