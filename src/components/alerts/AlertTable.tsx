import React from 'react';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { AlertInfo } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';
import AlertStatusTag from '../common/AlertStatusTag';

const { Text } = Typography;

interface AlertTableProps {
  alerts: AlertInfo[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const AlertTable: React.FC<AlertTableProps> = ({ alerts, loading, selectedId, onSelect }) => {
  const columns: ColumnsType<AlertInfo> = [
    {
      title: '报警类型',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: string) => <AlertStatusTag type={type as keyof typeof ALERT_TYPE_CONFIG} />,
    },
    {
      title: '工人姓名',
      dataIndex: 'workerName',
      key: 'workerName',
      width: 100,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 140,
      ellipsis: true,
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.triggeredAt).unix() - dayjs(b.triggeredAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: '持续时间',
      key: 'duration',
      width: 100,
      render: (_: unknown, record: AlertInfo) => {
        const dur = record.processed ? record.duration : Math.floor((Date.now() - dayjs(record.triggeredAt).valueOf()) / 1000);
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        return <Text>{mins}分{secs}秒</Text>;
      },
    },
    {
      title: '处理状态',
      key: 'processed',
      width: 100,
      render: (_: unknown, record: AlertInfo) =>
        record.processed ? (
          <Tag color="success">已处理</Tag>
        ) : (
          <Tag color="error">未处理</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: AlertInfo) => (
        <a onClick={(e) => { e.stopPropagation(); onSelect(record.id); }}>查看</a>
      ),
    },
  ];

  return (
    <Table<AlertInfo>
      columns={columns}
      dataSource={alerts}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      size="small"
      onRow={(record) => ({
        onClick: () => onSelect(record.id),
        style: {
          cursor: 'pointer',
          background: selectedId === record.id ? '#e6f4ff' : undefined,
          ...(record.processed ? {} : { borderLeft: '3px solid #ff4d4f' }),
        },
      })}
      rowClassName={(record) =>
        selectedId === record.id ? 'ant-table-row-selected' : ''
      }
    />
  );
};

export default AlertTable;
