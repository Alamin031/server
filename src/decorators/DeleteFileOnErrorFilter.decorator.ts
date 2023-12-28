import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { isArray } from 'lodash';

@Catch(BadRequestException)
export class DeleteFileOnErrorFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    {
      if (request.file)
        fs.unlink(request.file?.path, (err) => {
          if (err) {
            console.error(err);
            return err;
          }
        });
    }

    response.status(status).json(exception.getResponse());
  }
}

@Catch(BadRequestException)
export class DeleteFilesOnErrorFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const getFiles = (file: Express.Multer.File | unknown | undefined) => {
      if (!file) return [];
      if (isArray(file)) return file;
      return Object.values(file);
    };

    const filePaths: any = getFiles(request.file);

    for (const file of filePaths) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      });
    }
    response.status(status).json(exception.getResponse());
  }
}
