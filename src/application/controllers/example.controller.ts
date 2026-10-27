import {
  CreateExample,
  ExampleListRequest,
  UpdateExample,
} from '@application/dtos/request/example.request';
import {
  DeleteExampleResponse,
  ExampleData,
  ExampleResponse,
} from '@application/dtos/response/example.response';
import { PaginationResponse } from '@application/dtos/shared/schemas/pagination.schema';
import { ExampleServicePort } from '@domain/services/example/example.service.port';
import { JwtAuthGuard } from '@infrastructure/authentication/jwt-auth.guard';
import { ApiGroup } from '@infrastructure/decorators/error-response-swagger.decorator';
import { Roles } from '@infrastructure/roles/roles.decorator';
import { RolesGuard } from '@infrastructure/roles/roles.guard';
import { ROLE } from '@infrastructure/shared/enums/business.enum';
import { DOMAIN, SERVICES } from '@infrastructure/shared/enums/core.enum';
import { ApiPaginationResponse } from '@infrastructure/shared/helper/paginated-response.helper';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';

@Controller('example')
@ApiBearerAuth()
@ApiGroup(DOMAIN.EXAMPLE, 'Example')
export class ExampleController {
  constructor(
    @Inject(SERVICES.EXAMPLE_SERVICE)
    private readonly _exampleService: ExampleServicePort,
  ) {}

  @Get('/:projectId/list')
  @UseGuards(JwtAuthGuard)
  @ApiPaginationResponse(ExampleData)
  async getExampleList(
    @Param('projectId') projectId: string,
    @Query() query: ExampleListRequest,
  ): Promise<PaginationResponse<ExampleData>> {
    return this._exampleService.findByProjectId(projectId, query);
  }

  @Get('/:projectId/detail/:exampleId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ExampleResponse })
  async getExampleDetail(
    @Param('projectId') projectId: string,
    @Param('exampleId') exampleId: string,
  ): Promise<ExampleResponse> {
    return this._exampleService.findDetailById(projectId, exampleId);
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.PROJECT_ADMIN, ROLE.STAFF)
  @ApiBody({ type: CreateExample })
  @ApiOkResponse({ type: ExampleResponse })
  async createExample(@Body() request: CreateExample): Promise<ExampleResponse> {
    return this._exampleService.create(request);
  }

  @Patch('/:projectId/update/:exampleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.PROJECT_ADMIN, ROLE.STAFF)
  @ApiBody({ type: UpdateExample })
  @ApiOkResponse({ type: ExampleResponse })
  async updateExample(
    @Param('projectId') projectId: string,
    @Param('exampleId') exampleId: string,
    @Body() request: UpdateExample,
  ): Promise<ExampleResponse> {
    return this._exampleService.update(projectId, exampleId, request);
  }

  @Delete('/:projectId/delete/:exampleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.PROJECT_ADMIN, ROLE.STAFF)
  @ApiOkResponse({ type: DeleteExampleResponse })
  async deleteExample(
    @Param('projectId') projectId: string,
    @Param('exampleId') exampleId: string,
  ): Promise<DeleteExampleResponse> {
    return this._exampleService.delete(projectId, exampleId);
  }
}
