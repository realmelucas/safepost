import React from 'react';
import { Timeline, Tag, Typography } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CheckRecord {
  time: string;
  bloodPressure: string;
  alcoholLevel: number;
  passed: boolean;
}

interface CheckRecordTimelineProps {
  workerName?: string;
}

const mockRecords: CheckRecord[] = [
  { time: dayjs().subtract(0, 'hour').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '118/76', alcoholLevel: 0.01, passed: true },
  { time: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '125/82', alcoholLevel: 0.00, passed: true },
  { time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '130/85', alcoholLevel: 0.03, passed: true },
  { time: dayjs().subtract(1, 'day').add(8, 'hour').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '115/75', alcoholLevel: 0.00, passed: true },
  { time: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '142/92', alcoholLevel: 0.06, passed: false },
  { time: dayjs().subtract(2, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '120/78', alcoholLevel: 0.01, passed: true },
  { time: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'), bloodPressure: '128/80', alcoholLevel: 0.00, passed: true },
];

const CheckRecordTimeline: React.FC<CheckRecordTimelineProps> = () => {
  return (
    <Timeline
      items={mockRecords.map((record, idx) => ({
        key: idx,
        color: record.passed ? 'green' : 'red',
        dot: record.passed ? <CheckCircleFilled /> : <CloseCircleFilled />,
        children: (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ExperimentOutlined style={{ marginRight: 4 }} />
                {record.time}
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontSize: 12 }}>
                血压：{record.bloodPressure}
              </Tag>
              <Tag
                color={record.alcoholLevel > 0.02 ? 'error' : 'success'}
                style={{ fontSize: 12 }}
              >
                酒精：{record.alcoholLevel.toFixed(2)}%
              </Tag>
              <Tag
                color={record.passed ? 'success' : 'error'}
                icon={record.passed ? <CheckCircleFilled /> : <CloseCircleFilled />}
                style={{ fontSize: 12 }}
              >
                {record.passed ? '通过' : '不通过'}
              </Tag>
            </div>
          </div>
        ),
      }))}
    />
  );
};

export default CheckRecordTimeline;
