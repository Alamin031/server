import { ApiProperty } from '@nestjs/swagger';

class UserData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  accessToken: string;
}

class AuthResponse {
  @ApiProperty()
  data: UserData;

  @ApiProperty()
  message: string;
}

export { AuthResponse, UserData };
