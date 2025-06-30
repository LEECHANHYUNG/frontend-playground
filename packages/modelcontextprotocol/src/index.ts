// Re-export the server and its types
export { createServer } from "./mcp.js";
export type { FigmaService } from "./service/figma.js";
export { getServerConfig } from "./config.js";
export { startServer } from "./cli.js";
