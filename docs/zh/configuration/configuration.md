# 配置指南

本指南解释了如何配置 AI Common Notify 以自定义其行为并将其与您的工作流程集成。

## 配置文件位置

AI Common Notify 支持多个配置级别，优先级顺序如下（高优先级覆盖低优先级）：

1. **环境变量** - 最高优先级
2. **项目配置** - `<project-root>/.ai-notify.json`
3. **全局配置** - `~/.config/ai-common-notify/config.json` (Linux/macOS) 或 `%APPDATA%\ai-common-notify\config.json` (Windows)

## 全局配置

全局配置文件适用于所有项目。在以下位置创建：

- **Linux/macOS**：`~/.config/ai-common-notify/config.json`
- **Windows**：`%APPDATA%\ai-common-notify\config.json`

全局配置示例：

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
    "notify": []
  },
  "logging": {
    "retentionHours": 24
  },
  "platforms": {
    "windows": {
      "method": "powershell",
      "sound_enabled": true
    },
    "macos": {
      "method": "osascript",
      "sound_enabled": true
    },
    "linux": {
      "method": "notify-send",
      "sound_enabled": true,
      "urgency_mapping": {
        "low": "low",
        "normal": "normal",
        "critical": "critical"
      }
    }
  }
}
```

## 项目配置

项目特定配置会覆盖全局设置。在项目根目录中创建 `.ai-notify.json`：

```json
{
  "notifications": {
    "default_urgency": "critical",
    "title_template": "[PROJECT] {tool_name} - {project_name}"
  },
  "scripts": {
    "notify": [
      {
        "type": "node",
        "path": "/path/to/project/scripts/notify.js",
        "enabled": true
      }
    ]
  }
}
```

## 配置选项

### 服务器配置

```json
{
  "server": {
    "port": 6001,
    "host": "localhost",
    "token": "your-secret-token"
  }
}
```

- `port`：REST API 服务器端口（默认：6001）
- `host`：REST API 服务器主机（默认：localhost）
- `token`：API 认证令牌（可选但建议用于安全性）

### 通知配置

```json
{
  "notifications": {
    "default_timeout": 0,
    "default_sound": true,
    "default_urgency": "normal",
    "default_icon": "./dist/assets/icons/i-ai-notify_logo.icns",
    "title_template": "{tool_name} - {project_name}",
    "message_template": "{message}"
  }
}
```

- `default_timeout`: 默认通知超时时间（秒）（0 表示永久，默认值：0）
- `default_sound`: 是否默认播放声音（默认值：true）
- `default_urgency`: 默认紧急程度（low, normal, critical，默认值：normal）
- `default_icon`: 默认通知图标路径（默认值：内置应用图标）
- `title_template`: 通知标题模板（默认值："{tool_name} - {project_name}"）
- `message_template`: 通知消息模板（默认值："{message}"）

### 工具配置

AI Common Notify 为支持的 AI 工具包含了预定义的图标：

```json
{
  "tools": {
    "claude-code": {
      "icon": "./dist/assets/icons/tool-claude.png"
    },
    "cursor": {
      "icon": "./dist/assets/icons/tool-cursor.png"
    },
    "windsurf": {
      "icon": "./dist/assets/icons/tool-windsurf.png"
    },
    "kiro": {
      "icon": "./dist/assets/icons/tool-kiro.png"
    }
  }
}
```

您可以通过指定自定义图标文件的路径来覆盖这些图标或为其他工具添加图标。

### 日志配置

```json
{
  "logging": {
    "retentionHours": 24
  }
}
```

- `retentionHours`: 保留日志条目的小时数（默认：24）。超过此值的日志条目将被自动清理。设置为 0 以无限期保留所有日志。

### 平台配置

```json
{
  "platforms": {
    "windows": {
      "method": "powershell",
      "sound_enabled": true
    },
    "macos": {
      "method": "osascript",
      "sound_enabled": true
    },
    "linux": {
      "method": "notify-send",
      "sound_enabled": true,
      "urgency_mapping": {
        "low": "low",
        "normal": "normal",
        "critical": "critical"
      }
    }
  }
}
```

- `method`：每个平台的通知方法
- `sound_enabled`：每个平台是否启用声音
- `urgency_mapping`：紧急程度如何映射到平台特定值（仅限 Linux）

## 环境变量

您可以使用环境变量覆盖配置选项：

```bash
# 服务器配置
export AI_NOTIFY_PORT=3001
export AI_NOTIFY_HOST=0.0.0.0
export AI_NOTIFY_TOKEN=your-token

