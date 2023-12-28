import { ApiProperty } from '@nestjs/swagger';
import { ChatbotConfig } from '@prisma/client';

export class ConfigEntity implements ChatbotConfig {
  constructor(partial: Partial<ConfigEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  PromptInput: string;
  @ApiProperty()
  PromptOutput: string;
  @ApiProperty()
  chatbotId: number | null;
}
