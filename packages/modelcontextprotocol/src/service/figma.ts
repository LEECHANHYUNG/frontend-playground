import type {
  GetFileNodesResponse,
  Node as FigmaDocumentNode,
  Paint,
  Vector,
  GetFileResponse,
} from "@figma/rest-api-spec";

export interface FigmaError {
  status: number;
  err: string;
}

export type StyleId = `${string}_${string}` & { __brand: "StyleId" };

export type TextStyle = Partial<{
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  textAlignHorizontal: string;
  textAlignVertical: string;
}>;
export type StrokeWeights = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
type StyleTypes = TextStyle | string;
type GlobalVars = {
  styles: Record<StyleId, StyleTypes>;
};

export interface SimplifiedDesign {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  nodes: SimplifiedNode[];
  globalVars: GlobalVars;
}
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SimplifiedNode {
  id: string;
  name: string;
  type: string; // e.g. FRAME, TEXT, INSTANCE, RECTANGLE, etc.
  // geometry
  boundingBox?: BoundingBox;
  // text
  text?: string;
  textStyle?: string;
  // appearance
  fills?: string;
  styles?: string;
  strokes?: string;
  effects?: string;
  opacity?: number;
  borderRadius?: string;
  // layout & alignment
  layout?: string;
  // backgroundColor?: ColorValue; // Deprecated by Figma API
  // for rect-specific strokes, etc.
  // children
  children?: SimplifiedNode[];
}
export class FigmaService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.figma.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async requestFile<T>(endpoint: string): Promise<T> {
    if (typeof fetch !== "function") {
      throw new Error(
        "The MCP server is being run in a Node.js environment where `fetch` is not available. You won't be able to access any data related to the Figma file.\n\nAs the coding AI assistant, PLEASE ABORT THE CURRENT REQUEST. No alternate approaches will work. Help the user fix this issue so you can proceed by letting them know that they need to run the MCP server with Node.js version 18 or higher."
      );
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "X-Figma-Token": this.apiKey,
        },
      });
      if (!response.ok) {
        throw {
          status: response.status,
          err: response.statusText || "Unknown error",
        } as FigmaError;
      }
      return (await response.json()) as T;
    } catch (error) {
      if ((error as FigmaError).status) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(
          `Failed to make request to Figma API: ${error.message}`
        );
      }
      throw new Error(`Failed to make request to Figma API: ${error}`);
    }
  }

  async getFile(fileKey: string, depth?: number | null): Promise<any> {
    try {
      const endpoint = `/files/${fileKey}${depth ? `?depth=${depth}` : ""}`;

      const response = await this.requestFile<GetFileResponse>(endpoint);

      return response;
    } catch (e) {
      console.error("Failed to get file:", e);
      throw e;
    }
  }

  async getNode(
    fileKey: string,
    nodeId: string,
    depth?: number | null
  ): Promise<any> {
    const endpoint = `/files/${fileKey}/nodes?ids=${nodeId}${depth ? `&depth=${depth}` : ""}`;
    const response = await this.requestFile<GetFileNodesResponse>(endpoint);

    return response;
  }
}
