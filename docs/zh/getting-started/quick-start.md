# 快速开始指南

通过本快速开始指南，在几分钟内启动并运行 AI Common Notify。

## 步骤 1：安装 AI Common Notify

如果您还没有安装，请安装 AI Common Notify：

```bash
npm install -g ai-common-notify
```

验证安装：

```bash
ai-common-notify --version
```

## 步骤 2：测试基本功能

发送测试通知以验证一切正常工作：

```bash
ai-common-notify test
```

您应该会看到系统通知出现。

## 步骤 3：快速集成 AI 工具

### 选项 1：快速初始化（推荐）

使用快速初始化功能自动配置您的 AI 工具：

```bash
# 导航到您的项目目录
cd /path/to/your/project

# 自动检测并配置所有已安装的 AI 工具
ai-common-notify quickInit

# 或配置特定工具
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

这将自动为支持的工具创建或更新配置文件。

### 选项 2：手动配置

如果您喜欢手动配置，请遵循特定指南：
- [Claude Code 集成](../integrations/claude-code.md)
- [Cursor 集成](../integrations/cursor.md)
- [Windsurf 集成](../integrations/windsurf.md)
- [Gemini CLI 集成](../integrations/gemini-cli.md)

## 步骤 4：自定义配置（可选）

在 `~/.config/ai-common-notify/config.json` 创建自定义配置文件：

```json
{
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
  }
}
```

## 步骤 5：高级功能

### 脚本回调

在通知前后执行自定义脚本：

```json
{
  "scripts": {
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

### REST API

启动 REST API 服务器以进行自定义集成：

```bash
# 启动 API 服务器（默认端口：6001）
ai-common-notify api
```

通过 HTTP 发送通知：

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 测试",
    "message": "此通知通过 REST API 发送",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

有关详细的 API 文档，请参阅 [API 参考](../advanced/api.md)。

## 步骤 6：查看日志和监控

检查错误日志：

```bash
ai-common-notify errlog
```

查看所有日志：

```bash
ai-common-notify alllog
```

## 常见用例

### 1. 长时间运行任务的通知

设置通知以在长时间运行的 AI 任务完成时提醒您：

```bash
# 在您的脚本或工作流中
ai-common-notify send --title "任务完成" --message "模型训练完成"
```

### 2. 与 Shell 脚本集成

在 shell 脚本中使用以实现自动化工作流：

```bash
#!/bin/bash
echo "开始长时间运行的进程..."
# ... 您的长时间运行的进程 ...
ai-common-notify send --title "进程完成" --message "任务成功完成"
```

### 3. 自定义通知模板

为不同类型的通知创建自定义模板：

```json
{
  "notifications": {
    "title_template": "[{urgency}] {tool_name} - {project_name}",
    "message_template": "{message}\n项目: {project_name}\n时间: {timestamp}"
  }
}
```

## 故障排除

### 没有通知出现

1. 检查服务是否正在运行：
   ```bash
   ai-common-notify test
   ```

2. 验证系统通知设置：
   - **Windows**：检查操作中心设置
   - **macOS**：检查通知中心设置
   - **Linux**：确保 `notify-send` 正常工作：
     ```bash
     notify-send "测试" "通知测试"
     ```

### 配置问题

1. 验证您的 JSON 配置：
   ```bash
   # 检查语法
   cat ~/.config/ai-common-notify/config.json | python -m json.tool
   ```

2. 通过临时重命名配置文件来使用默认配置：
   ```bash
   mv ~/.config/ai-common-notify/config.json ~/.config/ai-common-notify/config.json.backup
   ```

## 下一步

1. [详细的工具集成指南](../integrations/) - 了解如何与特定 AI 工具集成
2. [配置指南](../configuration/configuration.md) - 探索所有配置选项
3. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能
4. [API 参考](../advanced/api.md) - 使用 REST API 进行自定义集成

---
*AI Common Notify - 简化 AI 编程工具的通知*