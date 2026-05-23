# 系统架构图

## 1. 技术架构

```mermaid
flowchart LR
  subgraph Device["设备层"]
    Badge["ESP32-C3 工牌"]
    Check["上岗检测站"]
    Station["ESP32-S3 基站"]
  end

  subgraph Network["通信层"]
    Mqtt["EMQX MQTT Broker"]
    Wifi["Wi-Fi / LAN"]
  end

  subgraph Server["服务层"]
    Api["NestJS API Server"]
    MqttIngest["MQTT Event Ingest"]
    Rules["Alarm Rule Engine"]
    WeCom["WeCom Alert Module"]
  end

  subgraph Data["数据层"]
    Pg["PostgreSQL"]
  end

  subgraph App["应用层"]
    Dashboard["React Dashboard"]
    WeComClient["企业微信"]
  end

  Badge --> Wifi
  Check --> Station
  Station --> Wifi
  Wifi --> Mqtt
  Mqtt --> MqttIngest
  MqttIngest --> Api
  Api --> Rules
  Rules --> Pg
  Api --> Pg
  Rules --> WeCom
  WeCom --> WeComClient
  Dashboard --> Api
```

## 2. 报警链路

```mermaid
flowchart LR
  Motion["静止/无响应/SOS"] --> Badge["工牌"]
  Badge --> Station["基站"]
  Station --> EMQX["EMQX"]
  EMQX --> Ingest["MQTT 接入"]
  Ingest --> Rules["报警规则"]
  Rules --> Alert["报警记录"]
  Alert --> Dashboard["后台弹出"]
  Alert --> WeCom["企业微信"]
  WeCom --> Manager["主管确认"]
  Manager --> Log["处置日志"]
```

## 3. 数据对象

| 对象 | 说明 |
| --- | --- |
| Worker | 工人档案 |
| Badge | 工牌设备 |
| Station | 安全基站 |
| CheckRecord | 血压/酒精检测记录 |
| WorkSession | 作业会话 |
| DeviceEvent | 工牌/基站事件 |
| Alert | 报警记录 |
| NotificationLog | 通知记录 |

## 4. 部署建议

- EMQX、API、PostgreSQL 部署在同一内网或云 VPC。
- 基站通过站点网络连接 MQTT。
- 工牌优先连接基站，必要时可直接 MQTT。
- 企业微信通知作为第一版报警出口。
- 后续可增加短信、电话、声光报警器和皮带机联动。
