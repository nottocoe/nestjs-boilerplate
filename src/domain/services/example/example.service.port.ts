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

export interface ExampleServicePort {
  findByProjectId(
    projectId: string,
    query: ExampleListRequest,
  ): Promise<PaginationResponse<ExampleData>>;
  findDetailById(projectId: string, exampleId: string): Promise<ExampleResponse>;
  create(request: CreateExample): Promise<ExampleResponse>;
  update(
    projectId: string,
    exampleId: string,
    request: UpdateExample,
  ): Promise<ExampleResponse>;
  delete(projectId: string, exampleId: string): Promise<DeleteExampleResponse>;
}
