export interface VitalSignData {
  temperature: number;
  heartRate: number;
  spo2: number;
  battery: number;
  txPower: number;
  timestamp: string;
}

export const VITAL_THRESHOLDS = {
  temperature: { min: 35.0, max: 38.5, critical: 39.0 },
  heartRate:   { min: 40,   max: 120,  critical: 140 },
  spo2:        { min: 94,   max: 100,  critical: 90 },
} as const;
