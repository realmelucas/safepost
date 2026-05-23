# ESP32-C3 Badge Firmware

工牌端示例能力：

- Wi-Fi 连接。
- MQTT 心跳上报。
- 订阅云端状态下发。
- 红/黄/绿 LED 状态显示。
- SOS 按键主动报警。

示例基于 Arduino framework，可在 Arduino IDE 或 PlatformIO 中移植。

## 引脚示例

| 功能 | GPIO |
| --- | --- |
| 红灯 | 2 |
| 黄灯 | 3 |
| 绿灯 | 4 |
| SOS 按键 | 9 |
| 蜂鸣器 | 10 |

## 配置

修改 `badge.ino` 中的 Wi-Fi、MQTT 地址和 `BADGE_NO`。
