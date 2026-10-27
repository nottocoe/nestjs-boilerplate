import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SuccessResponse {
  @Expose()
  @ApiProperty({ example: 200 })
  status: number;

  @Expose()
  @ApiProperty({ example: 'Success' })
  message: string;
}

export class SuccessCaseBooleanResponse {
  @Expose()
  @ApiProperty()
  success: boolean = true;
}
