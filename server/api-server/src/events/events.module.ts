import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { EventsService } from './events.service';

@Module({
  imports: [AlertsModule],
  providers: [EventsService]
})
export class EventsModule {}
