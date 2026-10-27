import { HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { ExampleRepositoryPort } from '@domain/repositories';
import { UserServiceAdapterPort } from '@domain/adapters';
import { ExampleServicePort } from './example.service.port';
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
import { ExampleCreatedPayload } from '@application/dtos/shared/cores/types/example.type';
import { ExampleMapper } from '@application/mapper/example.mapper';
import { DOMAIN, EVENT_TRIGGER } from '@infrastructure/shared/enums/core.enum';
import { BaseException } from '@infrastructure/shared/exceptions/base.exception';
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from '@infrastructure/shared/exceptions/http-error';
import {
  isPrismaKnownError,
  PRISMA_ERROR_CODE,
} from '@infrastructure/shared/helper/prisma-error.helper';

export class ExampleService implements ExampleServicePort {
  constructor(
    private readonly _exampleRepository: ExampleRepositoryPort,
    private readonly _userServiceAdapter: UserServiceAdapterPort,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  async findByProjectId(
    projectId: string,
    query: ExampleListRequest,
  ): Promise<PaginationResponse<ExampleData>> {
    try {
      const { data, total } = await this._exampleRepository.findByProjectId(
        projectId,
        query,
      );

      return new PaginationResponse(
        query.page,
        query.perPage,
        total,
        data.map(ExampleMapper),
      );
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  async findDetailById(
    projectId: string,
    exampleId: string,
  ): Promise<ExampleResponse> {
    try {
      const result = await this._exampleRepository.findDetailById(
        projectId,
        exampleId,
      );

      if (!result) {
        throw new NotFoundError(DOMAIN.EXAMPLE, 'Example Not Found');
      }

      return plainToInstance(ExampleResponse, {
        status: HttpStatus.OK,
        message: 'Get Success',
        data: ExampleMapper(result),
      });
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  async create(request: CreateExample): Promise<ExampleResponse> {
    try {
      const isMember = await this._userServiceAdapter.validateMemberInProject(
        request.projectId,
      );

      if (!isMember) {
        throw new BadRequestError(
          DOMAIN.EXAMPLE,
          'Users not assigned in this Project ID',
        );
      }

      const result = await this._exampleRepository.create(request);

      const payload: ExampleCreatedPayload = {
        id: result.id,
        projectId: result.project_id,
        name: result.name,
      };
      this._eventEmitter.emit(EVENT_TRIGGER.EXAMPLE_CREATED, payload);

      return plainToInstance(ExampleResponse, {
        status: HttpStatus.OK,
        message: 'Create Success',
        data: ExampleMapper(result),
      });
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  async update(
    projectId: string,
    exampleId: string,
    request: UpdateExample,
  ): Promise<ExampleResponse> {
    try {
      const result = await this._exampleRepository.update(
        projectId,
        exampleId,
        request,
      );

      return plainToInstance(ExampleResponse, {
        status: HttpStatus.OK,
        message: 'Update Success',
        data: ExampleMapper(result),
      });
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  async delete(
    projectId: string,
    exampleId: string,
  ): Promise<DeleteExampleResponse> {
    try {
      const result = await this._exampleRepository.delete(projectId, exampleId);

      return plainToInstance(DeleteExampleResponse, {
        status: HttpStatus.OK,
        message: 'Delete Success',
        data: {
          id: result.id,
          projectId: result.project_id,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  private toDomainError(error: unknown): BaseException {
    if (error instanceof BaseException) {
      return error;
    }

    if (isPrismaKnownError(error)) {
      if (error.code === PRISMA_ERROR_CODE.UNIQUE_CONSTRAINT) {
        return new ConflictError(
          DOMAIN.EXAMPLE,
          'Example name already exists in this project',
        );
      }

      if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
        return new NotFoundError(DOMAIN.EXAMPLE, 'Example Not Found');
      }
    }

    return new InternalError(DOMAIN.EXAMPLE, 'Internal Server Error');
  }
}
