import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Create
  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(dto);
    return await this.usersRepository.save(user);
  }

  // Read all
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // Read one
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // Update
  async update(id: string, dto: CreateUserDto): Promise<User> {
    const user = await this.findOne(id); // garante que existe
    await this.usersRepository.update(id, dto);
    return this.findOne(id); // retorna o usuário atualizado
  }

  // Delete
  async remove(id: string): Promise<{ deleted: boolean }> {
    const user = await this.findOne(id); // garante que existe
    await this.usersRepository.delete(id);
    return { deleted: true };
  }
}
