import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LogLevel } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { AllExceptionFilter } from './common/exception/exception.filter';
import { ValidationPipe } from './common/validation/validation.pipe';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL.split(',') as LogLevel[],
  });

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID + new Date().getTime(),
        brokers: [process.env.KAFKA_HOST],
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID + new Date().getTime(),
        allowAutoTopicCreation: true,
      },
    },
  });
  app.startAllMicroservices();

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  if (process.env.SWAGGER_IS_SHOW === 'true') {
    app.use(
      ['/swagger'],
      expressBasicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('Marketplace')
      .setDescription('The marketplace API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'My API Docs',
    };
    SwaggerModule.setup('swagger', app, document, customOptions);
  }

  await app.listen(process.env.PORT);
}
bootstrap();
