import 'reflect-metadata';
import * as express from 'express';
import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/create-app';

const expressApp = express();
let bootstrapped: Promise<express.Express> | null = null;

async function bootstrap(): Promise<express.Express> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  configureApp(app);
  await app.init();
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  if (!bootstrapped) {
    bootstrapped = bootstrap();
  }
  const app = await bootstrapped;
  app(req, res);
}
