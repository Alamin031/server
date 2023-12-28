/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Delete,
  Patch,
  Put,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/enums/role.enum';
import { ApiQueryPagination } from 'src/decorators/query-pagination.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { verifyDto } from './dto/verify';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorators/User';
import { ApiFile } from 'src/decorators/file.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Patch('password')
  async verifyEmail(
    @Query('email') email: string,
    @Query('password') password: string,
    @Body()
    VerifyDto: verifyDto,
    // email: string,
    // password: string,
  ) {
    try {
      const result = await this.usersService.verifyEmail(
        email,
        password,
        VerifyDto.password,
      );
      return result;
    } catch (error) {
      console.log(error);
      return { message: 'Error verifying email', error: error.message };
    }
  }

  @Post('forgettoken')
  @ApiOkResponse({ type: UserEntity })
  async requestPasswordReset(@Body('email') email: string) {
    return this.usersService.createPasswordResetToken(email);
  }

  //otp valide
  @Post('verifyotp')
  @ApiOkResponse({ type: UserEntity })
  async validateOtp(@Body('otp') otp: string) {
    const isValid = await this.usersService.validateTokenAndSetIsOTP(otp);

    if (!isValid) {
      throw new BadRequestException('Invalid otp');
    }

    return { message: 'valid otp', isOTPSet: true };
  }

  //password change
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const isReset = await this.usersService.resetPassword(email, password);
    if (!isReset) {
      throw new BadRequestException('Invalid email');
    }

    return { message: 'Password reset successful' };
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiQueryPagination()
  async findAll(
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    const users = await this.usersService.findAll({
      offset: +query.offset,
      limit: +query.limit,
      sort: query.sort,
      order: query.order,
      search: query.search,
    });
    return users;
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.findOne(id));
  }

  @Delete(':id')
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }

  @Patch(':id')
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }
}
