// 回应包1 (0x1803) - 体征数据
export interface BlePacket1 {
  serviceUuid: '0x1803';
  temperature: number;      // 体温 °C
  heartRate: number;        // 心率 bpm
  spo2: number;             // 血氧 %
}

// 回应包2 (0x0318) - 设备信息
export interface BlePacket2 {
  serviceUuid: '0x0318';
  mac: string;
  major: number;
  minor: number;
  battery: number;
  txPower: number;
  advertisingInterval: number;
}

// SOS 广播 (0x02)
export interface BleSOSPacket {
  serviceUuid: '0x02';
  mac: string;
  sosActive: true;
}

export type BlePacket = BlePacket1 | BlePacket2 | BleSOSPacket;

export interface GatewayDevice {
  mac: string;
  rssi: number;
  rawData: BlePacket;
}

export interface GatewayMessage {
  v: string;
  mid: string;
  time: number;
  ip: string;
  mac: string;
  devices: GatewayDevice[];
}
