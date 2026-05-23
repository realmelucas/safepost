import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './alerts/alerts.module';
import { BadgesModule } from './badges/badges.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { ChecksModule } from './checks/checks.module';
import { DbModule } from './db/db.module';
import { EventsModule } from './events/events.module';
import { WecomModule } from './wecom/wecom.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    WecomModule,
    WorkersModule,
    BadgesModule,
    BroadcastsModule,
    ChecksModule,
    AlertsModule,
    EventsModule
  ]
})
export class AppModule {}
