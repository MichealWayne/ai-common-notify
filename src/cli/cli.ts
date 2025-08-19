#!/usr/bin/env node

import { Command } from 'commander';
import { HookHandler } from '../handlers/HookHandler';
import { MCPServer } from '../handlers/MCPServer';
import { NotificationManager } from '../core/NotificationManager';
import { QuickInitializer } from '../core/QuickInitializer';
import { RestAPIServer } from '../servers/RestAPIServer';
import { logger } from '../utils/logger';

const program = new Command();

program
  .name('ai-common-notify')
  .description('A unified notification service for AI coding tools')
  .version('1.0.0');

// Hook command
program
  .command('hook')
  .description('Process Claude Code hook events from JSON input')
  .option('-e, --event-type <type>', 'Override the event type')
  .option('-t, --test', 'Test mode - read from test.json file instead of stdin')
  .option('--timeout <seconds>', 'Set notification timeout in seconds (0 for permanent)', '0')
  .action(async options => {
    const handler = new HookHandler();

    if (options.test) {
      console.error('Error: test mode not implemented yet');
      process.exit(1);
    }

    // Read JSON from stdin
    const data = await handler.readStdinJson();
    if (!data) {
      console.error('Error: No JSON data received from stdin');
      process.exit(1);
    }

    // Determine event type
    let eventType = options.eventType;
    if (!eventType) {
      eventType = handler.determineEventType(data);
      if (!eventType) {
        console.error('Error: Could not determine event type from JSON data');
        console.error('Use --event-type to specify the event type explicitly');
        process.exit(1);
      }
    }

    // Process the hook event
    const success = await handler.processHookEvent(eventType, data, parseInt(options.timeout));

    if (!success) {
      console.error('Warning: Failed to send notification');
      // Don't exit with error code to avoid blocking Claude operations
    }

    // Exit successfully to not block Claude
    process.exit(0);
  });

// MCP command
program
  .command('mcp')
  .description('Start MCP server for Cursor and other tools')
  .action(async () => {
    const server = new MCPServer();

    try {
      await server.serve();
    } catch (error) {
      logger.error('cli', 'Error starting MCP server', { error }, 'mcp command', __filename);
      process.exit(1);
    }
  });

// API command
program
  .command('api')
  .description('Start REST API server for custom integrations')
  .option('-p, --port <port>', 'Set server port (default: 6001)', '6001')
  .action(options => {
    const port = parseInt(options.port) || 6001;
    const server = new RestAPIServer();

    try {
      server.start(port);
      console.log(`REST API server started on port ${port}`);
    } catch (error) {
      logger.error('cli', 'Error starting REST API server', { error }, 'api command', __filename);
      console.error('Error starting REST API server:', error);
      process.exit(1);
    }
  });

// Error log display command
program
  .command('errlog')
  .description('Display error logs')
  .action(() => {
    try {
      const errorLogs = logger.getErrorLogs();

      if (errorLogs.length === 0) {
        console.log('No error logs found.');
        return;
      }

      console.log('Error Logs:');
      console.log('==============================');

      // 按时间倒序排列日志（最新的在前面）
      const sortedLogs = errorLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      for (const log of sortedLogs) {
        console.log(`[${log.timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}`);
        console.log(`  Method: ${log.method || 'N/A'}`);
        console.log(`  File: ${log.file || 'N/A'}`);

        if (log.details) {
          console.log(`  Details: ${JSON.stringify(log.details, null, 2)}`);
        }

        console.log('------------------------------');
      }
    } catch (error) {
      logger.error('cli', 'Error reading error logs', { error }, 'errlog command', __filename);
      console.error('Error reading error logs:', error);
      process.exit(1);
    }
  });

