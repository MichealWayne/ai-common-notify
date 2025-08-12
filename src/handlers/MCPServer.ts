import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { NotificationManager, NotificationOptions } from '../core/NotificationManager';

export class MCPServer {
  private mcpServer: McpServer;
  private notificationManager: NotificationManager;

  constructor() {
    // Create the MCP server instance with server info and capabilities
    this.mcpServer = new McpServer(
      {
        name: 'ai-common-notify',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize the notification manager
    this.notificationManager = new NotificationManager();
    
    // Set up the tools
    this.setupTools();
  }

  /**
   * Set up the tools for the MCP server
   */
  private setupTools(): void {
    // Register the send_notification tool
    this.mcpServer.tool(
      'send_notification',
      'Send system notification with optional sound',
      {
        title: z.string().describe('Notification title'),
        message: z.string().describe('Notification message'),
        urgency: z.enum(['low', 'normal', 'critical']).optional().describe('Notification urgency level'),
        timeout: z.number().optional().describe('Notification timeout in seconds'),
        play_sound: z.boolean().optional().describe('Play notification sound')
      },
      async (args) => {
        try {
          // Validate required arguments
          if (!args.title || !args.message) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Missing required arguments: title and message are required'
                }
              ]
            };
          }
          
          // Create notification options object
          const notificationOptions: NotificationOptions = {
            title: args.title,
            message: args.message
          };
          
          // Only add properties if they're defined
          if (args.urgency !== undefined) {
            notificationOptions.urgency = args.urgency;
          }
          if (args.timeout !== undefined) {
            notificationOptions.timeout = args.timeout;
          }
          if (args.play_sound !== undefined) {
            notificationOptions.sound = args.play_sound;
          }
          
          // Send the notification
          const success = await this.notificationManager.sendNotification(notificationOptions);
          
          // Return the response
          const content: CallToolResult['content'] = [
            {
              type: 'text',
              text: success ? 'Notification sent successfully' : 'Failed to send notification'
            }
          ];
          
          return { content };
        } catch (error) {
          // Handle any errors during tool execution
          return {
            content: [
              {
                type: 'text',
                text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
              }
            ]
          };
        }
      }
    );
  }

  /**
   * Start the MCP server
   */
  async serve(): Promise<void> {
    try {
      // Create the stdio transport
      const transport = new StdioServerTransport();
      
      // Connect the server to the transport
      await this.mcpServer.connect(transport);
      
      console.log('MCP Server started and listening on stdio');
    } catch (error) {
      console.error('Error starting MCP server:', error);
      throw error;
    }
  }
}