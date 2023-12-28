import { applyDecorators, UseFilters, UseInterceptors } from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
  anyFileFilter,
} from 'src/middleware/uploader';
import {
  DeleteFileOnErrorFilter,
  DeleteFilesOnErrorFilter,
} from './DeleteFileOnErrorFilter.decorator';
import { BodyInterceptor } from './BodyInterceptor';
import * as fs from 'fs';

export function ApiFile(
  fieldName = 'file',
  localOptions?: string,
  restFeild?: any,
  required = false,
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
          ...restFeild,
        },
      },
    }),
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: `public${localOptions}`,
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      }),
      BodyInterceptor,
    ),
    UseFilters(DeleteFileOnErrorFilter),
  );
}

export function ApiFiles(
  fieldName = 'file',
  localOptions?: string,
  maxCount = 5,
  restFeild?: any,
  required = false,
  fileFilter = imageFileFilter,
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          ...restFeild,
        },
      },
    }),
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: diskStorage({
          destination: `public${localOptions}`,
          filename: editFileName,
        }),
        fileFilter: fileFilter,
      }),
      BodyInterceptor,
    ),
    UseFilters(DeleteFilesOnErrorFilter),
  );
}

export function ApiFilesMultiFeild(
  fieldName = 'file',
  localOptions?: string,
  restFeild?: any,
  required = false,
  fileFilter = anyFileFilter,
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          ...restFeild,
        },
      },
    }),
    UseInterceptors(
      AnyFilesInterceptor({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const destination = `public/${localOptions}/${file.fieldname}`;
            if (!fs.existsSync(`public/${localOptions}`))
              fs.mkdirSync(`public/${localOptions}`);
            if (!fs.existsSync(destination)) fs.mkdirSync(destination);
            cb(null, destination);
          },
          filename: editFileName,
        }),
        fileFilter: fileFilter,
      }),
      BodyInterceptor,
    ),
    UseFilters(DeleteFilesOnErrorFilter),
  );
}
