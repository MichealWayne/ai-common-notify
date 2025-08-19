# Windsurf 集成指南

本指南解释了如何使用模型上下文协议 (MCP) 和规则文件将 AI Common Notify 与 Windsurf 集成，以接收 AI 活动的系统通知。

## 概述

Windsurf 支持模型上下文协议 (MCP) 和基于规则的自动化。AI Common Notify 通过这两种机制与 Windsurf 集成，提供全面的通知功能。

## 集成方法

### 方法 1：快速初始化（推荐）

与 Windsurf 集成的最简单方法是使用快速初始化功能：

```bash
# 导航到您的项目目录
cd /path/to/your/project

# 确保您的项目有 .windsurf 目录
ai-common-notify quickInit --tool windsurf
```

这将自动创建或更新：
1. `.windsurf/mcp.json` - MCP 服务器配置
2. `.windsurfrules` - 通知的自动化规则

### 方法 2：手动配置

如果您喜欢手动配置，请按照以下步骤操作：

#### MCP 服务器配置

1. 在您的项目中创建或编辑 `.windsurf/mcp.json` MCP 配置文件：

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"]
    }
  }
}
```

2. 如果您使用的是独立可执行文件，请相应地调整路径：

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "/path/to/ai-notify-macos",
      "args": ["mcp"]
    }
  }
}
```

#### 规则文件配置

3. 在您的项目中创建或编辑 `.windsurfrules` 规则文件：

```yaml
## Cascade 执行要求

每次执行后，无论结果如何，都调用 MCP工具 NotificationServer(send_notification)。

# 启用自动通知
notification:
  enabled: true
  on_start: true
  on_success: true
  on_failure: true
  on_error: true

# 通知配置
mcp:
  NotificationServer:
    enabled: true
    default_urgency: normal
    default_timeout: 5
    play_sound: true
```

4. 保存文件并重新启动 Windsurf。

## 工作原理

Windsurf 集成通过两种互补的机制工作：

### 1. MCP 集成
与 Cursor 类似，Windsurf 可以通过 MCP 协议调用 AI Common Notify 提供的 `send_notification` 工具。

### 2. 基于规则的自动化
Windsurf 的规则系统根据指定事件自动触发通知：
- `on_start`：任务开始时
- `on_success`：任务成功完成时
- `on_failure`：任务失败时
- `on_error`：发生错误时

## 使用示例

### 通过 MCP 的基本通知

```javascript
// 在 Windsurf 的 MCP 客户端中
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: '任务完成',
    message: '您的 AI 任务已成功完成',
    urgency: 'normal',
    timeout: 0,
    play_sound: true
  }
});
```

### 通过规则的错误通知

当发生错误且规则中设置了 `on_error: true` 时，Windsurf 自动调用：

```javascript
// 由 Windsurf 规则自动触发
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: '发生错误',
    message: 'AI 处理过程中发生错误',
    urgency: 'critical',
    timeout: 0,
    play_sound: true
  }
});
```

### 通过规则的自定义通知

您可以在规则文件中自定义默认通知参数：

```yaml
# 通知配置
mcp:
  NotificationServer:
    enabled: true
    default_urgency: critical  # 所有通知的更高紧急程度
    default_timeout: 10        # 10 秒超时
    play_sound: true
```

## 测试集成

### 手动测试

您可以手动测试 MCP 服务器：

```bash
# 启动 MCP 服务器
ai-common-notify mcp
```

### 自动测试

1. 打开 Windsurf 并开始与 AI 模型对话
2. 要求 AI 执行会触发通知的操作
3. 您应该会根据规则配置收到系统通知

### 规则测试

通过创建触发不同事件的简单任务来测试规则配置：

```yaml
# 测试不同的通知事件
notification:
  enabled: true
  on_start: true    # 任务开始时通知
  on_success: true  # 任务成功时通知
  on_failure: true  # 任务失败时通知
  on_error: true    # 发生错误时通知
```

## 常见问题和解决方案

### 1. 规则未触发

**问题**：Windsurf 规则已配置但通知未触发。

**解决方案**：
- 验证 `.windsurfrules` 文件是否位于正确位置
- 检查规则文件的语法
- 确保设置了 `notification: enabled: true`
- 使用简单规则配置进行测试

### 2. MCP 服务器未启动

**问题**：Windsurf 无法连接到 MCP 服务器。

**解决方案**：
- 验证 AI Common Notify 是否正确安装
- 检查 `mcp.json` 中的路径是否正确
- 确保 `mcp.json` 文件位于正确位置
- 手动测试 MCP 服务器：`ai-common-notify mcp`

### 3. 通知未出现

**问题**：MCP 服务器正在运行且规则已配置，但没有通知出现。

**解决方案**：
- 检查系统通知设置
- 验证通知参数是否正确
- 使用简单通知调用手动测试
- 检查 AI Common Notify 日志：`ai-common-notify errlog`

### 4. 权限错误

**问题**：启动 MCP 服务器或执行规则时出现权限错误。

**解决方案**：
- 确保 AI Common Notify 在您的系统 PATH 中
- 检查 ai-common-notify 可执行文件的文件权限
- 在 macOS 上，确保终端在系统偏好设置中具有通知权限

## 高级配置

### 自定义通知模板

您可以在全局配置中自定义通知模板：

```json
{
  "notifications": {
    "title_template": "[Windsurf] {project_name}",
    "message_template": "{message}\n项目: {project_name}\n事件: {event_type}"
  }
}
```

### 脚本回调

在发送通知时执行自定义脚本：

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/log-windsurf-event.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "/path/to/process-notification.js",
        "enabled": true
      }
    ]
  }
}
```

### 复杂规则配置

您可以创建更复杂的规则配置：

```yaml
# 高级通知规则
notification:
  enabled: true
  on_start: false    # 启动时不通知
  on_success: true   # 成功时通知
  on_failure: true   # 失败时通知
  on_error: true     # 错误时通知

# 自定义通知配置
mcp:
  NotificationServer:
    enabled: true
    default_urgency: normal
    default_timeout: 0    # 永久通知
    play_sound: true
```

## 最佳实践

1. **平衡通知频率**：不要启用所有通知事件以避免垃圾邮件
2. **使用适当的紧急程度级别**：为不同事件选择合适的紧急程度级别
3. **设置合理的超时时间**：使用超时时间防止通知停留太久
4. **明智地启用声音**：仅为重要通知启用声音
5. **定期测试**：定期测试您的配置以确保其正常工作
6. **监控日志**：使用 `ai-common-notify errlog` 监控问题
7. **提示请求通知**：在使用 Windsurf 与 AI 模型时，在提示中明确要求通知。例如，在提示的最后加上"最后，任务完成时发送通知给我。"这有助于确保 Windsurf 调用通知工具调用。

## 下一步

1. [Claude Code 集成](claude-code.md) - 与 Claude Code 集成
2. [Cursor 集成](cursor.md) - 与 Cursor 集成
3. [配置指南](../configuration/configuration.md) - 了解所有配置选项
4. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能

---
*AI Common Notify - 简化 AI 编程工具的通知*