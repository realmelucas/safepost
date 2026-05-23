import { Body, Controller, Post } from '@nestjs/common';
import { CheckInput, ChecksService } from './checks.service';

@Controller('checks')
export class ChecksController {
  constructor(private readonly checks: ChecksService) {}

  @Post()
  create(@Body() input: CheckInput) {
    return this.checks.create(input);
  }
}
