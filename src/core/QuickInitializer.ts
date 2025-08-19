import * as path from 'path';
import { promises as fsp } from 'fs';
import { logger } from '../utils/logger';
import { updateJsonFile } from '../utils/configUpdater';
import { isDirectoryExists, isFileExists, ensureDirectoryExists } from '../utils/commonUtils';
import { extractErrorInfo } from '../utils/errorHandler';
import {
  createMCPServerConfig,
  createHookConfig,
  createWindsurfRulesContent,
} from './ConfigTemplates';

/**
 * QuickInitializer类用于快速初始化各种AI工具的配置
 * 支持Cursor、Claude Code、Windsurf、Gemini CLI和Kiro等工具
 *
 * @example
 * ```typescript
 * const initializer = new QuickInitializer('/path/to/project');
 * await initializer.initializeAll();
 * ```
 */
export class QuickInitializer {
  private projectRoot: string;

  /**
   * 创建QuickInitializer实例
   * @param projectRoot - 项目根目录路径，默认为当前工作目录
   */
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 自动检测并初始化所有支持的AI工具
   * 会扫描项目目录，检测已安装的AI工具，并为每个工具生成相应的配置文件
   *
   * @throws {Error} 当某个工具初始化失败时会记录错误但不会中断整个过程
   * @example
   * ```typescript
   * const initializer = new QuickInitializer();
   * await initializer.initializeAll();
   * ```
   */
  async initializeAll(): Promise<void> {
    logger.info('QuickInitializer', 'Starting quick initialization for all AI tools');

    // 检测已安装的AI工具
    const detectedTools = await this.detectInstalledTools();

    // 为每个检测到的工具生成配置
    for (const tool of detectedTools) {
      try {
        await this.initializeTool(tool);
        logger.info('QuickInitializer', `Successfully initialized ${tool}`);
      } catch (error: unknown) {
        const errorInfo = extractErrorInfo(error);
        logger.error('QuickInitializer', `Failed to initialize ${tool}`, {
          error: errorInfo.message,
          code: errorInfo.code,
        });
      }
    }

    logger.info('QuickInitializer', 'Quick initialization completed');
  }

  /**
   * 初始化指定的AI工具配置
   *
   * @param toolName - 工具名称，支持: cursor, claudecode, windsurf, gemini-cli, kiro
   * @throws {Error} 当工具名称不支持或初始化失败时抛出错误
   * @example
   * ```typescript
   * await initializer.initializeTool('cursor');
   * ```
   */
  async initializeTool(toolName: string): Promise<void> {
    switch (toolName.toLowerCase()) {
      case 'cursor':
        await this.initializeCursor();
        break;
      case 'claudecode':
        await this.initializeClaudeCode();
        break;
      case 'windsurf':
        await this.initializeWindsurf();
        break;
      case 'gemini-cli':
        await this.initializeGeminiCLI();
        break;
      case 'kiro':
        await this.initializeKiro();
        break;
      default:
        throw new Error(`Unsupported tool: ${toolName}`);
    }
  }

  /**
   * 检测项目中已安装的AI工具
   * 通过检查特定的配置目录或文件来判断工具是否已安装
   *
   * @returns Promise<string[]> 已检测到的工具名称列表
   * @private
   */
  private async detectInstalledTools(): Promise<string[]> {
    const tools: string[] = [];

    // 检查Cursor
    if (await isDirectoryExists(path.join(this.projectRoot, '.cursor'))) {
      tools.push('Cursor');
    }

    // 检查Claude Code
    if (
      (await isFileExists(path.join(this.projectRoot, 'claude-config.json'))) ||
      (await isDirectoryExists(path.join(this.projectRoot, '.claude')))
    ) {
      tools.push('ClaudeCode');
    }

    // 检查Windsurf
    if (await isDirectoryExists(path.join(this.projectRoot, '.windsurf'))) {
      tools.push('Windsurf');
    }

    // 检查Gemini CLI
    if (await isDirectoryExists(path.join(this.projectRoot, '.gemini'))) {
      tools.push('Gemini-cli');
    }

    // 检查Kiro
    if (await isDirectoryExists(path.join(this.projectRoot, '.kiro'))) {
      tools.push('Kiro');
    }

    return tools;
  }

