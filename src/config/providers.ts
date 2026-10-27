import { ClsService } from 'nestjs-cls';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Provider } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { ExampleService } from '@domain/services';
import { ExampleRepository, ExampleRepositoryPort } from '@domain/repositories';
import { UserServiceAdapter, UserServiceAdapterPort } from '@domain/adapters';
import { ExampleEventListener } from '@domain/events';
import {
  ADAPTERS,
  EVENTS,
  REPOSITORY,
  SERVICES,
} from '@infrastructure/shared/enums/core.enum';
import { UserServiceAPIConfig } from './config';

//services provider
export const ExampleServiceProvider: Provider = {
  provide: SERVICES.EXAMPLE_SERVICE,
  useFactory(
    exampleRepository: ExampleRepositoryPort,
    userServiceAdapter: UserServiceAdapterPort,
    eventEmitter: EventEmitter2,
  ) {
    return new ExampleService(
      exampleRepository,
      userServiceAdapter,
      eventEmitter,
    );
  },
  inject: [
    REPOSITORY.EXAMPLE_REPOSITORY,
    ADAPTERS.USER_SERVICE_ADAPTER,
    EventEmitter2,
  ],
};

//adapters provider
export const UserServiceAdapterProvider: Provider = {
  provide: ADAPTERS.USER_SERVICE_ADAPTER,
  useFactory(config: UserServiceAPIConfig, cls: ClsService) {
    return new UserServiceAdapter(config, cls);
  },
  inject: [UserServiceAPIConfig, ClsService],
};

//repositories provider
export const ExampleRepositoryProvider: Provider = {
  provide: REPOSITORY.EXAMPLE_REPOSITORY,
  useFactory(prisma: PrismaService) {
    return new ExampleRepository(prisma);
  },
  inject: [PrismaService],
};

//events provider
export const ExampleEventListenerProvider: Provider = {
  provide: EVENTS.EXAMPLE_EVENT_HANDLER,
  useFactory() {
    return new ExampleEventListener();
  },
};
