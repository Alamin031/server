import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

function isJson(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    JSON.parse(value);
    return true;
  } catch {
    return /^\d+$/.test(value);
  }
}

@Injectable()
export class BodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    try {
      const body = { ...request.body };

      Object.keys({ ...request.body }).forEach((key) => {
        if (key === 'id') return;

        if (isJson(body[key])) {
          request.body[key] = JSON.parse(
            body[key].toString().replace(/[\u0000-\u0019]+/g, ''),
          );
        } else {
          request.body[key] = body[key];
        }
      });

      console.log(request.body);
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
