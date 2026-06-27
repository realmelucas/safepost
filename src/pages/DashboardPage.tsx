import React from 'react';
import { Typography, Row, Col } from 'antd';
import { useWebSocketData } from '../hooks/useWebSocketData';
import StatsOverview from '../components/dashboard/StatsOverview';
import AlertBanner from '../components/dashboard/AlertBanner';
import WorkerCardGrid from '../components/dashboard/WorkerCardGrid';
import BlindSpotView from '../components/dashboard/BlindSpotView';
import DemoControls from '../components/dashboard/DemoControls';
import { DataUpdateIndicator } from '../components/common';
import dayjs from 'dayjs';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { realtimeData, workers, alerts, isRunning, triggerAlert, resetAlerts } = useWebSocketData();

  const lastUpdate = realtimeData?.time
    ? dayjs(realtimeData.time * 1000).format('HH:mm:ss')
    : null;

  const handleViewAllAlerts = () => {
    window.location.href = '/alerts';
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>实时监控大盘</Title>
        <DataUpdateIndicator lastUpdate={lastUpdate ?? undefined} isConnected={isRunning} />
      </div>

      {/* 统计概览 */}
      <div style={{ marginBottom: 16 }}>
        <StatsOverview
          workers={workers}
          alerts={alerts}
          loading={workers.length === 0}
        />
      </div>

      {/* 报警横幅 */}
      <AlertBanner alerts={alerts} onViewAll={handleViewAllAlerts} />

      {/* 演示控制 + 盲区可视化（左右分栏） */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* 左侧：盲区可视化 */}
        <Col xl={14} lg={24} style={{ marginBottom: 16 }}>
          <DemoControls
            onSimulateSOS={() => triggerAlert('sos')}
            onSimulateLost={() => triggerAlert('lost')}
            onSimulateAbnormal={() => triggerAlert('vital_abnormal')}
            onReset={resetAlerts}
            isRunning={isRunning}
          />
          <BlindSpotView />
        </Col>

        {/* 右侧：工人卡片 */}
        <Col xl={10} lg={24}>
          <div style={{ marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>工人状态</Title>
          </div>
          <WorkerCardGrid />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
