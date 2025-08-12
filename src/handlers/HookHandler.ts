import { NotificationManager } from '../core/NotificationManager';
import { extractProjectInfo } from '../utils/ProjectInfoExtractor';
import { getConfig } from '../core/ConfigManager';

interface HookData {
  event_type?: string;
  tool_name?: string;
  tool_input?: any;
  transcript_path?: string;
  session_id?: string;
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
          console.error('Error parsing JSON from stdin:', error);
          resolve(null);
        }
      });
      
      // Handle errors
      process.stdin.on('error', (error) => {
        console.error('Error reading from stdin:', error);
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
   * @returns Promise that resolves to true if notification was sent successfully
   */
  async processHookEvent(eventType: string, data: HookData): Promise<boolean> {
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
    
    // Send the notification
    const config = getConfig();
    return this.notificationManager.sendNotification({
      title,
      message,
      urgency,
      sound: (urgency === 'normal' || urgency === 'critical') ? config.notifications.defaultSound : false
    });
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