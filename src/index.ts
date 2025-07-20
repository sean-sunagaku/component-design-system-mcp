import { MCPServer } from './core/MCPServer.js';

async function main() {
  try {
    const server = new MCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { MCPServer };
export * from './types';
export { ConfigManager } from './config/ConfigManager.js';
export { ComponentScanner } from './scanner/ComponentScanner.js';
export { ComponentAnalyzer } from './analyzer/ComponentAnalyzer.js';
export { ComponentCache } from './cache/ComponentCache.js';
