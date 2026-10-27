import { ExampleRepository } from '@domain/repositories';
import { ExampleListRequest } from '@application/dtos/request/example.request';
import { EXAMPLE_SORT_BY } from '@application/dtos/shared/cores/enums/example.enums';
import {
  EXAMPLE_STATUS,
  SORT_ORDER,
} from '@infrastructure/shared/enums/business.enum';

const mockPrismaService = {
  example: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ExampleRepository', () => {
  let repository: ExampleRepository;

  beforeEach(() => {
    repository = new ExampleRepository(mockPrismaService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findDetailById', () => {
    it('should scope the lookup to the project', async () => {
      const example = { id: 'ex-1', project_id: 'proj-1' };
      mockPrismaService.example.findUnique.mockResolvedValue(example);

      const result = await repository.findDetailById('proj-1', 'ex-1');

      expect(mockPrismaService.example.findUnique).toHaveBeenCalledWith({
        where: { id: 'ex-1', project_id: 'proj-1' },
      });
      expect(result).toEqual(example);
    });
  });

  describe('findByProjectId', () => {
    beforeEach(() => {
      mockPrismaService.example.findMany.mockResolvedValue([{ id: 'ex-1' }]);
      mockPrismaService.example.count.mockResolvedValue(1);
    });

    it('should default to newest first when no sort is given', async () => {
      const query = Object.assign(new ExampleListRequest(), {
        page: 1,
        perPage: 20,
        sortOrder: undefined,
      });

      const result = await repository.findByProjectId('proj-1', query);

      expect(mockPrismaService.example.findMany).toHaveBeenCalledWith({
        where: { project_id: 'proj-1' },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(mockPrismaService.example.count).toHaveBeenCalledWith({
        where: { project_id: 'proj-1' },
      });
      expect(result).toEqual({ data: [{ id: 'ex-1' }], total: 1 });
    });

    it('should map sortBy to its column and apply the status filter', async () => {
      const query = Object.assign(new ExampleListRequest(), {
        page: 3,
        perPage: 10,
        sortBy: EXAMPLE_SORT_BY.UPDATED_AT,
        sortOrder: SORT_ORDER.ASC,
        status: EXAMPLE_STATUS.INACTIVE,
      });

      await repository.findByProjectId('proj-1', query);

      expect(mockPrismaService.example.findMany).toHaveBeenCalledWith({
        where: { project_id: 'proj-1', status: EXAMPLE_STATUS.INACTIVE },
        orderBy: { updated_at: 'asc' },
        skip: 20,
        take: 10,
      });
    });
  });

  describe('create', () => {
    it('should map the request to snake_case columns', async () => {
      const payload = {
        projectId: 'proj-1',
        name: 'Example 1',
        description: 'desc',
        status: EXAMPLE_STATUS.ACTIVE,
      };
      mockPrismaService.example.create.mockResolvedValue({ id: 'ex-1' });

      const result = await repository.create(payload);

      expect(mockPrismaService.example.create).toHaveBeenCalledWith({
        data: {
          project_id: 'proj-1',
          name: 'Example 1',
          description: 'desc',
          status: EXAMPLE_STATUS.ACTIVE,
        },
      });
      expect(result).toEqual({ id: 'ex-1' });
    });
  });

  describe('update', () => {
    it('should pass only the sent fields, leaving the rest undefined', async () => {
      mockPrismaService.example.update.mockResolvedValue({ id: 'ex-1' });

      await repository.update('proj-1', 'ex-1', { name: 'Renamed' });

      expect(mockPrismaService.example.update).toHaveBeenCalledWith({
        where: { id: 'ex-1', project_id: 'proj-1' },
        data: { name: 'Renamed', description: undefined, status: undefined },
      });
    });
  });

  describe('delete', () => {
    it('should scope the delete to the project', async () => {
      mockPrismaService.example.delete.mockResolvedValue({ id: 'ex-1' });

      const result = await repository.delete('proj-1', 'ex-1');

      expect(mockPrismaService.example.delete).toHaveBeenCalledWith({
        where: { id: 'ex-1', project_id: 'proj-1' },
      });
      expect(result).toEqual({ id: 'ex-1' });
    });
  });
});
