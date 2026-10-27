import { SORT_ORDER } from '@infrastructure/shared/enums/business.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsString, IsEnum } from 'class-validator';

export class PaginationRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perPage: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ enum: SORT_ORDER, required: false })
  @IsOptional()
  @IsEnum(SORT_ORDER)
  sortOrder?: SORT_ORDER = SORT_ORDER.DESC;
}

export class PaginationResponse<T> {
  @Expose()
  @ApiProperty()
  page: number;

  @Expose()
  @ApiProperty()
  perPage: number;

  @Expose()
  @ApiProperty()
  totalItems: number;

  @Expose()
  @ApiProperty()
  totalPages: number;

  @Expose()
  @ApiProperty({ isArray: true })
  @Type(() => Object)
  data: T[];

  constructor(page = 1, perPage = 20, totalItems: number, data: T[]) {
    const totalPages = Math.ceil(totalItems / perPage);

    this.page = page;
    this.perPage = perPage;
    this.totalItems = totalItems;
    this.totalPages = totalPages;
    this.data = data;
  }
}
