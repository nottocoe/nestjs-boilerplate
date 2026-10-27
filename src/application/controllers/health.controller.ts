import { SuccessCaseBooleanResponse } from '@application/dtos/shared/schemas/success.response';
import { ApiGroup } from '@infrastructure/decorators/error-response-swagger.decorator';
import { DOMAIN } from '@infrastructure/shared/enums/core.enum';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('health')
@ApiGroup(DOMAIN.HEALTH, 'Health')
export class HealthController {
  constructor() {}

  @Get('/')
  @ApiOkResponse({ type: SuccessCaseBooleanResponse })
  async health(): Promise<boolean> {
    return true;
  }
}
