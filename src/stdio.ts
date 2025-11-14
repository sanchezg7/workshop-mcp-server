import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import mcp from "./mcp.ts";

const transport = new StdioServerTransport();
await mcp.connect(transport);