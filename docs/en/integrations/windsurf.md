# Windsurf Integration Guide

This guide explains how to integrate AI Common Notify with Windsurf using the Model Context Protocol (MCP) and rule files to receive system notifications for AI activities.

## Overview

Windsurf supports the Model Context Protocol (MCP) and rule-based automation. AI Common Notify integrates with Windsurf through both mechanisms to provide comprehensive notification capabilities.

## Integration Methods

### Method 1: Quick Initialization (Recommended)

The easiest way to integrate with Windsurf is to use the quick initialization feature:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Ensure your project has a .windsurf directory
ai-common-notify quickInit --tool windsurf
```

This will automatically create or update:
1. `.windsurf/mcp.json` - MCP server configuration
2. `.windsurfrules` - Automation rules for notifications

### Method 2: Manual Configuration

If you prefer manual configuration, follow these steps:

#### MCP Server Configuration

1. Create or edit the MCP configuration file at `.windsurf/mcp.json` in your project:

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

#### Rule File Configuration

3. Create or edit the rules file at `.windsurfrules` in your project:

```yaml
## Cascade execution requirement

Call MCP tool NotificationServer(send_notification) after each execution, regardless of the result.

# Enable automatic notifications
notification:
  enabled: true
  on_start: true
  on_success: true
  on_failure: true
  on_error: true

# Notification configuration
mcp:
  NotificationServer:
    enabled: true
    default_urgency: normal
    default_timeout: 5
    play_sound: true
```

4. Save the files and restart Windsurf.

## How It Works

Windsurf integration works through two complementary mechanisms:

### 1. MCP Integration
Similar to Cursor, Windsurf can call the `send_notification` tool provided by AI Common Notify through the MCP protocol.

### 2. Rule-based Automation
Windsurf's rule system automatically triggers notifications based on specified events:
- `on_start`: When a task starts
- `on_success`: When a task completes successfully
- `on_failure`: When a task fails
- `on_error`: When an error occurs

## Usage Examples

### Basic Notification via MCP

```javascript
// In Windsurf's MCP client
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

### Error Notification via Rules

When an error occurs and `on_error: true` is set in the rules, Windsurf automatically calls:

```javascript
// Automatically triggered by Windsurf rules
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

### Custom Notification via Rules

You can customize the default notification parameters in the rules file:

```yaml
# Notification configuration
mcp:
  NotificationServer:
    enabled: true
    default_urgency: critical  # Higher urgency for all notifications
    default_timeout: 10        # 10 second timeout
    play_sound: true
```

## Testing the Integration

### Manual Testing

You can test the MCP server manually:

```bash
# Start the MCP server
ai-common-notify mcp
```

### Automatic Testing

1. Open Windsurf and start a conversation with an AI model
2. Ask the AI to perform an action that would trigger a notification
3. You should receive a system notification based on your rules configuration

### Rule Testing

Test your rule configuration by creating a simple task that triggers different events:

```yaml
# Test different notification events
notification:
  enabled: true
  on_start: true    # Notify when task starts
  on_success: true  # Notify when task succeeds
  on_failure: true  # Notify when task fails
  on_error: true    # Notify when error occurs
```

## Common Issues and Solutions

### 1. Rules Not Triggering

**Problem**: Windsurf rules are configured but notifications are not triggered.

**Solutions**:
- Verify that the `.windsurfrules` file is in the correct location
- Check the syntax of your rule file
- Ensure `notification: enabled: true` is set
- Test with a simple rule configuration

### 2. MCP Server Not Starting

**Problem**: Windsurf cannot connect to the MCP server.

**Solutions**:
- Verify that AI Common Notify is properly installed
- Check that the path in `mcp.json` is correct
- Ensure the `mcp.json` file is in the correct location
- Test the MCP server manually: `ai-common-notify mcp`

### 3. Notifications Not Appearing

**Problem**: MCP server is running and rules are configured, but no notifications appear.

**Solutions**:
- Check system notification settings
- Verify that the notification parameters are correct
- Test manually with a simple notification call
- Check the AI Common Notify logs: `ai-common-notify errlog`

### 4. Permission Errors

**Problem**: Permission errors when starting the MCP server or executing rules.

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
    "title_template": "[Windsurf] {project_name}",
    "message_template": "{message}\nProject: {project_name}\nEvent: {event_type}"
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
        "path": "/path/to/log-windsurf-event.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "/path/to/process-notification.js",
        "enabled": true
      }
    ]
  }
}
```

### Complex Rule Configuration

You can create more complex rule configurations:

```yaml
# Advanced notification rules
notification:
  enabled: true
  on_start: false    # Don't notify on start
  on_success: true   # Notify on success
  on_failure: true   # Notify on failure
  on_error: true     # Notify on error

# Custom notification configuration
mcp:
  NotificationServer:
    enabled: true
    default_urgency: normal
    default_timeout: 0    # Permanent notifications
    play_sound: true
```

## Best Practices

1. **Balance Notification Frequency**: Don't enable all notification events to avoid spam
2. **Use Appropriate Urgency Levels**: Choose the right urgency level for different events
3. **Set Reasonable Timeouts**: Use timeouts to prevent notifications from staying too long
4. **Enable Sound Judiciously**: Only enable sound for important notifications
5. **Regular Testing**: Periodically test your configuration to ensure it's working
6. **Monitor Logs**: Use `ai-common-notify errlog` to monitor for issues
7. **Prompt for Notifications**: When using Windsurf with AI models, explicitly ask for notifications in your prompts. For example, end your prompt with "Finally, send me a notification when the task is finished." This helps ensure that Windsurf invokes the notification tool call.

## Next Steps

1. [Claude Code Integration](claude-code.md) - Integrate with Claude Code
2. [Cursor Integration](cursor.md) - Integrate with Cursor
3. [Configuration Guide](../configuration/configuration.md) - Learn about all configuration options
4. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts

---
*AI Common Notify - Simplifying notifications for AI coding tools*