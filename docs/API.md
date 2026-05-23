# API 设计

基础路径：`/api/v1`

## 1. 工人

### GET `/workers`

查询工人列表。

### POST `/workers`

```json
{
  "employeeNo": "W001",
  "name": "张三",
  "team": "夜班一组",
  "phone": "13800000000"
}
```

## 2. 工牌

### GET `/badges`

查询工牌列表和在线状态。

### POST `/badges/:badgeNo/bind`

```json
{
  "workerId": "uuid"
}
```

### POST `/badges/:badgeNo/status`

```json
{
  "status": "ALLOWED",
  "reason": "检测通过"
}
```

## 3. 检测

### POST `/checks`

上传血压和酒精检测结果。

```json
{
  "workerId": "uuid",
  "badgeNo": "B0001",
  "stationNo": "S0001",
  "systolic": 122,
  "diastolic": 78,
  "heartRate": 82,
  "alcoholMg100ml": 0
}
```

响应：

```json
{
  "passed": true,
  "badgeStatus": "ALLOWED",
  "reason": "检测通过"
}
```

## 4. 报警

### GET `/alerts?status=OPEN`

查询报警列表。

### POST `/alerts/:id/ack`

确认报警。

```json
{
  "operator": "安全主管A"
}
```

### POST `/alerts/:id/resolve`

关闭报警。

```json
{
  "operator": "安全主管A",
  "note": "现场确认已恢复"
}
```

## 5. 广播

### POST `/broadcasts`

基站向工牌广播通知。

```json
{
  "stationNo": "S0001",
  "type": "DRINK_WATER",
  "message": "请补水",
  "badgeNos": ["B0001", "B0002"]
}
```
