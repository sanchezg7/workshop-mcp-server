import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
    name: 'workshop-mcp-server',
    version: '1.0.0'
});

server.registerTool('multiply', {
    title: 'Multiply',
    description: 'Multiply two numbers',
    inputSchema: { a: z.number(), b: z.number() },
    outputSchema: { result: z.number() }
}, async ({ a, b}) => {
    return {
        content: [{type: "text", "text": String(a * b)}]
    }
})