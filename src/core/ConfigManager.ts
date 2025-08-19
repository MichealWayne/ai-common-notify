import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ScriptConfig } from './ScriptExecutor';
import { validateConfig } from '../utils/configValidator';

// Define the configuration interface
export interface Config {
  notifications: {
    defaultTimeout: number;
    defaultSound: boolean;
    defaultUrgency: 'low' | 'normal' | 'critical';
    defaultIcon?: string;
  };
  platforms: {
    windows: {
      soundEnabled: boolean;
    };
    macos: {
      soundEnabled: boolean;
    };
    linux: {
      soundEnabled: boolean;
      urgencyMapping: {
        low: string;
        normal: string;
        critical: string;
      };
    };
  };
  tools: {
    [key: string]: {
      icon?: string;
    };
  };
  scripts: {
    timeout: number;
    notify: ScriptConfig[];
  };
  hooks?: {
    [key: string]: Array<{
      matcher: string;
      hooks: Array<{
        type: string;
        path?: string;
        command?: string;
        enabled?: boolean;
      }>;
    }>;
  };
  logging?: {
    retentionHours?: number;
  };
}

// Define the default configuration
const DEFAULT_CONFIG: Config = {
  notifications: {
    defaultTimeout: 0, // 0表示永久显示
    defaultSound: true,
    defaultUrgency: 'normal',
    defaultIcon: path.join(__dirname, '../assets/icons/i-ai-notify_logo.icns'),
  },
  platforms: {
    windows: {
      soundEnabled: true,
    },
    macos: {
      soundEnabled: true,
    },
    linux: {
      soundEnabled: true,
      urgencyMapping: {
        low: 'low',
        normal: 'normal',
        critical: 'critical',
      },
    },
  },
  tools: {
    'claude-code': {
      icon: path.join(__dirname, '../assets/icons/tool-claude.png'),
    },
    cursor: {
      icon: path.join(__dirname, '../assets/icons/tool-cursor.png'),
    },
    windsurf: {
      icon: path.join(__dirname, '../assets/icons/tool-windsurf.png'),
    },
    kiro: {
      icon: path.join(__dirname, '../assets/icons/tool-kiro.png'),
    },
  },
  scripts: {
    timeout: 30000,
    notify: [],
  },
  logging: {
    retentionHours: 24, // 默认保留24小时的日志
  },
};

// Function to get the global config directory path
function getGlobalConfigDir(): string {
  const homeDir = os.homedir();
  if (os.platform() === 'win32') {
    return path.join(process.env['APPDATA'] || homeDir, 'ai-common-notify');
  } else {
    return path.join(homeDir, '.config', 'ai-common-notify');
  }
}

// Function to get the global config file path
function getGlobalConfigFile(): string {
  // 允许通过环境变量覆盖配置文件路径，便于测试
  const configPath = process.env['AI_COMMON_NOTIFY_CONFIG_PATH'];
  if (configPath) {
    return configPath;
  }
  return path.join(getGlobalConfigDir(), 'config.json');
}

// Function to get the project config file path
function getProjectConfigFile(): string {
  return path.join(process.cwd(), '.ai-notify.json');
}

// Function to load and merge configurations
export function loadConfig(): Config {
  let config = { ...DEFAULT_CONFIG };

  // Load global config if it exists
  const globalConfigFile = getGlobalConfigFile();
  if (fs.existsSync(globalConfigFile)) {
    try {
      const globalConfig = JSON.parse(fs.readFileSync(globalConfigFile, 'utf-8'));
      config = mergeConfigs(config, globalConfig);
    } catch (error) {
      console.error(`Error reading global config file: ${error}`);
    }
  }

  // Load project config if it exists
  const projectConfigFile = getProjectConfigFile();
  if (fs.existsSync(projectConfigFile)) {
    try {
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigFile, 'utf-8'));
      config = mergeConfigs(config, projectConfig);
    } catch (error) {
      console.error(`Error reading project config file: ${error}`);
    }
  }

  // 验证配置
  const validation = validateConfig(config);
  if (!validation.isValid) {
    console.warn('Configuration validation failed:', validation.errors);
    // 不抛出错误，而是使用默认配置并记录警告
  }
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
  }

  return config;
}

// Helper function to merge configs
function mergeConfigs(base: Config, override: any): Config {
  const merged = { ...base };

  // Merge notifications
  if (override.notifications) {
    merged.notifications = {
      ...merged.notifications,
      ...override.notifications,
    };
  }

  // Merge platforms
  if (override.platforms) {
    if (override.platforms.windows) {
      merged.platforms.windows = {
        ...merged.platforms.windows,
        ...override.platforms.windows,
      };
    }
    if (override.platforms.macos) {
      merged.platforms.macos = {
        ...merged.platforms.macos,
        ...override.platforms.macos,
      };
    }
    if (override.platforms.linux) {
      merged.platforms.linux = {
        ...merged.platforms.linux,
        ...override.platforms.linux,
        urgencyMapping: {
          ...merged.platforms.linux.urgencyMapping,
          ...override.platforms.linux.urgencyMapping,
        },
      };
    }
  }

  // Merge tools
  if (override.tools) {
    merged.tools = {
      ...merged.tools,
      ...override.tools,
    };
  }

  // Merge scripts
  if (override.scripts) {
    merged.scripts = {
      ...merged.scripts,
      ...override.scripts,
      notify: override.scripts.notify || merged.scripts.notify,
    };

    // 为了向后兼容，如果配置中仍有pre_notify或post_notify，则合并到notify中
    if (override.scripts.pre_notify || override.scripts.post_notify) {
      const preScripts = override.scripts.pre_notify || [];
      const postScripts = override.scripts.post_notify || [];
      merged.scripts.notify = [...preScripts, ...postScripts, ...merged.scripts.notify];
    }
  }

  // Merge hooks
  if (override.hooks) {
    // 如果基础配置中没有hooks，则初始化为空对象
    if (!merged.hooks) {
      merged.hooks = {};
    }
    
    // 合并hooks配置
    for (const [eventType, hookConfigs] of Object.entries(override.hooks)) {
      if (Array.isArray(hookConfigs)) {
        // 如果事件类型已存在，则合并配置，否则直接添加
        if (merged.hooks[eventType]) {
          merged.hooks[eventType] = [...merged.hooks[eventType], ...hookConfigs];
        } else {
          merged.hooks[eventType] = hookConfigs;
        }
      }
    }
  }

  return merged;
}

// Export a function to get the config
let cachedConfig: Config | null = null;
let lastConfigCheck: number = 0;
const CONFIG_CACHE_TTL = 5000; // 5秒缓存时间

export function getConfig(): Config {
  const now = Date.now();

  // 如果缓存存在且未过期，直接返回
  if (cachedConfig && now - lastConfigCheck < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  // 重新加载配置
  cachedConfig = loadConfig();
  lastConfigCheck = now;
  return cachedConfig;
}

/**
 * 清除配置缓存，强制重新加载
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  lastConfigCheck = 0;
}

/**
 * 重新加载配置
 */
export function reloadConfig(): Config {
  clearConfigCache();
  return getConfig();
}

// Helper functions to get script configurations
export function getNotifyScripts(): ScriptConfig[] {
  const config = getConfig();
  return config.scripts?.notify || [];
}

export function getScriptTimeout(): number {
  const config = getConfig();
  return config.scripts?.timeout || 30000;
}
