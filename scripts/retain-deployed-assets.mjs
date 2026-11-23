import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// Collect only publicly served, versioned build assets; never read browser storage.
// Use in a temporary release copy before building the new application.
const args = process.argv.slice(2);
const value = (flag) => { const index = args.indexOf(flag); return index < 0 ? undefined : args[index + 1]; };
const source = value("--source");
const output = value("--output");
if (!source || !output) {
  console.error("Usage: node scripts/retain-deployed-assets.mjs --source https://APP_HOST --output RELEASE/public/assets");
  process.exit(2);
}
const origin = new URL(source);
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Invalid source URL');
origin.pathname = '/'; origin.search = ''; origin.hash = '';
const outputDir = path.resolve(output);
await mkdir(outputDir, { recursive: true });
const assetPattern = /(?:\/assets\/|assets\/|\.\/)([A-Za-z0-9_.-]+-[A-Za-z0-9_-]{8,}\.(?:js|css|svg|png|jpg|jpeg|webp|avif|woff2))/g;
const findAssets = (text) => [...text.matchAll(assetPattern)].map((match) => match[1]);
async function get(url) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${new URL(url).pathname}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 10 * 1024 * 1024) throw new Error(`Asset too large: ${new URL(url).pathname}`);
  return { bytes, type: response.headers.get('content-type') ?? '' };
}
const root = await get(origin.href);
if (!root.type.includes('text/html')) throw new Error('Source did not return an HTML application page');
const pending = new Set(findAssets(root.bytes.toString('utf8')));
if (![...pending].some((name) => name.endsWith('.js'))) throw new Error('No versioned JavaScript entry found');
const seen = new Set();
while (pending.size) {
  const batch = [...pending].filter((name) => !seen.has(name)); pending.clear();
  if (!batch.length) break;
  if (seen.size + batch.length > 1000) throw new Error('Asset limit exceeded');
  for (let start = 0; start < batch.length; start += 8) {
    await Promise.all(batch.slice(start, start + 8).map(async (name) => {
      seen.add(name);
      const { bytes, type } = await get(new URL(`/assets/${encodeURIComponent(name)}`, origin).href);
      if (type.includes('text/html')) throw new Error(`Server returned HTML for asset ${name}`);
      if (name.endsWith('.js') && !/(javascript|ecmascript)/i.test(type)) throw new Error(`Invalid JavaScript content type for ${name}: ${type}`);
      const destination = path.join(outputDir, name);
      try { await writeFile(destination, bytes, { flag: 'wx' }); }
      catch (error) {
        if (error.code !== 'EEXIST') throw error;
        if (!(await readFile(destination)).equals(bytes)) throw new Error(`Asset collision: ${name}`);
      }
      if (name.endsWith('.js') || name.endsWith('.css')) for (const next of findAssets(bytes.toString('utf8'))) if (!seen.has(next)) pending.add(next);
    }));
  }
}
console.log(`Preserved ${seen.size} assets from ${origin.origin} in ${outputDir}.`);
