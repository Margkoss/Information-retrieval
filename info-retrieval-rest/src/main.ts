import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Instatiate config service
  const configService = new ConfigService();
  // Create app
  const app = await NestFactory.create(AppModule);
  // Enable cors
  app.enableCors();

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
