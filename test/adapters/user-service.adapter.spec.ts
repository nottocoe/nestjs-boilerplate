import { UserServiceAdapter } from '@domain/adapters';
import { ClsService } from 'nestjs-cls';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

jest.mock('axios');
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('UserServiceAdapter', () => {
  let adapter: UserServiceAdapter;
  let mockAxiosInstance: { get: jest.Mock };

  beforeEach(() => {
    const mockClsService = {
      get: jest.fn().mockReturnValue('Bearer mocked-token'),
    };
    mockAxiosInstance = { get: jest.fn() };
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    adapter = new UserServiceAdapter(
      { url: 'http://test-url' },
      mockClsService as unknown as ClsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMemberInProject', () => {
    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          data: { members: [{ userId: 'user-1', email: 'a@test.com' }] },
        },
      });
    });

    it('should forward the caller token to the user service', async () => {
      (jwtDecode as jest.Mock).mockReturnValue({ sub: 'user-1' });

      await adapter.validateMemberInProject('proj-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/project-information/proj-1/members',
        { headers: { Authorization: 'Bearer mocked-token' } },
      );
      expect(jwtDecode).toHaveBeenCalledWith('mocked-token');
    });

    it('should return true when the caller is a member', async () => {
      (jwtDecode as jest.Mock).mockReturnValue({ sub: 'user-1' });

      await expect(adapter.validateMemberInProject('proj-1')).resolves.toBe(
        true,
      );
    });

    it('should return false when the caller is not a member', async () => {
      (jwtDecode as jest.Mock).mockReturnValue({ sub: 'user-2' });

      await expect(adapter.validateMemberInProject('proj-1')).resolves.toBe(
        false,
      );
    });

    it('should return false when the request fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('network'));

      await expect(adapter.validateMemberInProject('proj-1')).resolves.toBe(
        false,
      );
    });
  });
});
