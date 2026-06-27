import type { AlertInfo, AlertType } from '../../types/alert';
import type { WorkerInfo } from '../../types/worker';

export type AlertCallback = (alert: AlertInfo) => void;

interface TimelineEvent {
  time: number;
  type: AlertType;
  workerName: string;
  workerId: string;
  summary: string;
}

const LOCATIONS = ['1号岗亭', '2号岗亭', '3号岗亭', '4号岗亭', '5号岗亭', '6号岗亭', '7号岗亭', '8号岗亭'];

const DEMO_TIMELINE: TimelineEvent[] = [
  { time: 10, type: 'vital_abnormal', workerName: '王五', workerId: '', summary: '体温异常：39.5°C' },
  { time: 25, type: 'lost',           workerName: '赵六', workerId: '', summary: '设备信号中断超过60秒' },
  { time: 40, type: 'sos',            workerName: '张三', workerId: '', summary: 'SOS紧急求救触发' },
  { time: 55, type: 'no_response',    workerName: '孙七', workerId: '', summary: '连续3次无响应' },
];

export class AlertSimulator {
  private alerts: AlertInfo[] = [];
  private callbacks: AlertCallback[] = [];
  private elapsed = 0;
  private timelineIndex = 0;
  private timelineTriggers: TimelineEvent[] = [];

  constructor() {
    this.timelineTriggers = DEMO_TIMELINE.map((e) => ({ ...e }));
  }

  onAlert(cb: AlertCallback): () => void {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  getAlerts(): AlertInfo[] {
    return this.alerts;
  }

  tick(onlineWorkers: WorkerInfo[]): void {
    this.elapsed++;

    // 检查预设时间线
    while (
      this.timelineIndex < this.timelineTriggers.length &&
      this.timelineTriggers[this.timelineIndex].time <= this.elapsed
    ) {
      const t = this.timelineTriggers[this.timelineIndex];
      const worker = onlineWorkers.find((w) => w.name === t.workerName);
      const alert: AlertInfo = {
        id: crypto.randomUUID(),
        type: t.type,
        workerName: t.workerName,
        workerId: worker?.id ?? t.workerId,
        location: worker?.position ?? LOCATIONS[this.timelineIndex],
        triggeredAt: new Date().toISOString(),
        duration: 0,
        summary: t.summary,
        processed: false,
      };
      this.alerts.unshift(alert);
      this.callbacks.forEach((cb) => cb(alert));
      this.timelineIndex++;
    }

    // 随机触发（低概率，演示时间线完成后）
    if (this.timelineIndex >= this.timelineTriggers.length && onlineWorkers.length > 0) {
      if (Math.random() < 0.008) {
        const types: AlertType[] = ['sos', 'lost', 'no_response', 'vital_abnormal'];
        const type = types[Math.floor(Math.random() * types.length)];
        const worker = onlineWorkers[Math.floor(Math.random() * onlineWorkers.length)];

        const summaries: Record<AlertType, string> = {
          sos: 'SOS紧急求救触发',
          lost: '设备信号中断超过60秒',
          no_response: '连续多次无响应',
          vital_abnormal: '体征数据异常波动',
        };

        const alert: AlertInfo = {
          id: crypto.randomUUID(),
          type,
          workerName: worker.name,
          workerId: worker.id,
          location: worker.position,
          triggeredAt: new Date().toISOString(),
          duration: 0,
          summary: summaries[type],
          processed: false,
        };
        this.alerts.unshift(alert);
        this.callbacks.forEach((cb) => cb(alert));
      }

      // 更新持续时间
      const now = new Date();
      for (const alert of this.alerts) {
        if (!alert.processed) {
          alert.duration = Math.floor((now.getTime() - new Date(alert.triggeredAt).getTime()) / 1000);
        }
      }
    }
  }

  processAlert(alertId: string, action: string, remark: string, processedBy?: string): AlertInfo | undefined {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.processed) {
      alert.processed = true;
      alert.processedAt = new Date().toISOString();
      alert.processedBy = processedBy ?? '管理员';
      alert.action = action;
      alert.remark = remark;
    }
    return alert;
  }

  /** 手动触发报警（演示用） */
  triggerAlert(type: AlertType, worker: WorkerInfo, summary?: string): AlertInfo {
    const summaries: Record<AlertType, string> = {
      sos: 'SOS紧急求救触发（手动演示）',
      lost: '设备信号中断（手动演示）',
      no_response: '连续多次无响应（手动演示）',
      vital_abnormal: '体征数据异常波动（手动演示）',
    };

    const alert: AlertInfo = {
      id: crypto.randomUUID(),
      type,
      workerName: worker.name,
      workerId: worker.id,
      location: worker.position,
      triggeredAt: new Date().toISOString(),
      duration: 0,
      summary: summary || summaries[type],
      processed: false,
    };
    this.alerts.unshift(alert);
    this.callbacks.forEach((cb) => cb(alert));
    return alert;
  }

  reset(): void {
    this.alerts = [];
    this.elapsed = 0;
    this.timelineIndex = 0;
    this.timelineTriggers = DEMO_TIMELINE.map((e) => ({ ...e }));
  }
}
