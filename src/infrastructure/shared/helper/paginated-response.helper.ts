// api-pagination-response.decorator.ts
import { PaginationResponse } from '@application/dtos/shared/schemas/pagination.schema';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginationResponse = <TModel extends Type<any>>(
  model: TModel,
) =>
  applyDecorators(
    ApiExtraModels(PaginationResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