# 通知配置
export AI_NOTIFY_DEFAULT_TIMEOUT=10
export AI_NOTIFY_DEFAULT_SOUND=false
export AI_NOTIFY_DEFAULT_URGENCY=critical

# 脚本配置
export AI_NOTIFY_SCRIPT_TIMEOUT=60000
```

环境变量名称遵循模式：`AI_NOTIFY_<SECTION>_<OPTION>`，其中部分和选项名称转换为大写。

## 配置示例

### 示例 1：开发环境

```json
{
  "server": {
    "port": 6001,
    "host": "localhost"
  },
  "notifications": {
    "default_timeout": 10,
    "default_sound": true,
    "default_urgency": "normal"
  },
  "logging": {
    "retentionHours": 168
  }
}
```

### 示例 2：生产环境

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "token": "generated-secret-token"
  },
  "notifications": {
    "default_timeout": 0,
    "default_sound": false,
    "default_urgency": "critical"
  },
  "scripts": {
    "timeout": 60000,
    "notify": [
      {
        "type": "shell",
        "path": "/var/log/ai-notify/log-notification.sh",
        "enabled": true
      }
    ]
  },
  "logging": {
    "retentionHours": 168
  }
}
```

### 示例 3：项目特定配置

```json
{
  "notifications": {
    "default_urgency": "normal",
    "title_template": "[{urgency}] {project_name}",
    "message_template": "{message}

项目: {project_name}
工具: {tool_name}"
  },
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "./scripts/notify.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "./scripts/notify.js",
        "enabled": true
      }
    ]
  }
}
```

## 配置验证

AI Common Notify 在加载配置文件时会自动验证它们。如果配置文件包含语法错误，该工具将：

1. 记录错误消息
2. 使用默认配置值
3. 继续以降低的功能运行

您可以手动验证配置文件：

```bash
# 验证 JSON 语法
cat ~/.config/ai-common-notify/config.json | python -m json.tool

# 或使用 jq
jq . ~/.config/ai-common-notify/config.json
```

## 配置最佳实践

### 1. 对敏感数据使用环境变量

```json
{
  "server": {
    "token": "${AI_NOTIFY_TOKEN}"
  }
}
```

### 2. 保持全局配置最小化

使用全局配置进行一般设置，使用项目配置进行项目特定覆盖。

### 3. 定期备份

保留配置文件的备份，特别是在进行重大更改之前。

### 4. 测试更改

在将配置更改应用到生产环境之前，在开发环境中测试它们。

### 5. 记录自定义模板

记录您创建的任何自定义模板以供将来参考。

## 排查配置问题

### 1. 配置未加载

**问题**：对配置文件的更改似乎没有生效。

**解决方案**：

- 验证配置文件是否位于正确位置
- 检查 JSON 语法错误
- 重新启动 AI Common Notify 服务
- 检查日志：`ai-common-notify errlog`

### 2. 使用了错误的值

**问题**：配置选项使用了意外的值。

**解决方案**：

- 检查配置优先级顺序（环境 > 项目 > 全局）
- 验证环境变量是否覆盖了配置
- 使用 `ai-common-notify config` 查看当前配置（如果已实现）

### 3. 模板变量不工作

**问题**：模板变量未在通知中替换。

**解决方案**：

- 验证变量名称是否正确
- 检查变量是否受通知源支持
- 使用简单模板进行测试

### 4. 脚本路径未找到

**问题**：配置的脚本未执行。

**解决方案**：

- 验证脚本路径是否正确且可访问
- 检查脚本文件的文件权限
- 确保脚本具有执行权限（在 Unix 系统上）
- 手动测试脚本

## 下一步

1. [脚本回调](script-callbacks.md) - 了解如何使用自定义脚本扩展功能
2. [通知模板](templates.md) - 创建自定义通知模板
3. [日志和监控](logging.md) - 监控和排查您的设置
4. [安全指南](../advanced/security.md) - 保护您的配置

---

_AI Common Notify - 简化 AI 编程工具的通知_
