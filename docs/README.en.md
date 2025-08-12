# AI Common Notify User Guide

AI Common Notify is a unified notification service for AI coding tools like Claude Code, Cursor, and more. This guide will help you install, configure, and use the service.

## Table of Contents

1. [Installation](#installation)
   - [Using npm](#using-npm)
   - [Using standalone executables](#using-standalone-executables)
2. [Basic Usage](#basic-usage)
3. [Integration with Claude Code](#integration-with-claude-code)
4. [Integration with Cursor](#integration-with-cursor)
5. [Configuration](#configuration)
6. [CLI Commands](#cli-commands)
7. [Platform-specific Notes](#platform-specific-notes)
8. [FAQ](#faq)

## Installation

### Using npm

This is the recommended installation method.

1. Make sure you have Node.js (version 16 or higher) installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

2. Open your terminal or command prompt.

3. Run the following command to install AI Common Notify globally:

   ```bash
   npm install -g ai-common-notify
   ```

4. Verify the installation by checking the version:

   ```bash
   ai-common-notify --version
   ```

### Using standalone executables

If you prefer not to install Node.js, you can use the standalone executables.

1. Download the appropriate executable for your platform from the [releases page](https://github.com/yourusername/ai-common-notify/releases):
   - Windows: `ai-notify-win.exe`
   - macOS: `ai-notify-macos`
   - Linux: `ai-notify-linux`

2. Make the executable file executable (on macOS and Linux):

   ```bash
   chmod +x ai-notify-macos
   chmod +x ai-notify-linux
   ```

3. You can now run the tool using:

   ```bash
   ./ai-notify-macos --help
   # or on Windows
   ai-notify-win.exe --help
   ```

## Basic Usage

AI Common Notify provides two main commands:

1. `hook`: Process Claude Code hook events
2. `mcp`: Start MCP server for Cursor and other tools

To see all available commands and options, run:

```bash
ai-common-notify --help
```

## Integration with Claude Code

AI Common Notify can be integrated directly with Claude Code as a hook to notify you when Claude needs attention or performs certain actions.

### Setting up Claude Hook

1. Locate your Claude settings file. It's usually located at:
   - macOS/Linux: `~/.claude/settings.json`
   - Windows: `%USERPROFILE%\.claude\settings.json`
   
   If the file doesn't exist, you can create it.

2. Add the following configuration to your `settings.json` file:

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

3. Save the file and restart Claude Code.

This configuration will:
- Notify you when Claude finishes responding (Stop event)
- Alert you before Claude uses potentially destructive tools (Bash, Write, Edit, MultiEdit)
- Show the project name in ALL notification titles and full project path in ALL messages

### Testing Claude Integration

To test if the integration is working:

1. Open Claude Code and start a conversation.
2. Ask Claude to perform an action that triggers a notification (e.g., "Run `ls` command in the terminal").
3. You should receive a system notification when Claude attempts to execute the command.

## Integration with Cursor (MCP Integration,通用 Windsurf/CodeBuddy 等)

To use AI Common Notify with Cursor, you need to configure it as an MCP server.

### Setting up Cursor Integration

1. Locate your Cursor MCP configuration file:
   - Global configuration: `~/.cursor/mcp.json`
   - Project-specific configuration: `<your-project>/.cursor/mcp.json`

> Other tools like Windsurf/CodeBuddy/Trae can be integrated in their respective MCP ways.

2. Add the following configuration to your `mcp.json` file:

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

3. If you're using the standalone executable, adjust the path accordingly:

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

4. Save the file and restart Cursor.

### Testing Cursor Integration

To test if the integration is working:

1. Open Cursor and start a conversation with an AI model.
2. Ask the AI to perform an action.
3. You should receive a system notification when the AI completes the task.

## Configuration

AI Common Notify can be configured through a JSON configuration file.

### Configuration File Location

The configuration file is located at:
- Linux/macOS: `~/.config/ai-common-notify/config.json`
- Windows: `%APPDATA%\ai-common-notify\config.json`

If the configuration file doesn't exist, the tool will use default settings.

### Configuration Options

Here's an example configuration file with all available options:

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

### Configuration Options Explained

- `notifications.defaultTimeout`: Default timeout for notifications in seconds (default: 10)
- `notifications.defaultSound`: Whether to play sound by default (default: true)
- `notifications.defaultUrgency`: Default urgency level (default: "normal")
- `platforms.[platform].soundEnabled`: Enable or disable sound for a specific platform
- `platforms.linux.urgencyMapping`: Map urgency levels for Linux notifications

## CLI Commands

AI Common Notify provides a command-line interface with the following commands:

### `hook` Command

Process Claude Code hook events from JSON input.

```bash
ai-common-notify hook [options]
```

Options:
- `-e, --event-type <type>`: Override the event type
- `-t, --test`: Test mode (not implemented yet)

Example:
```bash
echo '{"event_type": "Stop", "message": "Task completed"}' | ai-common-notify hook
```

### `mcp` Command

Start MCP server for Cursor and other tools.

```bash
ai-common-notify mcp
```

This command starts the MCP server that listens for requests from Cursor and other MCP-compatible tools.

## Platform-specific Notes

### Windows

- Uses native Windows Toast notifications
- Sound support is included by default
- No additional dependencies required

### macOS

- Uses native Notification Center
- Sound support is included by default
- No additional dependencies required

### Linux

- Requires `notify-send` utility (usually part of `libnotify-bin` package)
- Install with: `sudo apt-get install libnotify-bin` (Debian/Ubuntu)
- For other distributions, use the appropriate package manager

## FAQ

### Q: I installed AI Common Notify but the command is not found. What should I do?

A: This usually happens when npm's global bin directory is not in your system's PATH. Try the following:

1. Find npm's global bin directory:
   ```bash
   npm config get prefix
   ```
   
2. Add the bin directory to your PATH:
   - On macOS/Linux, add this line to your `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH=$PATH:$(npm config get prefix)/bin
     ```
   - On Windows, add the npm prefix to your system's PATH environment variable.

3. Restart your terminal or command prompt.

### Q: Notifications are not showing up on Linux. What should I do?

A: Make sure you have the `libnotify-bin` package installed:

```bash
# Ubuntu/Debian
sudo apt-get install libnotify-bin

# Fedora
sudo dnf install libnotify

# CentOS/RHEL
sudo yum install libnotify
```

### Q: How do I uninstall AI Common Notify?

A: If you installed it using npm, you can uninstall it with:

```bash
npm uninstall -g ai-common-notify
```

If you used the standalone executable, simply delete the executable file.

### Q: Can I use AI Common Notify with other AI tools?

A: Yes, AI Common Notify supports the Model Context Protocol (MCP), which is a standard protocol that many AI tools support. If your AI tool supports MCP, you can configure it to use AI Common Notify as a notification server.

### Q: How do I customize the notification sound?

A: Currently, AI Common Notify uses the system's default notification sound. You can enable or disable sound through the configuration file. Custom sound support may be added in future versions.

### Q: I'm getting permission errors on macOS. How do I fix this?

A: On macOS, you might need to grant notification permissions to the terminal app or the app you're running AI Common Notify from. Go to System Preferences > Notifications and ensure that your terminal app has permission to send notifications.

### Q: How do I update AI Common Notify?

A: If you installed it using npm, you can update it with:

```bash
npm update -g ai-common-notify
```

If you're using the standalone executable, download the latest version from the releases page and replace the old executable.

### Q: Where can I report bugs or request features?

A: You can report bugs or request features by creating an issue on the [GitHub repository](https://github.com/yourusername/ai-common-notify/issues).