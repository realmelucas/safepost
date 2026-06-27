import React from 'react';
import { Row, Col } from 'antd';
import { useWebSocketData } from '../../hooks/useWebSocketData';
import WorkerCard from './WorkerCard';
import { EmptyState } from '../common';
import type { VitalSignData } from '../../types/common';
import type { GatewayDevice, BlePacket, BlePacket1, BlePacket2 } from '../../types/device';

const extractVitalSignData = (device: GatewayDevice | undefined): VitalSignData | null => {
  if (!device) return null;
  const rawData: BlePacket = device.rawData;

  if (rawData.serviceUuid === '0x1803') {
    const pkt = rawData as BlePacket1;
    return {
      temperature: pkt.temperature,
      heartRate: pkt.heartRate,
      spo2: pkt.spo2,
      battery: 0,
      txPower: 0,
      timestamp: '',
    };
  }

  if (rawData.serviceUuid === '0x0318') {
    const pkt = rawData as BlePacket2;
    return {
      temperature: 0,
      heartRate: 0,
      spo2: 0,
      battery: pkt.battery,
      txPower: pkt.txPower,
      timestamp: '',
    };
  }

  return null;
};

const mergeVitalData = (existing: VitalSignData | null, incoming: VitalSignData | null): VitalSignData | null => {
  if (!existing && !incoming) return null;
  if (!existing) return incoming;
  if (!incoming) return existing;

  return {
    temperature: incoming.temperature !== 0 ? incoming.temperature : existing.temperature,
    heartRate: incoming.heartRate !== 0 ? incoming.heartRate : existing.heartRate,
    spo2: incoming.spo2 !== 0 ? incoming.spo2 : existing.spo2,
    battery: incoming.battery !== 0 ? incoming.battery : existing.battery,
    txPower: incoming.txPower !== 0 ? incoming.txPower : existing.txPower,
    timestamp: incoming.timestamp || existing.timestamp,
  };
};

const WorkerCardGrid: React.FC = () => {
  const { realtimeData, workers, alerts } = useWebSocketData();

  // 构建 mac -> device 映射
  const deviceMap = new Map<string, VitalSignData | null>();
  if (realtimeData?.devices) {
    realtimeData.devices.forEach((device: GatewayDevice) => {
      const vital = extractVitalSignData(device);
      const existing = deviceMap.get(device.mac);
      deviceMap.set(device.mac, mergeVitalData(existing ?? null, vital));
    });
  }

  // 构建 workerId -> alert 映射 (只取未处理的)
  const alertMap = new Map<string, typeof alerts[0]>();
  alerts
    .filter((a) => !a.processed)
    .forEach((a) => {
      if (!alertMap.has(a.workerId)) {
        alertMap.set(a.workerId, a);
      }
    });

  if (workers.length === 0) {
    return <EmptyState title="暂无工人数据" description="等待数据接入中..." />;
  }

  const handleClick = (workerId: string) => {
    const alert = alertMap.get(workerId);
    if (alert) {
      // 使用 window.location 跳转
      window.location.href = '/alerts';
    } else {
      window.location.href = '/workers';
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {workers.map((worker, index) => (
        <Col xl={6} lg={8} md={12} sm={24} key={worker.id}>
          <div className="slide-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
            <WorkerCard
              worker={worker}
              vitalData={deviceMap.get(worker.mac) ?? null}
              alert={alertMap.get(worker.id) ?? null}
              onClick={handleClick}
            />
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default WorkerCardGrid;
