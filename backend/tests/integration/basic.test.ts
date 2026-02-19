import assert from "node:assert/strict";
import { once } from "node:events";
import { type Server } from "node:http";
import { type AddressInfo } from "node:net";
import test from "node:test";

import { CORRELATION_ID_HEADER, createAppServer } from "../../src/server";

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = createAppServer();

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await closeServer(server);
  }
}

async function closeServer(server: Server): Promise<void> {
  server.close();
  await once(server, "close");
}

test("GET /health returns 200 and sets correlation id", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);

    const payload = (await response.json()) as { status: string };
    assert.equal(payload.status, "ok");

    const correlationId = response.headers.get(CORRELATION_ID_HEADER.toLowerCase());
    assert.ok(correlationId);
    assert.ok(correlationId.length > 0);
  });
});

test("GET /ready preserves provided X-Correlation-Id", async () => {
  await withServer(async (baseUrl) => {
    const providedCorrelationId = "cid-test-ready-001";
    const response = await fetch(`${baseUrl}/ready`, {
      headers: {
        [CORRELATION_ID_HEADER]: providedCorrelationId
      }
    });

    assert.equal(response.status, 200);

    const payload = (await response.json()) as { status: string };
    assert.equal(payload.status, "ready");

    const returnedCorrelationId = response.headers.get(CORRELATION_ID_HEADER.toLowerCase());
    assert.equal(returnedCorrelationId, providedCorrelationId);
  });
});
