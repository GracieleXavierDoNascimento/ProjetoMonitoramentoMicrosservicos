import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectMetric('users_requests_total') private readonly usersCounter: Counter<string>,
    @InjectMetric('users_response_duration_seconds') private readonly usersHistogram: Histogram<string>,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const end = this.usersHistogram.startTimer({ method: 'POST', route: '/users' });
    this.usersCounter.inc({ method: 'POST', route: '/users' });
    const result = await this.usersService.create(dto);
    end();
    return result;
  }

  @Get()
  async findAll() {
    const end = this.usersHistogram.startTimer({ method: 'GET', route: '/users' });
    this.usersCounter.inc({ method: 'GET', route: '/users' });
    const result = await this.usersService.findAll();
    end();
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const end = this.usersHistogram.startTimer({ method: 'GET', route: '/users/:id' });
    this.usersCounter.inc({ method: 'GET', route: '/users/:id' });
    const result = await this.usersService.findOne(id);
    end();
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateUserDto) {
    const end = this.usersHistogram.startTimer({ method: 'PUT', route: '/users/:id' });
    this.usersCounter.inc({ method: 'PUT', route: '/users/:id' });
    const result = await this.usersService.update(id, dto);
    end();
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const end = this.usersHistogram.startTimer({ method: 'DELETE', route: '/users/:id' });
    this.usersCounter.inc({ method: 'DELETE', route: '/users/:id' });
    await this.usersService.remove(id);
    end();
    return { message: 'User deleted', userId: id };
  }
}
