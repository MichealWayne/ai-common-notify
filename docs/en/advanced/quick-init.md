# Quick Initialization Guide

This guide explains how to use the quick initialization feature in AI Common Notify to automatically configure multiple AI tools with a single command.

## Overview

The quick initialization feature (`quickInit`) automatically detects and configures supported AI tools in your project, eliminating the need for manual configuration of each tool. This feature supports:

- **Cursor** - MCP protocol integration
- **Claude Code** - Hook system integration
- **Windsurf** - MCP protocol and rules file integration
- **Gemini CLI** - MCP protocol integration

## How It Works

The quick initialization process:

1. **Detection**: Scans your project directory for signs of supported AI tools
2. **Configuration**: Creates or updates configuration files for detected tools
3. **Integration**: Sets up proper integration with AI Common Notify
4. **Verification**: Confirms successful configuration

## Usage

### Initialize All Detected Tools

To automatically detect and configure all supported AI tools in your project:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize all detected tools
ai-common-notify quickInit
```

### Initialize Specific Tool

To configure a specific tool:

```bash
# Initialize Cursor
ai-common-notify quickInit --tool cursor

# Initialize Claude Code
ai-common-notify quickInit --tool claudecode

# Initialize Windsurf
ai-common-notify quickInit --tool windsurf

# Initialize Gemini CLI
ai-common-notify quickInit --tool gemini-cli
```

## Detection Mechanism

The quick initialization feature detects AI tools by looking for specific files and directories:

### Cursor Detection
- Looks for `.cursor` directory in project root

### Claude Code Detection
- Looks for `.claude` directory in project root
- Looks for `claude-config.json` file in project root

### Windsurf Detection
- Looks for `.windsurf` directory in project root

### Gemini CLI Detection
- Looks for `.gemini` directory in project root

## Generated Configuration Files

### Cursor Configuration

Creates/updates `.cursor/mcp.json`:

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

### Claude Code Configuration

Creates/updates `.claude/settings.json` (new structure) or `claude-config.json` (legacy):

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
    ]
  }
}
```

### Windsurf Configuration

Creates/updates two files:

1. `.windsurf/mcp.json`:
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

2. `.windsurfrules` (appends if file exists):
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

### Gemini CLI Configuration

Creates/updates `.gemini/mcp.json`:

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

## Safety Features

### Non-Destructive Updates

The quick initialization feature preserves existing configuration:

- **Existing Keys**: Preserves existing configuration keys
- **New Keys**: Only adds new keys for notification integration
- **Backup**: Creates backup files before making changes

### Duplicate Prevention

Prevents duplicate configuration entries:

- **Smart Detection**: Checks for existing notification configuration
- **Content Validation**: Verifies configuration completeness
- **Append Prevention**: Avoids adding duplicate rules or settings

### Error Handling

Robust error handling ensures reliability:

- **Graceful Failures**: Continues with other tools if one fails
- **Detailed Logging**: Provides clear error messages
- **Rollback Capability**: Maintains system stability

## Examples

### Example 1: New Project Setup

```bash
# Create new project
mkdir my-ai-project
cd my-ai-project

# Initialize git and add AI tools
git init
# ... set up Cursor, Claude Code, etc.

# Quick initialize all tools
ai-common-notify quickInit

# Verify configuration
ls -la .cursor/mcp.json
ls -la .claude/settings.json
```

### Example 2: Adding Tools to Existing Project

```bash
# Navigate to existing project
cd existing-project

# Add Windsurf to project
# ... Windsurf setup ...

# Quick initialize Windsurf only
ai-common-notify quickInit --tool windsurf

# Verify Windsurf configuration
cat .windsurf/mcp.json
cat .windsurfrules
```

### Example 3: Multi-Tool Project

```bash
# Navigate to project with multiple tools
cd multi-tool-project

# Project structure:
# ├── .cursor/
# ├── .claude/
# ├── .windsurf/
# └── .gemini/

# Quick initialize all tools
ai-common-notify quickInit

# All tools are now configured for notifications
```

## Customization Options

### Project-Specific Templates

You can customize the generated configuration by creating templates in your project:

```
project/
├── .ai-notify-templates/
│   ├── cursor-mcp.json
│   ├── claude-hooks.json
│   └── windsurf-rules.yaml
```

### Environment-Specific Configuration

Use environment variables to customize behavior:

```bash
# Skip backup creation
export AI_NOTIFY_QUICKINIT_NO_BACKUP=true

# Custom configuration directory
export AI_NOTIFY_CONFIG_DIR=/custom/config/path

# Verbose output
export AI_NOTIFY_VERBOSE=true
```

## Troubleshooting

### 1. Tool Not Detected

**Problem**: A tool is installed but not detected by quick initialization.

**Solutions**:
- Verify the tool's configuration directory exists
- Check that you're in the correct project directory
- Ensure the tool is properly installed
- Use `--tool` flag to specify the tool explicitly

### 2. Configuration Not Generated

**Problem**: Configuration files are not created or updated.

**Solutions**:
- Check file permissions in project directory
- Verify AI Common Notify has write access
- Check for disk space issues
- Review error logs: `ai-common-notify errlog`

### 3. Duplicate Configuration

**Problem**: Configuration is duplicated on repeated runs.

**Solutions**:
- This should not happen with the latest version
- If it does, please report as a bug
- Manually clean up duplicate entries
- Check for configuration file corruption

### 4. Permission Errors

**Problem**: Permission denied when creating configuration files.

**Solutions**:
- Run with elevated permissions if necessary
- Check directory ownership and permissions
- Ensure you have write access to project directory
- Use `sudo` as a last resort

## Best Practices

### 1. Regular Updates

Run quick initialization when:
- Adding new AI tools to your project
- Updating AI Common Notify to a new version
- Setting up a new development environment

### 2. Version Control

Add generated configuration files to version control:

```bash
# Add configuration files to git
git add .cursor/mcp.json
git add .claude/settings.json
git add .windsurf/mcp.json
git add .windsurfrules
git add .gemini/mcp.json
```

### 3. Backup Strategy

The quick initialization feature automatically creates backups, but you should:
- Regularly commit configuration changes
- Keep project documentation updated
- Test configuration in development first

### 4. Team Collaboration

When working in teams:
- Document the quick initialization process
- Share configuration templates
- Establish consistent tool usage patterns
- Review configuration changes during code reviews

## Advanced Usage

### Scripted Initialization

Use in automated setup scripts:

```bash
#!/bin/bash
# setup-ai-tools.sh

echo "Setting up AI tools for project..."

# Run quick initialization
ai-common-notify quickInit

# Verify configuration
if [ -f ".cursor/mcp.json" ]; then
  echo "✓ Cursor configured"
else
  echo "✗ Cursor configuration failed"
fi

# Additional setup steps...
```

### CI/CD Integration

Integrate with continuous integration pipelines:

```yaml
# .github/workflows/setup.yml
name: Setup AI Tools
on: [push]
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install AI Common Notify
        run: npm install -g ai-common-notify
      - name: Quick Initialize
        run: ai-common-notify quickInit
      - name: Verify Configuration
        run: |
          test -f .cursor/mcp.json
          test -f .claude/settings.json
```

## Next Steps

1. [CLI Commands](../tools/cli.md) - Learn about all available CLI commands
2. [Configuration Guide](../configuration/configuration.md) - Customize your setup
3. [Script Callbacks](../configuration/script-callbacks.md) - Extend functionality with custom scripts
4. [Security Guide](security.md) - Secure your configuration

---
*AI Common Notify - Simplifying notifications for AI coding tools*