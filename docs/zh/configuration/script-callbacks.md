# Script Callbacks Guide

AI Common Notify支持在发送通知时执行自定义脚本，这使得用户可以扩展通知服务的功能。

## 功能概述

脚本回调功能允许用户：

1. 在发送通知时执行处理脚本
2. 通过环境变量访问通知相关信息
3. 使用Shell脚本或Node.js脚本

## 配置

脚本回调通过配置文件中的`scripts`部分进行配置：

```json
{
  "scripts": {
    "timeout": 30000,
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/your/script.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "/path/to/your/script.js",
        "enabled": true
      }
    ]
  }
}
```

### 配置选项

- `timeout`: 脚本执行超时时间（毫秒），默认为30000（30秒）
- `notify`: 通知发送时执行的脚本数组

### 脚本配置项

每个脚本配置包含以下属性：

- `type`: 脚本类型，可选值为`shell`或`node`
- `path`: 脚本文件的绝对路径（Shell脚本使用`.sh`扩展名，Node.js脚本使用`.js`或`.cjs`扩展名）
- `enabled`: 是否启用该脚本，默认为`true`

## 脚本类型

### Shell脚本

Shell脚本在Unix-like系统上使用`bash`执行，在Windows上使用`cmd`执行。

文件扩展名应为`.sh`（Unix-like）或`.bat`/`.cmd`（Windows）。

### Node.js脚本

Node.js脚本使用Node.js运行时执行。

文件扩展名应为`.js`。

## 执行时机

### notify

在发送通知时执行。如果脚本执行失败，不会影响通知的发送。

## 环境变量

脚本执行时会接收到以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| NOTIFY_TITLE | 通知标题 | "任务完成" |
| NOTIFY_MESSAGE | 通知消息 | "代码重构已完成" |
| NOTIFY_URGENCY | 紧急程度 | "normal" |
| NOTIFY_TIMEOUT | 超时时间（秒） | "0" |
| NOTIFY_SOUND | 是否播放声音 | "true" |
| NOTIFY_PROJECT_NAME | 项目名称 | "my-project" |
| NOTIFY_TOOL_NAME | 工具名称 | "Claude Code" |
| NOTIFY_TIMESTAMP | 时间戳 | "2024-01-01T12:00:00Z" |
| NOTIFY_EVENT_TYPE | 事件类型（用于钩子事件） | "PreToolUse" |
| NOTIFY_PROJECT_PATH | 项目目录完整路径 | "/path/to/project" |
| NOTIFY_TRANSCRIPT_PATH | 对话记录文件路径（用于 Claude Code 钩子） | "/path/to/transcript.json" |
| NOTIFY_SESSION_ID | 会话 ID（用于 Claude Code 钩子） | "session-12345" |

## 脚本示例

### Shell脚本示例

```bash
#!/bin/bash
# notify.sh - 通知时执行的脚本

# 记录日志
echo "[$NOTIFY_TIMESTAMP] 发送通知: $NOTIFY_TITLE - $NOTIFY_MESSAGE" >> /tmp/ai-notify.log
echo "项目: $NOTIFY_PROJECT_NAME, 工具: $NOTIFY_TOOL_NAME, 紧急程度: $NOTIFY_URGENCY" >> /tmp/ai-notify.log

# 可以在这里添加其他逻辑，如：
# 1. 日志记录
# 2. 系统状态检查
# 3. 发送webhook到其他服务
# 4. 执行特定的系统命令

echo "脚本执行完成" >> /tmp/ai-notify.log
```

### Node.js脚本示例

```javascript
// notify.js - 通知时执行的脚本

const fs = require('fs');
const https = require('https');

// 记录通知日志
const logMessage = `[${process.env.NOTIFY_TIMESTAMP}] 通知已发送: ${process.env.NOTIFY_TITLE} - ${process.env.NOTIFY_MESSAGE}\n`;
fs.appendFileSync('/tmp/ai-notify.log', logMessage);

// 记录详细信息
const detailMessage = `项目: ${process.env.NOTIFY_PROJECT_NAME}, 工具: ${process.env.NOTIFY_TOOL_NAME}, 紧急程度: ${process.env.NOTIFY_URGENCY}\n`;
fs.appendFileSync('/tmp/ai-notify.log', detailMessage);

// 发送webhook到其他服务（示例）
function sendWebhook() {
  const data = JSON.stringify({
    title: process.env.NOTIFY_TITLE,
    message: process.env.NOTIFY_MESSAGE,
    project: process.env.NOTIFY_PROJECT_NAME,
    tool: process.env.NOTIFY_TOOL_NAME,
    urgency: process.env.NOTIFY_URGENCY
  });

  const options = {
    hostname: 'your-webhook-service.com',
    port: 443,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Webhook响应状态码: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error('Webhook发送错误:', error);
  });

  req.write(data);
  req.end();
}

// 发送webhook
sendWebhook();

fs.appendFileSync('/tmp/ai-notify.log', '脚本执行完成\n');
```

## 安全考虑

### 路径限制

脚本文件必须位于以下位置之一：

1. 用户主目录内
2. 当前项目目录内

这是为了防止执行系统关键目录中的恶意脚本。

### 文件扩展名验证

只允许以下文件扩展名：

- Shell脚本: `.sh` (Unix-like), `.bat` 或 `.cmd` (Windows)
- Node.js脚本: `.js` 或 `.cjs`

### 权限检查

在Unix-like系统上，脚本文件必须具有执行权限。

### 超时控制

所有脚本执行都有超时限制（默认30秒），防止恶意脚本消耗系统资源。

## 错误处理

### 脚本执行错误

如果脚本执行过程中发生错误：

1. 错误会被记录到日志中
2. 不会影响主通知流程
3. 后续脚本会继续执行

### 脚本超时

如果脚本执行超过设定的超时时间：

1. 脚本进程会被强制终止
2. 超时事件会被记录到日志中
3. 不会影响主通知流程

## 最佳实践

### 1. 脚本设计

- 保持脚本简洁高效
- 避免长时间运行的操作
- 正确处理错误情况
- 使用异步操作时要小心

### 2. 日志记录

- 记录重要操作和错误
- 使用一致的日志格式
- 避免记录敏感信息

### 3. 安全性

- 定期审查脚本内容
- 不要执行来源不明的脚本
- 限制脚本的系统访问权限

### 4. 性能

- 优化脚本执行效率
- 避免不必要的网络请求
- 合理设置超时时间

## 故障排除

### 脚本未执行

检查以下几点：

1. 脚本路径是否正确且为绝对路径
2. 脚本文件是否存在
3. 脚本是否具有执行权限（Unix-like系统）
4. 脚本是否在允许的目录内
5. 脚本配置中的`enabled`是否为`true`

### 环境变量未正确传递

检查脚本中环境变量的使用方式是否正确。

### 脚本执行超时

考虑以下解决方案：

1. 优化脚本执行效率
2. 增加`timeout`配置值
3. 将长时间运行的操作移到后台执行