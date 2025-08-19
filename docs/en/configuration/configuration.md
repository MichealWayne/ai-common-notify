# Configuration Guide

This guide explains how to configure AI Common Notify to customize its behavior and integrate it with your workflow.

## Configuration File Locations

AI Common Notify supports multiple configuration levels with the following priority order (higher priority overrides lower):

1. **Environment Variables** - Highest priority
2. **Project Configuration** - `<project-root>/.ai-notify.json`
3. **Global Configuration** - `~/.config/ai-common-notify/config.json` (Linux/macOS) or `%APPDATA%\\ai-common-notify\\config.json` (Windows)

## Global Configuration

The global configuration file applies to all projects. Create it at:

- **Linux/macOS**: `~/.config/ai-common-notify/config.json`
- **Windows**: `%APPDATA%\\ai-common-notify\\config.json`

Example global configuration:

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
    "notify": []
  },
  "logging": {
    "retentionHours": 24
  },
  "platforms": {
    "windows": {
      "method": "powershell",
      "sound_enabled": true
    },
    "macos": {
      "method": "osascript",
      "sound_enabled": true
    },
    "linux": {
      "method": "notify-send",
      "sound_enabled": true,
      "urgency_mapping": {
        "low": "low",
        "normal": "normal",
        "critical": "critical"
      }
    }
  }
}
```

## Project Configuration

Project-specific configuration overrides global settings. Create `.ai-notify.json` in your project root:

```json
{
  "notifications": {
    "default_urgency": "critical",
    "title_template": "[PROJECT] {tool_name} - {project_name}"
  },
  "scripts": {
    "notify": [
      {
        "type": "node",
        "path": "/path/to/project/scripts/notify.js",
        "enabled": true
      }
    ]
  }
}
```

## Configuration Options

### Server Configuration

```json
{
  "server": {
    "port": 6001,
    "host": "localhost",
    "token": "your-secret-token"
  }
}
```

- `port`: REST API server port (default: 6001)
- `host`: REST API server host (default: localhost)
- `token`: API authentication token (optional but recommended for security)

### Notification Configuration

```json
{
  "notifications": {
    "default_timeout": 0,
    "default_sound": true,
    "default_urgency": "normal",
    "default_icon": "./dist/assets/icons/i-ai-notify_logo.icns",
    "title_template": "{tool_name} - {project_name}",
    "message_template": "{message}"
  }
}
```

- `default_timeout`: Default notification timeout in seconds (0 for permanent, default: 0)
- `default_sound`: Whether to play sound by default (default: true)
- `default_urgency`: Default urgency level (low, normal, critical, default: normal)
- `default_icon`: Path to the default notification icon (default: built-in app icon)
- `title_template`: Template for notification titles (default: "{tool_name} - {project_name}")
- `message_template`: Template for notification messages (default: "{message}")

### Tool Configuration

AI Common Notify includes predefined icons for supported AI tools:

```json
{
  "tools": {
    "claude-code": {
      "icon": "./dist/assets/icons/tool-claude.png"
    },
    "cursor": {
      "icon": "./dist/assets/icons/tool-cursor.png"
    },
    "windsurf": {
      "icon": "./dist/assets/icons/tool-windsurf.png"
    },
    "kiro": {
      "icon": "./dist/assets/icons/tool-kiro.png"
    }
  }
}
```

You can override these icons or add icons for other tools by specifying the path to your custom icon files.

### Logging Configuration

```json
{
  "logging": {
    "retentionHours": 24
  }
}
```

- `retentionHours`: Number of hours to keep log entries (default: 24). Log entries older than this value will be automatically cleaned up. Set to 0 to keep all logs indefinitely.

### Platform Configuration

```json
{
  "platforms": {
    "windows": {
      "method": "powershell",
      "sound_enabled": true
    },
    "macos": {
      "method": "osascript",
      "sound_enabled": true
    },
    "linux": {
      "method": "notify-send",
      "sound_enabled": true,
      "urgency_mapping": {
        "low": "low",
        "normal": "normal",
        "critical": "critical"
      }
    }
  }
}
```

- `method`: Notification method for each platform
- `sound_enabled`: Whether sound is enabled for each platform
- `urgency_mapping`: How urgency levels map to platform-specific values (Linux only)

## Environment Variables

You can override configuration options using environment variables:

```bash
# Server configuration
export AI_NOTIFY_PORT=3001
export AI_NOTIFY_HOST=0.0.0.0
export AI_NOTIFY_TOKEN=your-token

