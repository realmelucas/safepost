import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.alerts.list(status);
  }

  @Post(':id/ack')
  ack(@Param('id') id: string, @Body('operator') operator: string) {
    return this.alerts.ack(id, operator);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body('operator') operator: string,
    @Body('note') note?: string
  ) {
    return this.alerts.resolve(id, operator, note);
  }
}
