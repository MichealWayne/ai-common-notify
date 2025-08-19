import notifier from 'node-notifier';
import { type Config, getConfig, getNotifyScripts, getScriptTimeout } from '../core/ConfigManager';
import * as fs from 'fs';
import { ScriptExecutor, type ScriptEnvironment } from './ScriptExecutor';
import { logger } from '../utils/logger';

export interface NotificationOptions {
  title: string;
  message: string;
  urgency?: 'low' | 'normal' | 'critical' | undefined;
  timeout?: number | undefined;
  sound?: boolean | undefined;
  icon?: string | undefined;
  toolName?: string | undefined;
  projectName?: string | undefined;
}

/**
 * NotificationManager负责管理和发送系统通知
 * 支持多平台通知、自定义脚本执行和配置管理
 *
 * @example
 * ```typescript
 * const manager = new NotificationManager();
 * await manager.sendNotification({
 *   title: 'Task Complete',
 *   message: 'Your task has finished successfully',
 *   urgency: 'normal'
 * });
 * ```
 */
export class NotificationManager {
  private config: Config;
  private scriptExecutor: ScriptExecutor;

  /**
   * 创建NotificationManager实例
   * 自动加载配置并初始化脚本执行器
   */
  constructor() {
    this.config = getConfig();
    this.scriptExecutor = new ScriptExecutor(getScriptTimeout());
  }

