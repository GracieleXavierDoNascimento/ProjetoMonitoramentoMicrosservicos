import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // registra a entidade User
    // NÃO registre PrometheusModule aqui para evitar métricas duplicadas
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    // Contador de requisições
    makeCounterProvider({
      name: 'users_requests_total',
      help: 'Total de requisições do Users',
      labelNames: ['method', 'route'],
    }),
    // Histograma de duração de respostas
    makeHistogramProvider({
      name: 'users_response_duration_seconds',
      help: 'Duração das respostas do Users',
      labelNames: ['method', 'route'],
    }),
  ],
  exports: [UsersService], // exporta o service se outro módulo precisar
})
export class UsersModule {}
