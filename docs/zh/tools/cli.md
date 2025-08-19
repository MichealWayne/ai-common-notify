# CLI 命令参考

本指南提供了 AI Common Notify 中所有命令行界面 (CLI) 命令的全面参考。

## 概述

AI Common Notify 提供了丰富的命令行界面，用于各种操作，包括发送通知、工具集成、配置管理和系统监控。

## 基本用法

```bash
ai-common-notify [command] [options]
```

### 全局选项

```bash
--version, -V    输出版本号
--help, -h       显示命令帮助
```

## 可用命令

### 1. hook

处理来自 JSON 输入的 Claude Code 钩子事件。

```bash
ai-common-notify hook [options]
```

**选项：**
- `-e, --event-type <type>`：覆盖事件类型
- `-t, --test`：测试模式（尚未实现）
- `--timeout <seconds>`：设置通知超时时间（秒）（0 表示永久，默认：0）

**使用示例：**

```bash
# 处理来自 stdin 的钩子事件
echo '{"event_type": "Stop", "message": "任务完成"}' | ai-common-notify hook

# 处理带自定义超时的钩子事件
echo '{"event_type": "Notification", "message": "自定义消息"}' | ai-common-notify hook --timeout 10

# 处理带显式事件类型的钩子事件
echo '{"message": "测试消息"}' | ai-common-notify hook --event-type critical
```

### 2. send

从命令行发送带有自定义选项的通知。

```bash
ai-common-notify send [options]
```

**选项：**
- `-t, --title <title>`：通知标题（必需）
- `-m, --message <message>`：通知消息（必需）
- `-u, --urgency <urgency>`：通知紧急程度（low, normal, critical）（默认："normal"）
- `--timeout <seconds>`：设置通知超时时间（秒）（0 表示永久）（默认："0"）
- `--no-sound`：禁用通知声音
- `--icon <icon>`：通知图标路径
- `--tool <tool>`：工具名称，用于工具特定配置
- `--project <project>`：项目名称

**使用示例：**

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

# 使用自定义图标
ai-common-notify send \
  --title "自定义图标" \
  --message "此通知使用自定义图标" \
  --icon "/path/to/custom-icon.png"
```

### 2. mcp

为 Cursor 和其他 MCP 兼容工具启动 MCP 服务器。

```bash
ai-common-notify mcp
```

**使用示例：**

```bash
# 启动 MCP 服务器
ai-common-notify mcp

# 在后台启动 MCP 服务器
ai-common-notify mcp &
```

### 3. quickInit

快速初始化 AI 工具配置。

```bash
ai-common-notify quickInit [options]
```

**选项：**
- `-t, --tool <tool>`：指定要初始化的工具（cursor, claudecode, windsurf, gemini-cli）

**使用示例：**

```bash
# 初始化所有检测到的 AI 工具
ai-common-notify quickInit

# 初始化特定工具
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

### 4. test

发送测试通知以验证系统是否正常工作。

```bash
ai-common-notify test [options]
```

**选项：**
- `-t, --timeout <seconds>`：设置通知超时时间（秒）（0 表示永久，默认：0）

**使用示例：**

```bash
# 发送基本测试通知
ai-common-notify test

# 发送带超时的测试通知
ai-common-notify test --timeout 10

# 发送带长超时的测试通知
ai-common-notify test --timeout 30
```

### 5. errlog

显示错误日志。

```bash
ai-common-notify errlog
```

**使用示例：**

```bash
# 显示错误日志
ai-common-notify errlog

# 将错误日志重定向到文件
ai-common-notify errlog > error-log.txt
```

### 6. alllog

显示所有日志。

```bash
ai-common-notify alllog
```

**使用示例：**

```bash
# 显示所有日志
ai-common-notify alllog

# 将所有日志重定向到文件
ai-common-notify alllog > all-log.txt
```

## 高级 CLI 用法

### 命令链

您可以链式执行命令以进行复杂操作：

```bash
# 初始化工具然后测试
ai-common-notify quickInit && ai-common-notify test

# 测试然后在测试失败时检查日志
ai-common-notify test || ai-common-notify errlog
```

### 脚本集成

在 shell 脚本中使用 CLI 命令：

