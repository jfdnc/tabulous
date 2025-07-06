import { MCPServer } from './mcp-server.js';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { 
  HelpExtractorTool, 
  ManPageParserTool, 
  CompletionGeneratorTool, 
  CommandAnalyzerTool 
} from '../tools/index.js';

export async function createServer(): Promise<MCPServer> {
  const config = configManager.loadServerConfig();
  const server = new MCPServer(config);

  // Register all tools
  if (config.tools.helpExtractor.enabled) {
    server.registerTool(new HelpExtractorTool());
  }

  if (config.tools.manPageParser.enabled) {
    server.registerTool(new ManPageParserTool());
  }

  if (config.tools.completionGenerator.enabled) {
    server.registerTool(new CompletionGeneratorTool());
  }

  if (config.tools.commandAnalyzer.enabled) {
    server.registerTool(new CommandAnalyzerTool());
  }

  return server;
}

export async function startServer(): Promise<void> {
  try {
    const server = await createServer();
    await server.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

export { MCPServer } from './mcp-server.js';
export { ToolRegistry } from './tool-registry.js';