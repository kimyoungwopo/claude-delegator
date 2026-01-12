#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { extname } from "path";

const server = new Server(
  {
    name: "gemini-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Execute Gemini CLI in headless mode
 */
async function runGeminiCLI(
  prompt: string,
  options: {
    systemPrompt?: string;
    model?: string;
    sandbox?: string;
    cwd?: string;
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args: string[] = ["--prompt", prompt, "--output-format", "text"];

    if (options.model) {
      args.push("--model", options.model);
    }

    // Auto-approve actions in yolo mode for implementation tasks
    if (options.sandbox === "workspace-write") {
      args.push("--yolo");
    }

    // Add system prompt if provided
    if (options.systemPrompt) {
      args.push("--system-prompt", options.systemPrompt);
    }

    const gemini = spawn("gemini", args, {
      cwd: options.cwd || process.cwd(),
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    gemini.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    gemini.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    gemini.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Gemini CLI exited with code ${code}: ${stderr}`));
      }
    });

    gemini.on("error", (err) => {
      reject(new Error(`Failed to start Gemini CLI: ${err.message}`));
    });
  });
}

/**
 * Read image file and convert to base64 for Gemini
 */
function readImageAsBase64(imagePath: string): { data: string; mimeType: string } {
  const buffer = readFileSync(imagePath);
  const base64 = buffer.toString("base64");
  const ext = extname(imagePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return {
    data: base64,
    mimeType: mimeTypes[ext] || "image/png",
  };
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gemini",
        description:
          "Delegate a task to Gemini AI via CLI. Use for UI/UX design, frontend development, and code analysis. Requires `gemini auth login` first.",
        inputSchema: {
          type: "object" as const,
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
              description: "Model to use (default: gemini-2.5-pro)",
              enum: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
            },
            sandbox: {
              type: "string",
              description: "Sandbox mode: read-only (advisory) or workspace-write (implementation)",
              enum: ["read-only", "workspace-write"],
            },
            cwd: {
              type: "string",
              description: "Working directory for the task",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "gemini-vision",
        description:
          "Analyze images with Gemini CLI. Use for design review, screenshot analysis, and visual feedback.",
        inputSchema: {
          type: "object" as const,
          properties: {
            prompt: {
              type: "string",
              description: "The question about the image",
            },
            imagePath: {
              type: "string",
              description: "Local file path of the image to analyze",
            },
          },
          required: ["prompt", "imagePath"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "gemini") {
    const prompt = args?.prompt as string;
    const developerInstructions = args?.["developer-instructions"] as string | undefined;
    const model = (args?.model as string) || "gemini-2.5-pro";
    const sandbox = args?.sandbox as string | undefined;
    const cwd = args?.cwd as string | undefined;

    try {
      const result = await runGeminiCLI(prompt, {
        systemPrompt: developerInstructions,
        model,
        sandbox,
        cwd,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's an auth error
      if (errorMessage.includes("not authenticated") || errorMessage.includes("login")) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Gemini CLI authentication required.\n\nRun: gemini auth login\n\nError: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Error calling Gemini CLI: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === "gemini-vision") {
    const prompt = args?.prompt as string;
    const imagePath = args?.imagePath as string;

    try {
      // For vision, we pipe the image content with the prompt
      // Gemini CLI supports: cat image.png | gemini -p "describe this"
      const fullPrompt = `Analyze the image at path: ${imagePath}\n\n${prompt}`;

      const result = await runGeminiCLI(fullPrompt, {
        model: "gemini-2.5-flash", // Flash is good for vision tasks
      });

      return {
        content: [
          {
            type: "text" as const,
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text" as const,
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
        type: "text" as const,
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
  console.error("Gemini MCP Server running on stdio (using Gemini CLI)");
}

main().catch(console.error);
