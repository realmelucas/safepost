import type { VitalSignData } from '../../types/common';

interface WorkerBaseline {
  temperature: number;
  heartRate: number;
  spo2: number;
}

const workerBaselines: Record<string, WorkerBaseline> = {
  '53:57:08:03:00:01': { temperature: 36.5, heartRate: 72, spo2: 98 },
  '53:57:08:03:00:02': { temperature: 36.3, heartRate: 68, spo2: 97 },
  '53:57:08:03:00:03': { temperature: 36.7, heartRate: 75, spo2: 98 },
  '53:57:08:03:00:04': { temperature: 36.4, heartRate: 70, spo2: 97 },
  '53:57:08:03:00:05': { temperature: 36.6, heartRate: 65, spo2: 99 },
  '53:57:08:03:00:06': { temperature: 36.5, heartRate: 73, spo2: 98 },
  '53:57:08:03:00:07': { temperature: 36.2, heartRate: 78, spo2: 96 },
  '53:57:08:03:00:08': { temperature: 36.0, heartRate: 80, spo2: 95 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function randomDelta(range: number): number {
  return (Math.random() - 0.5) * 2 * range;
}

export class VitalSignGenerator {
  private batteryLevels: Record<string, number> = {};

  constructor() {
    for (const mac of Object.keys(workerBaselines)) {
      this.batteryLevels[mac] = 85 + Math.random() * 10;
    }
  }

  generateNormal(mac: string, timestamp: string): VitalSignData {
    const baseline = workerBaselines[mac] ?? { temperature: 36.5, heartRate: 70, spo2: 98 };

    this.batteryLevels[mac] = clamp(this.batteryLevels[mac] - (Math.random() * 0.05), 20, 100);

    return {
      temperature: parseFloat((clamp(baseline.temperature + randomDelta(0.3), 35.5, 37.5)).toFixed(1)),
      heartRate: Math.round(clamp(baseline.heartRate + randomDelta(5), 55, 100)),
      spo2: Math.round(clamp(baseline.spo2 + randomDelta(1), 95, 100)),
      battery: Math.round(this.batteryLevels[mac]),
      txPower: Math.round(-8 + randomDelta(2)),
      timestamp,
    };
  }

  generateAbnormal(mac: string, timestamp: string, type?: 'temperature' | 'heartRate' | 'spo2'): VitalSignData {
    const baseline = workerBaselines[mac] ?? { temperature: 36.5, heartRate: 70, spo2: 98 };
    const types: Array<'temperature' | 'heartRate' | 'spo2'> = type ? [type] : ['temperature', 'heartRate', 'spo2'];
    const pick = types[Math.floor(Math.random() * types.length)];

    const data = this.generateNormal(mac, timestamp);

    switch (pick) {
      case 'temperature':
        data.temperature = parseFloat((Math.random() > 0.5 ? 39.2 + Math.random() * 1.5 : 34.0 + Math.random() * 1.0).toFixed(1));
        break;
      case 'heartRate':
        data.heartRate = Math.random() > 0.5
          ? Math.round(145 + Math.random() * 20)
          : Math.round(25 + Math.random() * 15);
        break;
      case 'spo2':
        data.spo2 = Math.round(80 + Math.random() * 10);
        break;
    }

    return data;
  }
}
