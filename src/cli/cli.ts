#!/usr/bin/env node

import { Command } from 'commander';
import { HookHandler } from '../handlers/HookHandler';
import { MCPServer } from '../handlers/MCPServer';

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
  .action(async (options) => {
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
    const success = await handler.processHookEvent(eventType, data);
    
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
      console.error('Error starting MCP server:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();