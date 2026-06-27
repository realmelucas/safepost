import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { GatewayMessage } from '../types/device';
import type { WorkerInfo } from '../types/worker';
import type { AlertInfo } from '../types/alert';
import { MockWebSocketManager } from '../mock/simulator/mockWebSocket';

export interface WebSocketContextValue {
  realtimeData: GatewayMessage | null;
  workers: WorkerInfo[];
  alerts: AlertInfo[];
  processAlert: (id: string, action: string, remark: string) => void;
  triggerAlert: (type: string, workerName?: string) => void;
  resetAlerts: () => void;
  isRunning: boolean;
}

export const WebSocketContext = createContext<WebSocketContextValue>({
  realtimeData: null,
  workers: [],
  alerts: [],
  processAlert: () => {},
  triggerAlert: () => {},
  resetAlerts: () => {},
  isRunning: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<MockWebSocketManager | null>(null);
  const [realtimeData, setRealtimeData] = useState<GatewayMessage | null>(null);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new MockWebSocketManager();
    }

    const manager = managerRef.current;

    const unsubData = manager.subscribe((msg) => {
      setRealtimeData(msg);
    });

    const unsubAlert = manager.onAlert(() => {
      setAlerts([...manager.getAlerts()]);
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
      manager.processAlert(id, action, remark);
      setAlerts([...manager.getAlerts()]);
    }
  }, []);

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
    <WebSocketContext.Provider value={{ realtimeData, workers, alerts, processAlert, triggerAlert, resetAlerts, isRunning }}>
      {children}
    </WebSocketContext.Provider>
  );
};
