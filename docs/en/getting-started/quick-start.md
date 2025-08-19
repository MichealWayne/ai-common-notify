# Quick Start Guide

Get up and running with AI Common Notify in minutes with this quick start guide.

## Step 1: Install AI Common Notify

If you haven't already, install AI Common Notify:

```bash
npm install -g ai-common-notify
```

Verify the installation:

```bash
ai-common-notify --version
```

## Step 2: Test Basic Functionality

Send a test notification to verify everything is working:

```bash
ai-common-notify test
```

You should see a system notification appear.

## Step 3: Quick Integration with AI Tools

### Option 1: Quick Initialization (Recommended)

Use the quick initialization feature to automatically configure your AI tools:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Automatically detect and configure all installed AI tools
ai-common-notify quickInit

# Or configure a specific tool
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

This will automatically create or update configuration files for supported tools.

### Option 2: Manual Configuration

If you prefer manual configuration, follow the specific guides:
- [Claude Code Integration](../integrations/claude-code.md)
- [Cursor Integration](../integrations/cursor.md)
- [Windsurf Integration](../integrations/windsurf.md)
- [Gemini CLI Integration](../integrations/gemini-cli.md)

## Step 4: Customize Configuration (Optional)

Create a custom configuration file at `~/.config/ai-common-notify/config.json`:

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

## Step 5: Advanced Features

### Script Callbacks

Execute custom scripts before or after notifications:

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

Start the REST API server for custom integrations:

```bash
# Start API server (default port: 6001)
ai-common-notify api
```

Send notifications via HTTP:

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test",
    "message": "This notification was sent via REST API",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

For detailed API documentation, see the [API Reference](../advanced/api.md).

## Step 6: View Logs and Monitor

Check error logs:

```bash
ai-common-notify errlog
```

View all logs:

```bash
ai-common-notify alllog
```

## Common Use Cases

### 1. Notification for Long-running Tasks

Set up notifications to alert you when long-running AI tasks complete:

```bash
# In your scripts or workflows
ai-common-notify send --title "Task Complete" --message "Model training finished"
```

### 2. Integration with Shell Scripts

Use in shell scripts for automated workflows:

```bash
#!/bin/bash
echo "Starting long process..."
# ... your long-running process ...
ai-common-notify send --title "Process Complete" --message "Task finished successfully"
```

### 3. Custom Notification Templates

Create custom templates for different types of notifications:

```json
{
  "notifications": {
    "title_template": "[{urgency}] {tool_name} - {project_name}",
    "message_template": "{message}\nProject: {project_name}\nTime: {timestamp}"
  }
}
```

## Troubleshooting

### No Notifications Appear

1. Check if the service is running:
   ```bash
   ai-common-notify test
   ```

2. Verify system notification settings:
   - **Windows**: Check Action Center settings
   - **macOS**: Check Notification Center settings
   - **Linux**: Ensure `notify-send` works:
     ```bash
     notify-send "Test" "Notification test"
     ```

### Configuration Issues

1. Validate your JSON configuration:
   ```bash
   # Check syntax
   cat ~/.config/ai-common-notify/config.json | python -m json.tool
   ```

2. Use default configuration by temporarily renaming your config file:
   ```bash
   mv ~/.config/ai-common-notify/config.json ~/.config/ai-common-notify/config.json.backup
   ```

## Next Steps

1. [Detailed Tool Integration Guides](../integrations/) - Learn how to integrate with specific AI tools
2. [Configuration Guide](../configuration/configuration.md) - Explore all configuration options
3. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts
4. [API Reference](../advanced/api.md) - Use the REST API for custom integrations

---
*AI Common Notify - Simplifying notifications for AI coding tools*