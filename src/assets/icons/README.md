# 工具图标说明

本目录包含各种 AI 编程工具的图标文件，用于通知系统中显示工具特定的图标。

## 图标文件

- `tool-claude.png` - Claude AI 助手图标（来源：Anthropic 官方图标）
- `tool-cursor.png` - Cursor 编辑器图标（来源：Cursor 官方仓库）
- `tool-windsurf.png` - Windsurf 编辑器图标（来源：Windsurf 官方网站）
- `tool-kiro.png` - Kiro AI 助手图标（自定义设计）

## 图标规格

- 格式：PNG
- 推荐尺寸：64x64 像素或更高
- 背景：透明或适合通知系统的背景

## 使用方式

这些图标会在配置验证时被检查，并在发送通知时根据工具类型自动选择合适的图标。

## 添加新图标

如需为新工具添加图标：

1. 将图标文件放置在此目录
2. 命名格式：`tool-{工具名}.png`
3. 在 `src/core/ConfigManager.ts` 中添加对应的配置
4. 重新构建项目：`npm run build`
