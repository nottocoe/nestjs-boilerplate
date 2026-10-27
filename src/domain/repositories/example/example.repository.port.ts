import { Example } from '@infrastructure/prisma/generated/prisma/client';
import {
  CreateExample,
  ExampleListRequest,
  UpdateExample,
} from '@application/dtos/request/example.request';

export interface ExampleRepositoryPort {
  findDetailById(projectId: string, exampleId: string): Promise<Example | null>;
  findByProjectId(
    projectId: string,
    query: ExampleListRequest,
  ): Promise<{ data: Example[]; total: number }>;
  create(request: CreateExample): Promise<Example>;
  update(
    projectId: string,
    exampleId: string,
    request: UpdateExample,
  ): Promise<Example>;
  delete(projectId: string, exampleId: string): Promise<Example>;
}
