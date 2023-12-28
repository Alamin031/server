/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthResponse } from './entity/auth.entity';
import {
  comparePassword,
  createAccessToken,
  customResponseHandler,
} from 'src/config/helpers';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, newPassword: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: username,
          },
          {
            username: username,
          },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException(
        `No user found for username/email: ${username}`,
      );
    }

    const { password, ...rest } = user;

    const isPasswordValid = await comparePassword(newPassword, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(`Invalid password`);
    }

    const accessToken = await createAccessToken(user);

    return customResponseHandler('Login successfull.', {
      ...rest,
      accessToken,
    });
  }

  async validateUser(jwtPayload: any): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            id: jwtPayload.id,
          },
          {
            email: jwtPayload.email,
          },
          {
            username: jwtPayload.username,
          },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid token.');

    return user;
  }
}
