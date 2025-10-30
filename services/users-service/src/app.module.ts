import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { User } from './users/entities/user.entity';
import './tracing';

@Module({
  imports: [
    // Inicializa Prometheus e cria o endpoint /metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true, // habilita métricas padrão (CPU, memória, etc.)
      },
      path: '/metrics', // endpoint onde o Prometheus vai coletar
    }),

    // Configuração do TypeORM para PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',      
      password: 'senha123',      
      database: 'meu_banco',     
      entities: [User],          
      synchronize: true,         
    }),

    // Módulo de usuários
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
