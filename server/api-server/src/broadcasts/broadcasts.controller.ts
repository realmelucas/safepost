import { Body, Controller, Post } from '@nestjs/common';
import { BroadcastInput, BroadcastsService } from './broadcasts.service';

@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcasts: BroadcastsService) {}

  @Post()
  send(@Body() input: BroadcastInput) {
    return this.broadcasts.send(input);
  }
}
