// Generate an explicitly staging-only transaction; no database is contacted.
import { readFileSync, writeFileSync } from "node:fs";

const candidate = readFileSync("supabase/rollout/20261123_coordinated_learning_candidate.sql", "utf8");
const preflight = readFileSync("supabase/rollout/staging_preflight_20261124.sql", "utf8");
const marker = "BEGIN;\n";
if (!candidate.includes(marker)) throw new Error("Expected transaction marker is missing");
const staging = candidate.replace(marker, () => `${marker}\n${preflight}\n`);
writeFileSync("supabase/rollout/staging_coordinated_candidate_20261124.sql", staging, "utf8");
console.log("Prepared staging-only candidate; no database was contacted.");
