import { MCPServer } from '../src/handlers/MCPServer';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Mock the MCP SDK modules
jest.mock('@modelcontextprotocol/sdk/server/mcp.js');
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');

// Mock the NotificationManager
jest.mock('../src/core/NotificationManager');

describe('MCPServer', () => {
  let mcpServer: MCPServer;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of MCPServer for each test
    mcpServer = new MCPServer();
  });

  it('should create an MCP server instance', () => {
    // The MCP server should be instantiated without errors
    expect(mcpServer).toBeInstanceOf(MCPServer);
  });

  it('should set up tools correctly', () => {
    // Verify that the McpServer was instantiated with the correct parameters
    expect(McpServer).toHaveBeenCalledWith(
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
    
    // Get the McpServer instance
    const mcpServerInstance = (McpServer as jest.Mock).mock.instances[0];
    
    // Verify that the tool method was called to register send_notification
    expect(mcpServerInstance.tool).toHaveBeenCalledWith(
      'send_notification',
      'Send system notification with optional sound',
      expect.any(Object), // Zod schema
      expect.any(Function) // Callback function
    );
  });

  it('should start the server when serve is called', async () => {
    // Get the McpServer instance
    const mcpServerInstance = (McpServer as jest.Mock).mock.instances[0];
    
    // Mock the connect method to resolve successfully
    mcpServerInstance.connect.mockResolvedValue(undefined);
    
    // Mock the StdioServerTransport constructor
    (StdioServerTransport as jest.Mock).mockImplementation(() => ({
      // Mock transport implementation
    }));
    
    // Call the serve method
    await mcpServer.serve();
    
    // Verify that StdioServerTransport was instantiated
    expect(StdioServerTransport).toHaveBeenCalled();
    
    // Verify that the server's connect method was called with the transport
    expect(mcpServerInstance.connect).toHaveBeenCalled();
  });

  it('should handle errors when starting the server', async () => {
    // Get the McpServer instance
    const mcpServerInstance = (McpServer as jest.Mock).mock.instances[0];
    
    // Mock the connect method to reject with an error
    const errorMessage = 'Connection failed';
    mcpServerInstance.connect.mockRejectedValue(new Error(errorMessage));
    
    // Mock the StdioServerTransport constructor
    (StdioServerTransport as jest.Mock).mockImplementation(() => ({
      // Mock transport implementation
    }));
    
    // Expect the serve method to throw an error
    await expect(mcpServer.serve()).rejects.toThrow(errorMessage);
  });
});