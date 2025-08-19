# Claude Code Integration Guide

This guide explains how to integrate AI Common Notify with Claude Code to receive system notifications for various events.

## Overview

Claude Code supports hook events that can trigger external commands. AI Common Notify integrates with these hooks to provide system notifications for events like task completion, errors, and tool usage.

## Integration Methods

### Method 1: Quick Initialization (Recommended)

The easiest way to integrate with Claude Code is to use the quick initialization feature:

```bash
# Navigate to your project directory
cd /path/to/your/project

# If your project has .claude directory
ai-common-notify quickInit --tool claudecode

# If your project uses legacy configuration
ai-common-notify quickInit --tool claudecode
```

This will automatically create or update the appropriate configuration file.

### Method 2: Manual Configuration

If you prefer manual configuration, follow these steps:

#### For New Configuration Structure (.claude/settings.json)

1. Create or edit the configuration file at `.claude/settings.json` in your project:

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

#### For Legacy Configuration (claude-config.json)

1. Create or edit the configuration file at `claude-config.json` in your project:

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

## Hook Event Types

AI Common Notify supports the following Claude Code hook events:

### 1. Notification
Triggered when Claude sends a notification message.

### 2. Stop
Triggered when Claude finishes responding to a query.

### 3. PreToolUse
Triggered before Claude uses a tool. The matcher can be configured for specific tools:
- `Bash`: Before executing bash commands
- `Write`: Before writing files
- `Edit`: Before editing files
- `MultiEdit`: Before multiple file edits

### 4. PostToolUse
Triggered after Claude successfully completes a tool operation.

### 5. Error
Triggered when Claude encounters an error.

### 6. UserInputRequired
Triggered when Claude needs user input.

## Configuration Options

### Hook Matcher Patterns

You can customize the matcher patterns to filter which events trigger notifications:

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

### Custom Event Handling

You can configure different notifications for different event types:

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

## Testing the Integration

### Manual Testing

Test the integration by sending a test event:

```bash
# Test basic notification
echo '{"event_type": "Stop", "message": "Test message from Claude"}' | ai-common-notify hook

# Test with custom event type
echo '{"event_type": "Notification", "message": "Custom notification"}' | ai-common-notify hook
```

### Automatic Testing

1. Open Claude Code and start a conversation
2. Ask Claude to perform an action that triggers a hook (e.g., "Run ls command")
3. You should receive a system notification

## Common Issues and Solutions

### 1. Notifications Not Appearing

**Problem**: Claude Code hooks are configured but no notifications appear.

**Solutions**:
- Verify the configuration file path and syntax
- Check that AI Common Notify is properly installed
- Test manually with the echo command above
- Ensure Claude Code has permission to execute external commands

### 2. Wrong Event Types

**Problem**: Wrong event types are being triggered.

**Solutions**:
- Review matcher patterns in your configuration
- Use more specific regex patterns if needed
- Check Claude Code documentation for exact event type names

### 3. Configuration Not Loading

**Problem**: Claude Code doesn't seem to recognize the configuration.

**Solutions**:
- Ensure the configuration file is in the correct location
- Restart Claude Code after configuration changes
- Check for JSON syntax errors in the configuration file

### 4. Permission Errors

**Problem**: Permission errors when executing hooks.

**Solutions**:
- Ensure AI Common Notify is in your system PATH
- Check file permissions on the ai-common-notify executable
- On macOS, ensure Terminal has notification permissions in System Preferences

## Advanced Configuration

### Custom Notification Templates

You can customize notification templates in your global configuration:

```json
{
  "notifications": {
    "title_template": "[Claude] {project_name}",
    "message_template": "{message}\nTool: {tool_name}"
  }
}
```

### Script Callbacks

Execute custom scripts when sending notifications:

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

### Project-specific Configuration

You can have different configurations for different projects by placing configuration files in project directories.

## Best Practices

1. **Use Specific Matchers**: Instead of `.*`, use more specific patterns to avoid notification spam
2. **Configure Critical Events**: Pay special attention to `PreToolUse` events for potentially destructive operations
3. **Regular Testing**: Periodically test your configuration to ensure it's working
4. **Backup Configuration**: Keep backups of your configuration files
5. **Monitor Logs**: Use `ai-common-notify errlog` to monitor for issues

## Next Steps

1. [Cursor Integration](cursor.md) - Integrate with Cursor
2. [Windsurf Integration](windsurf.md) - Integrate with Windsurf
3. [Configuration Guide](../configuration/configuration.md) - Learn about all configuration options
4. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts

---
*AI Common Notify - Simplifying notifications for AI coding tools*