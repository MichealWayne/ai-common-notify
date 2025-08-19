# 安装指南

本指南将帮助您在系统上安装和设置 AI Common Notify。

## 系统要求

- **Node.js**：版本 16 或更高
- **操作系统**：Windows 10+、macOS 10.14+ 或 Linux（Ubuntu 20.04+、CentOS 8+、Fedora 35+）
- **依赖项**：
  - Linux：`libnotify-bin` 包用于通知（通常预安装）

## 安装方法

### 方法 1：npm（推荐）

这是安装 AI Common Notify 最简单和最推荐的方法。

```bash
# 全局安装
npm install -g ai-common-notify

# 验证安装
ai-common-notify --version
```

### 方法 2：独立可执行文件

如果您不想安装 Node.js，可以使用独立可执行文件：

1. 从 [发布页面](https://github.com/MichealWayne/ai-common-notify/releases) 下载适合您平台的可执行文件：
   - Windows: `ai-notify-win.exe`
   - macOS: `ai-notify-macos`
   - Linux: `ai-notify-linux`

2. 使可执行文件具有执行权限（在 macOS 和 Linux 上）：
   ```bash
   chmod +x ai-notify-macos
   chmod +x ai-notify-linux
   ```

3. 运行工具：
   ```bash
   ./ai-notify-macos --help
   # 或在 Windows 上
   ai-notify-win.exe --help
   ```

## 安装后设置

### 配置目录

AI Common Notify 将自动创建一个配置目录：
- **Linux/macOS**：`~/.config/ai-common-notify/`
- **Windows**：`%APPDATA%\ai-common-notify\`

### 初始配置

该工具将使用默认设置工作，但您可以创建自定义配置文件：

```bash
# 创建配置目录
mkdir -p ~/.config/ai-common-notify

# 创建基本配置
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

## 验证安装

测试安装是否正确工作：

```bash
# 测试通知
ai-common-notify test

# 检查版本
ai-common-notify --version

# 查看帮助
ai-common-notify --help
```

## 故障排除

### 找不到命令

如果出现"command not found"错误：

1. 检查 npm 的全局 bin 目录是否在您的 PATH 中：
   ```bash
   npm config get prefix
   echo $PATH
   ```

2. 如果需要，将 npm 的 bin 目录添加到您的 PATH 中：
   - **Linux/macOS**：添加到 `~/.bashrc` 或 `~/.zshrc`：
     ```bash
     export PATH=$PATH:$(npm config get prefix)/bin
     ```
   - **Windows**：添加到系统 PATH 环境变量

### 权限问题

在 Linux 上，如果您遇到权限问题：

```bash
# 如果需要，使用 sudo 安装
sudo npm install -g ai-common-notify

# 或配置 npm 使用不同的目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Linux 通知问题

如果 Linux 上通知不显示：

1. 确保安装了 `libnotify-bin`：
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libnotify-bin
   
   # Fedora
   sudo dnf install libnotify
   
   # CentOS/RHEL
   sudo yum install libnotify
   ```

2. 手动测试通知：
   ```bash
   notify-send "测试" "这是一个测试通知"
   ```

## 下一步

安装成功后：

1. [快速开始指南](quick-start.md) - 快速上手
2. [工具集成指南](../integrations/) - 设置您的 AI 工具
3. [配置指南](../configuration/configuration.md) - 自定义您的设置

---
*AI Common Notify - 简化 AI 编程工具的通知*