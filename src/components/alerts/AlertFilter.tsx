import React from 'react';
import { Space, Select, Radio, Typography } from 'antd';
import type { AlertType } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';

const { Text } = Typography;

type ProcessStatus = 'all' | 'unprocessed' | 'processed';
type TimeRange = 'today' | 'week' | 'month' | 'all';

interface AlertFilterProps {
  selectedTypes: AlertType[];
  onTypesChange: (types: AlertType[]) => void;
  processStatus: ProcessStatus;
  onProcessStatusChange: (status: ProcessStatus) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const alertTypeOptions: { label: string; value: AlertType }[] = Object.entries(ALERT_TYPE_CONFIG).map(([key, config]) => ({
  label: config.label,
  value: key as AlertType,
}));

const AlertFilter: React.FC<AlertFilterProps> = ({
  selectedTypes,
  onTypesChange,
  processStatus,
  onProcessStatusChange,
  timeRange,
  onTimeRangeChange,
}) => {
  return (
    <Space wrap size="middle" style={{ marginBottom: 16 }}>
      <Space size="small">
        <Text type="secondary" style={{ fontSize: 13 }}>报警类型：</Text>
        <Select
          mode="multiple"
          placeholder="全部类型"
          value={selectedTypes}
          onChange={onTypesChange}
          options={alertTypeOptions}
          style={{ minWidth: 200 }}
          size="small"
          maxTagCount={2}
          allowClear
        />
      </Space>

      <Space size="small">
        <Text type="secondary" style={{ fontSize: 13 }}>处理状态：</Text>
        <Radio.Group
          value={processStatus}
          onChange={(e) => onProcessStatusChange(e.target.value)}
          size="small"
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="unprocessed">未处理</Radio.Button>
          <Radio.Button value="processed">已处理</Radio.Button>
        </Radio.Group>
      </Space>

      <Space size="small">
        <Text type="secondary" style={{ fontSize: 13 }}>时间范围：</Text>
        <Radio.Group
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          size="small"
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="today">今天</Radio.Button>
          <Radio.Button value="week">本周</Radio.Button>
          <Radio.Button value="month">本月</Radio.Button>
          <Radio.Button value="all">全部</Radio.Button>
        </Radio.Group>
      </Space>
    </Space>
  );
};

export default AlertFilter;
