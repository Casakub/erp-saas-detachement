"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRELATION_ID_HEADER = void 0;
exports.createAppServer = createAppServer;
const node_crypto_1 = require("node:crypto");
const node_http_1 = require("node:http");
exports.CORRELATION_ID_HEADER = "X-Correlation-Id";
function resolveCorrelationId(req) {
    const raw = req.headers[exports.CORRELATION_ID_HEADER.toLowerCase()];
    if (typeof raw === "string" && raw.trim().length > 0) {
        return raw.trim();
    }
    if (Array.isArray(raw)) {
        const first = raw.find((value) => value.trim().length > 0);
        if (first) {
            return first.trim();
        }
    }
    return (0, node_crypto_1.randomUUID)();
}
function writeJson(res, statusCode, payload, correlationId) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body),
        [exports.CORRELATION_ID_HEADER]: correlationId
    });
    res.end(body);
}
function createAppServer() {
    return (0, node_http_1.createServer)((req, res) => {
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
