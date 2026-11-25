// Check the generated offline shell and its static import graph after each build.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { staticPwaGraph } from "./pwa-static-graph.mjs";
const root=resolve(process.argv[2] || "dist"), sw=readFileSync(resolve(root,"sw.js"),"utf8");
const required=staticPwaGraph(root),missing=[...required].filter(file=>!sw.includes(file));
if(missing.length)throw new Error(`Offline shell misses static assets: ${missing.join(", ")}`);
if(sw.includes("NavigationRoute(")||!sw.includes("PrecacheFallbackPlugin")||!sw.includes("NetworkOnly"))throw new Error("Offline navigation strategy was not generated as expected");
console.log(`Offline shell and ${required.size} static modules verified.`);
