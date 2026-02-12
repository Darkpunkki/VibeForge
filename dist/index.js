#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadPromptFiles } from './framework/prompts/promptLoader.js';
import { makePromptRegistry } from './framework/prompts/promptRegistry.js';
import { registerVfTools } from './framework/tools/registerTools.js';
const SERVER_NAME = 'VibeForge Framework (Docs-first)';
const SERVER_VERSION = '0.0.1';
/**
 * This server is designed to be launched by an MCP host using STDIO transport.
 * IMPORTANT: do not write to stdout; stdout is reserved for JSON-RPC.
 */
async function main() {
    const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
    // Load prompt templates from ./prompts at runtime (packaged alongside server).
    const prompts = await loadPromptFiles(new URL('../prompts/', import.meta.url));
    const promptRegistry = makePromptRegistry(prompts);
    // Register MCP prompts (discoverable by hosts)
    for (const p of promptRegistry.list()) {
        server.registerPrompt(p.name, {
            title: p.title,
            description: p.description,
            // `inputSchema` here is a Zod-object map, per SDK examples.
            argsSchema: p.inputSchema ?? {},
        }, async (args) => {
            const messages = await promptRegistry.render(p.name, args);
            return { messages };
        });
    }
    // Register helper tools used by the prompts (filesystem + logging utilities).
    registerVfTools(server);
    // Connect over STDIO
    await server.connect(new StdioServerTransport());
    console.error(`[vf-framework-mcp] Ready: ${SERVER_NAME} v${SERVER_VERSION}`);
}
main().catch((err) => {
    console.error('[vf-framework-mcp] Fatal error:', err);
    process.exit(1);
});