```bash
#!/bin/bash
# ai-workflow.sh

# 发送通知的函数
send_notification() {
  local title="$1"
  local message="$2"
  local urgency="${3:-normal}"
  
  # 在实际场景中，您可能会使用 REST API 或 MCP
  echo "通知: $title - $message (紧急程度: $urgency)"
}

# 示例工作流
echo "开始 AI 任务..."
# ... AI 处理 ...
send_notification "任务完成" "AI 处理完成" "normal"
```

### 环境特定命令

为常见操作设置别名：

```bash
# 添加到您的 .bashrc 或 .zshrc
alias ain-test="ai-common-notify test"
alias ain-logs="ai-common-notify alllog"
alias ain-errors="ai-common-notify errlog"
alias ain-init="ai-common-notify quickInit"
```

## 退出代码

AI Common Notify CLI 命令返回以下退出代码：

- `0`：成功
- `1`：一般错误
- `2`：shell 内建命令误用

## 输出格式

### 成功消息

成功消息发送到 stdout：

```bash
$ ai-common-notify test
发送测试通知...
✓ 测试通知发送成功！
```

### 错误消息

错误消息发送到 stderr：

```bash
$ ai-common-notify hook
错误：未从 stdin 接收到 JSON 数据
```

### 日志输出

日志命令输出结构化数据：

```bash
$ ai-common-notify errlog
错误日志：
==============================
时间戳: 2024-01-01T12:00:00Z
组件: NotificationManager
消息: 发送通知失败
方法: sendNotification
文件: /path/to/NotificationManager.ts
------------------------------
```

## 配置命令

虽然不是直接的 CLI 命令，但可以通过以下方式管理配置：

1. **配置文件**：编辑 JSON 配置文件
2. **环境变量**：设置环境变量
3. **命令选项**：在可用时使用命令行选项

## 排查 CLI 问题

### 1. 找不到命令

**问题**：`ai-common-notify` 命令未被识别。

**解决方案：**
- 验证安装：`npm list -g ai-common-notify`
- 检查 PATH：`echo $PATH`
- 如需要重新安装：`npm install -g ai-common-notify`

### 2. 权限被拒绝

**问题**：运行命令时出现权限错误。

**解决方案：**
- 检查文件权限
- 如有必要使用 sudo 运行（不建议常规使用）
- 修复 npm 全局目录权限

### 3. 无效选项

**问题**：由于无效选项导致命令失败。

**解决方案：**
- 检查命令帮助：`ai-common-notify [command] --help`
- 验证选项语法
- 如果短格式不清楚，使用长格式选项

### 4. 无输出

**问题**：命令运行但无可见输出。

**解决方案：**
- 检查后台进程
- 验证配置
- 检查系统通知设置
- 查看日志：`ai-common-notify alllog`

## 最佳实践

### 1. 使用描述性标题和消息

使用发送通知的命令时，使用描述性标题和消息：

```bash
# 好
ai-common-notify test --title "部署完成" --message "版本 1.2.3 部署成功"

# 避免
ai-common-notify test  # 使用通用消息
```

### 2. 设置适当的超时时间

为您的通知使用适当的超时值：

```bash
# 重要警报的永久通知
ai-common-notify test --timeout 0

# 状态更新的临时通知
ai-common-notify test --timeout 10
```

### 3. 定期监控日志

定期检查日志以确保正常运行：

```bash
# 检查错误
ai-common-notify errlog

# 监控所有活动
ai-common-notify alllog
```

### 4. 在自动化脚本中使用

将 CLI 命令集成到自动化工作流中：

```bash
#!/bin/bash
# deploy.sh

# 部署步骤...
echo "部署应用程序..."

# 完成时通知
if [ $? -eq 0 ]; then
  ai-common-notify test --title "部署成功" --message "应用程序部署成功"
else
  ai-common-notify test --title "部署失败" --message "应用程序部署失败" --event-type critical
fi
```

## 下一步

1. [配置指南](../configuration/configuration.md) - 了解配置选项
2. [脚本回调](../configuration/script-callbacks.md) - 使用自定义脚本扩展功能
3. [API 参考](../advanced/api.md) - 使用 REST API 进行自定义集成
4. [测试工具](testing.md) - 测试您的设置的工具

---
*AI Common Notify - 简化 AI 编程工具的通知*