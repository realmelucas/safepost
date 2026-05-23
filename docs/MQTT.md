# MQTT 通信协议

Broker：EMQX

建议使用 QoS 1，设备认证启用 TLS、用户名和密码。

## 1. Topic 规范

| 方向 | Topic | 说明 |
| --- | --- | --- |
| 工牌上报 | `safepost/badge/{badgeNo}/up` | 心跳、SOS、确认响应 |
| 工牌下发 | `safepost/badge/{badgeNo}/down` | 状态、提醒、蜂鸣 |
| 基站上报 | `safepost/station/{stationNo}/up` | 检测、广播结果、在线状态 |
| 基站下发 | `safepost/station/{stationNo}/down` | 广播命令、配置更新 |
| 事件总线 | `safepost/events` | 云端内部转发事件 |

## 2. 工牌心跳

```json
{
  "type": "HEARTBEAT",
  "badgeNo": "B0001",
  "battery": 86,
  "rssi": -58,
  "status": "ALLOWED",
  "ts": 1716000000000
}
```

## 3. SOS 报警

```json
{
  "type": "SOS",
  "badgeNo": "B0001",
  "reason": "button_pressed",
  "ts": 1716000000000
}
```

## 4. 工牌状态下发

```json
{
  "type": "SET_STATUS",
  "status": "ALLOWED",
  "message": "检测通过",
  "ts": 1716000000000
}
```

## 5. 基站检测上传

```json
{
  "type": "CHECK_RESULT",
  "stationNo": "S0001",
  "badgeNo": "B0001",
  "systolic": 122,
  "diastolic": 78,
  "heartRate": 82,
  "alcoholMg100ml": 0,
  "ts": 1716000000000
}
```

## 6. 广播通知

```json
{
  "type": "BROADCAST",
  "noticeType": "DRINK_WATER",
  "message": "请补水",
  "durationMs": 5000,
  "ts": 1716000000000
}
```

## 7. 报警规则默认值

| 规则 | 默认值 |
| --- | --- |
| 工牌失联 | 120 秒无心跳 |
| 无响应 | 180 秒无确认/运动响应 |
| 作业时长提醒 | 45 分钟 |
| 喝水提醒 | 30 分钟 |
| SOS 冷却 | 30 秒 |
