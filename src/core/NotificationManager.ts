import notifier from 'node-notifier';
import { type Config, getConfig } from '../core/ConfigManager';
import * as fs from 'fs';

export interface NotificationOptions {
  title: string;
  message: string;
  urgency?: 'low' | 'normal' | 'critical' | undefined;
  timeout?: number | undefined;
  sound?: boolean | undefined;
  icon?: string | undefined;
  toolName?: string | undefined;
}

export class NotificationManager {
  private config: Config;

  constructor() {
    this.config = getConfig();
  }

  /**
   * Send a notification using node-notifier
   *
   * @param options - Notification options
   * @returns Promise that resolves to true if notification was sent successfully
   */
  async sendNotification(options: NotificationOptions): Promise<boolean> {
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
      const notificationOptions = {
        title: options.title,
        message: options.message,
        urgency: options.urgency || this.config.notifications.defaultUrgency,
        timeout: options.timeout || this.config.notifications.defaultTimeout,
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

      // Convert timeout to milliseconds for node-notifier
      const timeoutMs = notificationOptions.timeout * 1000;

      // Create the options object for node-notifier
      const notifierOptions: any = {
        title: notificationOptions.title,
        message: notificationOptions.message,
        wait: false, // Don't wait for user interaction
      };

      // Add icon if it exists and is a valid file
      if (notificationOptions.icon && fs.existsSync(notificationOptions.icon)) {
        notifierOptions.icon = notificationOptions.icon;
      }

      // Add platform-specific options
      if (platform === 'win32') {
        notifierOptions.timeout = timeoutMs;
        if (notificationOptions.sound) {
          notifierOptions.sound = true;
        }
      } else if (platform === 'darwin') {
        notifierOptions.timeout = notificationOptions.timeout;
        if ((notificationOptions as any).sound) {
          notifierOptions.sound = (notificationOptions as any).sound;
        }
      } else if (platform === 'linux') {
        notifierOptions.timeout = notificationOptions.timeout;
        if (notificationOptions.sound) {
          notifierOptions.sound = true;
        }
        (notifierOptions as any).urgency = (notificationOptions as any).urgency;
      }

      // Send notification
      return new Promise<boolean>(resolve => {
        // 检查 notifier 对象是否有 notify 方法
        if (typeof notifier.notify !== 'function') {
          console.error(
            'Error: node-notifier is not properly initialized or does not have a notify method'
          );
          resolve(false);
          return;
        }

        notifier.notify(notifierOptions, err => {
          if (err) {
            console.error('Notification error:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}
