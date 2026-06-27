import React from 'react';
import { Row, Col, Skeleton, Progress } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { StatCard } from '../common';
import type { WorkerInfo } from '../../types/worker';
import type { AlertInfo } from '../../types/alert';

interface StatsOverviewProps {
  workers: WorkerInfo[];
  alerts: AlertInfo[];
  loading?: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ workers, alerts, loading = false }) => {
  const totalBound = workers.length;
  const onDutyCount = workers.filter((w) => w.status !== 'offline').length;
  const unprocessedAlerts = alerts.filter((a) => !a.processed);
  const alertWorkerIds = new Set(unprocessedAlerts.map((a) => a.workerId));
  const alertCount = alertWorkerIds.size;
  const normalCount = onDutyCount - alertCount;
  const onlineRate = totalBound > 0 ? Math.round((onDutyCount / totalBound) * 100) : 0;

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="在岗人数"
          value={onDutyCount}
          prefix={<TeamOutlined style={{ fontSize: 20 }} />}
          color="#1677ff"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="正常人数"
          value={normalCount}
          prefix={<CheckCircleOutlined style={{ fontSize: 20 }} />}
          color="#52c41a"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <div className={alertCount > 0 ? 'sos-pulse' : undefined}>
          <StatCard
            title="报警人数"
            value={alertCount}
            prefix={<WarningOutlined style={{ fontSize: 20 }} />}
            color="#ff4d4f"
          />
        </div>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <div style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 8, background: '#fff' }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            <PercentageOutlined style={{ marginRight: 4 }} />
            在线率
          </div>
          <Progress
            type="circle"
            percent={onlineRate}
            size={60}
            strokeColor={onlineRate >= 80 ? '#52c41a' : onlineRate >= 50 ? '#faad14' : '#ff4d4f'}
            format={(p) => `${p}%`}
          />
        </div>
      </Col>
    </Row>
  );
};

export default StatsOverview;
