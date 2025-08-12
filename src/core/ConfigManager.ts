import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
}

// Define the default configuration
const DEFAULT_CONFIG: Config = {
  notifications: {
    defaultTimeout: 10,
    defaultSound: true,
    defaultUrgency: 'normal',
    defaultIcon: path.join(__dirname, '../assets/icons/app-icon.png'),
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
    'cursor': {
      icon: path.join(__dirname, '../assets/icons/tool-cursor.png'),
    },
    'windsurf': {
      icon: path.join(__dirname, '../assets/icons/tool-windsurf.png'),
    },
    'kiro': {
      icon: path.join(__dirname, '../assets/icons/tool-kiro.png'),
    }
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

  return merged;
}

// Export a function to get the config
let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}