# AI 通用通知服务

为 AI 编程工具（Claude Code、Cursor、Windsurf、Kiro 等）提供统一的通知服务

**版本**: 1.0.0-alpha67

[![npm version](https://img.shields.io/npm/v/ai-common-notify.svg)](https://www.npmjs.com/package/ai-common-notify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 功能特性

- **跨平台支持**：支持 Windows、macOS 和 Linux
- **多工具集成**：支持 Claude Code、Cursor、Windsurf、Kiro 等 AI 工具
- **统一接口**：标准化的 RESTful API 和 MCP 协议支持
- **可配置通知**：可自定义标题、消息、紧急程度、超时时间、声音和图标
- **默认永久显示**：通知默认永久显示，直到用户点击（可配置）
- **脚本回调**：支持在发送通知前后执行自定义脚本
- **快速初始化**：一键为多个 AI 工具生成配置文件
- **错误日志记录和查看**：记录执行错误并通过 `ai-common-notify errlog` 查看

## 安装

### 使用 npm (推荐)

```bash
npm install -g ai-common-notify
```

## 文档

详细文档请参阅以下文件：

### 快速初始化功能

- [快速初始化功能使用指南](docs/zh/advanced/quick-init.md) - 如何使用快速初始化功能为各种 AI 工具生成配置

### 脚本回调功能

- [脚本回调功能指南](docs/zh/configuration/script-callbacks.md) - 如何配置和使用脚本回调功能

### English Documentation

- [Main Documentation](docs/en/README.md) - Complete documentation in English
- [API Reference](docs/en/advanced/api.md) - REST API documentation

### 中文文档

- [主要文档](docs/zh/README.md) - 完整的中文文档
- [API 参考](docs/zh/advanced/api.md) - REST API 文档

## 快速开始

### 测试安装

```bash
# 发送测试通知以验证系统是否正常工作
ai-common-notify test
```

### 快速初始化

AI 通用通知服务提供快速初始化功能，可自动为各种 AI 编程工具生成或更新配置文件，极大地简化了集成过程。

```bash
# 导航到您的项目目录
cd /path/to/your/project

# 初始化所有检测到的 AI 工具
ai-common-notify quickInit

# 或初始化特定工具
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

## 使用示例

### Claude Code 集成

AI 通用通知服务可以直接与 Claude Code 集成作为钩子，在 Claude 需要注意或执行某些操作时通知您。

#### 设置为 Claude 钩子

添加到您的 Claude 设置文件 (`~/.claude/settings.json` 或项目中的 `.claude/settings.json`)：

对于一般使用（推荐），仅配置 Stop 事件以避免频繁通知：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook"
          }
        ]
      }
    ]
  }
}
```

对于需要详细通知的高级用户，您可以使用完整配置：

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "(Bash|Write|Edit|MultiEdit)",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook"
          }
        ]
      }
    ]
  }
}
```

此配置将：

- 在 Claude 完成响应时通知您 (Stop 事件)
- 在通知标题中显示项目名称，在消息中显示完整项目路径

### Cursor 集成

要将 AI 通用通知服务与 Cursor 一起使用，您需要将其配置为 MCP 服务器。

找到配置文件 `~/.cursor/mcp.json` 或 `your_project/.cursor/mcp.json` 并添加：

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

如果您使用的是独立可执行文件，请相应地调整路径：

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

> **使用提示**：在使用 Cursor 时，建议在您的提示中明确要求发送通知，例如："最后，任务完成时发送通知给我。"这有助于确保 Cursor 调用通知工具调用。您也可以在 Cursor 设置中将此提示添加为规则，这样就不需要每次都手动输入。

### 手动使用

#### 从脚本发送通知

您可以在 shell 脚本中轻松使用`send`命令来发送通知：

```bash
# 基本用法
ai-common-notify send --title "部署完成" --message "应用已成功部署到生产环境"

# 使用自定义选项
ai-common-notify send \
  --title "构建失败" \
  --message "构建过程失败，请检查日志" \
  --urgency critical \
  --timeout 10 \
  --sound \
  --project "我的项目" \
  --tool "CI/CD"
```

#### 作为钩子发送通知

```bash
# 基本通知
echo '{"title": "测试通知", "message": "这是一条测试消息"}' | ai-common-notify hook

# 自定义通知
echo '{"title": "自定义标题", "message": "自定义消息", "urgency": "critical"}' | ai-common-notify hook

