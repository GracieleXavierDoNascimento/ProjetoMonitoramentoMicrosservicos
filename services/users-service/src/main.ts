import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './tracing';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3007);
  console.log(`🚀 Users service running on http://localhost:3007`);
}
bootstrap();
