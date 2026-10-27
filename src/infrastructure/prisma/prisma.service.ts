import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { createPgAdapter } from './prisma.client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const { adapter, pool } = createPgAdapter();

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'warn', 'error']
          : ['error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      client.release();

      await this.$connect();

      this.logger.log('✅ Database connection established successfully.');
    } catch (error) {
      this.logger.error('❌ Failed to connect to the database.');
      this.logger.error('👉 Is the Postgres Docker container running?');
      this.logger.error(error.message);

      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
