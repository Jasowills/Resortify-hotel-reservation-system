import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let app: INestApplication | undefined;

async function getApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }
  return app;
}

export default async function handler(req: Request, res: Response) {
  try {
    const instance = await getApp();
    instance.getHttpAdapter().getInstance()(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
