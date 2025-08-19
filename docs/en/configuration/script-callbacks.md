# Script Callbacks Guide

This guide explains how to use script callbacks in AI Common Notify to extend its functionality with custom scripts executed when sending notifications.

## Overview

Script callbacks allow you to execute custom scripts when sending notifications. This feature enables you to:
- Log notification events
- Trigger external systems
- Modify notification data
- Perform cleanup tasks
- Integrate with other tools and services

## Configuration

Script callbacks are configured in the `scripts` section of your configuration file:

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

### Configuration Options

- `timeout`: Maximum execution time for scripts in milliseconds (default: 30000)
- `notify`: Array of scripts to execute when sending notifications

### Script Configuration

Each script configuration supports the following options:

- `type`: Script type (`shell` or `node`)
- `path`: Absolute path to the script file (`.sh` for shell scripts, `.js` or `.cjs` for Node.js scripts)
- `enabled`: Whether the script is enabled (default: true)

## Environment Variables

When scripts are executed, they receive notification data through environment variables:

### Available Environment Variables

- `NOTIFY_TITLE`: Notification title
- `NOTIFY_MESSAGE`: Notification message
- `NOTIFY_URGENCY`: Urgency level (low/normal/critical)
- `NOTIFY_TIMEOUT`: Timeout in seconds
- `NOTIFY_SOUND`: Whether sound is enabled (true/false)
- `NOTIFY_PROJECT_NAME`: Project name
- `NOTIFY_TOOL_NAME`: AI tool name
- `NOTIFY_TIMESTAMP`: Notification timestamp
- `NOTIFY_EVENT_TYPE`: Event type (for hook events)
- `NOTIFY_PROJECT_PATH`: Full path to the project directory
- `NOTIFY_TRANSCRIPT_PATH`: Path to the transcript file (for Claude Code hooks)
- `NOTIFY_SESSION_ID`: Session ID (for Claude Code hooks)

## Script Examples

### Shell Script Example

Create a shell script at `/path/to/your/script.sh`:

```bash
#!/bin/bash

# Log notification details
echo "$(date): Notification sent" >> /var/log/ai-notify.log
echo "Title: $NOTIFY_TITLE" >> /var/log/ai-notify.log
echo "Message: $NOTIFY_MESSAGE" >> /var/log/ai-notify.log
echo "Tool: $NOTIFY_TOOL_NAME" >> /var/log/ai-notify.log
echo "Project: $NOTIFY_PROJECT_NAME" >> /var/log/ai-notify.log
echo "------------------------" >> /var/log/ai-notify.log

# Send to external webhook (example)
# curl -X POST -H "Content-Type: application/json" \
#   -d '{"title":"'$NOTIFY_TITLE'","message":"'$NOTIFY_MESSAGE'"}' \
#   https://your-webhook-url.com/notifications

# Perform other actions...
```

Make the script executable:

```bash
chmod +x /path/to/your/script.sh
```

### Node.js Script Example

Create a Node.js script at `/path/to/your/script.js`:

```javascript
// script.js
const fs = require('fs');
const https = require('https');

// Log notification details
const logMessage = `
${new Date().toISOString()}: Notification sent
Title: ${process.env.NOTIFY_TITLE}
Message: ${process.env.NOTIFY_MESSAGE}
Tool: ${process.env.NOTIFY_TOOL_NAME}
Project: ${process.env.NOTIFY_PROJECT_NAME}
------------------------
`;

fs.appendFileSync('/var/log/ai-notify.log', logMessage);

// Send to external service
const data = JSON.stringify({
  title: process.env.NOTIFY_TITLE,
  message: process.env.NOTIFY_MESSAGE,
  tool: process.env.NOTIFY_TOOL_NAME,
  project: process.env.NOTIFY_PROJECT_NAME
});

const options = {
  hostname: 'your-webhook-url.com',
  port: 443,
  path: '/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
});

req.on('error', error => {
  console.error('Webhook error:', error);
});

req.write(data);
req.end();

// Perform other async operations...
```

### Python Script Example

Create a Python script at `/path/to/your/script.py`:

```python
#!/usr/bin/env python3
import os
import json
import requests
from datetime import datetime

# Log notification details
log_message = f"""
{datetime.now().isoformat()}: Notification sent
Title: {os.environ.get('NOTIFY_TITLE', '')}
Message: {os.environ.get('NOTIFY_MESSAGE', '')}
Tool: {os.environ.get('NOTIFY_TOOL_NAME', '')}
Project: {os.environ.get('NOTIFY_PROJECT_NAME', '')}
------------------------
"""

with open('/var/log/ai-notify.log', 'a') as f:
    f.write(log_message)

# Send to external service
try:
    data = {
        'title': os.environ.get('NOTIFY_TITLE', ''),
        'message': os.environ.get('NOTIFY_MESSAGE', ''),
        'tool': os.environ.get('NOTIFY_TOOL_NAME', ''),
        'project': os.environ.get('NOTIFY_PROJECT_NAME', '')
    }
    
    response = requests.post(
        'https://your-webhook-url.com/notifications',
        json=data
    )
    
    print(f"Webhook status: {response.status_code}")
except Exception as e:
    print(f"Webhook error: {e}")

# Perform other operations...
```

Make the script executable:

```bash
chmod +x /path/to/your/script.py
```

And update your configuration to use it:

