# CLI Commands Reference

This guide provides a comprehensive reference for all command-line interface (CLI) commands available in AI Common Notify.

## Overview

AI Common Notify provides a rich command-line interface for various operations including notification sending, tool integration, configuration management, and system monitoring.

## Basic Usage

```bash
ai-common-notify [command] [options]
```

### Global Options

```bash
--version, -V    Output the version number
--help, -h       Display help for command
```

## Available Commands

### 1. hook

Process Claude Code hook events from JSON input.

```bash
ai-common-notify hook [options]
```

**Options:**
- `-e, --event-type <type>`: Override the event type
- `-t, --test`: Test mode (not implemented yet)
- `--timeout <seconds>`: Set notification timeout in seconds (0 for permanent, default: 0)

**Usage Examples:**

```bash
# Process hook event from stdin
echo '{"event_type": "Stop", "message": "Task completed"}' | ai-common-notify hook

# Process hook event with custom timeout
echo '{"event_type": "Notification", "message": "Custom message"}' | ai-common-notify hook --timeout 10

# Process hook event with explicit event type
echo '{"message": "Test message"}' | ai-common-notify hook --event-type critical
```

### 2. send

Send a notification from the command line with custom options.

```bash
ai-common-notify send [options]
```

**Options:**
- `-t, --title <title>`: Notification title (required)
- `-m, --message <message>`: Notification message (required)
- `-u, --urgency <urgency>`: Notification urgency (low, normal, critical) (default: "normal")
- `--timeout <seconds>`: Set notification timeout in seconds (0 for permanent, default: 0)
- `--no-sound`: Disable notification sound
- `--icon <icon>`: Path to notification icon
- `--tool <tool>`: Tool name for tool-specific configuration
- `--project <project>`: Project name

**Usage Examples:**

```bash
# Basic usage
ai-common-notify send --title "Deployment Complete" --message "Application successfully deployed to production"

# With custom options
ai-common-notify send \
  --title "Build Failed" \
  --message "The build process failed, please check the logs" \
  --urgency critical \
  --timeout 10 \
  --sound \
  --project "MyProject" \
  --tool "CI/CD"

# With custom icon
ai-common-notify send \
  --title "Custom Icon" \
  --message "This notification uses a custom icon" \
  --icon "/path/to/custom-icon.png"
```

### 2. mcp

Start MCP server for Cursor and other MCP-compatible tools.

```bash
ai-common-notify mcp
```

**Usage Examples:**

```bash
# Start MCP server
ai-common-notify mcp

# Start MCP server in background
ai-common-notify mcp &
```

### 3. quickInit

Quickly initialize AI tools configuration.

```bash
ai-common-notify quickInit [options]
```

**Options:**
- `-t, --tool <tool>`: Specify a tool to initialize (cursor, claudecode, windsurf, gemini-cli)

**Usage Examples:**

```bash
# Initialize all detected AI tools
ai-common-notify quickInit

# Initialize specific tool
ai-common-notify quickInit --tool cursor
ai-common-notify quickInit --tool claudecode
ai-common-notify quickInit --tool windsurf
ai-common-notify quickInit --tool gemini-cli
```

### 4. test

Send a test notification to verify the system is working.

```bash
ai-common-notify test [options]
```

**Options:**
- `-t, --timeout <seconds>`: Set notification timeout in seconds (0 for permanent, default: 0)

**Usage Examples:**

```bash
# Send basic test notification
ai-common-notify test

# Send test notification with timeout
ai-common-notify test --timeout 10

# Send test notification with long timeout
ai-common-notify test --timeout 30
```

### 5. errlog

Display error logs.

```bash
ai-common-notify errlog
```

**Usage Examples:**

```bash
# Display error logs
ai-common-notify errlog

# Redirect error logs to file
ai-common-notify errlog > error-log.txt
```

### 6. alllog

Display all logs.

```bash
ai-common-notify alllog
```

**Usage Examples:**

```bash
# Display all logs
ai-common-notify alllog

# Redirect all logs to file
ai-common-notify alllog > all-log.txt
```

## Advanced CLI Usage

### Command Chaining

You can chain commands for complex operations:

```bash
# Initialize tools and then test
ai-common-notify quickInit && ai-common-notify test

# Test and then check logs if test fails
ai-common-notify test || ai-common-notify errlog
```

