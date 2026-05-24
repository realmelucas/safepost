# 飞书多角色 Agent 工作流

## 1. 目标形态

SafePost 的飞书协作采用：

```text
一个 Hermes 飞书机器人
多个 Hermes Profile Agent
一个 safepost Kanban 看板
一套状态汇报脚本
```

也就是说，飞书里不需要先做 5 个不同机器人。你只需要和 Hermes 对话，然后用约定格式把任务派给不同角色。

## 2. 当前角色

| 飞书里怎么称呼 | Hermes profile | 职责 |
| --- | --- | --- |
| 产品 Agent | `safepostpm` | 内部方案、PRD、试点标准、汇报材料 |
| 后端 Agent | `safepostbackend` | NestJS、PostgreSQL、MQTT、通知、部署 |
| 固件 Agent | `safepostfirmware` | ESP32-C3、ESP32-S3、MPU-6050、SOS、震动马达 |
| 前端 Agent | `safepostfrontend` | React 后台、演示页、截图验证 |
| 测试 Agent | `safepostqa` | 真机测试、端到端验证、验收清单 |

## 3. 飞书里推荐说法

### 创建任务

```text
@Hermes 交给【固件Agent】：
任务：给 ESP32-C3-Pro mini 写第一版 SOS + MPU6050 静止检测代码。
目标：硬件到货后可以照着接线测试。
验收：按下 SOS 能上报 MQTT；静止 120 秒触发报警。
```

```text
@Hermes 交给【后端Agent】：
任务：补一个 MQTT 报警模拟器。
目标：不用真机也能模拟 HEARTBEAT、SOS、OFFLINE、NO_RESPONSE。
验收：README 写清楚启动 EMQX、启动 API、运行模拟器、查询报警。
```

### 查状态

```text
@Hermes 汇总 SafePost 所有 Agent 当前工作状态。
```

也可以在本地直接运行：

```bash
scripts/hermes/status_report.sh
```

### 发送飞书状态汇报

```bash
scripts/hermes/status_report.sh --send
```

## 4. 本地快速创建任务

脚本：

```bash
scripts/hermes/create_task.sh <角色> "任务标题" "任务详情"
```

角色支持：

- `pm`
- `product`
- `backend`
- `firmware`
- `frontend`
- `qa`

示例：

```bash
scripts/hermes/create_task.sh firmware \
  "ESP32-C3 SOS + MPU6050 代码" \
  "输出 Arduino 代码、接线说明、串口测试步骤。验收：SOS 和静止报警均可发布 MQTT。"
```

创建后，任务会进入 `safepost` 看板，由 Hermes gateway dispatcher 自动派发。

## 5. 状态汇报格式

`status_report.sh` 会输出：

- 当前时间。
- Kanban 看板任务列表。
- Agent 角色说明。
- 当前 Git 工作区是否有未提交改动。
- 下一步提醒。

如果加 `--send`，会通过 Hermes 的 Feishu home channel 主动推送。

当前已经配置 Hermes cron：

```text
任务 ID：f37aa7fb0afe
名称：SafePost 两小时工作状态汇报
周期：每 2 小时
模式：no-agent，直接运行脚本并发送输出
脚本：~/.hermes/scripts/safepost_status_report.sh
投递：飞书 home channel
```

管理命令：

```bash
hermes cron list
hermes cron pause f37aa7fb0afe
hermes cron resume f37aa7fb0afe
hermes cron run f37aa7fb0afe
hermes cron remove f37aa7fb0afe
```

## 6. 安全建议

当前飞书已经切回安全模式：

```text
FEISHU_ALLOW_ALL_USERS=false
FEISHU_ALLOWED_USERS=<你的 open_id>
```

建议保持这个模式。等以后真的要多人协作，再把可信成员的 open_id 追加到 `FEISHU_ALLOWED_USERS`。

## 7. 更像 wanman.ai 的下一步

第一阶段保持“一个机器人 + 多角色调度”最稳。

如果后续你想要更像独立员工头像，可以升级为：

- 每个角色一个飞书 Bot/App。
- 每个 Bot 绑定一个 Hermes profile。
- 每个 Bot 单独配置权限和 home channel。

但这会增加飞书应用配置和安全维护成本。MVP 阶段建议先用当前方案。
