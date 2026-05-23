# MQTT Server

SafePost 推荐使用 EMQX 作为 MQTT Broker。

## 本地启动

```bash
docker compose up -d
```

## Topic

完整协议见 `docs/MQTT.md`。

核心订阅：

- `safepost/badge/+/up`
- `safepost/station/+/up`

核心下发：

- `safepost/badge/{badgeNo}/down`
- `safepost/station/{stationNo}/down`
