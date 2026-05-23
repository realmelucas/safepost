import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BadgeStatus, BadgesService } from './badges.service';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get()
  list() {
    return this.badges.list();
  }

  @Post(':badgeNo/bind')
  bind(@Param('badgeNo') badgeNo: string, @Body('workerId') workerId: string) {
    return this.badges.bind(badgeNo, workerId);
  }

  @Post(':badgeNo/status')
  setStatus(
    @Param('badgeNo') badgeNo: string,
    @Body('status') status: BadgeStatus,
    @Body('reason') reason = '状态更新'
  ) {
    return this.badges.setStatus(badgeNo, status, reason);
  }
}
