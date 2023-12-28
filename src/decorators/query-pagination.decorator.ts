import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiQueryPagination() {
  return applyDecorators(
    ApiQuery({ name: 'offset', type: Number, example: 1, required: false }),
    ApiQuery({ name: 'limit', type: Number, example: 10, required: false }),
    ApiQuery({
      name: 'order',
      type: String,
      example: 'asc/desc',
      required: false,
    }),
    ApiQuery({
      name: 'sort',
      type: String,
      example: 'username',
      required: false,
    }),
    ApiQuery({ name: 'search', type: String, example: 'abc', required: false }),
  );
}
