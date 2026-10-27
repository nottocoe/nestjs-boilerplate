import { EXAMPLE_STATUS } from '@infrastructure/shared/enums/business.enum';
import { EXAMPLE_SORT_BY } from '@application/dtos/shared/cores/enums/example.enums';
import { PaginationRequest } from '@application/dtos/shared/schemas/pagination.schema';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExample {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EXAMPLE_STATUS })
  @IsNotEmpty()
  @IsEnum(EXAMPLE_STATUS)
  status: EXAMPLE_STATUS;
}

export class UpdateExample extends PartialType(
  PickType(CreateExample, ['name', 'description', 'status']),
) {}

export class ExampleListRequest extends PaginationRequest {
  @ApiProperty({ enum: EXAMPLE_SORT_BY, required: false })
  @IsOptional()
  @IsEnum(EXAMPLE_SORT_BY)
  declare sortBy?: EXAMPLE_SORT_BY;

  @ApiProperty({ enum: EXAMPLE_STATUS, required: false })
  @IsOptional()
  @IsEnum(EXAMPLE_STATUS)
  status?: EXAMPLE_STATUS;
}
