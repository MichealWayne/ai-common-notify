/**
 * 配置模板，用于减少代码重复
 */

export interface MCPServerConfig {
  command: string;
  args: string[];
  disabled?: boolean;
  autoApprove?: string[];
}

export interface HookConfig {
  matcher: string;
  hooks: Array<{
    type: string;
    command: string;
  }>;
}

/**
 * 创建标准MCP服务器配置
 * @param serverName - 服务器名称
 * @param options - 可选配置项
 * @returns MCP服务器配置对象
 */
export function createMCPServerConfig(
  serverName: string = 'NotificationServer',
  options: Partial<MCPServerConfig> = {}
): Record<string, MCPServerConfig> {
  return {
    [serverName]: {
      command: 'ai-common-notify',
      args: ['mcp'],
      disabled: false,
      autoApprove: [],
      ...options,
    },
  };
}

/**
 * 创建标准Hook配置
 * @param hookName - Hook名称
 * @param command - 执行命令
 * @param matcher - 匹配规则
 * @returns Hook配置对象
 */
export function createHookConfig(
  hookName: string = 'Notification',
  command: string = 'ai-common-notify hook',
  matcher: string = '.*'
): Record<string, HookConfig[]> {
  return {
    [hookName]: [
      {
        matcher,
        hooks: [
          {
            type: 'command',
            command,
          },
        ],
      },
    ],
  };
}

/**
 * 创建Windsurf规则内容
 * @returns Windsurf规则文件内容
 */
export function createWindsurfRulesContent(): string {
  return `
## 任务结束规则

每当你完成所有步骤后，无论结果如何，都立即调用 MCP工具 NotificationServer(send_notification)发送消息通知。

### 通知配置
notifications:
  enabled: true
  rules:
    - event: on_success
      enabled: true
      message: "任务执行成功"
      urgency: normal
    - event: on_failure
      enabled: true
      message: "任务执行失败"
      urgency: critical
    - event: on_error
      enabled: true
      message: "发生错误"
      urgency: critical

### MCP 服务器配置
mcp_servers:
  - name: NotificationServer
    enabled: true
    config:
      default_urgency: normal
      default_timeout: 5
      retry_count: 3
      play_sound: true
`;
}

/**
 * 工具配置映射
 */
export const TOOL_CONFIGS = {
  cursor: {
    configPath: '.cursor/mcp.json',
    createConfig: () => ({ mcpServers: createMCPServerConfig() }),
  },
  claudecode: {
    configPaths: ['.claude/settings.json', 'claude-config.json'],
    createConfig: () => ({ hooks: createHookConfig() }),
  },
  windsurf: {
    configPath: '.windsurf/mcp.json',
    rulesPath: '.windsurfrules',
    createConfig: () => ({ mcpServers: createMCPServerConfig() }),
    createRules: createWindsurfRulesContent,
  },
  'gemini-cli': {
    configPath: '.gemini/mcp.json',
    createConfig: () => ({ mcpServers: createMCPServerConfig() }),
  },
  kiro: {
    configPath: '.kiro/settings/mcp.json',
    createConfig: () => ({ mcpServers: createMCPServerConfig() }),
  },
} as const;