```json
{
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "/path/to/your/script.py",
        "enabled": true
      }
    ]
  }
}
```

## Advanced Script Patterns

### 1. Conditional Execution

Execute scripts based on notification properties:

```bash
#!/bin/bash
# conditional-script.sh

# Only execute for critical notifications
if [ "$NOTIFY_URGENCY" = "critical" ]; then
  echo "Critical notification: $NOTIFY_TITLE" | mail -s "Critical Alert" admin@example.com
fi

# Only execute for specific tools
if [ "$NOTIFY_TOOL_NAME" = "ClaudeCode" ]; then
  # Perform Claude-specific actions
  echo "Claude notification received" >> /var/log/claude-notifications.log
fi
```

### 2. Data Transformation

Modify notification data before sending:

```javascript
// transform-script.js
const fs = require('fs');

// Read existing notification data
let notifications = [];
try {
  const data = fs.readFileSync('/var/log/notification-history.json', 'utf8');
  notifications = JSON.parse(data);
} catch (error) {
  // File doesn't exist or is invalid, start fresh
}

// Add current notification
notifications.push({
  title: process.env.NOTIFY_TITLE,
  message: process.env.NOTIFY_MESSAGE,
  tool: process.env.NOTIFY_TOOL_NAME,
  project: process.env.NOTIFY_PROJECT_NAME,
  timestamp: process.env.NOTIFY_TIMESTAMP,
  urgency: process.env.NOTIFY_URGENCY
});

// Save updated history
fs.writeFileSync(
  '/var/log/notification-history.json',
  JSON.stringify(notifications, null, 2)
);
```

### 3. External Service Integration

Integrate with external services like Slack, Discord, or custom webhooks:

```bash
#!/bin/bash
# slack-notify.sh

# Send to Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data "{
    \"text\": \"*$NOTIFY_TITLE*\n$NOTIFY_MESSAGE\",
    \"username\": \"AI Notifier\",
    \"icon_emoji\": \":robot_face:\"
  }" \
  https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Security Considerations

### 1. Script Path Validation

Scripts must be located in secure directories:
- User home directory
- Project directory
- Configured safe directories

### 2. Execution Permissions

Scripts must have appropriate execute permissions:
- Owner execution permission required
- Group and others permissions restricted

### 3. Timeout Protection

All scripts are executed with a timeout to prevent hanging:
- Default: 30 seconds
- Configurable via `timeout` setting

### 4. Environment Isolation

Scripts run with limited environment variables:
- Only notification-related variables are provided
- System environment variables are not exposed

## Error Handling

### Script Execution Errors

If a script fails:
- The error is logged but doesn't affect the main notification process
- Other scripts in the chain continue to execute
- The notification is still sent

### Logging Script Errors

Script errors are logged to the AI Common Notify error log:

```bash
# View script execution errors
ai-common-notify errlog
```

### Debugging Scripts

To debug script issues:

1. Test scripts manually with environment variables:
   ```bash
   NOTIFY_TITLE="Test" NOTIFY_MESSAGE="Test message" ./your-script.sh
   ```

2. Add debugging output to your scripts:
   ```bash
   #!/bin/bash
   echo "Debug: Script started with title: $NOTIFY_TITLE" >> /tmp/debug.log
   ```

3. Check file permissions:
   ```bash
   ls -la /path/to/your/script.sh
   ```

## Best Practices

### 1. Keep Scripts Simple

- Focus on a single responsibility
- Avoid complex logic that could slow down notification delivery
- Use asynchronous operations for external calls

### 2. Handle Errors Gracefully

- Always include error handling in your scripts
- Log errors for debugging
- Don't let script failures block the main notification process

### 3. Use Absolute Paths

- Always use absolute paths for script files
- Avoid relative paths that could break in different contexts

### 4. Secure Script Locations

- Store scripts in secure, user-controlled directories
- Avoid system directories that require elevated permissions

### 5. Monitor Script Performance

- Keep scripts fast to avoid delaying notifications
- Use timeouts to prevent hanging scripts
- Monitor execution times in logs

### 6. Document Your Scripts

- Add comments explaining what each script does
- Document environment variable usage
- Include usage examples

## Troubleshooting

### 1. Scripts Not Executing

**Problem**: Configured scripts are not running.

**Solutions**:
- Verify script paths are correct and accessible
- Check file permissions (`chmod +x script.sh`)
- Ensure scripts are enabled in configuration
- Check AI Common Notify logs for execution errors

### 2. Environment Variables Missing

**Problem**: Scripts can't access notification data.

**Solutions**:
- Verify environment variable names are correct
- Test scripts manually with sample data
- Check that the script type is correctly configured

### 3. Script Timeout Issues

**Problem**: Scripts are timing out before completion.

**Solutions**:
- Increase the timeout value in configuration
- Optimize script performance
- Move heavy operations to background processes

### 4. Permission Errors

**Problem**: Permission denied when executing scripts.

**Solutions**:
- Check file permissions (`ls -la`)
- Ensure the script owner has execute permissions
- Verify the AI Common Notify process has access to the script directory

## Next Steps

1. [Notification Templates](templates.md) - Customize notification appearance
2. [Logging and Monitoring](logging.md) - Monitor script execution
3. [Security Guide](../advanced/security.md) - Secure your scripts
4. [API Reference](../advanced/api.md) - Integrate with external services

---
*AI Common Notify - Simplifying notifications for AI coding tools*