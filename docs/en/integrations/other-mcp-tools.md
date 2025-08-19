# Other MCP Tools Integration Guide

This guide explains how to integrate AI Common Notify with other AI tools that support the Model Context Protocol (MCP).

## Overview

The Model Context Protocol (MCP) is an open standard that allows AI tools to communicate with external services. Any tool that implements MCP can use AI Common Notify as a notification service.

## General Integration Process

### Step 1: Configure MCP Server

Most MCP-compatible tools require a configuration file that specifies external servers. The general format is:

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

### Step 2: Tool-specific Configuration

Each tool may have its own specific configuration requirements:

1. **Configuration File Location**: Different tools may look for configuration files in different locations
2. **File Format**: Some tools may require specific file extensions or formats
3. **Server Naming**: The server name (`NotificationServer` in the example) may need to match tool expectations

### Step 3: Test Integration

After configuration, test the integration by:

1. Starting the tool
2. Triggering an action that would call the notification service
3. Verifying that notifications appear

## Common MCP Tool Examples

### Example 1: Generic MCP Tool

For a generic MCP tool that looks for configuration in `.mcp/config.json`:

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

### Example 2: Tool with Custom Path

For a tool that requires a full path to the executable:

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "/usr/local/bin/ai-common-notify",
      "args": ["mcp"]
    }
  }
}
```

### Example 3: Tool with Environment Variables

For a tool that requires specific environment variables:

```json
{
  "mcpServers": {
    "NotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"],
      "env": {
        "NOTIFICATION_SOUND": "true",
        "DEFAULT_TIMEOUT": "0"
      }
    }
  }
}
```

## Using the send_notification Tool

Once integrated, any MCP tool can call the `send_notification` tool provided by AI Common Notify. The tool accepts the following parameters:

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
// In any MCP client
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

### Critical Notification

```javascript
// In any MCP client
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: 'Critical Error',
    message: 'Immediate attention required',
    urgency: 'critical',
    timeout: 0,
    play_sound: true
  }
});
```

### Low Priority Notification

```javascript
// In any MCP client
const response = await client.request('call_tool', {
  name: 'send_notification',
  arguments: {
    title: 'Background Task',
    message: 'A background process has completed',
    urgency: 'low',
    timeout: 10,
    play_sound: false
  }
});
```

## Troubleshooting Common Issues

### 1. Tool Cannot Find MCP Server

**Problem**: The AI tool reports that it cannot connect to the MCP server.

**Solutions**:
- Verify the configuration file location is correct for the specific tool
- Check that AI Common Notify is installed and in the system PATH
- Ensure the command path in the configuration is correct
- Test the MCP server manually: `ai-common-notify mcp`

### 2. Notifications Not Appearing

**Problem**: The MCP server appears to be running, but no notifications appear.

**Solutions**:
- Check system notification settings and permissions
- Verify that the notification parameters are valid
- Test with a simple notification call
- Check AI Common Notify logs: `ai-common-notify errlog`

### 3. Configuration Format Errors

**Problem**: The tool reports configuration file format errors.

**Solutions**:
- Verify the JSON syntax is correct
- Check that the configuration file is in the expected location
- Consult the tool's documentation for specific configuration requirements
- Use a JSON validator to check the configuration file

### 4. Permission Issues

**Problem**: Permission errors when starting the MCP server or sending notifications.

**Solutions**:
- Ensure AI Common Notify is in your system PATH
- Check file permissions on the ai-common-notify executable
- On macOS, ensure the terminal application has notification permissions
- On Linux, ensure the user has permissions to send notifications

## Best Practices for MCP Integration

### 1. Consistent Naming

Use consistent naming for the notification server across different tools when possible:

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

### 2. Environment-specific Configuration

Use different configuration files for different environments:

```
project/
├── .mcp/
│   ├── config.dev.json
│   ├── config.prod.json
│   └── config.local.json
```

### 3. Error Handling

Implement proper error handling in your MCP clients:

```javascript
try {
  const response = await client.request('call_tool', {
    name: 'send_notification',
    arguments: {
      title: 'Task Completed',
      message: 'Your task finished successfully'
    }
  });
  
  if (response.error) {
    console.error('Notification failed:', response.error);
  }
} catch (error) {
  console.error('MCP request failed:', error);
}
```

### 4. Testing

Create test scripts to verify integration:

```bash
#!/bin/bash
# test-notification.sh

echo "Testing MCP notification..."
ai-common-notify mcp &
MCP_PID=$!

# Give the server a moment to start
sleep 2

# Send a test notification (this would typically be done by the MCP client)
# This is a simplified example - actual implementation depends on the tool

echo "Test completed. Stopping MCP server..."
kill $MCP_PID
```

### 5. Prompt for Notifications

When using MCP-compatible AI tools, explicitly ask for notifications in your prompts. For example, end your prompt with "Finally, send me a notification when the task is finished." This helps ensure that the AI tool invokes the notification tool call.

## Advanced Integration Scenarios

### 1. Multiple Notification Servers

You can configure multiple notification servers for different purposes:

```json
{
  "mcpServers": {
    "CriticalNotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"]
    },
    "InfoNotificationServer": {
      "command": "ai-common-notify",
      "args": ["mcp"]
    }
  }
}
```

### 2. Custom Notification Templates

Configure custom templates in the global AI Common Notify configuration:

```json
{
  "notifications": {
    "title_template": "[{tool_name}] {project_name}",
    "message_template": "{message}\nProject: {project_name}\nTime: {timestamp}"
  }
}
```

### 3. Script Callbacks

Use script callbacks for extended functionality:

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/notification-script.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "/path/to/notification-script.js",
        "enabled": true
      }
    ]
  }
}
```

## Next Steps

1. [Configuration Guide](../configuration/configuration.md) - Learn about all configuration options
2. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts
3. [API Reference](../advanced/api.md) - Use the REST API for custom integrations
4. [Security Guide](../advanced/security.md) - Security best practices and configurations

---
*AI Common Notify - Simplifying notifications for AI coding tools*