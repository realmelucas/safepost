import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateWorkerInput, WorkersService } from './workers.service';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workers: WorkersService) {}

  @Get()
  list() {
    return this.workers.list();
  }

  @Post()
  create(@Body() input: CreateWorkerInput) {
    return this.workers.create(input);
  }
}
