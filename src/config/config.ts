import { Injectable } from '@nestjs/common';

require('dotenv').config();

@Injectable()
export class JwtConfig {
  secret: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }

    this.secret = process.env.JWT_SECRET;
  }
}

@Injectable()
export class UserServiceAPIConfig {
  url: string;

  constructor() {
    this.url =
      process.env.USER_SERVICE_API_URL || 'https://test.user-api.nwl-dev.com';
  }
}
