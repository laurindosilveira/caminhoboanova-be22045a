import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname} from "node:path";
import {chromium} from "playwright";
import assert from "node:assert/strict";
const root=resolve(process.argv[2] || "dist"); let version="v1";
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,"http://localhost"); const decoded=decodeURIComponent(url.pathname);
  let file=resolve(root,"."+decoded);
  if(!file.startsWith(root+"\\") && file!==root){res.writeHead(403).end();return;}
  try { if((await stat(file)).isDirectory()) file=resolve(file,"index.html"); }
  catch { if(!extname(file)) file=resolve(root,"index.html"); else {res.writeHead(404).end();return;} }
  let body=await readFile(file);
  if(file===resolve(root,"index.html"))body=Buffer.from(body.toString("utf8").replace("<head>",`<head><meta name="test-shell" content="${version}">`));
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 } catch {res.writeHead(500).end();}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
let browser;
try {
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 await context.route("https://**/*",route=>route.abort());
 const page=await context.newPage();
 await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
 await page.evaluate(async()=>{await navigator.serviceWorker.register("/sw.js");await navigator.serviceWorker.ready;});
 await page.reload({waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 assert.equal(await page.locator('meta[name="test-shell"]').getAttribute("content"),"v1");
 version="v2";
 await page.goto(origin+"/?updated",{waitUntil:"domcontentloaded"});
 assert.equal(await page.locator('meta[name="test-shell"]').getAttribute("content"),"v2","navigation must reach the new deployment");
 await context.setOffline(true);
 const failed=[];page.on("requestfailed",r=>{if(r.url().startsWith(origin+"/assets/") && ["script","stylesheet"].includes(r.resourceType()))failed.push(r.url());});
 const response=await page.goto(origin+"/previously-unvisited-route",{waitUntil:"domcontentloaded"});
 assert.equal(response.status(),200,"offline fallback should serve the cached shell");
 assert.equal(await page.locator('meta[name="test-shell"]').getAttribute("content"),"v1","offline shell must match the active worker");
 await page.waitForTimeout(1200);
 assert.deepEqual(failed,[],"entry assets must be present offline");
 console.log("Service worker: fresh online navigation and offline shell with initial assets passed.");
 await context.close();
} finally { if(browser)await browser.close();await new Promise(r=>server.close(r)); }
