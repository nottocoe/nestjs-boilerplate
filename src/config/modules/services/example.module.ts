import { Module } from '@nestjs/common';
import { PrismaModule } from '../core/prisma.module';
import { ExampleController } from '@application/controllers/example.controller';
import { UserServiceAPIConfig } from '@config/config';
import {
  ExampleEventListenerProvider,
  ExampleRepositoryProvider,
  ExampleServiceProvider,
  UserServiceAdapterProvider,
} from '@config/providers';

@Module({
  imports: [PrismaModule],
  controllers: [ExampleController],
  providers: [
    ExampleServiceProvider,
    ExampleRepositoryProvider,
    ExampleEventListenerProvider,
    UserServiceAPIConfig,
    UserServiceAdapterProvider,
  ],
})
export class ExampleModule {}
