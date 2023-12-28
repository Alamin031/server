import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/modules/auth/enums/role.enum';

export const UserRoles = createParamDecorator(
  (data: unknown, context: ExecutionContext): Role[] => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (request.user && request.user.role) {
      // console.log('request.user.role', request.user.role);
      // console.log('request.user', request.user);
      return request.user.role;
    } else {
      return [];
    }
  },
);
