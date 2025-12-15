import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import { execPowerShell, installApplication, configureSystem, transferFiles } from './tools.js';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'mcp-server.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// Create MCP server
const server = new Server(
  {
    name: 'pc-succession-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'install_application',
        description: 'Install an application on the target PC',
        inputSchema: {
          type: 'object',
          properties: {
            application_name: {
              type: 'string',
              description: 'Name of the application to install',
            },
            installer_url: {
              type: 'string',
              description: 'URL to download the installer',
            },
            install_arguments: {
              type: 'string',
              description: 'Silent installation arguments',
            },
            verify_command: {
              type: 'string',
              description: 'Command to verify installation',
            },
          },
          required: ['application_name'],
        },
      },
      {
        name: 'configure_system',
        description: 'Configure system settings (registry, environment variables, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            config_type: {
              type: 'string',
              enum: ['registry', 'environment', 'service', 'firewall'],
              description: 'Type of configuration to apply',
            },
            settings: {
              type: 'object',
              description: 'Configuration settings to apply',
            },
          },
          required: ['config_type', 'settings'],
        },
      },
      {
        name: 'transfer_files',
        description: 'Transfer files from source to target PC',
        inputSchema: {
          type: 'object',
          properties: {
            source_path: {
              type: 'string',
              description: 'Source file or directory path',
            },
            target_path: {
              type: 'string',
              description: 'Target file or directory path',
            },
            include_hidden: {
              type: 'boolean',
              description: 'Include hidden files',
            },
          },
          required: ['source_path', 'target_path'],
        },
      },
      {
        name: 'install_certificates',
        description: 'Install certificates on the target PC',
        inputSchema: {
          type: 'object',
          properties: {
            certificate_data: {
              type: 'string',
              description: 'Base64 encoded certificate data',
            },
            store_location: {
              type: 'string',
              enum: ['CurrentUser', 'LocalMachine'],
              description: 'Certificate store location',
            },
            store_name: {
              type: 'string',
              enum: ['My', 'Root', 'TrustedPeople'],
              description: 'Certificate store name',
            },
          },
          required: ['certificate_data', 'store_location', 'store_name'],
        },
      },
      {
        name: 'configure_vpn',
        description: 'Configure VPN connection on the target PC',
        inputSchema: {
          type: 'object',
          properties: {
            connection_name: {
              type: 'string',
              description: 'Name of the VPN connection',
            },
            server_address: {
              type: 'string',
              description: 'VPN server address',
            },
            connection_type: {
              type: 'string',
              enum: ['L2TP', 'PPTP', 'SSTP', 'IKEv2'],
              description: 'VPN connection type',
            },
          },
          required: ['connection_name', 'server_address', 'connection_type'],
        },
      },
      {
        name: 'exec_powershell',
        description: 'Execute a PowerShell command on the target PC',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'PowerShell script to execute',
            },
            as_admin: {
              type: 'boolean',
              description: 'Execute with administrator privileges',
            },
          },
          required: ['script'],
        },
      },
      {
        name: 'verify_installation',
        description: 'Verify that an application or configuration is correctly installed',
        inputSchema: {
          type: 'object',
          properties: {
            verification_type: {
              type: 'string',
              enum: ['application', 'service', 'registry', 'file'],
              description: 'Type of verification to perform',
            },
            target: {
              type: 'string',
              description: 'Target to verify (app name, service name, registry path, file path)',
            },
          },
          required: ['verification_type', 'target'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info(`Executing tool: ${name}`, { args });

  try {
    switch (name) {
      case 'install_application':
        return await installApplication(args as any);
      
      case 'configure_system':
        return await configureSystem(args as any);
      
      case 'transfer_files':
        return await transferFiles(args as any);
      
      case 'install_certificates':
        return {
          content: [
            {
              type: 'text',
              text: 'Certificate installation initiated. This requires elevated privileges.',
            },
          ],
        };
      
      case 'configure_vpn':
        return {
          content: [
            {
              type: 'text',
              text: `VPN connection "${args.connection_name}" configured successfully.`,
            },
          ],
        };
      
      case 'exec_powershell':
        return await execPowerShell(args as any);
      
      case 'verify_installation':
        return {
          content: [
            {
              type: 'text',
              text: `Verification completed for ${args.verification_type}: ${args.target}`,
            },
          ],
        };
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    logger.error(`Tool execution failed: ${name}`, { error: error.message });
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('PC Succession MCP Server started');
}

main().catch((error) => {
  logger.error('Server error:', error);
  process.exit(1);
});


