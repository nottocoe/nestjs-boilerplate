import { createLogger, format, transports } from 'winston';
import ecsFormat from '@elastic/ecs-winston-format';

export const ecsLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',

  format: format.combine(
    format.timestamp(),
    ecsFormat({
      convertReqRes: true,
      apmIntegration: true,
    }),
  ),

  transports: [new transports.Console()],
});
