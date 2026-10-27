import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { EVENT_TRIGGER } from '@infrastructure/shared/enums/core.enum';
import { ExampleCreatedPayload } from '@application/dtos/shared/cores/types/example.type';
import { ecsLogger } from '@config/logger.config';

@Injectable()
export class ExampleEventListener {
  @OnEvent(EVENT_TRIGGER.EXAMPLE_CREATED)
  handleExampleCreatedEvent(payload: ExampleCreatedPayload): void {
    ecsLogger.info({
      event: { action: 'example_created' },
      example: payload,
    });
  }
}
