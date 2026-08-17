import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from apps/api/.env and cwd .env before NestFactory boots
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      const allowedDomains = [
        'https://hq.netify.ng',
        'http://hq.netify.ng',
        'https://www.hq.netify.ng',
        'https://admin.hq.netify.ng',
        'http://admin.hq.netify.ng',
        'https://api.hq.netify.ng',
        'http://api.hq.netify.ng',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5000',
      ];

      if (
        allowedDomains.includes(origin) ||
        /\.netify\.ng$/.test(origin) ||
        /\.run\.app$/.test(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-Company-Id, X-User-Id',
  });

  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('HQ API')
    .setDescription(
      'The core REST API service contracts for HQ: Your AI Headquarters',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(
    `\n🚀 HQ API Backend successfully listening on http://localhost:${port}\n📖 Swagger API Documentation available at http://localhost:${port}/api/docs\n`,
  );
}
bootstrap();
