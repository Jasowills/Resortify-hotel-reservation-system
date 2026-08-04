import { NestFactory } from '@nestjs/core';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`Resortify API → http://localhost:${port}/api`);
  return app;
}

if (require.main === module) {
  bootstrap();
}
