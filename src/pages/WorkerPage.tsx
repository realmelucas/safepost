import React, { useState, useContext, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { WebSocketContext } from '../context/WebSocketContext';
import type { WorkerInfo, WorkerStatus } from '../types/worker';
import { WorkerFilter, WorkerTable, WorkerDrawer } from '../components/workers';

const { Title } = Typography;

type StatusFilter = 'all' | WorkerStatus;

const WorkerPage: React.FC = () => {
  const { workers, alerts } = useContext(WebSocketContext);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    if (statusFilter !== 'all') {
      result = result.filter((w) => w.status === statusFilter);
    }

    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(kw) ||
          w.mac.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [workers, statusFilter, searchText]);

  const handleSelectWorker = (worker: WorkerInfo) => {
    setSelectedWorker(worker);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedWorker(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>工人管理</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <WorkerFilter
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchText={searchText}
          onSearchChange={setSearchText}
          onAddWorker={() => {}}
          onBatchImport={() => {}}
        />
      </Card>

      <Card size="small">
        <WorkerTable
          workers={filteredWorkers}
          onSelect={handleSelectWorker}
        />
      </Card>

      <WorkerDrawer
        open={drawerOpen}
        worker={selectedWorker}
        alerts={alerts}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default WorkerPage;
