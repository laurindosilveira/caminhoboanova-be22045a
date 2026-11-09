import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

let server: Server;
let origin: string;
let temp: string;
let returnHtmlForChunk = false;

beforeAll(async () => {
  temp = await mkdtemp(path.join(tmpdir(), "caminho-retain-test-"));
  server = createServer((request, response) => {
    if (request.url === "/") { response.writeHead(200, { "content-type": "text/html" }); response.end('<script type="module" src="/assets/main-AbC12345.js"></script>'); return; }
    if (request.url === "/assets/main-AbC12345.js") { response.writeHead(200, { "content-type": "text/javascript" }); response.end('import "./lazy-DeF12345.js";'); return; }
    if (request.url === "/assets/lazy-DeF12345.js" && !returnHtmlForChunk) { response.writeHead(200, { "content-type": "text/javascript" }); response.end('export default 42;'); return; }
    response.writeHead(200, { "content-type": "text/html" }); response.end('<html>fallback</html>');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing server address");
  origin = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await rm(temp, { recursive: true, force: true }); });

function collect(output: string) {
  return new Promise<{ code: number | null; text: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/retain-deployed-assets.mjs", "--source", origin, "--output", output], { cwd: process.cwd() });
    let text = ""; child.stdout.on("data", (chunk) => { text += chunk; }); child.stderr.on("data", (chunk) => { text += chunk; });
    child.on("error", reject); child.on("close", (code) => resolve({ code, text }));
  });
}

describe("release asset retention", () => {
  it("preserves the entry module and its dependent modules", async () => {
    const output = path.join(temp, "success"); const result = await collect(output);
    expect(result.code).toBe(0); expect(await readFile(path.join(output, "main-AbC12345.js"), "utf8")).toContain("lazy-DeF12345.js");
    expect(await readFile(path.join(output, "lazy-DeF12345.js"), "utf8")).toContain("42");
  });
  it("rejects an HTML fallback returned for a missing module", async () => {
    returnHtmlForChunk = true; const result = await collect(path.join(temp, "missing")); returnHtmlForChunk = false;
    expect(result.code).not.toBe(0); expect(result.text).toContain("Server returned HTML for asset");
  });
  it("refuses to overwrite a different asset with the same name", async () => {
    const output = path.join(temp, "success"); await writeFile(path.join(output, "main-AbC12345.js"), "different");
    const result = await collect(output); expect(result.code).not.toBe(0); expect(result.text).toContain("Asset collision");
  });
});
