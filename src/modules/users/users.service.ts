/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  comparePassword,
  customResponseHandler,
  hashPassword,
} from 'src/config/helpers';
import { sendEmail } from 'src/middleware/sendemail';
import { unlink } from 'fs';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    // private assetService: AssetService,
  ) {}
  private readonly OTP_EXPIRATION_TIME = 1000 * 60 * 5;

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  }

  async create(createUserDto: CreateUserDto) {
    const initialPassword = createUserDto.password;
    const hashpass = await hashPassword(initialPassword);

    const response = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashpass,
        isVerified: false,
      },
    });

    const user = new UserEntity(response);
    await this.sendInitialPasswordEmail(
      user.email,
      user.username,
      initialPassword,
    );

    return customResponseHandler(
      'User created successfully. Check your email for the initial password.',
      user,
    );
  }

  async sendInitialPasswordEmail(
    email: string,
    username: string,
    initialPassword: string,
  ): Promise<void> {
    const verificationLink = `http://localhost:3000/password?email=${email}&password=${initialPassword}`;

    const emailContent = `
      <p>Hello <strong>${username}</strong></p>
      <p>Your initial password is: <strong>${initialPassword}</strong></p>
      <a href="${verificationLink}">${verificationLink}</a>

      <p>Please use this password to log in. After logging in, you can set a new password.</p>
      <p>If you did not create an account, please contact support.</p>
      <p>Thank you!</p>
    `;

    try {
      await sendEmail(email, 'Initial Password', emailContent);
    } catch (error) {
      throw new Error('Error sending initial password email');
    }
  }

  async verifyEmail(
    email: string,
    password: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        isVerified: false,
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    console.log(user.password);
    console.log(password);

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error('Invalid password');
    }

    const hashpass = await hashPassword(newPassword);

    // Update the user's password and set as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashpass,
        isVerified: true,
      },
    });

    return customResponseHandler(
      'Your Account Activetion successful. You can now log in with your new password.',
    );
  }

  async createPasswordResetToken(email: string): Promise<any> {
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    const newOtp = await this.prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt: expiresAt,
      },
    });
    await this.sendResetEmail(email, otp);
    return newOtp;
  }
  async sendResetEmail(email: string, otp: string): Promise<void> {
    const emailContent = `
    <p>Hello,</p>
    <p>Your OTP for password reset is: <strong>${otp}</strong></p>
    <p>This OTP is valid until: 2 minit </p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
  `;
    try {
      await sendEmail(email, 'Password Reset OTP', emailContent);
    } catch (error) {
      throw new Error('Error sending reset email');
    }
  }

  async validateTokenAndSetIsOTP(otp: string): Promise<boolean> {
    const otpEntry = await this.prisma.oTP.findFirst({
      where: {
        otp,
      },
    });

    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      return false;
    }

    const email = otpEntry.email;
    await this.prisma.user.update({
      where: { email },
      data: {
        isOTP: true,
      },
    });
    await this.prisma.oTP.delete({
      where: {
        otp,
      },
    });
    return true;
  }

  async resetPassword(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user && user.isOTP) {
      const hashpass = await hashPassword(password);
      const response = await this.prisma.user.update({
        where: { email },
        data: {
          password: hashpass,
          isOTP: false,
        },
      });
      return customResponseHandler('Password reset successfully', response);
    }
  }

  async findAll({
    offset = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  }: {
    offset?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    if (offset < 1)
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },

      skip: (offset - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    });

    const total = await this.prisma.user.count({
      where: {
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: users,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async remove(id: number) {
    const response = await this.prisma.user.delete({ where: { id } });
    delete response.password;
    console.log(response);

    // const oldData = await this.prisma.user.findUnique({
    //   where: { id },
    // });

    // const asset = await this.prisma.asset.findUnique({
    //   where: { id: oldData.assetId },
    // });

    // unlink(`public/${asset.fileName}`, (err) => {
    //   if (err) throw err;
    // });
    return customResponseHandler('User deleted successfully', response);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const response = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
    });
    return customResponseHandler('User updated successfully', response);
  }
}
