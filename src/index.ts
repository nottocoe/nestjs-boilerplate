import { NestFactory } from '@nestjs/core';
import { AppModule } from '@config/modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { LoggerInterceptor } from '@infrastructure/interceptor/logger.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          mediaSrc: ["'self'", 'data:', 'blob:', 'https:'],
        },
      },
    }),
  );

  app.enableCors();

  app.useGlobalInterceptors(new LoggerInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NWL Boilerplate')
    .setDescription('NWL Boilerplate APIs Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀  Server is running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
