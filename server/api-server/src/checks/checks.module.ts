import { Module } from '@nestjs/common';
import { BadgesModule } from '../badges/badges.module';
import { ChecksController } from './checks.controller';
import { ChecksService } from './checks.service';

@Module({
  imports: [BadgesModule],
  controllers: [ChecksController],
  providers: [ChecksService]
})
export class ChecksModule {}
