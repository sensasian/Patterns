import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(){
  const workerUrl=new URL("../dist/server/index.js",import.meta.url);workerUrl.searchParams.set("test",`${process.pid}-${Date.now()}`);const{default:worker}=await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/",{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
}

test("server-renders the Nodes supply-chain diagnostic",async()=>{
  const response=await render();assert.equal(response.status,200);assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);const html=await response.text();
  assert.match(html,/<title>Nodes — Supply Chain Intelligence<\/title>/i);assert.match(html,/Supply Chain Intelligence/);assert.match(html,/Operational benchmark/);assert.match(html,/Eastport Consumer Logistics/);assert.match(html,/Upload operational CSVs/);assert.match(html,/Constraint network/);
});

test("ships usable synthetic datasets and functional analysis controls",async()=>{
  const [page,warehouse,transport,inventory]=await Promise.all([readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),readFile(new URL("../public/samples/nodes-warehouse-daily.csv",import.meta.url),"utf8"),readFile(new URL("../public/samples/nodes-transport-lanes.csv",import.meta.url),"utf8"),readFile(new URL("../public/samples/nodes-inventory-snapshot.csv",import.meta.url),"utf8")]);
  assert.match(page,/function analyse/);assert.match(page,/percentile/);assert.match(page,/Constraint propagation/i);assert.match(page,/Recommended interventions/i);assert.ok(warehouse.split("\n").length>20);assert.ok(transport.split("\n").length>10);assert.ok(inventory.split("\n").length>5);
});