### Script Integration

Use CLI commands in shell scripts:

```bash
#!/bin/bash
# ai-workflow.sh

# Function to send notification
send_notification() {
  local title="$1"
  local message="$2"
  local urgency="${3:-normal}"
  
  # In a real scenario, you might use the REST API or MCP
  echo "Notification: $title - $message (Urgency: $urgency)"
}

# Example workflow
echo "Starting AI task..."
# ... AI processing ...
send_notification "Task Complete" "AI processing finished" "normal"
```

### Environment-Specific Commands

Set up aliases for common operations:

```bash
# Add to your .bashrc or .zshrc
alias ain-test="ai-common-notify test"
alias ain-logs="ai-common-notify alllog"
alias ain-errors="ai-common-notify errlog"
alias ain-init="ai-common-notify quickInit"
```

## Exit Codes

AI Common Notify CLI commands return the following exit codes:

- `0`: Success
- `1`: General error
- `2`: Misuse of shell builtins

## Output Formats

### Success Messages

Success messages are sent to stdout:

```bash
$ ai-common-notify test
Sending test notification...
✓ Test notification sent successfully!
```

### Error Messages

Error messages are sent to stderr:

```bash
$ ai-common-notify hook
Error: No JSON data received from stdin
```

### Log Output

Log commands output structured data:

```bash
$ ai-common-notify errlog
Error Logs:
==============================
Timestamp: 2024-01-01T12:00:00Z
Component: NotificationManager
Message: Failed to send notification
Method: sendNotification
File: /path/to/NotificationManager.ts
------------------------------
```

## Configuration Commands

While not direct CLI commands, configuration can be managed through:

1. **Configuration Files**: Edit JSON configuration files
2. **Environment Variables**: Set environment variables
3. **Command Options**: Use command-line options where available

## Troubleshooting CLI Issues

### 1. Command Not Found

**Problem**: `ai-common-notify` command is not recognized.

**Solutions:**
- Verify installation: `npm list -g ai-common-notify`
- Check PATH: `echo $PATH`
- Reinstall if needed: `npm install -g ai-common-notify`

### 2. Permission Denied

**Problem**: Permission errors when running commands.

**Solutions:**
- Check file permissions
- Run with sudo if necessary (not recommended for regular use)
- Fix npm global directory permissions

### 3. Invalid Options

**Problem**: Command fails due to invalid options.

**Solutions:**
- Check command help: `ai-common-notify [command] --help`
- Verify option syntax
- Use long-form options if short-form is unclear

### 4. No Output

**Problem**: Command runs but produces no visible output.

**Solutions:**
- Check for background processes
- Verify configuration
- Check system notification settings
- Review logs: `ai-common-notify alllog`

## Best Practices

### 1. Use Descriptive Titles and Messages

When using commands that send notifications, use descriptive titles and messages:

```bash
# Good
ai-common-notify test --title "Deployment Complete" --message "Version 1.2.3 deployed successfully"

# Avoid
ai-common-notify test  # Uses generic message
```

### 2. Set Appropriate Timeouts

Use appropriate timeout values for your notifications:

```bash
# Permanent notification for important alerts
ai-common-notify test --timeout 0

# Temporary notification for status updates
ai-common-notify test --timeout 10
```

### 3. Monitor Logs Regularly

Regularly check logs to ensure proper operation:

```bash
# Check for errors
ai-common-notify errlog

# Monitor all activity
ai-common-notify alllog
```

### 4. Use in Automation Scripts

Integrate CLI commands into automation workflows:

```bash
#!/bin/bash
# deploy.sh

# Deployment steps...
echo "Deploying application..."

# Notify on completion
if [ $? -eq 0 ]; then
  ai-common-notify test --title "Deployment Success" --message "Application deployed successfully"
else
  ai-common-notify test --title "Deployment Failed" --message "Application deployment failed" --event-type critical
fi
```

## Next Steps

1. [Configuration Guide](../configuration/configuration.md) - Learn about configuration options
2. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts
3. [API Reference](../advanced/api.md) - Use the REST API for custom integrations
4. [Testing Utilities](testing.md) - Tools for testing your setup

---
*AI Common Notify - Simplifying notifications for AI coding tools*