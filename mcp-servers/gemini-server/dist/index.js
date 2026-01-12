#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    console.error("Set it with: export GEMINI_API_KEY=your_api_key");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const server = new Server({
    name: "gemini-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "gemini",
                description: "Delegate a task to Gemini AI. Use for UI/UX design, frontend development, and visual analysis tasks.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The task or question for Gemini",
                        },
                        "developer-instructions": {
                            type: "string",
                            description: "System instructions for the expert persona",
                        },
                        model: {
                            type: "string",
                            description: "Model to use (default: gemini-2.0-flash)",
                            enum: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-pro"],
                        },
                    },
                    required: ["prompt"],
                },
            },
            {
                name: "gemini-vision",
                description: "Analyze images with Gemini. Use for design review, screenshot analysis, and visual feedback.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The question about the image",
                        },
                        imageUrl: {
                            type: "string",
                            description: "URL of the image to analyze",
                        },
                        imagePath: {
                            type: "string",
                            description: "Local file path of the image to analyze",
                        },
                    },
                    required: ["prompt"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "gemini") {
        const prompt = args?.prompt;
        const developerInstructions = args?.["developer-instructions"];
        const modelName = args?.model || "gemini-2.0-flash";
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: developerInstructions,
            });
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            return {
                content: [
                    {
                        type: "text",
                        text: response,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error calling Gemini: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
    if (name === "gemini-vision") {
        const prompt = args?.prompt;
        const imageUrl = args?.imageUrl;
        const imagePath = args?.imagePath;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            let imagePart;
            if (imageUrl) {
                const response = await fetch(imageUrl);
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString("base64");
                const mimeType = response.headers.get("content-type") || "image/png";
                imagePart = {
                    inlineData: { data: base64, mimeType },
                };
            }
            else if (imagePath) {
                const fs = await import("fs");
                const path = await import("path");
                const buffer = fs.readFileSync(imagePath);
                const base64 = buffer.toString("base64");
                const ext = path.extname(imagePath).toLowerCase();
                const mimeTypes = {
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".gif": "image/gif",
                    ".webp": "image/webp",
                };
                const mimeType = mimeTypes[ext] || "image/png";
                imagePart = {
                    inlineData: { data: base64, mimeType },
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Either imageUrl or imagePath is required",
                        },
                    ],
                    isError: true,
                };
            }
            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response.text();
            return {
                content: [
                    {
                        type: "text",
                        text: response,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error calling Gemini Vision: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
    return {
        content: [
            {
                type: "text",
                text: `Unknown tool: ${name}`,
            },
        ],
        isError: true,
    };
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Gemini MCP Server running on stdio");
}
main().catch(console.error);
