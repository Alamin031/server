import { ApiProperty } from '@nestjs/swagger';
import { CounterQuestion } from '@prisma/client';

export class CounterQuestionEntity implements CounterQuestion {
  constructor(partial: Partial<CounterQuestionEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  text: string;
  @ApiProperty()
  chatbotId: number | null;
}
