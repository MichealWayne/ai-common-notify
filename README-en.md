# AI Common Notify

A unified notification service for AI coding tools like Claude Code, Cursor, and more.

## Features

- 🖥️ **Cross-platform support**: Works on Windows, macOS, and Linux
- 🪝 **Multiple integration methods**: Supports Claude Code hooks, MCP protocol (for Cursor), and REST API
- 🔔 **Native notifications**: Uses system-native notification methods when available
- ⚙️ **Configurable**: Customize notification preferences
- 🎯 **Simple CLI**: Easy-to-use command-line interface
- 🚨 **Smart alerts**: Critical notifications for potentially destructive operations
- 📁 **Project identification**: All notifications include project name and path

## Installation

### Using npm (recommended)

```bash
npm install -g ai-common-notify
```

### Using standalone executables

Download the appropriate executable for your platform from the releases page:

- Windows: `ai-notify-win.exe`
- macOS: `ai-notify-macos`
- Linux: `ai-notify-linux`

Make the executable file executable (on macOS and Linux):

```bash
chmod +x ai-notify-macos
chmod +x ai-notify-linux
```

## Usage

### Claude Code Integration

AI Common Notify can be integrated directly with Claude Code as a hook to notify you when Claude needs attention or performs certain actions.

#### Setting up as a Claude Hook

Add to your Claude settings file (`~/.claude/settings.json` or `.claude/settings.json` in your project):

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
- Alert you before Claude uses potentially destructive tools (Bash, Write, Edit, MultiEdit)
- Show the project name in ALL notification titles and full project path in ALL messages

### Cursor Integration

To use AI Common Notify with Cursor, you need to configure it as an MCP server.

Find the configuration file `~/.cursor/mcp.json` or `your_project/.cursor/mcp.json` and add:

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

### Manual Usage

#### Send a notification

```bash
# Basic notification
ai-common-notify hook <<EOF
{
  "title": "Test Notification",
  "message": "This is a test message"
}
EOF

# Custom notification
ai-common-notify hook <<EOF
{
  "title": "Custom Title",
  "message": "Custom message",
  "urgency": "critical"
}
EOF
```

#### Available Hook Events

- **PreToolUse**: Before Claude uses a tool (can be used to review/block actions)
- **PostToolUse**: After a tool completes successfully
- **Notification**: When Claude sends a notification
- **Stop**: When Claude finishes responding
- **SubagentStop**: When a Claude subagent completes

## Configuration

Configuration is stored in:
- Linux/macOS: `~/.config/ai-common-notify/config.json`
- Windows: `%APPDATA%\ai-common-notify\config.json`

Example configuration:

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

## Platform-specific Notes

### Windows
- Uses native Windows Toast notifications
- Sound support included

### macOS
- Uses native Notification Center
- Sound support included

### Linux
- Requires `notify-send` (usually part of `libnotify-bin` package)
- Install with: `sudo apt-get install libnotify-bin` (Debian/Ubuntu)

## Development

### Prerequisites

- Node.js 16+
- npm

### Building from source

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-common-notify.git
cd ai-common-notify

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Package as standalone executables
npm run package
```

## License

MIT License - see LICENSE file for details