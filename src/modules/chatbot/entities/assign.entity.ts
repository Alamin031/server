import { ApiProperty } from '@nestjs/swagger';
import { UserChatbotAssignment } from '@prisma/client';

export class UserAssignEntity implements UserChatbotAssignment {
  constructor(partial: Partial<UserAssignEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  userEmail: string;
  @ApiProperty()
  chatbotId: number | null;
}
