# Hermes 本地多 Agent 部署方案

## 1. 目标

SafePost 当前进入硬件到货前的开发准备阶段。Hermes 本地部署的目标是：

- 用多个专用 Agent 分担产品、后端、固件、前端、测试集成工作。
- 用 Hermes Kanban 管理任务，避免所有开发事项堆在一个对话里。
- 用飞书作为日常沟通入口，让任务创建、状态汇报和报警式提醒都能进群。
- 保持核心开发在本地仓库完成，敏感事故背景和内部方案默认不公开。

## 2. 已创建的 Hermes Profiles

| Profile | 角色 | 主要职责 |
| --- | --- | --- |
| `safepostpm` | 产品/安全方案 Agent | PRD、内部汇报、MVP 范围、试点验收、飞书状态摘要 |
| `safepostbackend` | 后端 Agent | NestJS API、PostgreSQL、MQTT、EMQX、通知模块、部署脚本 |
| `safepostfirmware` | 固件 Agent | ESP32-C3 工牌、ESP32-S3 基站、MPU-6050、SOS、震动马达、Arduino 调试 |
| `safepostfrontend` | 前端 Agent | React 后台、商业计划网站、报警看板、截图验证 |
| `safepostqa` | 测试集成 Agent | MVP 端到端验证、硬件调试清单、接口联调、回归检查 |

这些 profile 已经通过 `hermes profile create --clone` 从默认配置克隆，继承当前模型和密钥配置。

## 3. 已创建的 Kanban 看板

看板名：`safepost`

显示名：`SafePost MVP`

默认工作目录：

```text
/Users/luo/Documents/AI兔帮守岗(智能胸卡安全监护系统)
```

常用命令：

```bash
hermes kanban boards switch safepost
hermes kanban list
hermes kanban stats
hermes kanban assignees
```

## 4. 推荐任务拆分

### 产品/安全方案

适合派给 `safepostpm`：

- 完善内部立项汇报。
- 把真实事故背景整理成内部安全复盘材料。
- 制定 MVP 试点验收标准。
- 输出飞书群每周项目进展。

示例：

```bash
hermes kanban create "整理 SafePost 内部试点验收标准" \
  --assignee safepostpm \
  --workspace dir:/Users/luo/Documents/AI兔帮守岗\(智能胸卡安全监护系统\) \
  --body "基于 docs/PRD.md 和 docs/MVPRoadmap.md，输出一份 4-6 周内部试点验收标准，强调失联发现机制。"
```

### 后端

适合派给 `safepostbackend`：

- 补数据库迁移脚本。
- 补 MQTT 消息模拟器。
- 补企业微信/飞书通知模块。
- 补 API 单元测试。

### 固件

适合派给 `safepostfirmware`：

- 把 `firmware/badge/badge.ino` 改成 ESP32-C3-Pro mini 版本。
- 接入 MPU-6050。
- 增加静止检测算法。
- 增加震动马达驱动示例。
- 输出面包板接线表。

### 前端

适合派给 `safepostfrontend`：

- 完善后台报警看板。
- 增加工牌状态视图。
- 增加 MVP 演示页。
- 生成桌面和移动端截图。

### 测试集成

适合派给 `safepostqa`：

- 设计第一批真机测试步骤。
- 编写 MQTT/API 联调清单。
- 设计“模拟晕倒 120 秒无响应”演示流程。
- 每次提交后做端到端验证摘要。

## 5. 飞书沟通接入

Hermes 已内置 Feishu/Lark 平台适配器，但当前还没有配置消息平台。

先运行：

```bash
hermes gateway setup
```

按提示选择 Feishu/Lark。配置成功后，启动网关：

```bash
hermes gateway start
```

或前台运行，方便排查日志：

```bash
hermes gateway run
```

查看状态：

```bash
hermes gateway status
hermes send --list
```

测试发消息：

```bash
hermes send --to feishu "SafePost Hermes 本地 Agent 已接入。"
```

> 注意：飞书 App ID、App Secret、Verification Token、Encrypt Key 等敏感信息不要写进仓库。只放在 Hermes 本机配置或环境变量里。

## 6. 飞书里的建议用法

建议建一个飞书群，例如：

```text
SafePost 守岗 MVP
```

群里使用方式：

- 直接问 Hermes：让它解释当前任务、整理汇报、生成测试步骤。
- 用 Kanban：创建任务、查看任务、订阅任务进展。
- 要求某个方向：明确说“交给固件 Agent”“交给后端 Agent”。

推荐消息格式：

```text
任务：让固件 Agent 给 ESP32-C3-Pro mini 输出 SOS + MPU6050 静止检测接线表和 Arduino 代码。
目标：硬件到货后可以照着接线测试。
验收：能按下 SOS 上报 MQTT；静止 120 秒触发报警。
```

更完整的飞书多角色 Agent 用法见：[`FeishuAgentWorkflow.md`](./FeishuAgentWorkflow.md)。

常用脚本：

```bash
scripts/hermes/create_task.sh firmware "任务标题" "任务详情"
scripts/hermes/status_report.sh
scripts/hermes/status_report.sh --send
```

## 7. 本地启动顺序

1. 切到项目目录。
2. 确认 Hermes 正常：

```bash
hermes --version
hermes profile list
hermes kanban boards show
```

3. 启动飞书网关：

```bash
hermes gateway start
```

4. 创建任务：

```bash
hermes kanban create "任务标题" --assignee safepostfirmware --workspace dir:/Users/luo/Documents/AI兔帮守岗\(智能胸卡安全监护系统\) --body "任务详情"
```

5. 派发一次任务：

```bash
hermes kanban dispatch --board safepost
```

6. 查看结果：

```bash
hermes kanban list --board safepost
hermes kanban runs --board safepost
hermes kanban log <task-id> --board safepost
```

## 8. 第一批建议任务

第一批不要让 Agent 同时大改代码。建议先派 5 个准备任务：

1. 固件 Agent：ESP32-C3-Pro mini 工牌接线表和 Arduino 烧录配置。
2. 固件 Agent：MPU-6050 静止检测算法设计。
3. 后端 Agent：MQTT 模拟器和报警事件样例。
4. 前端 Agent：后台 MVP 演示页完善。
5. QA Agent：真机到货后的 10 步测试清单。

等硬件到了，再让 Agent 进入实际固件和联调开发。
