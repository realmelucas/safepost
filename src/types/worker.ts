export type WorkerStatus = 'on_duty' | 'pending_check' | 'blocked' | 'offline';

export interface WorkerInfo {
  id: string;
  name: string;
  employeeId: string;
  mac: string;
  cardId: string;
  status: WorkerStatus;
  position: string;
  gatewayRssi: number;
  workStartTime?: string;
  bloodPressure?: string;    // "120/80"
  alcoholLevel?: number;     // 0.00
  lastCheckTime?: string;
}