# Notification configuration
export AI_NOTIFY_DEFAULT_TIMEOUT=10
export AI_NOTIFY_DEFAULT_SOUND=false
export AI_NOTIFY_DEFAULT_URGENCY=critical

# Script configuration
export AI_NOTIFY_SCRIPT_TIMEOUT=60000
```

Environment variable names follow the pattern: `AI_NOTIFY_<SECTION>_<OPTION>` where section and option names are converted to uppercase.

## Configuration Examples

### Example 1: Development Environment

```json
{
  "server": {
    "port": 6001,
    "host": "localhost"
  },
  "notifications": {
    "default_timeout": 10,
    "default_sound": true,
    "default_urgency": "normal"
  },
  "logging": {
    "retentionHours": 168
  }
}
```

### Example 2: Production Environment

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "token": "generated-secret-token"
  },
  "notifications": {
    "default_timeout": 0,
    "default_sound": false,
    "default_urgency": "critical"
  },
  "scripts": {
    "timeout": 60000,
    "notify": [
      {
        "type": "shell",
        "path": "/var/log/ai-notify/log-notification.sh",
        "enabled": true
      }
    ]
  },
  "logging": {
    "retentionHours": 168
  }
}
```

### Example 3: Project-specific Configuration

```json
{
  "notifications": {
    "default_urgency": "critical",
    "title_template": "[{urgency}] {project_name}",
    "message_template": "{message}\n\nProject: {project_name}\nTool: {tool_name}"
  },
  "scripts": {
    "notify": [
      {
        "type": "shell",
        "path": "./scripts/notify.sh",
        "enabled": true
      },
      {
        "type": "node",
        "path": "./scripts/notify.js",
        "enabled": true
      }
    ]
  }
}
```

````

## Configuration Validation

AI Common Notify automatically validates configuration files when loading them. If a configuration file contains syntax errors, the tool will:

1. Log an error message
2. Use default configuration values
3. Continue to operate with reduced functionality

You can manually validate your configuration files:

```bash
# Validate JSON syntax
cat ~/.config/ai-common-notify/config.json | python -m json.tool

# Or use jq
jq . ~/.config/ai-common-notify/config.json
````

## Configuration Best Practices

### 1. Use Environment Variables for Sensitive Data

```json
{
  "server": {
    "token": "${AI_NOTIFY_TOKEN}"
  }
}
```

### 2. Keep Global Configuration Minimal

Use global configuration for general settings and project configuration for project-specific overrides.

### 3. Regular Backups

Keep backups of your configuration files, especially before making significant changes.

### 4. Test Changes

Test configuration changes in a development environment before applying them to production.

### 5. Document Custom Templates

Document any custom templates you create for future reference.

## Troubleshooting Configuration Issues

### 1. Configuration Not Loading

**Problem**: Changes to configuration files don't seem to take effect.

**Solutions**:

- Verify the configuration file is in the correct location
- Check for JSON syntax errors
- Restart the AI Common Notify service
- Check the logs: `ai-common-notify errlog`

### 2. Wrong Values Being Used

**Problem**: Unexpected values are being used for configuration options.

**Solutions**:

- Check the configuration priority order (environment > project > global)
- Verify environment variables are not overriding configuration
- Use `ai-common-notify config` to view current configuration (if implemented)

### 3. Template Variables Not Working

**Problem**: Template variables are not being replaced in notifications.

**Solutions**:

- Verify the variable names are correct
- Check that the variables are supported by the notification source
- Test with a simple template

### 4. Script Paths Not Found

**Problem**: Configured scripts are not being executed.

**Solutions**:

- Verify the script paths are correct and accessible
- Check file permissions on script files
- Ensure scripts have execute permissions (on Unix systems)
- Test scripts manually

## Next Steps

1. [Script Callbacks](script-callbacks.md) - Learn how to extend functionality with custom scripts
2. [Notification Templates](templates.md) - Create custom notification templates
3. [Logging and Monitoring](logging.md) - Monitor and troubleshoot your setup
4. [Security Guide](../advanced/security.md) - Secure your configuration

---

_AI Common Notify - Simplifying notifications for AI coding tools_
