import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SuccessResponse } from '../shared/schemas/success.response';

export class ExampleData {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  projectId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class ExampleResponse extends SuccessResponse {
  @Expose()
  @ApiProperty()
  data: ExampleData;
}

class DeletedExample {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  projectId: string;

  @Expose()
  @ApiProperty()
  deletedAt: Date;
}

export class DeleteExampleResponse extends SuccessResponse {
  @Expose()
  @ApiProperty()
  data: DeletedExample;
}
