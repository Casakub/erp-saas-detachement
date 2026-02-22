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

test("substrate gate: health and ready endpoints are available", async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const ready = await fetch(`${baseUrl}/ready`);
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { status: "ready" });
  });
});

test("substrate gate: business routes are not exposed in PR0", async () => {
  await withServer(async (baseUrl) => {
    const providedCorrelationId = "cid-pr0-no-business-route";
    const response = await fetch(`${baseUrl}/v1/quotes`, {
      headers: {
        [CORRELATION_ID_HEADER]: providedCorrelationId
      }
    });

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "not_found" });

    const returnedCorrelationId = response.headers.get(CORRELATION_ID_HEADER.toLowerCase());
    assert.equal(returnedCorrelationId, providedCorrelationId);
  });
});
