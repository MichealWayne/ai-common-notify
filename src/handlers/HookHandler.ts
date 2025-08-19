import { NotificationManager } from '../core/NotificationManager';
import { extractProjectInfo } from '../utils/ProjectInfoExtractor';
import { getConfig } from '../core/ConfigManager';
import { logger } from '../utils/logger';

interface HookData {
  event_type?: string;
  tool_name?: string;
  tool_input?: any;
  transcript_path?: string;
  session_id?: string;
  title?: string;
  message?: string;
  notification_type?: string;
  tool_response?: any;
  project_name?: string;
  project_path?: string;
}

export class HookHandler {
  private notificationManager: NotificationManager;

  constructor() {
    this.notificationManager = new NotificationManager();
  }

  /**
   * Read JSON data from stdin
   * 
   * @returns Promise that resolves to the parsed JSON object or null if reading failed
   */
  async readStdinJson(): Promise<HookData | null> {
    return new Promise((resolve) => {
      let inputData = '';
      
      // Read data from stdin
      process.stdin.setEncoding('utf8');
      process.stdin.on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
          inputData += chunk;
        }
      });
      
      // When stdin ends, try to parse the data
      process.stdin.on('end', () => {
        try {
          if (inputData.trim() === '') {
            resolve(null);
            return;
          }
          
          const parsedData = JSON.parse(inputData);
          resolve(parsedData);
        } catch (error) {
          logger.error('HookHandler', 'Error parsing JSON from stdin', { error }, 'readStdinJson', __filename);
          resolve(null);
        }
      });
      
