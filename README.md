# AI Common Notify

A unified notification service for AI coding tools (Claude Code, Cursor, Windsurf, Kiro, etc.)

**Version**: 1.0.0-alpha67

[![npm version](https://img.shields.io/npm/v/ai-common-notify.svg)](https://www.npmjs.com/package/ai-common-notify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Multi-tool support**: Integrates with Claude Code, Cursor, Windsurf, Kiro and more
- **Unified interface**: Standardized RESTful API and MCP protocol support
- **Configurable notifications**: Customizable title, message, urgency, timeout, sound and icons
- **Default permanent notifications**: Notifications stay visible until clicked (configurable)
- **Script callbacks**: Execute custom scripts before or after sending notifications
- **Quick initialization**: One-command setup for multiple AI tools
- **Error log recording and viewing**: Record execution errors and view them with `ai-common-notify errlog`

## Installation

### Using npm (recommended)

```bash
npm install -g ai-common-notify
```

## Documentation

For detailed documentation, please refer to the following files:

### Quick Initialization

- [Quick Initialization Guide](docs/en/advanced/quick-init.md) - How to use the quick initialization feature to generate configurations for various AI tools

### Script Callbacks

- [Script Callbacks Guide](docs/en/configuration/script-callbacks.md) - How to configure and use script callbacks

### English Documentation

- [Main Documentation](docs/en/README.md) - Complete documentation in English
- [API Reference](docs/en/advanced/api.md) - REST API documentation

### 中文文档

- [主要文档](docs/zh/README.md) - 完整的中文文档
- [API 参考](docs/zh/advanced/api.md) - REST API 文档

## Quick Start

### Test the installation

```bash
# Send a test notification to verify the system is working
ai-common-notify test
```

### Quick Initialization

AI Common Notify provides a quick initialization feature that automatically generates or updates configuration files for various AI coding tools, greatly simplifying the integration process.

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize all detected AI tools
ai-common-notify quickInit

# Or initialize a specific tool
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

## Usage Examples

### Claude Code Integration

AI Common Notify can be integrated with Claude Code as a hook to notify you when Claude needs attention or performs certain actions.

#### Setting up Claude Hooks

Add to your Claude settings file (`~/.claude/settings.json` or `.claude/settings.json` in your project):

For general use (recommended), configure only the Stop event to avoid frequent notifications:

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

For advanced users who need detailed notifications, you can use the full configuration:

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

This configuration will:

- Notify you when Claude finishes responding (Stop event)
- Show the project name in the notification title and the full project path in the message

### Cursor Integration

To use AI Common Notify with Cursor, you need to configure it as an MCP server.

Find the configuration file at `~/.cursor/mcp.json` or `your_project/.cursor/mcp.json` and add:

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

If you're using the standalone executable, adjust the path accordingly:

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

> **Usage Tip**: When using Cursor, it's recommended to explicitly ask for notifications in your prompts. For example, end your prompt with "Finally, send me a notification when the task is finished." This helps ensure that Cursor invokes the notification tool call. You can also add this prompt as a rule in Cursor Settings so you don't have to type it manually each time.

### Manual Usage

#### Sending Notifications from Scripts

You can use the `send` command to easily send notifications from shell scripts:

```bash
# Basic usage
ai-common-notify send --title "Deployment Complete" --message "Application successfully deployed to production"

# With custom options
ai-common-notify send \\
  --title "Build Failed" \\
  --message "The build process failed, please check the logs" \\
  --urgency critical \\
  --timeout 10 \\
  --sound \\
  --project "MyProject" \\
  --tool "CI/CD"
```

#### Sending Notifications as Hooks

```bash
# Basic notification
echo '{"title": "Test Notification", "message": "This is a test message"}' | ai-common-notify hook

# Custom notification
echo '{"title": "Custom Title", "message": "Custom message", "urgency": "critical"}' | ai-common-notify hook

# Explicitly specify event type
echo '{"title": "Explicit Notification", "message": "This is an explicit notification"}' | ai-common-notify hook --event-type Notification
```

#### Available Hook Events

- **PreToolUse**: Before Claude uses a tool (can be used for review/blocking actions)
- **PostToolUse**: After a tool successfully completes
- **Notification**: When Claude sends a notification
- **Stop**: When Claude finishes responding
- **SubagentStop**: When a Claude subagent completes

#### Hook Command Options

- `-e, --event-type <type>`: Explicitly specify the event type (useful when the event type cannot be automatically determined)
- `-t, --test`: Test mode - read from test.json file instead of stdin (not yet implemented)

## Script Callbacks

AI Common Notify supports executing custom scripts when sending notifications. This feature allows you to extend the notification service's functionality.

For detailed information, please refer to the [Script Callbacks Guide](docs/en/configuration/script-callbacks.md).

## Automation Workflow

### Example Deployment Script

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
  --project "MyWebApp" \
  --tool "CI/CD"

echo "通知已发送"
```

### Command Line Options

The `send` command supports the following options:

- `-t, --title <title>`: Notification title (required)
- `-m, --message <message>`: Notification message (required)
- `-u, --urgency <urgency>`: Notification urgency (low, normal, critical) (default: "normal")
- `--timeout <seconds>`: Set notification timeout in seconds (0 for permanent) (default: "0")
- `--no-sound`: Disable notification sound
- `--icon <icon>`: Path to notification icon
- `--tool <tool>`: Tool name for tool-specific configuration
- `--project <project>`: Project name

### Configuration

To configure script callbacks, add the `scripts` section to your configuration file:

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

### Script Types

- **shell**: Execute Shell scripts (`.sh` files on Unix-like systems, `.bat` or `.cmd` files on Windows)
- **node**: Execute Node.js scripts (`.js` files)

### Execution Timing

- **notify**: Scripts executed when sending notifications

### Environment Variables

Scripts receive the following environment variables:

- `NOTIFY_TITLE`: Notification title
- `NOTIFY_MESSAGE`: Notification message
- `NOTIFY_URGENCY`: Notification urgency level (low/normal/critical)
- `NOTIFY_TIMEOUT`: Notification timeout (seconds)
- `NOTIFY_SOUND`: Whether sound is enabled (true/false)
- `NOTIFY_PROJECT_NAME`: Project name (if available)
- `NOTIFY_TOOL_NAME`: Tool name (if available)
- `NOTIFY_TIMESTAMP`: ISO timestamp when the notification was triggered

### Script Examples

#### Shell Script Example

```bash
#!/bin/bash
# notify.sh

echo "[$NOTIFY_TIMESTAMP] Sending notification: $NOTIFY_TITLE - $NOTIFY_MESSAGE" >> /tmp/ai-notify.log
echo "Project: $NOTIFY_PROJECT_NAME, Tool: $NOTIFY_TOOL_NAME, Urgency: $NOTIFY_URGENCY" >> /tmp/ai-notify.log
```

#### Node.js Script Example

```javascript
// notify.js
const fs = require('fs');

const logMessage = `[${process.env.NOTIFY_TIMESTAMP}] Notification sent: ${process.env.NOTIFY_TITLE} - ${process.env.NOTIFY_MESSAGE}\n`;
fs.appendFileSync('/tmp/ai-notify.log', logMessage);

const detailMessage = `Project: ${process.env.NOTIFY_PROJECT_NAME}, Tool: ${process.env.NOTIFY_TOOL_NAME}, Urgency: ${process.env.NOTIFY_URGENCY}\n`;
fs.appendFileSync('/tmp/ai-notify.log', detailMessage);
```

### Security Considerations

- Scripts must be located in your home directory or current project directory
- Scripts must have appropriate file extensions (`.sh` for Shell scripts, `.js` or `.cjs` for Node.js scripts)
- On Unix-like systems, scripts must have execute permissions
- Script execution has a timeout limit (default 30 seconds) to prevent hanging

## Configuration

AI Common Notify supports multiple configuration levels:

1. **Global Configuration**: `~/.config/ai-common-notify/config.json` (Linux/macOS) or `%APPDATA%\ai-common-notify\config.json` (Windows)
2. **Project Configuration**: `<project-root>/.ai-notify.json`
3. **Environment Variables**: Override configuration with environment variables

Example configuration:

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

## CLI Commands

```bash
# View all available commands
ai-common-notify --help

# Send a test notification
ai-common-notify test

# Send a custom notification
ai-common-notify send --title "Task Complete" --message "Your task has finished successfully"

# Quick initialize AI tools
ai-common-notify quickInit

# View error logs
ai-common-notify errlog

# View all logs
ai-common-notify alllog

# Start MCP server for Cursor and other tools
ai-common-notify mcp

# Process Claude Code hook events
ai-common-notify hook
```

## Supported AI Tools

- **Claude Code**: Integrated via Hook system
- **Cursor**: Integrated via MCP protocol
- **Windsurf**: Integrated via MCP protocol and rules file
- **Gemini CLI**: Integrated via MCP protocol
- **Other MCP Tools**: Any tool supporting the Model Context Protocol

## REST API

Start the REST API server:

```bash
ai-common-notify api
```

Send notifications via HTTP:

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "title": "API Test",
    "message": "This notification was sent via REST API",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Wayne

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/MichealWayne/ai-common-notify/issues) on GitHub.
