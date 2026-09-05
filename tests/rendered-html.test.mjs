import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Noema investigation workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Noema — Visual Evidence Investigation<\/title>/i);
  assert.match(html, /Build live graph/);
  assert.match(html, /Crossref/);
  assert.match(html, /OpenAlex/);
  assert.match(html, /Demo corpus/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("keeps live integrations explicit and fixes known interaction defects", async () => {
  const [page, route] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/investigate/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /setActive\("hypothesis"\)/);
  assert.doesNotMatch(page, /hypoxia/);
  assert.match(page, /<title>\{`\$\{node\.kind\} linked to/);
  assert.match(route, /api\.crossref\.org\/works/);
  assert.match(route, /api\.openalex\.org\/works/);
  assert.match(route, /Promise\.allSettled/);
});
