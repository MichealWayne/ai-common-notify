# AI Common Notify 使用指南

AI Common Notify 是一个为 AI 编程工具（如 Claude Code、Cursor 等）提供统一通知服务的工具。本指南将帮助您安装、配置和使用该服务。

## 目录

1. [安装](#安装)
   - [使用 npm](#使用-npm)
   - [使用独立可执行文件](#使用独立可执行文件)
2. [基本使用](#基本使用)
3. [与 Claude Code 集成](#与-claude-code-集成)
4. [与 Cursor 集成](#与-cursor-集成)
5. [配置](#配置)
6. [CLI 命令](#cli-命令)
7. [平台特定说明](#平台特定说明)
8. [常见问题解答](#常见问题解答)

## 安装

### 使用 npm

这是推荐的安装方法。

1. 确保您的系统已安装 Node.js（版本 16 或更高）。您可以从 [nodejs.org](https://nodejs.org/) 下载。

2. 打开终端或命令提示符。

3. 运行以下命令全局安装 AI Common Notify：

   ```bash
   npm install -g ai-common-notify
   ```

4. 通过检查版本来验证安装：

   ```bash
   ai-common-notify --version
   ```

### 使用独立可执行文件

如果您不想安装 Node.js，可以使用独立可执行文件。

1. 从 [发布页面](https://github.com/yourusername/ai-common-notify/releases) 下载适合您平台的可执行文件：

   - Windows: `ai-notify-win.exe`
   - macOS: `ai-notify-macos`
   - Linux: `ai-notify-linux`

2. 使可执行文件具有执行权限（在 macOS 和 Linux 上）：

   ```bash
   chmod +x ai-notify-macos
   chmod +x ai-notify-linux
   ```

3. 现在您可以使用以下命令运行该工具：

   ```bash
   ./ai-notify-macos --help
   # 或在 Windows 上
   ai-notify-win.exe --help
   ```

## 基本使用

AI Common Notify 提供两个主要命令：

1. `hook`：处理 Claude Code 钩子事件
2. `mcp`：为 Cursor 和其他工具启动 MCP 服务器

要查看所有可用命令和选项，请运行：

```bash
ai-common-notify --help
```

## 与 Claude Code 集成

AI Common Notify 可以直接与 Claude Code 集成，作为钩子在 Claude 需要注意或执行某些操作时通知您。

### 设置 Claude 钩子

1. 找到您的 Claude 配置文件。通常位于：

   - macOS/Linux: `~/.claude/settings.json`
   - Windows: `%USERPROFILE%\.claude\settings.json`

   如果文件不存在，您可以创建它。

2. 将以下配置添加到您的 `settings.json` 文件中：

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

3. 保存文件并重新启动 Claude Code。

此配置将：

- 在 Claude 完成响应时通知您（Stop 事件）
- 在 Claude 使用潜在破坏性工具之前提醒您（Bash, Write, Edit, MultiEdit）
- 在所有通知标题中显示项目名称，在所有消息中显示完整项目路径

### 测试 Claude 集成

要测试集成是否正常工作：

1. 打开 Claude Code 并开始对话。
2. 要求 Claude 执行触发通知的操作（例如，"在终端中运行 `ls` 命令"）。
3. 当 Claude 尝试执行命令时，您应该会收到系统通知。

## 与 Cursor 集成（MCP 集成，Windsurf/CodeBuddy 等都通用）

要将 AI Common Notify 与 Cursor 一起使用，您需要将其配置为 MCP 服务器。

### 设置 Cursor 集成

1. 找到您的 Cursor MCP 配置文件：
   - 全局配置: `~/.cursor/mcp.json`
   - 项目特定配置: `<your-project>/.cursor/mcp.json`

> 其他像 Windsurf/CodeBuddy/Trae 等按各自 MCP 方式接入即可。

2. 将以下配置添加到您的 `mcp.json` 文件中：

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

3. 如果您使用的是独立可执行文件，请相应地调整路径：

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

4. 保存文件并重新启动 Cursor。

### 测试 Cursor 集成

要测试集成是否正常工作：

1. 打开 Cursor 并开始与 AI 模型对话。
2. 要求 AI 执行操作。
3. 当 AI 完成任务时，您应该会收到系统通知。

## 配置

AI Common Notify 可以通过 JSON 配置文件进行配置。

### 配置文件位置

配置文件位于：

- Linux/macOS: `~/.config/ai-common-notify/config.json`
- Windows: `%APPDATA%\ai-common-notify\config.json`

如果配置文件不存在，该工具将使用默认设置。

### 配置选项

以下是包含所有可用选项的示例配置文件：

```json
{
  "notifications": {
    "defaultTimeout": 10,
    "defaultSound": true,
    "defaultUrgency": "normal"
  },
  "platforms": {
    "windows": {
      "soundEnabled": true
    },
    "macos": {
      "soundEnabled": true
    },
    "linux": {
      "soundEnabled": true,
      "urgencyMapping": {
        "low": "low",
        "normal": "normal",
        "critical": "critical"
      }
    }
  }
}
```

### 配置选项说明

- `notifications.defaultTimeout`：通知的默认超时时间（秒）（默认值：10）
- `notifications.defaultSound`：是否默认播放声音（默认值：true）
- `notifications.defaultUrgency`：默认紧急程度（默认值："normal"）
- `platforms.[platform].soundEnabled`：为特定平台启用或禁用声音
- `platforms.linux.urgencyMapping`：为 Linux 通知映射紧急程度

## CLI 命令

AI Common Notify 提供了以下命令行界面命令：

### `hook` 命令

处理来自 JSON 输入的 Claude Code 钩子事件。

```bash
ai-common-notify hook [options]
```

选项：

- `-e, --event-type <type>`：覆盖事件类型
- `-t, --test`：测试模式（尚未实现）

示例：

```bash
echo '{"event_type": "Stop", "message": "任务完成"}' | ai-common-notify hook
```

### `mcp` 命令

为 Cursor 和其他工具启动 MCP 服务器。

```bash
ai-common-notify mcp
```

此命令启动 MCP 服务器，监听来自 Cursor 和其他兼容 MCP 的工具的请求。

## 平台特定说明

### Windows

- 使用原生 Windows Toast 通知
- 默认包含声音支持
- 无需额外依赖

### macOS

- 使用原生通知中心
- 默认包含声音支持
- 无需额外依赖

### Linux

- 需要 `notify-send` 工具（通常是 `libnotify-bin` 包的一部分）
- 安装命令：`sudo apt-get install libnotify-bin`（Debian/Ubuntu）
- 对于其他发行版，请使用相应的包管理器

## 常见问题解答

### Q: 我安装了 AI Common Notify，但命令未找到。我该怎么办？

A: 这通常是因为 npm 的全局 bin 目录不在系统的 PATH 中。请尝试以下操作：

1. 查找 npm 的全局 bin 目录：
   ```bash
   npm config get prefix
   ```
2. 将 bin 目录添加到您的 PATH 中：

   - 在 macOS/Linux 上，将此行添加到您的 `~/.bashrc` 或 `~/.zshrc` 中：
     ```bash
     export PATH=$PATH:$(npm config get prefix)/bin
     ```
   - 在 Windows 上，将 npm 前缀添加到系统的 PATH 环境变量中。

3. 重新启动终端或命令提示符。

### Q: 在 Linux 上通知没有显示。我该怎么办？

A: 确保您已安装 `libnotify-bin` 包：

```bash
# Ubuntu/Debian
sudo apt-get install libnotify-bin

# Fedora
sudo dnf install libnotify

# CentOS/RHEL
sudo yum install libnotify
```

### Q: 如何卸载 AI Common Notify？

A: 如果您使用 npm 安装，可以使用以下命令卸载：

```bash
npm uninstall -g ai-common-notify
```

如果您使用的是独立可执行文件，只需删除可执行文件即可。

### Q: 我可以将 AI Common Notify 与其他 AI 工具一起使用吗？

A: 是的，AI Common Notify 支持 Model Context Protocol (MCP)，这是许多 AI 工具支持的标准协议。如果您的 AI 工具支持 MCP，您可以配置它使用 AI Common Notify 作为通知服务器。

### Q: 如何自定义通知声音？

A: 目前，AI Common Notify 使用系统的默认通知声音。您可以通过配置文件启用或禁用声音。自定义声音支持可能会在未来的版本中添加。

### Q: 在 macOS 上出现权限错误。如何解决？

A: 在 macOS 上，您可能需要为终端应用程序或运行 AI Common Notify 的应用程序授予通知权限。转到系统偏好设置 > 通知，确保您的终端应用程序有权限发送通知。

### Q: 如何更新 AI Common Notify？

A: 如果您使用 npm 安装，可以使用以下命令更新：

```bash
npm update -g ai-common-notify
```

如果您使用的是独立可执行文件，请从发布页面下载最新版本并替换旧的可执行文件。

### Q: 在哪里可以报告错误或请求功能？

A: 您可以通过在 [GitHub 仓库](https://github.com/yourusername/ai-common-notify/issues) 上创建问题来报告错误或请求功能。
