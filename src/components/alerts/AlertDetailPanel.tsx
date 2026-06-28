import React, { useState, useEffect } from 'react';
import { Typography, Space, Divider, Descriptions, Card } from 'antd';
import {
  WarningFilled,
  DisconnectOutlined,
  QuestionCircleFilled,
  HeartFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { AlertInfo, AlertType } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';
import AlertTimeline from './AlertTimeline';
import AlertActionPanel from './AlertActionPanel';
import EmptyState from '../common/EmptyState';

dayjs.extend(duration);

const { Title, Text } = Typography;

interface AlertDetailPanelProps {
  alert: AlertInfo | null;
  onProcess: (id: string, action: string, remark: string) => void;
}

const typeIconMap: Record<AlertType, React.ReactNode> = {
  sos: <WarningFilled style={{ fontSize: 48, color: ALERT_TYPE_CONFIG.sos.color }} />,
  lost: <DisconnectOutlined style={{ fontSize: 48, color: ALERT_TYPE_CONFIG.lost.color }} />,
  no_response: <QuestionCircleFilled style={{ fontSize: 48, color: ALERT_TYPE_CONFIG.no_response.color }} />,
  vital_abnormal: <HeartFilled style={{ fontSize: 48, color: ALERT_TYPE_CONFIG.vital_abnormal.color }} />,
};

const AlertDetailPanel: React.FC<AlertDetailPanelProps> = ({ alert, onProcess }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!alert || alert.processed) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [alert?.id, alert?.processed]);

  if (!alert) {
    return (
      <Card size="small" style={{ height: '100%' }}>
        <EmptyState title="请选择一个报警查看详情" description="点击左侧列表中的报警记录" />
      </Card>
    );
  }

  const config = ALERT_TYPE_CONFIG[alert.type];
  const dur = alert.processed
    ? alert.duration
    : Math.floor((Date.now() - dayjs(alert.triggeredAt).valueOf()) / 1000);
  const durObj = dayjs.duration(dur, 'seconds');
  const durStr = `${String(Math.floor(durObj.asMinutes())).padStart(2, '0')}:${String(durObj.seconds()).padStart(2, '0')}:00`;

  return (
    <Card size="small" style={{ height: '100%', overflow: 'auto' }}>
      {/* 头部：图标 + 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{typeIconMap[alert.type]}</div>
        <Title level={4} style={{ margin: 0, color: config.color }}>
          {config.label}
        </Title>
        <Text style={{ fontSize: 16 }}>{alert.workerName}</Text>
        <div style={{ marginTop: 8 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          <Text
            strong
            style={{
              fontSize: 24,
              fontFamily: 'monospace',
              color: alert.processed ? undefined : '#ff4d4f',
            }}
          >
            {durStr}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 中间：详情信息 */}
      <Descriptions column={1} size="small" colon={false}>
        <Descriptions.Item label={<><ClockCircleOutlined /> 触发时间</>}>
          {dayjs(alert.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label={<><EnvironmentOutlined /> 位置</>}>
          {alert.location}
        </Descriptions.Item>
        <Descriptions.Item label={<><AimOutlined /> 手环MAC</>}>
          {alert.workerId || '未绑定'}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      {/* 下方：Timeline + 处置操作 */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>事件时间线</Text>
        <AlertTimeline alert={alert} />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>处置操作</Text>
        <AlertActionPanel alert={alert} onProcess={onProcess} />
      </div>
    </Card>
  );
};

export default AlertDetailPanel;
