import { useMemo } from 'react';
import type { AlertInfo, AlertType } from '../types/alert';
import { useWebSocketData } from './useWebSocketData';

export interface UseAlertsOptions {
  type?: AlertType;
  onlyUnprocessed?: boolean;
  workerId?: string;
  search?: string;
}

export function useAlerts(options: UseAlertsOptions = {}): AlertInfo[] {
  const { alerts } = useWebSocketData();

  return useMemo(() => {
    let filtered = alerts;

    if (options.type) {
      filtered = filtered.filter((a) => a.type === options.type);
    }

    if (options.onlyUnprocessed) {
      filtered = filtered.filter((a) => !a.processed);
    }

    if (options.workerId) {
      filtered = filtered.filter((a) => a.workerId === options.workerId);
    }

    if (options.search) {
      const keyword = options.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.workerName.toLowerCase().includes(keyword) ||
          a.location.toLowerCase().includes(keyword) ||
          a.summary.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [alerts, options.type, options.onlyUnprocessed, options.workerId, options.search]);
}
