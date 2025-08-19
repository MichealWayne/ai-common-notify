# Cursor 集成指南

本指南解释了如何使用模型上下文协议 (MCP) 将 AI Common Notify 与 Cursor 集成，以接收 AI 活动的系统通知。

## 概述

Cursor 支持模型上下文协议 (MCP)，该协议允许外部工具为 AI 提供服务。AI Common Notify 实现了一个 MCP 服务器，可以在 Cursor 请求时发送系统通知。

## 集成方法

### 方法 1：快速初始化（推荐）

与 Cursor 集成的最简单方法是使用快速初始化功能：

```bash
# 导航到您的项目目录
cd /path/to/your/project

# 确保您的项目有 .cursor 目录
ai-common-notify quickInit --tool cursor
```

这将自动创建或更新 `.cursor/mcp.json` 配置文件。

### 方法 2：手动配置

如果您喜欢手动配置，请按照以下步骤操作：

1. 在您的项目中创建或编辑 `.cursor/mcp.json` MCP 配置文件：

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

3. 保存文件并重新启动 Cursor。

## 工作原理

配置完成后，Cursor 可以调用 AI Common Notify 提供的 `send_notification` 工具。该工具接受以下参数：

```json
{
  "name": "send_notification",
  "description": "发送带可选声音的系统通知",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": {"type": "string", "description": "通知标题"},
      "message": {"type": "string", "description": "通知消息"},
      "urgency": {"type": "string", "enum": ["low", "normal", "critical"]},
      "timeout": { "type": "number", "description": "超时时间（秒）（0 表示永久显示）" },
      "play_sound": { "type": "boolean", "description": "播放通知声音" }
    },
    "required": ["title", "message"]
  }
}
```

## 使用示例

### 基本通知

```javascript
// 在 Cursor 的 MCP 客户端中
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

### 错误通知

```javascript
// 在 Cursor 的 MCP 客户端中
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

### 低优先级通知

```javascript
// 在 Cursor 的 MCP 客户端中
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: '后台任务',
    message: '后台任务已完成',
    urgency: 'low',
    timeout: 10,
    play_sound: false
  }
});
```

## 测试集成

### 手动测试

您可以使用 MCP 测试客户端手动测试 MCP 服务器，或创建一个简单的测试脚本：

```bash
# 启动 MCP 服务器
ai-common-notify mcp
```

### 自动测试

1. 打开 Cursor 并开始与 AI 模型对话
2. 要求 AI 执行会触发通知的操作
3. 您应该会收到系统通知

## 常见问题和解决方案

### 1. MCP 服务器未启动

**问题**：Cursor 无法连接到 MCP 服务器。

**解决方案**：
- 验证 AI Common Notify 是否正确安装
- 检查 `mcp.json` 中的路径是否正确
- 确保 `mcp.json` 文件位于正确位置
- 手动测试 MCP 服务器：`ai-common-notify mcp`

### 2. 通知未出现

**问题**：MCP 服务器正在运行但没有通知出现。

**解决方案**：
- 检查系统通知设置
- 验证通知参数是否正确
- 使用简单通知调用手动测试
- 检查 AI Common Notify 日志：`ai-common-notify errlog`

### 3. 权限错误

**问题**：启动 MCP 服务器时出现权限错误。

**解决方案**：
- 确保 AI Common Notify 在您的系统 PATH 中
- 检查 ai-common-notify 可执行文件的文件权限
- 在 macOS 上，确保终端在系统偏好设置中具有通知权限

### 4. 配置未加载

**问题**：Cursor 似乎无法识别 MCP 配置。

**解决方案**：
- 确保 `mcp.json` 文件位于正确位置（`.cursor/mcp.json`）
- 配置更改后重新启动 Cursor
- 检查配置文件中的 JSON 语法错误

## 高级配置

### 自定义通知模板

您可以在全局配置中自定义通知模板：

```json
{
  "notifications": {
    "title_template": "[Cursor] {project_name}",
    "message_template": "{message}\n项目: {project_name}"
  }
}
```

### 脚本回调

在通知前后执行自定义脚本：

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/log-cursor-notification.sh",
        "enabled": true
      }
    ]
  }
}
```

### 项目特定配置

您可以通过将 `mcp.json` 文件放在项目目录中为不同项目设置不同的配置。

## 最佳实践

1. **使用适当的紧急程度级别**：为不同类型的通知选择合适的紧急程度级别
2. **设置合理的超时时间**：使用超时时间防止通知停留太久
3. **明智地启用声音**：仅为重要通知启用声音，以避免通知疲劳
4. **定期测试**：定期测试您的配置以确保其正常工作
5. **监控日志**：使用 `ai-common-notify errlog` 监控问题
6. **提示请求通知**：在使用 Cursor 与 AI 模型时，在提示中明确要求通知。例如，在提示的最后加上"最后，任务完成时发送通知给我。"这有助于确保 Cursor 调用通知工具调用。

## 下一步

1. [Claude Code 集成](claude-code.md) - 与 Claude Code 集成
2. [Windsurf 集成](windsurf.md) - 与 Windsurf 集成
3. [配置指南](../configuration/configuration.md) - 了解所有配置选项
4. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能

---
*AI Common Notify - 简化 AI 编程工具的通知*