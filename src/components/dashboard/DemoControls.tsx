import React from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import {
  ThunderboltOutlined,
  DisconnectOutlined,
  HeartFilled,
  ReloadOutlined,
} from '@ant-design/icons';

interface DemoControlsProps {
  onSimulateSOS: () => void;
  onSimulateLost: () => void;
  onSimulateAbnormal: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const DemoControls: React.FC<DemoControlsProps> = ({
  onSimulateSOS,
  onSimulateLost,
  onSimulateAbnormal,
  onReset,
  isRunning,
}) => {
  const handleSOS = () => {
    onSimulateSOS();
    message.warning('已触发 SOS 紧急求救（演示）');
  };

  const handleLost = () => {
    onSimulateLost();
    message.warning('已触发失联报警（演示）');
  };

  const handleAbnormal = () => {
    onSimulateAbnormal();
    message.warning('已触发体征异常（演示）');
  };

  const handleReset = () => {
    onReset();
    message.success('已重置所有报警');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderRadius: 6,
        background: 'rgba(255,77,79,0.06)',
        border: '1px solid rgba(255,77,79,0.15)',
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
        🎯 演示控制
      </span>
      <Space size={8}>
        <Tooltip title="模拟 SOS 紧急求救">
          <Button
            size="small"
            danger
            icon={<ThunderboltOutlined />}
            onClick={handleSOS}
            style={{ fontWeight: 600, fontSize: 11 }}
          >
            SOS
          </Button>
        </Tooltip>
        <Tooltip title="模拟手环信号中断（失联）">
          <Button
            size="small"
            icon={<DisconnectOutlined />}
            onClick={handleLost}
            style={{ borderColor: '#FF7A00', color: '#FF7A00', fontSize: 11 }}
          >
            失联
          </Button>
        </Tooltip>
        <Tooltip title="模拟体征数据异常（体温/心率超标）">
          <Button
            size="small"
            icon={<HeartFilled />}
            onClick={handleAbnormal}
            style={{ borderColor: '#FF6B6B', color: '#FF6B6B', fontSize: 11 }}
          >
            体征异常
          </Button>
        </Tooltip>
        <Tooltip title="重置所有模拟报警">
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}
          >
            重置
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
};

export default DemoControls;
