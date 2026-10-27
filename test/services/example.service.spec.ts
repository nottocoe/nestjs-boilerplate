import { ExampleService } from '@domain/services';
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from '@infrastructure/shared/exceptions/http-error';
import { DOMAIN, EVENT_TRIGGER } from '@infrastructure/shared/enums/core.enum';
import { EXAMPLE_STATUS } from '@infrastructure/shared/enums/business.enum';
import { ExampleListRequest } from '@application/dtos/request/example.request';

const mockExampleRepository = {
  findDetailById: jest.fn(),
  findByProjectId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockUserServiceAdapter = {
  validateMemberInProject: jest.fn(),
};
const mockEventEmitter = {
  emit: jest.fn(),
};

const row = {
  id: 'ex-1',
  project_id: 'proj-1',
  name: 'Example 1',
  description: null,
  status: EXAMPLE_STATUS.ACTIVE,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-02'),
};

describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ExampleService(
      mockExampleRepository as any,
      mockUserServiceAdapter as any,
      mockEventEmitter as any,
    );
  });

  describe('error mapping', () => {
    it.each([
      [
        'a BaseException as-is',
        new BadRequestError(DOMAIN.EXAMPLE, 'Bad'),
        BadRequestError,
      ],
      ['Prisma P2002 to ConflictError', { code: 'P2002' }, ConflictError],
      ['Prisma P2025 to NotFoundError', { code: 'P2025' }, NotFoundError],
      ['an unmapped Prisma code to InternalError', { code: 'P9999' }, InternalError],
      ['a plain Error to InternalError', new Error('boom'), InternalError],
    ])('should rethrow %s', async (_label, thrown, expected) => {
      mockExampleRepository.update.mockRejectedValue(thrown);

      await expect(
        service.update('proj-1', 'ex-1', { name: 'x' }),
      ).rejects.toBeInstanceOf(expected);
    });
  });

  describe('findByProjectId', () => {
    it('should return a mapped, paginated list', async () => {
      const query = Object.assign(new ExampleListRequest(), {
        page: 2,
        perPage: 10,
      });
      mockExampleRepository.findByProjectId.mockResolvedValue({
        data: [row],
        total: 11,
      });

      const result = await service.findByProjectId('proj-1', query);

      expect(mockExampleRepository.findByProjectId).toHaveBeenCalledWith(
        'proj-1',
        query,
      );
      expect(result).toEqual({
        page: 2,
        perPage: 10,
        totalItems: 11,
        totalPages: 2,
        data: [
          {
            id: 'ex-1',
            projectId: 'proj-1',
            name: 'Example 1',
            description: '',
            status: EXAMPLE_STATUS.ACTIVE,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          },
        ],
      });
    });

    it('should throw InternalError when the repository fails', async () => {
      mockExampleRepository.findByProjectId.mockRejectedValue(new Error('db'));

      await expect(
        service.findByProjectId('proj-1', new ExampleListRequest()),
      ).rejects.toBeInstanceOf(InternalError);
    });
  });

  describe('findDetailById', () => {
    it('should return the mapped example', async () => {
      mockExampleRepository.findDetailById.mockResolvedValue(row);

      const result = await service.findDetailById('proj-1', 'ex-1');

      expect(mockExampleRepository.findDetailById).toHaveBeenCalledWith(
        'proj-1',
        'ex-1',
      );
      expect(result.status).toBe(200);
      expect(result.data.projectId).toBe('proj-1');
    });

    it('should throw NotFoundError when the example does not exist', async () => {
      mockExampleRepository.findDetailById.mockResolvedValue(null);

      await expect(
        service.findDetailById('proj-1', 'missing'),
      ).rejects.toMatchObject({
        constructor: NotFoundError,
        message: 'Example Not Found',
      });
    });
  });

  describe('create', () => {
    const request = {
      projectId: 'proj-1',
      name: 'Example 1',
      status: EXAMPLE_STATUS.ACTIVE,
    };

    it('should create the example and emit EXAMPLE_CREATED', async () => {
      mockUserServiceAdapter.validateMemberInProject.mockResolvedValue(true);
      mockExampleRepository.create.mockResolvedValue(row);

      const result = await service.create(request);

      expect(mockExampleRepository.create).toHaveBeenCalledWith(request);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        EVENT_TRIGGER.EXAMPLE_CREATED,
        { id: 'ex-1', projectId: 'proj-1', name: 'Example 1' },
      );
      expect(result.message).toBe('Create Success');
      expect(result.data.id).toBe('ex-1');
    });

    it('should reject a user who is not a project member without writing', async () => {
      mockUserServiceAdapter.validateMemberInProject.mockResolvedValue(false);

      await expect(service.create(request)).rejects.toBeInstanceOf(
        BadRequestError,
      );
      expect(mockExampleRepository.create).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return the updated example', async () => {
      mockExampleRepository.update.mockResolvedValue({
        ...row,
        name: 'Renamed',
      });

      const result = await service.update('proj-1', 'ex-1', {
        name: 'Renamed',
      });

      expect(mockExampleRepository.update).toHaveBeenCalledWith(
        'proj-1',
        'ex-1',
        { name: 'Renamed' },
      );
      expect(result.data.name).toBe('Renamed');
    });
  });

  describe('delete', () => {
    it('should return the deleted example ids', async () => {
      mockExampleRepository.delete.mockResolvedValue(row);

      const result = await service.delete('proj-1', 'ex-1');

      expect(mockExampleRepository.delete).toHaveBeenCalledWith(
        'proj-1',
        'ex-1',
      );
      expect(result.data).toMatchObject({ id: 'ex-1', projectId: 'proj-1' });
      expect(result.data.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError when the example does not exist', async () => {
      mockExampleRepository.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.delete('proj-1', 'missing')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
