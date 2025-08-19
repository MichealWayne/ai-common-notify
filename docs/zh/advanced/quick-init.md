# AI 通用通知服务 - 快速初始化功能使用指南

## 简介

快速初始化功能 (`quickInit`) 是 AI 通用通知服务的一个重要特性，它能够自动为各种 AI 编程工具生成或更新配置文件，大大简化了工具集成的过程。通过这个功能，用户可以一键完成多个 AI 工具的配置，无需手动编辑复杂的配置文件。

## 支持的 AI 工具

快速初始化功能目前支持以下 AI 编程工具：

1. **Cursor** - 通过 MCP 协议集成
2. **Claude Code** - 通过 Hook 系统集成
3. **Windsurf** - 通过 MCP 协议和规则文件集成
4. **Gemini CLI** - 通过 MCP 协议集成

## 使用方法

### 1. 为所有检测到的工具初始化配置

在项目根目录下运行以下命令，系统会自动检测项目中已安装的 AI 工具，并为它们生成相应的配置文件：

```bash
ai-common-notify quickInit
```

### 2. 为特定工具初始化配置

如果您只想为某个特定的工具初始化配置，可以使用 `--tool` 选项指定工具名称：

```bash
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

## 工具检测机制

快速初始化功能会自动检测项目中已安装的 AI 工具，检测依据如下：

1. **Cursor**: 检测项目根目录下是否存在 `.cursor` 目录
2. **Claude Code**: 检测项目根目录下是否存在 `.claude` 目录或 `claude-config.json` 文件
3. **Windsurf**: 检测项目根目录下是否存在 `.windsurf` 目录
4. **Gemini CLI**: 检测项目根目录下是否存在 `.gemini` 目录

## 生成的配置文件

### Cursor

为 Cursor 生成的配置文件位于 `.cursor/mcp.json`，内容如下：

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

### Claude Code

为 Claude Code 生成的配置文件位于 `.claude/settings.json`（如果项目使用新配置结构）或 `claude-config.json`（如果项目使用旧配置结构），内容如下：

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
    ]
  }
}
```

### Windsurf

为 Windsurf 生成两个配置文件：

1. MCP 配置文件 `.windsurf/mcp.json`：

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

2. 规则文件 `.windsurfrules`：

```
## 任务结束规则

每当你完成所有步骤后，无论结果如何，都立即调用 MCP工具 NotificationServer(send_notification)发送消息通知。


每当你完成所有步骤后，无论结果如何，都立即调用 MCP工具 NotificationServer(send_notification)发送消息通知。

### 通知配置
notifications:
  enabled: true
  rules:
    - event: on_success
      enabled: true
      message: "任务执行成功"
      urgency: normal
    - event: on_failure
      enabled: true
      message: "任务执行失败"
      urgency: critical
    - event: on_error
      enabled: true
      message: "发生错误"
      urgency: critical

### MCP 服务器配置
mcp_servers:
  - name: NotificationServer
    enabled: true
    config:
      default_urgency: normal
      default_timeout: 5
      retry_count: 3
      play_sound: true
```

### Gemini CLI

为 Gemini CLI 生成的配置文件位于 `.gemini/mcp.json`，内容如下：

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

## 安全性说明

快速初始化功能在更新配置文件时会采取以下安全措施：

1. **非破坏性更新**: 在更新现有配置文件时，会保留原有配置项，仅添加或更新与通知服务相关的配置
2. **备份机制**: 在更新配置文件前会自动创建备份文件（.backup 后缀）
3. **原子操作**: 配置文件的更新是原子操作，避免因意外中断导致文件损坏

## 故障排除

### 1. 配置文件未生成

如果运行 `quickInit` 命令后没有生成预期的配置文件，请检查：

- 确保在正确的项目根目录下运行命令
- 确保项目中已安装对应的 AI 工具（存在相应的配置目录或文件）
- 检查是否有权限问题

### 2. 配置文件内容不正确

如果生成的配置文件内容不正确，请检查：

- 确保使用的是最新版本的 AI 通用通知服务
- 检查日志文件以获取更多信息

### 3. 工具未正确集成

如果工具未正确集成通知服务，请检查：

- 确保生成的配置文件格式正确
- 确保 AI 工具已正确配置以使用通知服务
- 检查 AI 工具的文档以确认配置要求

## 最佳实践

1. **定期更新配置**: 建议在项目初始化或添加新 AI 工具时运行 `quickInit` 命令
2. **备份重要配置**: 虽然 `quickInit` 会自动创建备份，但仍建议在重要更改前手动备份配置文件
3. **检查生成的配置**: 在生产环境中使用前，建议检查生成的配置文件以确保符合项目要求