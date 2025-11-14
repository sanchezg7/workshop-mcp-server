import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
    name: 'workshop-mcp-server',
    version: '1.0.0'
});

server.registerTool('multiply', {
    title: 'Multiply',
    description: 'Multiply two numbers',
    inputSchema: {a: z.number(), b: z.number()},
    outputSchema: {result: z.number()}
}, async ({a, b}: { a: number, b: number }) => {
    const output = { result: a * b};
    return {
        content: [{type: "text", "text": JSON.stringify(output, null, 2)}],
        structuredContent: output
    }
});

// Define the entry schema as a reusable schema
const EntrySchema = z.object({
    id: z.number(),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    submitted_at: z.string().datetime()
});

// Define the output schema for the array of entries
const EntriesOutputSchema = z.object({
    result: z.array(EntrySchema)
});

// Type inference from the schema
type Entry = z.infer<typeof EntrySchema>;
type EntriesOutput = z.infer<typeof EntriesOutputSchema>;

server.registerTool('get-entries', {
    title: 'Get entries',
    description: 'Get the entries of a list',
    inputSchema: {},
    outputSchema: EntriesOutputSchema.shape
}, async () => {
    const response = await fetch('https://workshop.gsans.net/api/entries');
    const data = await response.json();

    // Validate the data conforms to the schema
    const validatedData = z.array(EntrySchema).parse(data);

    const result: EntriesOutput = { result: validatedData };

    return {
        content: [{type: "text", text: JSON.stringify(result, null, 2)}],
        structuredContent: result
    }
});

server.registerTool('create-entry', {
    title: 'Create entry',
    description: 'Create a new entry',
    inputSchema: z.object({
        description: z.string(),
        latitude: z.number(),
        longitude: z.number()
    }).shape,
    outputSchema: EntriesOutputSchema.shape
}, async ({ description, latitude, longitude }: { description: string, latitude: number, longitude: number }) => {
    // Send a POST request to create a new entry
    const response = await fetch('https://workshop.gsans.net/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, latitude, longitude })
    });

    const data = await response.json();

    let validatedArray: Entry[];
    try {
        validatedArray = z.array(EntrySchema).parse(data);
    } catch {
        throw new Error("Unable to parse response");
    }

    const result: EntriesOutput = { result: validatedArray };

    return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result
    }
})

export default server;