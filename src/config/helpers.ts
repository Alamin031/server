import * as bcrypt from 'bcryptjs';
import { UnprocessableEntityException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { getConfigVar } from 'src/utils/config';
import { User } from '@prisma/client';

export const createAccessToken = async (user: User) => {
  const { id, role, email, createdAt, updatedAt, avatar, username } = user;
  const accessToken = sign(
    { id, role, email, createdAt, updatedAt, avatar, username },
    getConfigVar('JWT_SECRET'),
    {
      expiresIn: getConfigVar('JWT_EXPIRATION'),
    },
  );
  return accessToken;
};
export const customResponseHandler = (message: string, response?: any) => {
  return { data: response, message };
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  const match = await bcrypt.compare(password, hashedPassword);
  if (!match)
    throw new UnprocessableEntityException('Wrong email or password.');
  return match;
};
