import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { BadgesService, BadgeStatus } from '../badges/badges.service';
import { PG_POOL } from '../db/db.module';

export interface CheckInput {
  workerId: string;
  badgeNo: string;
  stationNo?: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  alcoholMg100ml: number;
}

@Injectable()
export class ChecksService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly badges: BadgesService
  ) {}

  async create(input: CheckInput) {
    const passed = this.evaluate(input);
    const status: BadgeStatus = passed ? 'ALLOWED' : 'FORBIDDEN';
    const reason = passed ? '检测通过' : '血压或酒精检测未通过';

    await this.pool.query(
      `INSERT INTO check_records
       (worker_id, systolic, diastolic, heart_rate, alcohol_mg_100ml, passed, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.workerId,
        input.systolic,
        input.diastolic,
        input.heartRate ?? null,
        input.alcoholMg100ml,
        passed,
        reason
      ]
    );

    await this.badges.setStatus(input.badgeNo, status, reason);

    return { passed, badgeStatus: status, reason };
  }

  private evaluate(input: CheckInput) {
    const bloodPressureOk = input.systolic >= 90 && input.systolic <= 140
      && input.diastolic >= 60 && input.diastolic <= 90;
    const alcoholOk = input.alcoholMg100ml <= 0;
    return bloodPressureOk && alcoholOk;
  }
}
