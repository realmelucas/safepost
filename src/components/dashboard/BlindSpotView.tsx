import React from 'react';
import { Tooltip, Typography, Tag } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { WorkerInfo } from '../../types/worker';
import type { AlertInfo, AlertType } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';
import type { VitalSignData } from '../../types/common';
import { useWebSocketData } from '../../hooks/useWebSocketData';

const { Text } = Typography;

// 车厢配置
const CARRIAGE_CONFIG: Record<string, { id: string; label: string; x: number; y: number }> = {
  '车厢A区': { id: 'A', label: 'A区', x: 20, y: 20 },
  '车厢B区': { id: 'B', label: 'B区', x: 310, y: 20 },
  '车厢C区': { id: 'C', label: 'C区', x: 20, y: 240 },
  '车厢D区': { id: 'D', label: 'D区', x: 310, y: 240 },
};

// 岗亭 → 车厢映射
const POSITION_TO_CARRIAGE: Record<string, string> = {
  '1号岗亭': '车厢A区', '2号岗亭': '车厢A区',
  '3号岗亭': '车厢B区', '4号岗亭': '车厢B区',
  '5号岗亭': '车厢C区', '6号岗亭': '车厢C区',
  '7号岗亭': '车厢D区', '8号岗亭': '车厢D区',
};

const CARRIAGE_W = 270;
const CARRIAGE_H = 200;
const SVG_W = 610;
const SVG_H = 470;

// 获取报警动画类
const getAlertClass = (alert: AlertInfo | null): string | undefined => {
  if (!alert) return undefined;
  if (alert.type === 'sos') return 'sos-pulse';
  if (alert.type === 'lost' || alert.type === 'no_response') return 'alert-pulse';
  return undefined;
};

// 获取工人颜色
const getWorkerColor = (status: string, alert: AlertInfo | null): string => {
  if (alert && alert.type === 'sos') return '#FF1F1F';
  if (alert && (alert.type === 'lost' || alert.type === 'no_response')) return '#FF7A00';
  if (alert && alert.type === 'vital_abnormal') return '#FF6B6B';
  if (status === 'on_duty') return '#52C41A';
  if (status === 'pending_check') return '#FAAD14';
  if (status === 'blocked') return '#FF4D4F';
  return '#8C8C8C';
};

// 提取体征数据
const extractVital = (mac: string, devices: any[]): VitalSignData | null => {
  const device = devices?.find((d: any) => d.mac === mac);
  if (!device) return null;
  const raw = device.rawData;
  if (raw?.serviceUuid === '0x1803') {
    return { temperature: raw.temperature, heartRate: raw.heartRate, spo2: raw.spo2, battery: 0, txPower: 0, timestamp: '' };
  }
  if (raw?.serviceUuid === '0x0318') {
    return { temperature: 0, heartRate: 0, spo2: 0, battery: raw.battery, txPower: raw.txPower, timestamp: '' };
  }
  return null;
};