      // Handle errors
      process.stdin.on('error', (error) => {
        logger.error('HookHandler', 'Error reading from stdin', { error }, 'readStdinJson', __filename);
        resolve(null);
      });
    });
  }

  /**
   * Determine the event type from hook data
   * 
   * @param data - Hook data
   * @returns The determined event type or null if unknown
   */
  determineEventType(data: HookData): string | null {
    // Check for explicit event type
    if (data.event_type) {
      return data.event_type;
    }
    
    // Infer from data structure
    if (data.tool_name) {
      if (data.tool_response) {
        return 'PostToolUse';
      } else {
        return 'PreToolUse';
      }
    }
    
    // Check for notification-specific fields
    if (data.notification_type) {
      return 'Notification';
    }
    
    // Check for generic notification with title and message
    if (data.title && data.message) {
      return 'Notification';
    }
    
    // Default to Stop if we have session info but no tool info
    if (data.session_id && !data.tool_name) {
      return 'Stop';
    }
    
    return null;
  }

  /**
   * Process a hook event and send appropriate notification
   * 
   * @param eventType - The type of event
   * @param data - The hook data
   * @param timeout - The notification timeout in seconds (0 for permanent)
   * @returns Promise that resolves to true if notification was sent successfully
   */
  async processHookEvent(eventType: string, data: HookData, timeout: number = 0): Promise<boolean> {
    // Define notification templates for different hook events
    const eventTemplates: Record<string, any> = {
      PreToolUse: {
        title: 'Claude Tool Request',
        message: 'Claude wants to use {tool_name}',
        urgency: 'normal'
      },
      PostToolUse: {
        title: 'Claude Tool Complete',
        message: '{tool_name} execution completed',
        urgency: 'low'
      },
      Notification: {
        title: 'Claude Notification',
        message: 'Claude has sent a notification',
        urgency: 'normal'
      },
      Stop: {
        title: 'Claude Response Complete',
        message: 'Claude has finished responding',
        urgency: 'normal'
      },
      SubagentStop: {
        title: 'Claude Task Complete',
        message: 'Claude subagent has finished',
        urgency: 'low'
      }
    };

    // Special handling for certain tools
    const criticalTools = ['Bash', 'Write', 'Edit', 'MultiEdit'];
    
    // Extract project information
    let projectInfo: { projectName: string; projectPath: string } | null = null;
    
    if (data.transcript_path) {
      projectInfo = extractProjectInfo(data.transcript_path);
    } else if (data.project_name && data.project_path) {
      projectInfo = {
        projectName: data.project_name,
        projectPath: data.project_path
      };
    }
    
    // If we still don't have project info, use fallback
    if (!projectInfo) {
      projectInfo = extractProjectInfo(process.cwd());
    }
    
    // Get template for event type
    const template = eventTemplates[eventType] || {
      title: 'Claude Event',
      message: 'Unknown event: {event_type}',
      urgency: 'normal'
    };
    
    let title = template.title;
    let message = template.message;
    let urgency = template.urgency;
    
    // Add project info to title for better context
    if (projectInfo) {
      title = `${title} - ${projectInfo.projectName}`;
    }
    
    // Customize message based on event type and data
    if (eventType === 'PreToolUse' || eventType === 'PostToolUse') {
      const toolName = data.tool_name || 'Unknown Tool';
      message = message.replace('{tool_name}', toolName);
      
      // Increase urgency for critical tools
      if (toolName && criticalTools.includes(toolName) && eventType === 'PreToolUse') {
        urgency = 'critical';
        title = `⚠️ ${title}`;
        message = `Claude wants to use ${toolName} - Review required!`;
      }
      
      // Add tool input preview for PreToolUse
      if (eventType === 'PreToolUse' && data.tool_input) {
        const toolInputPreview = this.getToolInputPreview(toolName, data.tool_input);
        if (toolInputPreview) {
          message = `${message}\n${toolInputPreview}`;
        }
      }
    } else if (eventType === 'Stop') {
      // For Stop events, we can customize the message if needed
      message = message.replace('{event_type}', eventType);
    } else {
      // For other events, replace placeholders
      message = message.replace('{event_type}', eventType);
    }
    
    // Always show the full project path in the message for all events
    if (projectInfo) {
      message = `${message}\nProject: ${projectInfo.projectName} (${projectInfo.projectPath})`;
    }
    
    // Execute project-specific hooks before sending notification
    const config = getConfig();
    await this.executeProjectHooks(eventType, data, projectInfo);
    
    // Send the notification
    return this.notificationManager.sendNotification({
      title,
      message,
      urgency,
      timeout, // 添加timeout参数
      sound: (urgency === 'normal' || urgency === 'critical') ? config.notifications.defaultSound : false
    });
  }

  /**
   * Execute project-specific hooks based on event type and data
   * 
   * @param eventType - The type of event
   * @param data - The hook data
   * @param projectInfo - Project information
   * @returns Promise that resolves when all hooks have been executed
   */
  private async executeProjectHooks(eventType: string, data: HookData, projectInfo: { projectName: string; projectPath: string } | null): Promise<void> {
    const config = getConfig();
    
    // Check if hooks are configured
    if (!config.hooks || !config.hooks[eventType]) {
      return;
    }
    
    // Get hooks for this event type
    const hookConfigs = config.hooks[eventType];
    
    // Execute each hook
    for (const hookConfig of hookConfigs) {
      // Check if any hook matches the data
      const matches = hookConfig.matcher === '.*' || 
        (data.message && new RegExp(hookConfig.matcher).test(data.message)) ||
        (data.tool_name && new RegExp(hookConfig.matcher).test(data.tool_name));
        
      if (matches) {
        // Execute each hook in the configuration
        for (const hook of hookConfig.hooks) {
          // Check if hook is enabled
          if (hook.enabled === false) {
            continue;
          }
          
          // Execute the hook based on its type
          if (hook.type === 'node' && hook.path) {
            // Execute node script
            await this.executeNodeScript(hook.path, eventType, data, projectInfo);
          } else if (hook.type === 'command' && hook.command) {
            // Execute command
            await this.executeCommand(hook.command, eventType, data, projectInfo);
          }
        }
      }
    }
  }

  /**
   * Execute a node script with environment variables
   * 
   * @param scriptPath - Path to the node script
   * @param eventType - The event type
   * @param data - The hook data
   * @param projectInfo - Project information
   * @returns Promise that resolves when the script has been executed
   */
  private async executeNodeScript(scriptPath: string, eventType: string, data: HookData, projectInfo: { projectName: string; projectPath: string } | null): Promise<void> {
    try {
      const { ScriptExecutor } = await import('../core/ScriptExecutor');
      
      // Create script executor
      const config = getConfig();
      const scriptExecutor = new ScriptExecutor(config.scripts.timeout);
      
      // Prepare environment variables
      const env = {
        NOTIFY_EVENT_TYPE: eventType,
        NOTIFY_TITLE: data.title || '',
        NOTIFY_MESSAGE: data.message || '',
        NOTIFY_TOOL_NAME: data.tool_name || '',
        NOTIFY_PROJECT_NAME: projectInfo?.projectName || '',
        NOTIFY_PROJECT_PATH: projectInfo?.projectPath || '',
        NOTIFY_TRANSCRIPT_PATH: data.transcript_path || '',
        NOTIFY_SESSION_ID: data.session_id || '',
        NOTIFY_TIMESTAMP: new Date().toISOString(),
        // 添加缺少的必需字段
        NOTIFY_URGENCY: 'normal',
        NOTIFY_TIMEOUT: '0',
        NOTIFY_SOUND: 'true'
      };
      
      // Execute the script
      const scriptConfig = {
        type: 'node' as const,
        path: scriptPath,
        enabled: true
      };
      
      await scriptExecutor.execute(scriptConfig, env);
    } catch (error) {
      logger.error('HookHandler', `Error executing node script: ${scriptPath}`, { error }, 'executeNodeScript', __filename);
    }
  }

  /**
   * Execute a command with environment variables
   * 
   * @param command - The command to execute
   * @param eventType - The event type
   * @param data - The hook data
   * @param projectInfo - Project information
   * @returns Promise that resolves when the command has been executed
   */
  private async executeCommand(command: string, eventType: string, data: HookData, projectInfo: { projectName: string; projectPath: string } | null): Promise<void> {
    try {
      const { spawn } = await import('child_process');
      
      // Prepare environment variables
      const env: Record<string, string> = {
        ...process.env as Record<string, string>,
        NOTIFY_EVENT_TYPE: eventType,
        NOTIFY_TITLE: data.title || '',
        NOTIFY_MESSAGE: data.message || '',
        NOTIFY_TOOL_NAME: data.tool_name || '',
        NOTIFY_PROJECT_NAME: projectInfo?.projectName || '',
        NOTIFY_PROJECT_PATH: projectInfo?.projectPath || '',
        NOTIFY_TRANSCRIPT_PATH: data.transcript_path || '',
        NOTIFY_SESSION_ID: data.session_id || '',
        NOTIFY_TIMESTAMP: new Date().toISOString(),
      };
      
      // Execute the command
      await new Promise<void>((resolve, reject) => {
        const child = spawn(command, [], { 
          shell: true, 
          env,
          stdio: 'ignore'
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command exited with code ${code}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      logger.error('HookHandler', `Error executing command: ${command}`, { error }, 'executeCommand', __filename);
    }
  }

  /**
   * Get a preview of tool input for the notification
   * 
   * @param toolName - The name of the tool
   * @param toolInput - The tool input data
   * @returns A string preview of the tool input or null if not applicable
   */
  private getToolInputPreview(toolName: string, toolInput: any): string | null {
    if (toolName === 'Bash') {
      const command = toolInput.command?.trim() || '';
      if (command.length > 50) {
        return `Command: ${command.substring(0, 47)}...`;
      }
      return `Command: ${command}`;
    } else if (['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
      const filePath = toolInput.file_path || '';
      if (filePath) {
        return `File: ${filePath}`;
      }
    } else if (toolName === 'Read') {
      const filePath = toolInput.file_path || '';
      if (filePath) {
        return `Reading: ${filePath}`;
      }
    }
    return null;
  }
}