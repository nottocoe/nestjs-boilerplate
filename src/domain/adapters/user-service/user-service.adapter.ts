import { MemberValidationType } from '@application/dtos/shared/cores/types/user-adapter.type';
import { UserServiceAdapterPort } from './user-service.adapter.port';
import { UserServiceAPIConfig } from '@config/config';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { ClsService } from 'nestjs-cls';
import { jwtDecode } from 'jwt-decode';

export class UserServiceAdapter implements UserServiceAdapterPort {
  axios: AxiosInstance;
  constructor(
    _config: UserServiceAPIConfig,
    private readonly cls: ClsService,
  ) {
    this.axios = axios.create({
      baseURL: `${_config.url}`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
      }),
    });
  }

  async validateMemberInProject(projectId: string): Promise<boolean> {
    try {
      const token = this.cls.get('jwt_token');

      const { data: response } = await this.axios.get<MemberValidationType>(
        `/project-information/${projectId}/members`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      const pureToken = token.replace('Bearer ', '');
      const { sub: userId } = jwtDecode(pureToken);

      return response.data.members.some((member) => member.userId === userId);
    } catch (error) {
      return false;
    }
  }
}
