import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export const CORRELATION_ID_HEADER = "X-Correlation-Id";

function resolveCorrelationId(req: IncomingMessage): string {
  const raw = req.headers[CORRELATION_ID_HEADER.toLowerCase()];

  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }

  if (Array.isArray(raw)) {
    const first = raw.find((value) => value.trim().length > 0);
    if (first) {
      return first.trim();
    }
  }

  return randomUUID();
}

function writeJson(res: ServerResponse, statusCode: number, payload: Record<string, string>, correlationId: string): void {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
    [CORRELATION_ID_HEADER]: correlationId
  });
  res.end(body);
}

export function createAppServer(): Server {
  return createServer((req, res) => {
    const method = req.method ?? "GET";
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const correlationId = resolveCorrelationId(req);

    if (method === "GET" && url.pathname === "/health") {
      writeJson(res, 200, { status: "ok" }, correlationId);
      console.info(`[${correlationId}] ${method} ${url.pathname} -> 200`);
      return;
    }

    if (method === "GET" && url.pathname === "/ready") {
      writeJson(res, 200, { status: "ready" }, correlationId);
      console.info(`[${correlationId}] ${method} ${url.pathname} -> 200`);
      return;
    }

    writeJson(res, 404, { error: "not_found" }, correlationId);
    console.info(`[${correlationId}] ${method} ${url.pathname} -> 404`);
  });
}
