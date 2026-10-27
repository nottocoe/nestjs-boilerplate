import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PassportModule } from '@nestjs/passport';
import { ClsModule } from 'nestjs-cls';
import { AllExceptionsFilter } from '@infrastructure/filters/exception.filter';
import { CorrelationIdMiddleware } from '@infrastructure/middleware/correlation-id.middleware';
import { JwtStrategy } from '@infrastructure/authentication/jwt.strategy';
import { JwtConfig } from '@config/config';
import { HealthModule } from './core/health.module';
import { PrismaModule } from './core/prisma.module';
import { ExampleModule } from './services';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    PrismaModule,
    EventEmitterModule.forRoot(),
    PassportModule,
    HealthModule,
    ExampleModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    JwtStrategy,
    JwtConfig,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
