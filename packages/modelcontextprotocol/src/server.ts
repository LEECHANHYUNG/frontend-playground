import { randomUUID } from "node:crypto";
import express, { type Request, type Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { Server } from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

let httpServer: Server | null = null;
const transports = {
  streamable: {} as Record<string, StreamableHTTPServerTransport>,
  sse: {} as Record<string, SSEServerTransport>,
};

export async function startHttpServer(
  port: number,
  mcpServer: McpServer
): Promise<void> {
  const app = express();

  // Parse JSON requests for the Streamable HTTP endpoint only, will break SSE endpoint
  app.use("/mcp", express.json());

  // Modern Streamable HTTP endpoint
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.streamable[sessionId]) {
      // Reuse existing transport

      transport = transports.streamable[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports.streamable[sessionId] = transport;
        },
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports.streamable[transport.sessionId];
        }
      };
      // TODO? There semes to be an issue—at least in Cursor—where after a connection is made to an HTTP Streamable endpoint, SSE connections to the same Express server fail with "Received a response for an unknown message ID"
      await mcpServer.connect(transport);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;
    const progressToken = req.body.params?._meta?.progressToken;
    // Logger.log("Progress token:", progressToken);
    let progress = 0;
    if (progressToken) {
      progressInterval = setInterval(async () => {
        await mcpServer.server.notification({
          method: "notifications/progress",
          params: {
            progress,
            progressToken,
          },
        });
        progress++;
      }, 1000);
    }

    await transport.handleRequest(req, res, req.body);

    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });

  // Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
  const handleSessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.streamable[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    console.error(
      `Received session termination request for session ${sessionId}`
    );

    try {
      const transport = transports.streamable[sessionId];
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling session termination:", error);
      if (!res.headersSent) {
        res.status(500).send("Error processing session termination");
      }
    }
  };

  // Handle GET requests for server-to-client notifications via SSE
  app.get("/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete("/mcp", handleSessionRequest);

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);

    transports.sse[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports.sse[transport.sessionId];
    });

    await mcpServer.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.sse[sessionId];
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send(`No transport found for sessionId ${sessionId}`);
      return;
    }
  });

  process.on("SIGINT", async () => {
    // Close all active transports to properly clean up resources
    await closeTransports(transports.sse);
    await closeTransports(transports.streamable);

    process.exit(0);
  });
}

async function closeTransports(
  transports: Record<string, SSEServerTransport | StreamableHTTPServerTransport>
) {
  for (const sessionId in transports) {
    try {
      await transports[sessionId]?.close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
}

export async function stopHttpServer(): Promise<void> {
  if (!httpServer) {
    throw new Error("HTTP server is not running");
  }

  return new Promise((resolve, reject) => {
    httpServer!.close((err: Error | undefined) => {
      if (err) {
        reject(err);
        return;
      }
      httpServer = null;
      const closing = Object.values(transports.sse).map((transport) => {
        return transport.close();
      });
      Promise.all(closing).then(() => {
        resolve();
      });
    });
  });
}
