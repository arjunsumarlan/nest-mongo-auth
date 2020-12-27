import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './core/filters/http.filter';
import { FallbackExceptionFilter } from './core/filters/fallback.filter';
import { RequestContextMiddleware } from './core/middleware/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  // app.setGlobalPrefix('api');
  app.use(RequestContextMiddleware.rawExpressMiddleware);
  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new HttpExceptionFilter()
  );

  const options = new DocumentBuilder()
    .setTitle('Api ')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(AppModule.port || 5000);
}
bootstrap();
