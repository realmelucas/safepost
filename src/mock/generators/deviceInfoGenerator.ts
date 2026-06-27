import type { BlePacket2 } from '../../types/device';

let counter = 0;

export function generateDeviceInfo(mac: string, currentBattery: number): BlePacket2 {
  counter++;
  return {
    serviceUuid: '0x0318',
    mac,
    major: 1,
    minor: counter % 256,
    battery: Math.round(currentBattery),
    txPower: Math.round(-8 + (Math.random() - 0.5) * 2),
    advertisingInterval: 2000,
  };
}