  /**
   * 初始化Cursor编辑器的MCP服务器配置
   * 创建.cursor/mcp.json文件，配置NotificationServer
   *
   * @private
   * @throws {Error} 当文件操作失败时抛出错误
   */
  private async initializeCursor(): Promise<void> {
    const configPath = path.join(this.projectRoot, '.cursor', 'mcp.json');

    // 确保目录存在
    await ensureDirectoryExists(path.join(this.projectRoot, '.cursor'));

    // 使用配置模板
    const mcpConfig = { mcpServers: createMCPServerConfig() };

    // 更新或创建配置文件
    await updateJsonFile(configPath, mcpConfig);
    logger.info('QuickInitializer', 'Cursor configuration updated');
  }

  /**
   * 初始化Claude Code配置
   */
  private async initializeClaudeCode(): Promise<void> {
    // 使用配置模板
    const hookConfig = { hooks: createHookConfig() };

    // 检查是否存在.claude目录
    if (await isDirectoryExists(path.join(this.projectRoot, '.claude'))) {
      // 使用新配置文件路径
      const configPath = path.join(this.projectRoot, '.claude', 'settings.json');
      await ensureDirectoryExists(path.join(this.projectRoot, '.claude'));
      await updateJsonFile(configPath, hookConfig);
    } else {
      // 使用旧配置文件路径
      const configPath = path.join(this.projectRoot, 'claude-config.json');
      await ensureDirectoryExists(this.projectRoot);
      await updateJsonFile(configPath, hookConfig);
    }

    logger.info('QuickInitializer', 'Claude Code configuration updated');
  }

  /**
   * 初始化Windsurf配置
   */
  private async initializeWindsurf(): Promise<void> {
    // 更新MCP配置
    const mcpConfigPath = path.join(this.projectRoot, '.windsurf', 'mcp.json');
    await ensureDirectoryExists(path.join(this.projectRoot, '.windsurf'));

    const mcpConfig = { mcpServers: createMCPServerConfig() };
    await updateJsonFile(mcpConfigPath, mcpConfig);

    // 更新规则文件
    const rulesPath = path.join(this.projectRoot, '.windsurfrules');
    const rulesContent = createWindsurfRulesContent();

    // 如果文件不存在则创建，如果存在则追加
    await this.appendToFile(rulesPath, rulesContent);

    logger.info('QuickInitializer', 'Windsurf configuration updated');
  }

  /**
   * 初始化Gemini CLI配置
   */
  private async initializeGeminiCLI(): Promise<void> {
    const configPath = path.join(this.projectRoot, '.gemini', 'mcp.json');

    // 确保目录存在
    await ensureDirectoryExists(path.join(this.projectRoot, '.gemini'));

    // 使用配置模板
    const mcpConfig = { mcpServers: createMCPServerConfig() };

    // 更新或创建配置文件
    await updateJsonFile(configPath, mcpConfig);
    logger.info('QuickInitializer', 'Gemini CLI configuration updated');
  }

  /**
   * 初始化Kiro配置
   */
  private async initializeKiro(): Promise<void> {
    const configPath = path.join(this.projectRoot, '.kiro', 'settings', 'mcp.json');

    // 确保目录存在
    await ensureDirectoryExists(path.join(this.projectRoot, '.kiro', 'settings'));

    // 使用配置模板
    const mcpConfig = { mcpServers: createMCPServerConfig() };

    // 更新或创建配置文件
    await updateJsonFile(configPath, mcpConfig);
    logger.info('QuickInitializer', 'Kiro configuration updated');
  }

  /**
   * 智能追加内容到文件
   * 检查文件是否已包含相关配置，避免重复添加
   *
   * @param filePath - 目标文件路径
   * @param content - 要追加的内容
   * @private
   */
  private async appendToFile(filePath: string, content: string): Promise<void> {
    try {
      // 检查文件是否已包含内容
      let fileContent = '';
      try {
        fileContent = await fsp.readFile(filePath, 'utf8');
      } catch (error) {
        // 文件不存在，将创建新文件
      }

      // 检查是否已经包含了我们特定的通知配置
      // 我们检查几个关键标识来确定是否已经配置过
      const hasNotificationServer = fileContent.includes('NotificationServer');
      const hasSendNotification = fileContent.includes('send_notification');
      const hasMcpServers = fileContent.includes('mcp_servers:') || fileContent.includes('mcp:');

      // 如果文件不包含我们的通知配置，则追加
      // 这样可以避免重复添加相同的配置
      if (!(hasNotificationServer && hasSendNotification && hasMcpServers)) {
        await fsp.appendFile(filePath, content);
      }
    } catch (error: unknown) {
      const errorInfo = extractErrorInfo(error);
      logger.warn('QuickInitializer', `Failed to append to file ${filePath}`, {
        error: errorInfo.message,
        code: errorInfo.code,
      });
    }
  }
}
