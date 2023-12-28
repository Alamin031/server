import { ApiProperty } from '@nestjs/swagger';
import { Chatbot, Role } from '@prisma/client';

export class ChatbotEntity implements Chatbot {
  constructor(partial: Partial<ChatbotEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  name: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  titel: string;
  @ApiProperty()
  isGreetings: boolean;
  @ApiProperty()
  icone: string;
  @ApiProperty()
  greetingsSMS: string[];
  @ApiProperty()
  files: File[];
  @ApiProperty()
  requiredRole: Role;
}
