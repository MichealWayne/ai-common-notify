import { Config } from '../core/ConfigManager';
import * as fs from 'fs';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证配置对象
 * @param config - 配置对象
 * @returns 验证结果
 */
export function validateConfig(config: Config): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证通知配置
  if (
    typeof config.notifications?.defaultTimeout !== 'number' ||
    config.notifications.defaultTimeout < 0
  ) {
    errors.push('notifications.defaultTimeout must be a number >= 0');
  }

  if (!['low', 'normal', 'critical'].includes(config.notifications?.defaultUrgency)) {
    errors.push('notifications.defaultUrgency must be one of: low, normal, critical');
  }

  if (typeof config.notifications?.defaultSound !== 'boolean') {
    errors.push('notifications.defaultSound must be a boolean');
  }

  // 验证默认图标路径
  if (config.notifications?.defaultIcon !== undefined && typeof config.notifications.defaultIcon !== 'string') {
    errors.push('notifications.defaultIcon must be a string');
  } else if (config.notifications?.defaultIcon && !fs.existsSync(config.notifications.defaultIcon)) {
    warnings.push(`Default icon file not found: ${config.notifications.defaultIcon}`);
  }

  // 验证平台配置
  if (config.platforms) {
    ['windows', 'macos', 'linux'].forEach(platform => {
      const platformConfig = config.platforms[platform as keyof typeof config.platforms];
      if (platformConfig && typeof platformConfig.soundEnabled !== 'boolean') {
        errors.push(`platforms.${platform}.soundEnabled must be a boolean`);
      }
    });

    // 验证Linux特有配置
    if (config.platforms.linux?.urgencyMapping) {
      const mapping = config.platforms.linux.urgencyMapping;
      ['low', 'normal', 'critical'].forEach(level => {
        if (typeof mapping[level as keyof typeof mapping] !== 'string') {
          errors.push(`platforms.linux.urgencyMapping.${level} must be a string`);
        }
      });
    }
  }

  // 验证脚本配置
  if (typeof config.scripts?.timeout !== 'number' || config.scripts.timeout <= 0) {
    errors.push('scripts.timeout must be a number > 0');
  }

  // 验证脚本路径
  if (config.scripts?.notify && Array.isArray(config.scripts.notify)) {
    for (let i = 0; i < config.scripts.notify.length; i++) {
      const script = config.scripts.notify[i];
      if (!script || !script.path || typeof script.path !== 'string') {
        errors.push(`scripts.notify[${i}].path cannot be empty and must be a string`);
        continue;
      }

      // 检查脚本文件是否存在
      if (!fs.existsSync(script.path)) {
        warnings.push(`Script file not found: ${script.path}`);
      }

      if (script.type && !['node', 'shell'].includes(script.type)) {
        warnings.push(`Unknown script type: ${script.type} for script ${script.path}`);
      }

      if (typeof script.enabled !== 'boolean') {
        warnings.push(`scripts.notify[${i}].enabled should be a boolean, defaulting to true`);
      }
    }
  }

  // 验证工具配置
  if (config.tools && typeof config.tools === 'object') {
    Object.entries(config.tools).forEach(([toolName, toolConfig]) => {
      if (toolConfig.icon && typeof toolConfig.icon === 'string') {
        if (!fs.existsSync(toolConfig.icon)) {
          warnings.push(`Icon file not found for tool ${toolName}: ${toolConfig.icon}`);
        }
      }
    });
  }

  // 验证日志配置
  if (config.logging?.retentionHours !== undefined) {
    if (typeof config.logging.retentionHours !== 'number' || config.logging.retentionHours <= 0) {
      errors.push('logging.retentionHours must be a number > 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证通知选项
 * @param options - 通知选项
 * @returns 验证结果
 */
export function validateNotificationOptions(options: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!options.title || typeof options.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (options.title.length > 100) {
    warnings.push('title is longer than 100 characters, may be truncated');
  }

  if (!options.message || typeof options.message !== 'string') {
    errors.push('message is required and must be a string');
  } else if (options.message.length > 1000) {
    warnings.push('message is longer than 1000 characters, may be truncated');
  }

  if (options.urgency && !['low', 'normal', 'critical'].includes(options.urgency)) {
    errors.push('urgency must be one of: low, normal, critical');
  }

  if (options.timeout !== undefined) {
    if (typeof options.timeout !== 'number' || options.timeout < 0) {
      errors.push('timeout must be a number >= 0');
    }
  }

  if (options.sound !== undefined && typeof options.sound !== 'boolean') {
    errors.push('sound must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
