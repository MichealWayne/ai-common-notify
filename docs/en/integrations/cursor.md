# Cursor Integration Guide

This guide explains how to integrate AI Common Notify with Cursor using the Model Context Protocol (MCP) to receive system notifications for AI activities.

## Overview

Cursor supports the Model Context Protocol (MCP), which allows external tools to provide services to the AI. AI Common Notify implements an MCP server that can send system notifications when requested by Cursor.

## Integration Methods

### Method 1: Quick Initialization (Recommended)

The easiest way to integrate with Cursor is to use the quick initialization feature:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Ensure your project has a .cursor directory
ai-common-notify quickInit --tool cursor
```

This will automatically create or update the `.cursor/mcp.json` configuration file.

### Method 2: Manual Configuration

If you prefer manual configuration, follow these steps:

1. Create or edit the MCP configuration file at `.cursor/mcp.json` in your project:

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

2. If you're using the standalone executable, adjust the path accordingly:

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

3. Save the file and restart Cursor.

## How It Works

Once configured, Cursor can call the `send_notification` tool provided by AI Common Notify. The tool accepts the following parameters:

```json
{
  "name": "send_notification",
  "description": "Send system notification with optional sound",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": {"type": "string", "description": "Notification title"},
      "message": {"type": "string", "description": "Notification message"},
      "urgency": {"type": "string", "enum": ["low", "normal", "critical"]},
      "timeout": { "type": "number", "description": "Timeout in seconds (0 for permanent display)" },
      "play_sound": { "type": "boolean", "description": "Play notification sound" }
    },
    "required": ["title", "message"]
  }
}
```

## Usage Examples

### Basic Notification

```javascript
// In Cursor's MCP client
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: 'Task Completed',
    message: 'Your AI task has finished successfully',
    urgency: 'normal',
    timeout: 0,
    play_sound: true
  }
});
```

### Error Notification

```javascript
// In Cursor's MCP client
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: 'Error Occurred',
    message: 'An error occurred during AI processing',
    urgency: 'critical',
    timeout: 0,
    play_sound: true
  }
});
```

### Low Priority Notification

```javascript
// In Cursor's MCP client
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: 'Background Task',
    message: 'A background task has completed',
    urgency: 'low',
    timeout: 10,
    play_sound: false
  }
});
```

## Testing the Integration

### Manual Testing

You can test the MCP server manually using the MCP test client or by creating a simple test script:

```bash
# Start the MCP server
ai-common-notify mcp
```

### Automatic Testing

1. Open Cursor and start a conversation with an AI model
2. Ask the AI to perform an action that would trigger a notification
3. You should receive a system notification

## Common Issues and Solutions

### 1. MCP Server Not Starting

**Problem**: Cursor cannot connect to the MCP server.

**Solutions**:
- Verify that AI Common Notify is properly installed
- Check that the path in `mcp.json` is correct
- Ensure the `mcp.json` file is in the correct location
- Test the MCP server manually: `ai-common-notify mcp`

### 2. Notifications Not Appearing

**Problem**: MCP server is running but no notifications appear.

**Solutions**:
- Check system notification settings
- Verify that the notification parameters are correct
- Test manually with a simple notification call
- Check the AI Common Notify logs: `ai-common-notify errlog`

### 3. Permission Errors

**Problem**: Permission errors when starting the MCP server.

**Solutions**:
- Ensure AI Common Notify is in your system PATH
- Check file permissions on the ai-common-notify executable
- On macOS, ensure Terminal has notification permissions in System Preferences

### 4. Configuration Not Loading

**Problem**: Cursor doesn't seem to recognize the MCP configuration.

**Solutions**:
- Ensure the `mcp.json` file is in the correct location (`.cursor/mcp.json`)
- Restart Cursor after configuration changes
- Check for JSON syntax errors in the configuration file

## Advanced Configuration

### Custom Notification Templates

You can customize notification templates in your global configuration:

```json
{
  "notifications": {
    "title_template": "[Cursor] {project_name}",
    "message_template": "{message}\nProject: {project_name}"
  }
}
```

### Script Callbacks

Execute custom scripts before or after notifications:

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/log-cursor-notification.sh",
        "enabled": true
      }
    ]
  }
}
```

### Project-specific Configuration

You can have different configurations for different projects by placing `mcp.json` files in project directories.

## Best Practices

1. **Use Appropriate Urgency Levels**: Choose the right urgency level for different types of notifications
2. **Set Reasonable Timeouts**: Use timeouts to prevent notifications from staying too long
3. **Enable Sound Judiciously**: Only enable sound for important notifications to avoid notification fatigue
4. **Regular Testing**: Periodically test your configuration to ensure it's working
5. **Monitor Logs**: Use `ai-common-notify errlog` to monitor for issues
6. **Prompt for Notifications**: When using Cursor with AI models, explicitly ask for notifications in your prompts. For example, end your prompt with "Finally, send me a notification when the task is finished." This helps ensure that Cursor invokes the notification tool call.

## Next Steps

1. [Claude Code Integration](claude-code.md) - Integrate with Claude Code
2. [Windsurf Integration](windsurf.md) - Integrate with Windsurf
3. [Configuration Guide](../configuration/configuration.md) - Learn about all configuration options
4. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts

---
*AI Common Notify - Simplifying notifications for AI coding tools*