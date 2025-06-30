import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import yaml from "js-yaml";
import { FigmaService } from "./service/figma.js";

const serverInfo = {
  name: "Vapor Figma MCP Server",
  version: "0.0.1",
};

const createServer = (figmaApiKey: string) => {
  const server = new McpServer(serverInfo);

  const figmaService = new FigmaService(figmaApiKey);
  registerTools(server, figmaService);

  return server;
};

const registerTools = (server: McpServer, figmaService: FigmaService) => {
  server.tool(
    "get_figma_file_node_data",
    "Get the data for a specific node in a Figma file",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to fetch, often found in a provided URL like figma.com/(file|design)/<fileKey>/..."
        ),
      nodeId: z
        .string()
        .describe(
          "The ID of the node to fetch, often found as URL parameter node-id=<nodeId>, always use if provided"
        ),
      depth: z
        .number()
        .optional()
        .describe(
          "How many levels deep to traverse the node tree, only use if explicitly requested by the user"
        ),
    },
    async ({ fileKey, nodeId, depth }) => {
      const node = await figmaService.getNode(fileKey, nodeId, depth);
      const { nodes, globalVars, ...metadata } = node;
      const result = {
        metadata,
        nodes,
        globalVars,
      };
      const yamlResult = yaml.dump(result);
      return {
        content: [{ type: "text", text: yamlResult }],
      };
    }
  );
};

export { createServer };