# 显式指定事件类型
echo '{"title": "显式通知", "message": "这是一条显式通知"}' | ai-common-notify hook --event-type Notification
```

#### 可用的钩子事件

- **PreToolUse**：在 Claude 使用工具之前（可用于审查/阻止操作）
- **PostToolUse**：在工具成功完成后
- **Notification**：当 Claude 发送通知时
- **Stop**：当 Claude 完成响应时
- **SubagentStop**：当 Claude 子代理完成时

#### 钩子命令选项

- `-e, --event-type <type>`: 显式指定事件类型（当无法自动确定事件类型时很有用）
- `-t, --test`: 测试模式 - 从 test.json 文件而不是 stdin 读取（尚未实现）

## 脚本回调

AI 通用通知服务支持在发送通知时执行自定义脚本。此功能允许您扩展通知服务的功能。

详细信息请参阅 [脚本回调功能指南](docs/zh/configuration/script-callbacks.md)。

## 自动化工作流

AI 通用通知服务可以轻松集成到自动化脚本中，以便在工作流的关键节点发送通知。

### 部署脚本示例

```bash
#!/bin/bash

echo "开始部署..."

# 模拟部署过程
echo "正在构建应用..."
sleep 2

echo "正在运行测试..."
sleep 2

echo "正在部署到生产环境..."
sleep 3

echo "部署完成!"

# 发送通知
ai-common-notify send \
  --title "部署完成" \
  --message "应用已成功部署到生产环境" \
  --urgency normal \
  --timeout 10 \
  --sound \
  --project "我的Web应用" \
  --tool "CI/CD"

echo "通知已发送"
```

### 命令行选项

`send` 命令支持以下选项：

- `-t, --title <title>`: 通知标题（必需）
- `-m, --message <message>`: 通知消息（必需）
- `-u, --urgency <urgency>`: 通知紧急程度（low, normal, critical）（默认："normal"）
- `--timeout <seconds>`: 设置通知超时时间（秒）（0 表示永久）（默认："0"）
- `--no-sound`: 禁用通知声音
- `--icon <icon>`: 通知图标路径
- `--tool <tool>`: 工具名称，用于工具特定配置
- `--project <project>`: 项目名称

## 配置

AI Common Notify 支持多个配置级别：

1. **全局配置**: `~/.config/ai-common-notify/config.json` (Linux/macOS) 或 `%APPDATA%\ai-common-notify\config.json` (Windows)
2. **项目配置**: `<project-root>/.ai-notify.json`
3. **环境变量**: 使用环境变量覆盖配置

示例配置：

```json
{
  "server": {
    "port": 6001,
    "host": "localhost",
    "token": "your-secret-token"
  },
  "notifications": {
    "default_timeout": 0,
    "default_sound": true,
    "default_urgency": "normal",
    "title_template": "{tool_name} - {project_name}",
    "message_template": "{message}"
  },
  "scripts": {
    "timeout": 30000,
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/script.sh",
        "enabled": true
      }
    ]
  }
}
```

## CLI 命令

```bash
# 查看所有可用命令
ai-common-notify --help

# 发送测试通知
ai-common-notify test

# 发送自定义通知
ai-common-notify send --title "任务完成" --message "您的任务已成功完成"

# 快速初始化 AI 工具
ai-common-notify quickInit

# 查看错误日志
ai-common-notify errlog

# 查看所有日志
ai-common-notify alllog

# 启动 MCP 服务器以供 Cursor 和其他工具使用
ai-common-notify mcp

# 处理 Claude Code 钩子事件
ai-common-notify hook
```

## 支持的 AI 工具

- **Claude Code**: 通过钩子系统集成
- **Cursor**: 通过 MCP 协议集成
- **Windsurf**: 通过 MCP 协议和规则文件集成
- **Gemini CLI**: 通过 MCP 协议集成
- **其他 MCP 工具**: 任何支持模型上下文协议的工具

## REST API

启动 REST API 服务器：

```bash
ai-common-notify api
```

通过 HTTP 发送通知：

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "title": "API 测试",
    "message": "此通知通过 REST API 发送",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

## 贡献

1. Fork 仓库
2. 为您的功能创建新分支
3. 提交您的更改
4. 推送到您的分支
5. 创建拉取请求

## 许可证

本项目采用 MIT 许可证 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

## 作者

Wayne

## 支持

如果您遇到任何问题或有疑问，请在 GitHub 上 [提交问题](https://github.com/MichealWayne/ai-common-notify/issues)。