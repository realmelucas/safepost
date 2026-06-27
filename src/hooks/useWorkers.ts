import { useMemo } from 'react';
import type { WorkerInfo, WorkerStatus } from '../types/worker';
import { useWebSocketData } from './useWebSocketData';

export interface UseWorkersOptions {
  status?: WorkerStatus;
  search?: string;
  position?: string;
}

export function useWorkers(options: UseWorkersOptions = {}): WorkerInfo[] {
  const { workers } = useWebSocketData();

  return useMemo(() => {
    let filtered = workers;

    if (options.status) {
      filtered = filtered.filter((w) => w.status === options.status);
    }

    if (options.position) {
      filtered = filtered.filter((w) => w.position === options.position);
    }

    if (options.search) {
      const keyword = options.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(keyword) ||
          w.employeeId.toLowerCase().includes(keyword) ||
          w.position.toLowerCase().includes(keyword) ||
          w.mac.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [workers, options.status, options.position, options.search]);
}
