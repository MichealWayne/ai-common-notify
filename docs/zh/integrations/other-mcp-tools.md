# 其他 MCP 工具集成指南

本指南解释了如何将 AI Common Notify 与支持模型上下文协议 (MCP) 的其他 AI 工具集成。

## 概述

模型上下文协议 (MCP) 是一个开放标准，允许 AI 工具与外部服务通信。任何实现 MCP 的工具都可以使用 AI Common Notify 作为通知服务。

## 通用集成过程

### 步骤 1：配置 MCP 服务器

大多数 MCP 兼容工具都需要一个指定外部服务器的配置文件。通用格式为：

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

### 步骤 2：工具特定配置

每个工具可能有自己的特定配置要求：

1. **配置文件位置**：不同工具可能在不同位置查找配置文件
2. **文件格式**：一些工具可能需要特定的文件扩展名或格式
3. **服务器命名**：服务器名称（示例中的 `NotificationServer`）可能需要与工具期望匹配

### 步骤 3：测试集成

配置完成后，通过以下方式测试集成：

1. 启动工具
2. 触发会调用通知服务的操作
3. 验证通知是否出现

## 常见 MCP 工具示例

### 示例 1：通用 MCP 工具

对于在 `.mcp/config.json` 中查找配置的通用 MCP 工具：

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

### 示例 2：具有自定义路径的工具

对于需要可执行文件完整路径的工具：

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "/usr/local/bin/ai-common-notify",
      "args": ["mcp"]
    }
  }
}
```

### 示例 3：具有环境变量的工具

对于需要特定环境变量的工具：

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"],
      "env": {
        "NOTIFICATION_SOUND": "true",
        "DEFAULT_TIMEOUT": "0"
      }
    }
  }
}
```

## 使用 send_notification 工具

集成后，任何 MCP 工具都可以调用 AI Common Notify 提供的 `send_notification` 工具。该工具接受以下参数：

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
// 在任何 MCP 客户端中
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

### 关键通知

```javascript
// 在任何 MCP 客户端中
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: '关键错误',
    message: '需要立即关注',
    urgency: 'critical',
    timeout: 0,
    play_sound: true
  }
});
```

### 低优先级通知

```javascript
// 在任何 MCP 客户端中
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: '后台任务',
    message: '后台进程已完成',
    urgency: 'low',
    timeout: 10,
    play_sound: false
  }
});
```

## 排查常见问题

### 1. 工具找不到 MCP 服务器

**问题**：AI 工具报告无法连接到 MCP 服务器。

**解决方案**：
- 验证配置文件位置对特定工具是否正确
- 检查 AI Common Notify 是否已安装并在系统 PATH 中
- 确保配置中的命令路径正确
- 手动测试 MCP 服务器：`ai-common-notify mcp`

### 2. 通知未出现

**问题**：MCP 服务器似乎正在运行，但没有通知出现。

**解决方案**：
- 检查系统通知设置和权限
- 验证通知参数是否有效
- 使用简单通知调用进行测试
- 检查 AI Common Notify 日志：`ai-common-notify errlog`

### 3. 配置格式错误

**问题**：工具报告配置文件格式错误。

**解决方案**：
- 验证 JSON 语法是否正确
- 检查配置文件是否在预期位置
- 查阅工具文档了解特定配置要求
- 使用 JSON 验证器检查配置文件

### 4. 权限问题

**问题**：启动 MCP 服务器或发送通知时出现权限错误。

**解决方案**：
- 确保 AI Common Notify 在您的系统 PATH 中
- 检查 ai-common-notify 可执行文件的文件权限
- 在 macOS 上，确保终端应用程序具有通知权限
- 在 Linux 上，确保用户有权限发送通知

## MCP 集成的最佳实践

### 1. 一致命名

在可能的情况下，对不同工具使用一致的服务器命名：

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

### 2. 环境特定配置

为不同环境使用不同的配置文件：

```
project/
├── .mcp/
│   ├── config.dev.json
│   ├── config.prod.json
│   └── config.local.json
```

### 3. 错误处理

在您的 MCP 客户端中实现适当的错误处理：

```javascript
try {
  const response = await client.request('call_tool', {
    name: 'send_notification',
    arguments: {
      title: '任务完成',
      message: '您的任务已成功完成'
    }
  });
  
  if (response.error) {
    console.error('通知失败:', response.error);
  }
} catch (error) {
  console.error('MCP 请求失败:', error);
}
```

### 4. 测试

创建测试脚本以验证集成：

```bash
#!/bin/bash
# test-notification.sh

echo "测试 MCP 通知..."
ai-common-notify mcp &
MCP_PID=$!

# 给服务器一些启动时间
sleep 2

# 发送测试通知（这通常由 MCP 客户端完成）
# 这是一个简化的示例 - 实际实现取决于工具

echo "测试完成。停止 MCP 服务器..."
kill $MCP_PID
```

### 5. 提示请求通知

在使用 MCP 兼容的 AI 工具时，在提示中明确要求通知。例如，在提示的最后加上"最后，任务完成时发送通知给我。"这有助于确保 AI 工具调用通知工具调用。

## 高级集成场景

### 1. 多个通知服务器

您可以为不同目的配置多个通知服务器：

```json
{
  "mcpServers": {
    "CriticalNotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"]
    },
    "InfoNotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"]
    }
  }
}
```

### 2. 自定义通知模板

在全局 AI Common Notify 配置中配置自定义模板：

```json
{
  "notifications": {
    "title_template": "[{tool_name}] {project_name}",
    "message_template": "{message}\n项目: {project_name}\n时间: {timestamp}"
  }
}
```

### 3. 脚本回调

使用脚本回调扩展功能：

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/notification-script.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "/path/to/notification-script.js",
        "enabled": true
      }
    ]
  }
}
```

## 下一步

1. [配置指南](../configuration/configuration.md) - 了解所有配置选项
2. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能
3. [API 参考](../advanced/api.md) - 使用 REST API 进行自定义集成
4. [安全指南](../advanced/security.md) - 安全最佳实践和配置

---
*AI Common Notify - 简化 AI 编程工具的通知*