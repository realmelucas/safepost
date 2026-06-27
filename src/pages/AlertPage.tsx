import React, { useState, useContext, useMemo } from 'react';
import { Row, Col, Typography, Card } from 'antd';
import dayjs from 'dayjs';
import { WebSocketContext } from '../context/WebSocketContext';
import type { AlertType, AlertInfo } from '../types/alert';
import { AlertFilter, AlertTable, AlertDetailPanel } from '../components/alerts';

const { Title } = Typography;

type ProcessStatus = 'all' | 'unprocessed' | 'processed';
type TimeRange = 'today' | 'week' | 'month' | 'all';

const AlertPage: React.FC = () => {
  const { alerts, processAlert } = useContext(WebSocketContext);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<AlertType[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    // 类型筛选
    if (selectedTypes.length > 0) {
      result = result.filter((a) => selectedTypes.includes(a.type));
    }

    // 处理状态筛选
    if (processStatus === 'unprocessed') {
      result = result.filter((a) => !a.processed);
    } else if (processStatus === 'processed') {
      result = result.filter((a) => a.processed);
    }

    // 时间范围筛选
    const now = dayjs();
    if (timeRange === 'today') {
      result = result.filter((a) => dayjs(a.triggeredAt).isSame(now, 'day'));
    } else if (timeRange === 'week') {
      result = result.filter((a) => dayjs(a.triggeredAt).isSame(now, 'week'));
    } else if (timeRange === 'month') {
      result = result.filter((a) => dayjs(a.triggeredAt).isSame(now, 'month'));
    }

    // 按触发时间倒序
    result.sort((a, b) => dayjs(b.triggeredAt).valueOf() - dayjs(a.triggeredAt).valueOf());

    return result;
  }, [alerts, selectedTypes, processStatus, timeRange]);

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedId) || null,
    [alerts, selectedId]
  );

  const handleProcess = (id: string, action: string, remark: string) => {
    processAlert(id, action, remark);
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Title level={4} style={{ marginBottom: 16 }}>报警管理</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <AlertFilter
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          processStatus={processStatus}
          onProcessStatusChange={setProcessStatus}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </Card>

      <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
        <Col xs={24} lg={14} style={{ height: '100%', overflow: 'auto' }}>
          <Card size="small" style={{ height: '100%' }}>
            <AlertTable
              alerts={filteredAlerts}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10} style={{ height: '100%' }}>
          <AlertDetailPanel alert={selectedAlert} onProcess={handleProcess} />
        </Col>
      </Row>
    </div>
  );
};

export default AlertPage;
