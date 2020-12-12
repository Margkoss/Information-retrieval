import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  // Instatiate config service
  const configService = new ConfigService();
  // Create app
  const app = await NestFactory.create(AppModule);
  // Enable cors
  app.enableCors();

  // Enable a global rate limiter for api calls
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes in miliseconds
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Set a global prefix
  app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'));

  // Create swagger documentation
  const options = new DocumentBuilder()
    .setTitle('Information Retreival Rest')
    .setDescription('Information Retreival school project rest API descriptor')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(configService.get('NODE_PORT'));
}
bootstrap();
