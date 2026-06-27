import React from 'react';
import { Space, Radio, Input, Button, Typography } from 'antd';
import { PlusOutlined, ImportOutlined } from '@ant-design/icons';
import type { WorkerStatus } from '../../types/worker';

const { Text } = Typography;

type StatusFilter = 'all' | WorkerStatus;

interface WorkerFilterProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  onAddWorker?: () => void;
  onBatchImport?: () => void;
}

const WorkerFilter: React.FC<WorkerFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchText,
  onSearchChange,
  onAddWorker,
  onBatchImport,
}) => {
  return (
    <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space wrap size="middle">
        <Space size="small">
          <Text type="secondary" style={{ fontSize: 13 }}>上岗状态：</Text>
          <Radio.Group
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="on_duty">在岗</Radio.Button>
            <Radio.Button value="pending_check">待检测</Radio.Button>
            <Radio.Button value="blocked">禁止上岗</Radio.Button>
            <Radio.Button value="offline">离线</Radio.Button>
          </Radio.Group>
        </Space>

        <Input.Search
          placeholder="按姓名或MAC地址搜索"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={onSearchChange}
          style={{ width: 260 }}
          size="small"
          allowClear
        />
      </Space>

      <Space>
        <Button type="primary" icon={<PlusOutlined />} size="small" onClick={onAddWorker}>
          添加工人
        </Button>
        <Button icon={<ImportOutlined />} size="small" onClick={onBatchImport}>
          批量导入
        </Button>
      </Space>
    </Space>
  );
};

export default WorkerFilter;
