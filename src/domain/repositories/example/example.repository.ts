import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  Example,
  Prisma,
} from '@infrastructure/prisma/generated/prisma/client';
import {
  CreateExample,
  ExampleListRequest,
  UpdateExample,
} from '@application/dtos/request/example.request';
import { EXAMPLE_SORT_BY } from '@application/dtos/shared/cores/enums/example.enums';
import { SORT_ORDER } from '@infrastructure/shared/enums/business.enum';
import { ExampleRepositoryPort } from './example.repository.port';

const SORT_COLUMN: Record<
  EXAMPLE_SORT_BY,
  keyof Prisma.ExampleOrderByWithRelationInput
> = {
  [EXAMPLE_SORT_BY.NAME]: 'name',
  [EXAMPLE_SORT_BY.STATUS]: 'status',
  [EXAMPLE_SORT_BY.CREATED_AT]: 'created_at',
  [EXAMPLE_SORT_BY.UPDATED_AT]: 'updated_at',
};

export class ExampleRepository implements ExampleRepositoryPort {
  private readonly _repository: PrismaService['example'];
  constructor(private readonly _prisma: PrismaService) {
    this._repository = this._prisma.example;
  }

  async findDetailById(
    projectId: string,
    exampleId: string,
  ): Promise<Example | null> {
    return this._repository.findUnique({
      where: { id: exampleId, project_id: projectId },
    });
  }

  async findByProjectId(
    projectId: string,
    query: ExampleListRequest,
  ): Promise<{ data: Example[]; total: number }> {
    const { page, perPage, status } = query;
    const order = query.sortOrder === SORT_ORDER.ASC ? 'asc' : 'desc';
    const column = SORT_COLUMN[query.sortBy ?? EXAMPLE_SORT_BY.CREATED_AT];
    const where: Prisma.ExampleWhereInput = {
      project_id: projectId,
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this._repository.findMany({
        where,
        orderBy: { [column]: order },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this._repository.count({ where }),
    ]);

    return { data, total };
  }

  async create(payload: CreateExample): Promise<Example> {
    return this._repository.create({
      data: {
        project_id: payload.projectId,
        name: payload.name,
        description: payload.description,
        status: payload.status,
      },
    });
  }

  // Prisma skips `undefined` fields, so a partial update only touches what was sent.
  async update(
    projectId: string,
    exampleId: string,
    request: UpdateExample,
  ): Promise<Example> {
    return this._repository.update({
      where: { id: exampleId, project_id: projectId },
      data: {
        name: request.name,
        description: request.description,
        status: request.status,
      },
    });
  }

  async delete(projectId: string, exampleId: string): Promise<Example> {
    return this._repository.delete({
      where: { id: exampleId, project_id: projectId },
    });
  }
}
