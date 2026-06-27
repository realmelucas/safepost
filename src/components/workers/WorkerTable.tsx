import React from 'react';
import { Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { WorkerInfo, WorkerStatus } from '../../types/worker';
import WorkerStatusIcon from '../common/WorkerStatusIcon';

const { Text } = Typography;

const statusToIconStatus = (status: WorkerStatus): 'online' | 'offline' | 'warning' | 'danger' | 'pending' => {
  const map: Record<WorkerStatus, 'online' | 'offline' | 'warning' | 'danger' | 'pending'> = {
    on_duty: 'online',
    pending_check: 'pending',
    blocked: 'danger',
    offline: 'offline',
  };
  return map[status] || 'offline';
};

interface WorkerTableProps {
  workers: WorkerInfo[];
  loading?: boolean;
  onSelect: (worker: WorkerInfo) => void;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers, loading, onSelect }) => {
  const columns: ColumnsType<WorkerInfo> = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      align: 'center',
      render: (status: WorkerStatus) => (
        <WorkerStatusIcon status={statusToIconStatus(status)} size={18} />
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100,
    },
    {
      title: '手环MAC',
      dataIndex: 'mac',
      key: 'mac',
      width: 140,
      render: (mac: string) => <Text code>{mac}</Text>,
    },
    {
      title: '工牌ID',
      dataIndex: 'cardId',
      key: 'cardId',
      width: 100,
    },
    {
      title: '上岗时间',
      dataIndex: 'workStartTime',
      key: 'workStartTime',
      width: 160,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '最近检测结果',
      key: 'lastCheck',
      width: 140,
      render: (_: unknown, record: WorkerInfo) => {
        if (!record.lastCheckTime) return <Tag>未检测</Tag>;
        const parts: string[] = [];
        if (record.bloodPressure) parts.push(`血压 ${record.bloodPressure}`);
        if (record.alcoholLevel !== undefined) parts.push(`酒精 ${record.alcoholLevel.toFixed(2)}%`);
        return (
          <Tag color={record.alcoholLevel !== undefined && record.alcoholLevel > 0.02 ? 'error' : 'success'}>
            {parts.join(' / ') || '已检测'}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: WorkerInfo) => (
        <a onClick={(e) => { e.stopPropagation(); onSelect(record); }}>详情</a>
      ),
    },
  ];

  return (
    <Table<WorkerInfo>
      columns={columns}
      dataSource={workers}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 人` }}
      size="small"
      onRow={(record) => ({
        onClick: () => onSelect(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default WorkerTable;
