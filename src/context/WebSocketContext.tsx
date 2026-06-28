import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { GatewayMessage } from '../types/device';
import type { WorkerInfo } from '../types/worker';
import type { AlertInfo } from '../types/alert';
import { MockWebSocketManager } from '../mock/simulator/mockWebSocket';
import { sendAlertToFeishu, sendResolveToFeishu } from '../services/feishuService';

export interface WebSocketContextValue {
  realtimeData: GatewayMessage | null;
  workers: WorkerInfo[];
  alerts: AlertInfo[];
  processAlert: (id: string, action: string, remark: string) => void;
  triggerAlert: (type: string, workerName?: string) => void;
  resetAlerts: () => void;
  isRunning: boolean;
  feishuEnabled: boolean;
}

export const WebSocketContext = createContext<WebSocketContextValue>({
  realtimeData: null,
  workers: [],
  alerts: [],
  processAlert: () => {},
  triggerAlert: () => {},
  resetAlerts: () => {},
  isRunning: false,
  feishuEnabled: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<MockWebSocketManager | null>(null);
  const [realtimeData, setRealtimeData] = useState<GatewayMessage | null>(null);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [feishuEnabled, setFeishuEnabled] = useState(false);

  // 启动时检测飞书后端是否可用
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setFeishuEnabled(true);
          console.log('[SafePost] 飞书集成服务已连接');
        }
      })
      .catch(() => {
        console.log('[SafePost] 飞书集成服务未启动，报警将仅在本地显示');
      });
  }, []);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new MockWebSocketManager();
    }

    const manager = managerRef.current;

    const unsubData = manager.subscribe((msg) => {
      setRealtimeData(msg);
    });

    const unsubAlert = manager.onAlert((alert) => {
      setAlerts([...manager.getAlerts()]);
      // 自动推送到飞书
      if (feishuEnabled) {
        sendAlertToFeishu(alert).then((ok) => {
          console.log(`[SafePost] 飞书推送${ok ? '成功' : '失败'}: ${alert.type} - ${alert.workerName}`);
        });
      }
    });

    manager.start();
    setIsRunning(true);
    setWorkers(manager.getWorkers());
    setAlerts(manager.getAlerts());

    return () => {
      unsubData();
      unsubAlert();
      manager.stop();
      setIsRunning(false);
    };
  }, []);

  const processAlert = useCallback((id: string, action: string, remark: string) => {
    const manager = managerRef.current;
    if (manager) {
      const alert = manager.getAlerts().find(a => a.id === id);
      manager.processAlert(id, action, remark);
      setAlerts([...manager.getAlerts()]);
      // 处置通知推送到飞书
      if (feishuEnabled && alert) {
        sendResolveToFeishu(
          alert.type,
          alert.workerName,
          action,
          remark
        ).then((ok) => {
          console.log(`[SafePost] 飞书处置通知推送${ok ? '成功' : '失败'}`);
        });
      }
    }
  }, [feishuEnabled]);

  const triggerAlert = useCallback((type: string, workerName?: string) => {
    const manager = managerRef.current;
    if (manager) {
      manager.triggerAlert(type, workerName);
      setAlerts([...manager.getAlerts()]);
    }
  }, []);

  const resetAlerts = useCallback(() => {
    const manager = managerRef.current;
    if (manager) {
      manager.resetAlerts();
      setAlerts([]);
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ realtimeData, workers, alerts, processAlert, triggerAlert, resetAlerts, isRunning, feishuEnabled }}>
      {children}
    </WebSocketContext.Provider>
  );
};