// 车厢卡车SVG形状
const TruckSVG: React.FC<{ x: number; y: number; w: number; h: number; label: string; hasWorkers: boolean }> = ({ x, y, w, h, label, hasWorkers }) => (
  <g>
    {/* 车厢主体 */}
    <rect
      x={x} y={y} width={w} height={h} rx={8} ry={8}
      fill={hasWorkers ? 'rgba(22,119,255,0.06)' : 'rgba(140,140,140,0.04)'}
      stroke={hasWorkers ? '#1677FF' : '#8C8C8C'}
      strokeWidth={hasWorkers ? 2 : 1}
      strokeDasharray={hasWorkers ? undefined : '6,4'}
    />
    {/* 车厢标签 */}
    <rect x={x + w / 2 - 22} y={y - 10} width={44} height={20} rx={4}
      fill={hasWorkers ? '#1677FF' : '#8C8C8C'}
    />
    <text x={x + w / 2} y={y + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
      {label}
    </text>
    {/* 车厢底部阴影/连接线 */}
    <rect x={x + w - 15} y={y + h - 10} width={10} height={10} rx={2}
      fill={hasWorkers ? '#1677FF' : '#D9D9D9'} opacity={0.5}
    />
  </g>
);

// 工人圆点
const WorkerDot: React.FC<{
  cx: number; cy: number; color: string; name: string;
  alertClass?: string; rssi: number;
}> = ({ cx, cy, color, name, alertClass, rssi }) => {
  const baseRadius = 14;
  const rssiScale = Math.max(0.6, Math.min(1.4, (-rssi + 40) / 50));
  const radius = baseRadius * rssiScale;

  return (
    <g className={alertClass}>
      {/* 外圈光晕（报警时） */}
      {alertClass && (
        <circle cx={cx} cy={cy} r={radius + 8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />
      )}
      {/* 主体圆 */}
      <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.85} />
      {/* 内圈 */}
      <circle cx={cx} cy={cy} r={radius - 4} fill="#fff" opacity={0.3} />
      {/* 名字首字 */}
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>
        {name[0]}
      </text>
    </g>
  );
};

// 体征标签
const VitalTag: React.FC<{ label: string; value: number | null; unit: string; abnormal: boolean }> = ({ label, value, unit, abnormal }) => (
  <span style={{
    fontSize: 10, marginRight: 6,
    color: abnormal ? '#FF4D4F' : 'rgba(255,255,255,0.85)',
    fontWeight: abnormal ? 600 : 400,
  }}>
    {label}: {value !== null && value !== 0 ? `${value}${unit}` : '--'}
  </span>
);

const BlindSpotView: React.FC = () => {
  const { realtimeData, workers, alerts } = useWebSocketData();

  // 构建 alert map
  const alertMap = new Map<string, AlertInfo>();
  alerts.filter(a => !a.processed).forEach(a => alertMap.set(a.workerId, a));

  // 按车厢分组
  const carriageGroups = new Map<string, WorkerInfo[]>();
  workers.forEach(w => {
    const pos = w.position || '未知';
    const carriage = POSITION_TO_CARRIAGE[pos] || '车厢A区';
    if (!carriageGroups.has(carriage)) carriageGroups.set(carriage, []);
    carriageGroups.get(carriage)!.push(w);
  });

  const devices = realtimeData?.devices || [];

  return (
    <div style={{
      background: 'var(--color-bg-component, #141414)',
      borderRadius: 8,
      border: '1px solid var(--color-border-secondary, #303030)',
      padding: 12,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14 }}>
          <EnvironmentOutlined style={{ marginRight: 4 }} />
          车厢盲区可视化
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {workers.filter(w => w.status === 'on_duty').length} 人在岗 · 共 {workers.length} 人
        </Text>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', minHeight: 300 }}>
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          {/* 渐变 */}
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grid)" />

        {/* 标题 */}
        <text x={SVG_W / 2} y={14} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={9} letterSpacing={6}>
          SAFEPOST MONITOR
        </text>

        {/* 绘制每个车厢 */}
        {Object.entries(CARRIAGE_CONFIG).map(([pos, cfg]) => {
          const groupWorkers = carriageGroups.get(pos) || [];
          const hasWorkers = groupWorkers.length > 0;

          return (
            <g key={cfg.id}>
              <TruckSVG x={cfg.x} y={cfg.y} w={CARRIAGE_W} h={CARRIAGE_H} label={cfg.label} hasWorkers={hasWorkers} />

              {/* 车厢内工人 */}
              {groupWorkers.map((worker, idx) => {
                const alert = alertMap.get(worker.id) || null;
                const color = getWorkerColor(worker.status, alert);
                const alertClass = getAlertClass(alert);
                const vital = extractVital(worker.mac, devices);

                // 计算车厢内位置（散开排列）
                const cols = 2;
                const rows = Math.ceil(groupWorkers.length / cols);
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const dotX = cfg.x + CARRIAGE_W / (cols + 1) * (col + 1);
                const dotY = cfg.y + CARRIAGE_H / (rows + 1) * (row + 1) + 10;

                return (
                  <Tooltip
                    key={worker.id}
                    title={
                      <div style={{ minWidth: 140 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{worker.name}</div>
                        <div style={{ fontSize: 11 }}>
                          <VitalTag label="体温" value={vital?.temperature ?? null} unit="°C" abnormal={(vital?.temperature ?? 0) > 38.5} />
                          <VitalTag label="心率" value={vital?.heartRate ?? null} unit="bpm" abnormal={(vital?.heartRate ?? 0) > 120} />
                          <VitalTag label="血氧" value={vital?.spo2 ?? null} unit="%" abnormal={(vital?.spo2 ?? 100) < 94} />
                        </div>
                        <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.45)' }}>
                          信号: {worker.gatewayRssi}dBm · {alert ? ALERT_TYPE_CONFIG[alert.type]?.label : '正常'}
                        </div>
                      </div>
                    }
                    color={color}
                  >
                    <g style={{ cursor: 'pointer' }}>
                      <WorkerDot cx={dotX} cy={dotY} color={color} name={worker.name} alertClass={alertClass} rssi={worker.gatewayRssi} />
                      {/* 姓名标签 */}
                      <text x={dotX} y={dotY + 28} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={10}>
                        {worker.name}
                      </text>
                    </g>
                  </Tooltip>
                );
              })}

              {/* 空车厢提示 */}
              {!hasWorkers && (
                <text x={cfg.x + CARRIAGE_W / 2} y={cfg.y + CARRIAGE_H / 2 + 4}
                  textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={12}>
                  暂无工人
                </text>
              )}
            </g>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${SVG_W - 160}, ${SVG_H - 40})`}>
          <rect x={0} y={0} width={155} height={35} rx={4} fill="rgba(0,0,0,0.4)" />
          <circle cx={12} cy={12} r={5} fill="#52C41A" /><text x={22} y={15} fill="rgba(255,255,255,0.6)" fontSize={9}>正常</text>
          <circle cx={55} cy={12} r={5} fill="#FF7A00" /><text x={65} y={15} fill="rgba(255,255,255,0.6)" fontSize={9}>失联</text>
          <circle cx={98} cy={12} r={5} fill="#FF1F1F" /><text x={108} y={15} fill="rgba(255,255,255,0.6)" fontSize={9}>SOS</text>
          <circle cx={135} cy={12} r={5} fill="#8C8C8C" /><text x={145} y={15} fill="rgba(255,255,255,0.6)" fontSize={9}>离线</text>
        </g>
      </svg>
    </div>
  );
};

export default BlindSpotView;
