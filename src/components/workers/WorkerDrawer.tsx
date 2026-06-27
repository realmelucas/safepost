import React from 'react';
import { Drawer, Tabs, Descriptions, Typography, Table, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import type { WorkerInfo } from '../../types/worker';
import type { AlertInfo } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';
import WorkerStatusIcon from '../common/WorkerStatusIcon';
import AlertStatusTag from '../common/AlertStatusTag';
import DeviceBinding from './DeviceBinding';
import CheckRecordTimeline from './CheckRecordTimeline';

const { Text, Title } = Typography;

const statusToIconStatus = (status: string): 'online' | 'offline' | 'warning' | 'danger' | 'pending' => {
  const map: Record<string, 'online' | 'offline' | 'warning' | 'danger' | 'pending'> = {
    on_duty: 'online',
    pending_check: 'pending',
    blocked: 'danger',
    offline: 'offline',
  };
  return map[status] || 'offline';
};

interface WorkerDrawerProps {
  open: boolean;
  worker: WorkerInfo | null;
  alerts: AlertInfo[];
  onClose: () => void;
}

const WorkerDrawer: React.FC<WorkerDrawerProps> = ({ open, worker, alerts, onClose }) => {
  if (!worker) return null;

  const workerAlerts = alerts.filter((a) => a.workerId === worker.id || a.workerName === worker.name);

  const alertColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => <AlertStatusTag type={type as keyof typeof ALERT_TYPE_CONFIG} />,
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 150,
      render: (t: string) => dayjs(t).format('MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      key: 'processed',
      width: 80,
      render: (_: unknown, record: AlertInfo) =>
        record.processed ? <Tag color="success">已处理</Tag> : <Tag color="error">未处理</Tag>,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <div>
          <Space align="center" style={{ marginBottom: 16 }}>
            <WorkerStatusIcon status={statusToIconStatus(worker.status)} size={24} />
            <Title level={5} style={{ margin: 0 }}>{worker.name}</Title>
          </Space>
          <Descriptions column={1} size="small" colon={false} bordered>
            <Descriptions.Item label="姓名">{worker.name}</Descriptions.Item>
            <Descriptions.Item label="工号">{worker.employeeId}</Descriptions.Item>
            <Descriptions.Item label="联系方式">138****{Math.floor(Math.random() * 9000 + 1000)}</Descriptions.Item>
            <Descriptions.Item label="部门">转运中心操作部</Descriptions.Item>
            <Descriptions.Item label="岗位">{worker.position || '分拣员'}</Descriptions.Item>
            <Descriptions.Item label="入职日期">2024-03-15</Descriptions.Item>
            <Descriptions.Item label="上岗时间">
              {worker.workStartTime ? dayjs(worker.workStartTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'device',
      label: '设备绑定',
      children: <DeviceBinding worker={worker} />,
    },
    {
      key: 'records',
      label: '检测记录',
      children: <CheckRecordTimeline workerName={worker.name} />,
    },
    {
      key: 'alerts',
      label: `报警历史${workerAlerts.length > 0 ? ` (${workerAlerts.length})` : ''}`,
      children: workerAlerts.length > 0 ? (
        <Table
          columns={alertColumns}
          dataSource={workerAlerts}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Text type="secondary">暂无报警记录</Text>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <WorkerStatusIcon status={statusToIconStatus(worker.status)} size={18} />
          <span>{worker.name} - 详情</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </Drawer>
  );
};

export default WorkerDrawer;
