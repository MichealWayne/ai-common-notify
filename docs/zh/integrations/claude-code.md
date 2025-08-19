# Claude Code 集成指南

本指南解释了如何将 AI Common Notify 与 Claude Code 集成，以接收各种事件的系统通知。

## 概述

Claude Code 支持可以触发外部命令的钩子事件。AI Common Notify 与这些钩子集成，为任务完成、错误和工具使用等事件提供系统通知。

## 集成方法

### 方法 1：快速初始化（推荐）

与 Claude Code 集成的最简单方法是使用快速初始化功能：

```bash
# 导航到您的项目目录
cd /path/to/your/project

# 如果您的项目有 .claude 目录
ai-common-notify quickInit --tool claudecode

# 如果您的项目使用旧配置
ai-common-notify quickInit --tool claudecode
```

这将自动创建或更新相应的配置文件。

### 方法 2：手动配置

如果您喜欢手动配置，请按照以下步骤操作：

#### 对于新配置结构 (.claude/settings.json)

1. 在您的项目中创建或编辑 `.claude/settings.json` 配置文件：

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

#### 对于旧配置 (claude-config.json)

1. 在您的项目中创建或编辑 `claude-config.json` 配置文件：

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

## 钩子事件类型

AI Common Notify 支持以下 Claude Code 钩子事件：

### 1. Notification
在 Claude 发送通知消息时触发。

### 2. Stop
在 Claude 完成对查询的响应时触发。

### 3. PreToolUse
在 Claude 使用工具之前触发。匹配器可以为特定工具配置：
- `Bash`：在执行 bash 命令之前
- `Write`：在写入文件之前
- `Edit`：在编辑文件之前
- `MultiEdit`：在多个文件编辑之前

### 4. PostToolUse
在 Claude 成功完成工具操作后触发。

### 5. Error
在 Claude 遇到错误时触发。

### 6. UserInputRequired
在 Claude 需要用户输入时触发。

## 配置选项

### 钩子匹配器模式

您可以自定义匹配器模式以过滤触发通知的事件：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*important-project.*",
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

### 自定义事件处理

您可以为不同事件类型配置不同的通知：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook --timeout 10"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "(Bash)",
        "hooks": [
          {
            "type": "command",
            "command": "ai-common-notify hook --event-type critical"
          }
        ]
      }
    ]
  }
}
```

## 测试集成

### 手动测试

通过发送测试事件来测试集成：

```bash
# 测试基本通知
echo '{"event_type": "Stop", "message": "来自 Claude 的测试消息"}' | ai-common-notify hook

# 使用自定义事件类型测试
echo '{"event_type": "Notification", "message": "自定义通知"}' | ai-common-notify hook
```

### 自动测试

1. 打开 Claude Code 并开始对话
2. 要求 Claude 执行触发钩子的操作（例如，"运行 ls 命令"）
3. 您应该会收到系统通知

## 常见问题和解决方案

### 1. 通知未出现

**问题**：Claude Code 钩子已配置但没有通知出现。

**解决方案**：
- 验证配置文件路径和语法
- 检查 AI Common Notify 是否正确安装
- 使用上面的 echo 命令手动测试
- 确保 Claude Code 有权执行外部命令

### 2. 错误的事件类型

**问题**：触发了错误的事件类型。

**解决方案**：
- 检查配置中的匹配器模式
- 如需要，使用更具体的正则表达式模式
- 查看 Claude Code 文档以获取确切的事件类型名称

### 3. 配置未加载

**问题**：Claude Code 似乎无法识别配置。

**解决方案**：
- 确保配置文件位于正确位置
- 配置更改后重新启动 Claude Code
- 检查配置文件中的 JSON 语法错误

### 4. 权限错误

**问题**：执行钩子时出现权限错误。

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
    "title_template": "[Claude] {project_name}",
    "message_template": "{message}\n工具: {tool_name}"
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
        "path": "/path/to/log-claude-notification.sh",
        "enabled": true
      }
    ]
  }
}
```

### 项目特定配置

您可以通过将配置文件放在项目目录中为不同项目设置不同的配置。

## 最佳实践

1. **使用特定匹配器**：使用 `.*` 以外的更具体模式，以避免通知垃圾邮件
2. **配置关键事件**：特别注意潜在破坏性操作的 `PreToolUse` 事件
3. **定期测试**：定期测试您的配置以确保其正常工作
4. **备份配置**：保留配置文件的备份
5. **监控日志**：使用 `ai-common-notify errlog` 监控问题

## 下一步

1. [Cursor 集成](cursor.md) - 与 Cursor 集成
2. [Windsurf 集成](windsurf.md) - 与 Windsurf 集成
3. [配置指南](../configuration/configuration.md) - 了解所有配置选项
4. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能

---
*AI Common Notify - 简化 AI 编程工具的通知*