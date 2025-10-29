// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Cria um novo usuário
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  // Lista todos os usuários
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Busca um usuário específico pelo ID (pode retornar null)
  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
}
