"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_events_1 = require("node:events");
const node_test_1 = __importDefault(require("node:test"));
const server_1 = require("../../src/server");
async function withServer(run) {
    const server = (0, server_1.createAppServer)();
    server.listen(0, "127.0.0.1");
    await (0, node_events_1.once)(server, "listening");
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
        await run(baseUrl);
    }
    finally {
        await closeServer(server);
    }
}
async function closeServer(server) {
    server.close();
    await (0, node_events_1.once)(server, "close");
}
(0, node_test_1.default)("GET /health returns 200 and sets correlation id", async () => {
    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/health`);
        strict_1.default.equal(response.status, 200);
        const payload = (await response.json());
        strict_1.default.equal(payload.status, "ok");
        const correlationId = response.headers.get(server_1.CORRELATION_ID_HEADER.toLowerCase());
        strict_1.default.ok(correlationId);
        strict_1.default.ok(correlationId.length > 0);
    });
});
(0, node_test_1.default)("GET /ready preserves provided X-Correlation-Id", async () => {
    await withServer(async (baseUrl) => {
        const providedCorrelationId = "cid-test-ready-001";
        const response = await fetch(`${baseUrl}/ready`, {
            headers: {
                [server_1.CORRELATION_ID_HEADER]: providedCorrelationId
            }
        });
        strict_1.default.equal(response.status, 200);
        const payload = (await response.json());
        strict_1.default.equal(payload.status, "ready");
        const returnedCorrelationId = response.headers.get(server_1.CORRELATION_ID_HEADER.toLowerCase());
        strict_1.default.equal(returnedCorrelationId, providedCorrelationId);
    });
});
