import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getConfig, loadConfig } from '../src/core/ConfigManager';

describe('ConfigManager', () => {
  const globalConfigDir = path.join(os.homedir(), '.config', 'ai-common-notify');
  const globalConfigFile = path.join(globalConfigDir, 'config.json');
  const projectConfigFile = path.join(process.cwd(), '.ai-notify.json');

  // Clean up config files before and after tests
  beforeEach(() => {
    if (fs.existsSync(globalConfigFile)) {
      fs.unlinkSync(globalConfigFile);
    }
    if (fs.existsSync(projectConfigFile)) {
      fs.unlinkSync(projectConfigFile);
    }
  });

  afterEach(() => {
    if (fs.existsSync(globalConfigFile)) {
      fs.unlinkSync(globalConfigFile);
    }
    if (fs.existsSync(projectConfigFile)) {
      fs.unlinkSync(projectConfigFile);
    }
  });

  it('should return default config when no config files exist', () => {
    const config = loadConfig();
    expect(config.notifications.defaultTimeout).toBe(0);
    expect(config.notifications.defaultSound).toBe(true);
    expect(config.notifications.defaultUrgency).toBe('normal');
  });

  it('should load global config when it exists', () => {
    // Create global config directory if it doesn't exist
    if (!fs.existsSync(globalConfigDir)) {
      fs.mkdirSync(globalConfigDir, { recursive: true });
    }

    // Write global config file
    const globalConfig = {
      notifications: {
        defaultTimeout: 20,
        defaultSound: false,
      },
    };
    fs.writeFileSync(globalConfigFile, JSON.stringify(globalConfig, null, 2));

    const config = loadConfig();
    expect(config.notifications.defaultTimeout).toBe(20);
    expect(config.notifications.defaultSound).toBe(false);
    expect(config.notifications.defaultUrgency).toBe('normal'); // Should still be default
  });

  it('should load project config when it exists', () => {
    // Write project config file
    const projectConfig = {
      notifications: {
        defaultUrgency: 'critical',
      },
    };
    fs.writeFileSync(projectConfigFile, JSON.stringify(projectConfig, null, 2));

    const config = loadConfig();
    expect(config.notifications.defaultTimeout).toBe(0); // Should still be default
    expect(config.notifications.defaultSound).toBe(true); // Should still be default
    expect(config.notifications.defaultUrgency).toBe('critical');
  });

  it('should prioritize project config over global config', () => {
    // Create global config directory if it doesn't exist
    if (!fs.existsSync(globalConfigDir)) {
      fs.mkdirSync(globalConfigDir, { recursive: true });
    }

    // Write global config file
    const globalConfig = {
      notifications: {
        defaultTimeout: 20,
        defaultSound: false,
        defaultUrgency: 'low',
      },
    };
    fs.writeFileSync(globalConfigFile, JSON.stringify(globalConfig, null, 2));

    // Write project config file
    const projectConfig = {
      notifications: {
        defaultTimeout: 30,
      },
    };
    fs.writeFileSync(projectConfigFile, JSON.stringify(projectConfig, null, 2));

    const config = loadConfig();
    expect(config.notifications.defaultTimeout).toBe(30); // Project config value
    expect(config.notifications.defaultSound).toBe(false); // Global config value
    expect(config.notifications.defaultUrgency).toBe('low'); // Global config value
  });

  it('should handle corrupted config files gracefully', () => {
    // Create global config directory if it doesn't exist
    if (!fs.existsSync(globalConfigDir)) {
      fs.mkdirSync(globalConfigDir, { recursive: true });
    }

    // Write corrupted global config file
    fs.writeFileSync(globalConfigFile, 'corrupted json');

    // Write project config file
    const projectConfig = {
      notifications: {
        defaultTimeout: 30,
      },
    };
    fs.writeFileSync(projectConfigFile, JSON.stringify(projectConfig, null, 2));

    const config = loadConfig();
    expect(config.notifications.defaultTimeout).toBe(30); // Project config value
    expect(config.notifications.defaultSound).toBe(true); // Default value
    expect(config.notifications.defaultUrgency).toBe('normal'); // Default value
  });
});