import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiResponseOptions,
  ApiProperty,
} from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export const DOMAIN_KEY = 'serviceDomain';

export function ServiceDomain(domainName: string) {
  return SetMetadata(DOMAIN_KEY, domainName);
}

export class ErrorResponse {
  @Expose()
  @ApiProperty()
  statusCode: number;

  @Expose()
  @ApiProperty()
  domain: string;

  @Expose()
  @ApiProperty()
  error: string;

  @Expose()
  @ApiProperty()
  message: string;

  @Expose()
  @ApiProperty()
  timestamp: string;
}

function buildErrorDecorators(domainName: string): any[] {
  const schema = (
    status: number,
    error: string,
    message: string,
  ): ApiResponseOptions => ({
    type: ErrorResponse,
    example: {
      statusCode: status,
      domain: domainName,
      error,
      message,
      timestamp: new Date().toISOString(),
    },
  });

  return [
    ApiBadRequestResponse(
      schema(400, 'Bad Request', 'Validation or request error.'),
    ),
    ApiUnauthorizedResponse(
      schema(401, 'Unauthorized', 'Authentication missing or invalid.'),
    ),
    ApiForbiddenResponse(schema(403, 'Forbidden', 'Insufficient permissions.')),
    ApiNotFoundResponse(schema(404, 'Not Found', 'Resource not found.')),
    ApiInternalServerErrorResponse(
      schema(500, 'Internal Server Error', 'Unexpected server error.'),
    ),
  ];
}

export function ApiGroup(domainName: string, tagName: string) {
  return applyDecorators(
    ServiceDomain(domainName),
    ApiTags(tagName),
    ...buildErrorDecorators(domainName),
  );
}