  /**
   * 发送系统通知
   * 支持多平台通知、自定义脚本执行和配置验证
   *
   * @param options - 通知选项配置
   * @param options.title - 通知标题（必需）
   * @param options.message - 通知消息内容（必需）
   * @param options.urgency - 通知紧急程度：'low' | 'normal' | 'critical'
   * @param options.timeout - 通知显示时间（秒），0表示永久显示
   * @param options.sound - 是否播放通知声音
   * @param options.icon - 自定义图标路径
   * @param options.toolName - 触发通知的工具名称
   * @param options.projectName - 项目名称
   * @returns Promise<boolean> 发送成功返回true，失败返回false
   *
   * @example
   * ```typescript
   * const success = await manager.sendNotification({
   *   title: 'Build Complete',
   *   message: 'Your project has been built successfully',
   *   urgency: 'normal',
   *   timeout: 5,
   *   sound: true
   * });
   * ```
   */
  async sendNotification(options: NotificationOptions): Promise<boolean> {
    // 构建脚本环境变量
    const scriptEnv: ScriptEnvironment = {
      NOTIFY_TITLE: options.title,
      NOTIFY_MESSAGE: options.message,
      NOTIFY_URGENCY: options.urgency || this.config.notifications.defaultUrgency,
      NOTIFY_TIMEOUT: (options.timeout || this.config.notifications.defaultTimeout).toString(),
      NOTIFY_SOUND: (options.sound !== undefined
        ? options.sound
        : this.config.notifications.defaultSound
      ).toString(),
      NOTIFY_PROJECT_NAME: options.projectName || '',
      NOTIFY_TOOL_NAME: options.toolName || '',
      NOTIFY_TIMESTAMP: new Date().toISOString(),
    };

    // 执行通知脚本
    const scripts = getNotifyScripts();
    logger.info(
      'NotificationManager',
      `Found ${scripts.length} notify scripts`,
      { scripts },
      'sendNotification',
      __filename
    );

    for (const script of scripts) {
      if (script.enabled) {
        logger.info(
          'NotificationManager',
          `Executing notify script: ${script.path}`,
          { script },
          'sendNotification',
          __filename
        );
        try {
          // 检查脚本文件是否存在
          if (!(await this.checkScriptFileExists(script.path))) {
            logger.warn(
              'NotificationManager',
              `Notify script file not found: ${script.path}`,
              undefined,
              'sendNotification',
              __filename
            );
            this.sendScriptErrorNotification(
              `Script file not found`,
              `The notify script file was not found: ${script.path}`
            );
            continue;
          }

          const result = await this.scriptExecutor.execute(script, scriptEnv);
          if (result) {
            logger.info(
              'NotificationManager',
              `Notify script executed successfully: ${script.path}`,
              { scriptPath: script.path },
              'sendNotification',
              __filename
            );
          } else {
            logger.warn(
              'NotificationManager',
              `Notify script execution failed: ${script.path}`,
              { scriptPath: script.path },
              'sendNotification',
              __filename
            );
          }
        } catch (error: any) {
          logger.error(
            'NotificationManager',
            `Notify script execution error: ${error.message}`,
            { error },
            'sendNotification',
            __filename
          );
        }
      } else {
        logger.info(
          'NotificationManager',
          `Notify script is disabled: ${script.path}`,
          { script },
          'sendNotification',
          __filename
        );
      }
    }

    try {
      // Determine icon path
      let iconPath = options.icon;

      // If no icon specified in options, check for tool-specific icon
      if (!iconPath && options.toolName) {
        const toolConfig = this.config.tools[options.toolName];
        if (toolConfig && toolConfig.icon) {
          iconPath = toolConfig.icon;
        }
      }

      // If still no icon, use default icon
      if (!iconPath) {
        iconPath = this.config.notifications.defaultIcon;
      }

      // Apply default values from config
      // 如果options.timeout为undefined，则使用配置的默认值
      // 如果配置的默认值为0，则表示永久显示（在node-notifier中设置为false）
      const timeoutValue =
        options.timeout !== undefined ? options.timeout : this.config.notifications.defaultTimeout;
      const notificationTimeout = timeoutValue === 0 ? false : timeoutValue;

      const notificationOptions = {
        title: options.title,
        message: options.message,
        urgency: options.urgency || this.config.notifications.defaultUrgency,
        timeout: notificationTimeout,
        sound: options.sound !== undefined ? options.sound : this.config.notifications.defaultSound,
        icon: iconPath,
      };

      // Platform-specific adjustments
      const platform = process.platform;

      // Adjust options based on platform and config
      if (platform === 'win32') {
        // Windows-specific options
        if (!this.config.platforms.windows.soundEnabled) {
          notificationOptions.sound = false;
        }
      } else if (platform === 'darwin') {
        // macOS-specific options
        if (!this.config.platforms.macos.soundEnabled) {
          notificationOptions.sound = false;
        }
        // On macOS, sound is specified as a string, not boolean
        if (notificationOptions.sound) {
          (notificationOptions as any).sound = 'Glass';
        }
      } else if (platform === 'linux') {
        // Linux-specific options
        if (!this.config.platforms.linux.soundEnabled) {
          notificationOptions.sound = false;
        }

        // Map urgency levels based on config
        const urgencyMapping = this.config.platforms.linux.urgencyMapping;
        switch (notificationOptions.urgency) {
          case 'low':
            (notificationOptions as any).urgency = urgencyMapping.low;
            break;
          case 'normal':
            (notificationOptions as any).urgency = urgencyMapping.normal;
            break;
          case 'critical':
            (notificationOptions as any).urgency = urgencyMapping.critical;
            break;
        }
      }

      // Convert timeout to milliseconds for node-notifier (only if it's a number)
      const timeoutMs =
        typeof notificationOptions.timeout === 'number'
          ? notificationOptions.timeout * 1000
          : undefined;

      // Create the options object for node-notifier
      const notifierOptions: any = {
        title: notificationOptions.title,
        message: notificationOptions.message,
      };

      // Add icon if it exists and is a valid file
      if (notificationOptions.icon && fs.existsSync(notificationOptions.icon)) {
        notifierOptions.icon = notificationOptions.icon;
      }

      // Add platform-specific options
      if (platform === 'win32') {
        if (typeof timeoutMs === 'number') {
          notifierOptions.timeout = timeoutMs;
        }
        if (notificationOptions.sound) {
          notifierOptions.sound = true;
        }
      } else if (platform === 'darwin') {
        if (notificationOptions.timeout !== false) {
          notifierOptions.timeout = notificationOptions.timeout;
        }
        if ((notificationOptions as any).sound) {
          notifierOptions.sound = (notificationOptions as any).sound;
        }
      } else if (platform === 'linux') {
        if (notificationOptions.timeout !== false) {
          notifierOptions.timeout = notificationOptions.timeout;
        }
        if (notificationOptions.sound) {
          notifierOptions.sound = true;
        }
        (notifierOptions as any).urgency = (notificationOptions as any).urgency;
      }

      // Create a promise to handle the notification result
      const result = await new Promise<boolean>(resolve => {
        try {
          // 检查 notifier 对象是否有 notify 方法
          if (typeof notifier.notify !== 'function') {
            logger.error(
              'NotificationManager',
              'node-notifier is not properly initialized or does not have a notify method',
              undefined,
              'sendNotification',
              __filename
            );
            resolve(false);
            return;
          }

          notifier.notify(notifierOptions, err => {
            if (err) {
              logger.error(
                'NotificationManager',
                'Notification error',
                { error: err },
                'sendNotification',
                __filename
              );
              resolve(false);
              return;
            }

            resolve(true);
          });
        } catch (error) {
          logger.error(
            'NotificationManager',
            'Error sending notification',
            { error },
            'sendNotification',
            __filename
          );
          resolve(false);
        }
      });

      return result;
    } catch (error: any) {
      logger.error(
        'NotificationManager',
        'Error sending notification',
        { error },
        'sendNotification',
        __filename
      );
      return false;
    }
  }

  /**
   * 检查脚本文件是否存在
   * @param scriptPath 脚本路径
   * @returns 文件是否存在
   */
  private async checkScriptFileExists(scriptPath: string): Promise<boolean> {
    try {
      await fs.promises.access(scriptPath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 发送脚本错误通知
   * @param title 通知标题
   * @param message 通知消息
   */
  private async sendScriptErrorNotification(title: string, message: string): Promise<void> {
    try {
      notifier.notify({
        title: `[AI Common Notify] ${title}`,
        message: message,
        sound: true,
        wait: false,
      });
    } catch (error) {
      logger.error(
        'NotificationManager',
        `Failed to send script error notification`,
        { error },
        'sendScriptErrorNotification',
        __filename
      );
    }
  }
}
