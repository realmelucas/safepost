import type { GatewayMessage, BlePacket1, BlePacket2 } from '../../types/device';
import type { WorkerInfo } from '../../types/worker';
import type { AlertInfo } from '../../types/alert';
import { mockWorkers } from '../data/workers';
import { VitalSignGenerator } from '../generators/vitalSignGenerator';
import { generateDeviceInfo } from '../generators/deviceInfoGenerator';
import { AlertSimulator } from './alertSimulator';

const GATEWAY_IP = '192.168.1.100';
const GATEWAY_MAC = 'AA:BB:CC:DD:EE:FF';
const GATEWAY_VERSION = '2.0.1';

export type DataCallback = (message: GatewayMessage) => void;
export type AlertCallback = (alert: AlertInfo) => void;

export class MockWebSocketManager {
  private dataCallbacks: DataCallback[] = [];
  private alertCallbacks: AlertCallback[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private workers: WorkerInfo[];
  private vitalSignGen: VitalSignGenerator;
  private alertSim: AlertSimulator;

  constructor() {
    this.workers = mockWorkers.map((w) => ({ ...w }));
    this.vitalSignGen = new VitalSignGenerator();
    this.alertSim = new AlertSimulator();

    this.alertSim.onAlert((alert) => {
      this.alertCallbacks.forEach((cb) => cb(alert));
    });
  }

  start(): void {
    if (this.intervalId !== null) return;

    this.intervalId = setInterval(() => {
      this.tick++;
      const onlineWorkers = this.workers.filter((w) => w.status === 'on_duty');
      const isVitalRound = this.tick % 2 === 1;

      if (onlineWorkers.length > 0) {
        const message: GatewayMessage = {
          v: GATEWAY_VERSION,
          mid: crypto.randomUUID(),
          time: Math.floor(Date.now() / 1000),
          ip: GATEWAY_IP,
          mac: GATEWAY_MAC,
          devices: onlineWorkers.map((worker) => {
            if (isVitalRound) {
              const vitalData = this.vitalSignGen.generateNormal(worker.mac, new Date().toISOString());
              const packet: BlePacket1 = {
                serviceUuid: '0x1803',
                temperature: vitalData.temperature,
                heartRate: vitalData.heartRate,
                spo2: vitalData.spo2,
              };
              return {
                mac: worker.mac,
                rssi: worker.gatewayRssi + Math.round((Math.random() - 0.5) * 10),
                rawData: packet,
              };
            } else {
              const battery = 85 - (this.tick * 0.02) + Math.random() * 2;
              const packet: BlePacket2 = generateDeviceInfo(worker.mac, Math.max(20, Math.round(battery)));
              return {
                mac: worker.mac,
                rssi: worker.gatewayRssi + Math.round((Math.random() - 0.5) * 10),
                rawData: packet,
              };
            }
          }),
        };

        this.dataCallbacks.forEach((cb) => cb(message));
      }

      this.alertSim.tick(this.workers);
    }, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback: DataCallback): () => void {
    this.dataCallbacks.push(callback);
    return () => {
      this.dataCallbacks = this.dataCallbacks.filter((cb) => cb !== callback);
    };
  }

  unsubscribe(callback: DataCallback): void {
    this.dataCallbacks = this.dataCallbacks.filter((cb) => cb !== callback);
  }

  onAlert(callback: AlertCallback): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter((cb) => cb !== callback);
    };
  }

  getWorkers(): WorkerInfo[] {
    return this.workers;
  }

  getAlerts(): AlertInfo[] {
    return this.alertSim.getAlerts();
  }

  processAlert(alertId: string, action: string, remark: string, processedBy?: string): AlertInfo | undefined {
    return this.alertSim.processAlert(alertId, action, remark, processedBy);
  }

  /** 手动触发报警（演示用） */
  triggerAlert(type: string, workerName?: string): AlertInfo | undefined {
    const onlineWorkers = this.workers.filter(w => w.status === 'on_duty');
    let worker: WorkerInfo | undefined;
    if (workerName) {
      worker = onlineWorkers.find(w => w.name === workerName);
    }
    if (!worker) {
      worker = onlineWorkers[Math.floor(Math.random() * onlineWorkers.length)];
    }
    if (!worker) return undefined;
    return this.alertSim.triggerAlert(type as any, worker);
  }

  resetAlerts(): void {
    this.alertSim.reset();
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
