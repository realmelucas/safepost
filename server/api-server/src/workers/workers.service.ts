import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../db/db.module';

export interface CreateWorkerInput {
  employeeNo: string;
  name: string;
  team?: string;
  phone?: string;
}

@Injectable()
export class WorkersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async list() {
    const result = await this.pool.query('SELECT * FROM workers ORDER BY created_at DESC LIMIT 100');
    return result.rows;
  }

  async create(input: CreateWorkerInput) {
    const result = await this.pool.query(
      `INSERT INTO workers (employee_no, name, team, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.employeeNo, input.name, input.team ?? null, input.phone ?? null]
    );
    return result.rows[0];
  }
}
