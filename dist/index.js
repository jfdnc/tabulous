#!/usr/bin/env node
import { startServer } from './server/index.js';
import { logger } from './utils/logger.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// This is the main entry point for the MCP server
if (process.argv[1] === __filename) {
    startServer().catch(error => {
        logger.error('Failed to start server', error);
        process.exit(1);
    });
}
export * from './server/index.js';
export * from './client/index.js';
export * from './tools/index.js';
export * from './types/index.js';
export * from './errors/index.js';
export * from './config/index.js';
