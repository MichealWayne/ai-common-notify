# Installation Guide

This guide will help you install and set up AI Common Notify on your system.

## System Requirements

- **Node.js**: Version 16 or higher
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 20.04+, CentOS 8+, Fedora 35+)
- **Dependencies**: 
  - Linux: `libnotify-bin` package for notifications (usually pre-installed)

## Installation Methods

### Method 1: npm (Recommended)

This is the easiest and most recommended way to install AI Common Notify.

```bash
# Install globally
npm install -g ai-common-notify

# Verify installation
ai-common-notify --version
```

### Method 2: Standalone Executables

If you prefer not to install Node.js, you can use standalone executables:

1. Download the appropriate executable for your platform from the [releases page](https://github.com/MichealWayne/ai-common-notify/releases):
   - Windows: `ai-notify-win.exe`
   - macOS: `ai-notify-macos`
   - Linux: `ai-notify-linux`

2. Make the executable file executable (on macOS and Linux):
   ```bash
   chmod +x ai-notify-macos
   chmod +x ai-notify-linux
   ```

3. Run the tool:
   ```bash
   ./ai-notify-macos --help
   # or on Windows
   ai-notify-win.exe --help
   ```

## Post-Installation Setup

### Configuration Directory

AI Common Notify will automatically create a configuration directory:
- **Linux/macOS**: `~/.config/ai-common-notify/`
- **Windows**: `%APPDATA%\ai-common-notify\`

### Initial Configuration

The tool will work with default settings, but you can create a custom configuration file:

```bash
# Create config directory
mkdir -p ~/.config/ai-common-notify

# Create basic configuration
cat > ~/.config/ai-common-notify/config.json << EOF
{
  "server": {
    "port": 6001,
    "host": "localhost"
  },
  "notifications": {
    "default_timeout": 0,
    "default_sound": true,
    "default_urgency": "normal"
  }
}
EOF
```

## Verifying Installation

Test that the installation works correctly:

```bash
# Test notification
ai-common-notify test

# Check version
ai-common-notify --version

# View help
ai-common-notify --help
```

## Troubleshooting

### Command Not Found

If you get a "command not found" error:

1. Check if npm's global bin directory is in your PATH:
   ```bash
   npm config get prefix
   echo $PATH
   ```

2. Add npm's bin directory to your PATH if needed:
   - **Linux/macOS**: Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH=$PATH:$(npm config get prefix)/bin
     ```
   - **Windows**: Add to system PATH environment variable

### Permission Issues

On Linux, if you encounter permission issues:

```bash
# Install with sudo if needed
sudo npm install -g ai-common-notify

# Or configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Linux Notification Issues

If notifications don't appear on Linux:

1. Ensure `libnotify-bin` is installed:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libnotify-bin
   
   # Fedora
   sudo dnf install libnotify
   
   # CentOS/RHEL
   sudo yum install libnotify
   ```

2. Test notifications manually:
   ```bash
   notify-send "Test" "This is a test notification"
   ```

## Next Steps

After successful installation:

1. [Quick Start Guide](quick-start.md) - Get up and running quickly
2. [Tool Integration Guides](../integrations/) - Set up your AI tools
3. [Configuration Guide](../configuration/configuration.md) - Customize your setup

---
*AI Common Notify - Simplifying notifications for AI coding tools*