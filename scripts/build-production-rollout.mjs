// Generate the review artifact only; never connects to a database.
import { readFileSync, writeFileSync } from "node:fs";
const candidate = readFileSync("supabase/rollout/20261123_coordinated_learning_candidate.sql", "utf8");
const preflight = readFileSync("supabase/rollout/production_preflight_20261124.sql", "utf8");
const snapshot = readFileSync("supabase/rollout/production_release_snapshot_20261124.sql", "utf8");
const marker = "BEGIN;\n";
if (!candidate.includes(marker)) throw new Error("Expected transaction marker is missing");
const postMarker = "NOTIFY pgrst, 'reload schema';";
if (!candidate.includes(postMarker)) throw new Error("Expected post-transaction marker is missing");
const reviewed = candidate.replace(marker, () => `${marker}\n${preflight}\n`).replace(postMarker, () => `${snapshot}\n${postMarker}`);
writeFileSync("supabase/rollout/production_coordinated_candidate_20261124.sql", reviewed, "utf8");
console.log("Prepared production review candidate; no database was contacted.");
