import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the TripReady product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>[^<]*TripReady/);
  assert.match(html, /London in autumn/);
  assert.match(html, /LIKELY SCHEDULE CONFLICT/);
  assert.match(html, /Travel wallet/);
  assert.match(html, /Offline wallet ready/);
  assert.match(html, /Ask TripReady/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("keeps time zones, provenance, and approvals first-class", async () => {
  const [schema, route, agents, hosting, packageJson] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/assistant/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(schema, /startLocal/);
  assert.match(schema, /startTimeZone/);
  assert.match(schema, /startUtc/);
  assert.match(schema, /sourceDocumentId/);
  assert.match(schema, /confidence/);
  assert.match(schema, /requiresReview/);
  assert.match(route, /gpt-5\.6-sol/);
  assert.match(route, /External changes require explicit user approval/);
  assert.match(route, /store: false/);
  assert.match(agents, /Never invent a confirmation number/);
  assert.match(agents, /tenant authorization/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "DOCUMENTS"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
