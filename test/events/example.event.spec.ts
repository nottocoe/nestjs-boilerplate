import { ExampleEventListener } from '@domain/events';
import { ecsLogger } from '@config/logger.config';

describe('ExampleEventListener', () => {
  let listener: ExampleEventListener;

  beforeEach(() => {
    listener = new ExampleEventListener();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleExampleCreatedEvent', () => {
    it('should log the created example', () => {
      const infoSpy = jest
        .spyOn(ecsLogger, 'info')
        .mockImplementation(() => ecsLogger);
      const payload = { id: 'ex-1', projectId: 'proj-1', name: 'Example 1' };

      listener.handleExampleCreatedEvent(payload);

      expect(infoSpy).toHaveBeenCalledWith({
        event: { action: 'example_created' },
        example: payload,
      });
    });
  });
});