// All log display command
program
  .command('alllog')
  .description('Display all logs')
  .action(() => {
    try {
      const allLogs = logger.getAllLogs();

      if (allLogs.length === 0) {
        console.log('No logs found.');
        return;
      }

      console.log('All Logs:');
      console.log('==============================');

      // 按时间倒序排列日志（最新的在前面）
      const sortedLogs = allLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      for (const log of sortedLogs) {
        console.log(`[${log.timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}`);
        console.log(`  Method: ${log.method || 'N/A'}`);
        console.log(`  File: ${log.file || 'N/A'}`);

        if (log.details) {
          console.log(`  Details: ${JSON.stringify(log.details, null, 2)}`);
        }

        console.log('------------------------------');
      }
    } catch (error) {
      logger.error('cli', 'Error reading logs', { error }, 'alllog command', __filename);
      console.error('Error reading logs:', error);
      process.exit(1);
    }
  });

// Test notification command
program
  .command('test')
  .description('Send a test notification to verify the system is working')
  .option('-t, --timeout <seconds>', 'Set notification timeout in seconds (0 for permanent)', '0')
  .action(async options => {
    try {
      const notificationManager = new NotificationManager();
      const timeout = parseInt(options.timeout);

      console.log('Sending test notification...');

      const success = await notificationManager.sendNotification({
        title: 'AI Common Notify Test',
        message: 'This is a test notification to verify the system is working correctly.',
        urgency: 'normal',
        timeout: timeout,
        sound: true,
      });

      if (success) {
        console.log('✓ Test notification sent successfully!');
      } else {
        console.log('✗ Failed to send test notification.');
        process.exit(1);
      }
    } catch (error) {
      logger.error('cli', 'Error sending test notification', { error }, 'test command', __filename);
      console.error('Error sending test notification:', error);
      process.exit(1);
    }
  });

// Send notification command
program
  .command('send')
  .description('Send a notification from command line')
  .option('-t, --title <title>', 'Notification title')
  .option('-m, --message <message>', 'Notification message')
  .option('-u, --urgency <urgency>', 'Notification urgency (low, normal, critical)', 'normal')
  .option('--timeout <seconds>', 'Set notification timeout in seconds (0 for permanent)', '0')
  .option('--no-sound', 'Disable notification sound')
  .option('--icon <icon>', 'Path to notification icon')
  .option('--tool <tool>', 'Tool name for tool-specific configuration')
  .option('--project <project>', 'Project name')
  .action(async options => {
    try {
      const notificationManager = new NotificationManager();
      
      // Validate required options
      if (!options.title) {
        console.error('Error: --title is required');
        process.exit(1);
      }
      
      if (!options.message) {
        console.error('Error: --message is required');
        process.exit(1);
      }

      const timeout = parseInt(options.timeout);

      console.log('Sending notification...');

      const success = await notificationManager.sendNotification({
        title: options.title,
        message: options.message,
        urgency: options.urgency as 'low' | 'normal' | 'critical',
        timeout: timeout,
        sound: options.sound,
        icon: options.icon,
        toolName: options.tool,
        projectName: options.project,
      });

      if (success) {
        console.log('✓ Notification sent successfully!');
      } else {
        console.log('✗ Failed to send notification.');
        process.exit(1);
      }
    } catch (error) {
      logger.error('cli', 'Error sending notification', { error }, 'send command', __filename);
      console.error('Error sending notification:', error);
      process.exit(1);
    }
  });

// Quick initialization command
program
  .command('quickInit')
  .description('Quickly initialize AI tools configuration')
  .option(
    '-t, --tool <tool>',
    'Specify a tool to initialize (cursor, claudecode, windsurf, gemini-cli, kiro)'
  )
  .action(async options => {
    try {
      const initializer = new QuickInitializer();

      if (options.tool) {
        console.log(`Initializing ${options.tool}...`);
        await initializer.initializeTool(options.tool);
        console.log(`✓ ${options.tool} initialized successfully!`);
      } else {
        console.log('Initializing all detected AI tools...');
        await initializer.initializeAll();
        console.log('✓ All tools initialized successfully!');
      }
    } catch (error) {
      logger.error(
        'cli',
        'Error during quick initialization',
        { error },
        'quickInit command',
        __filename
      );
      console.error('Error during quick initialization:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
