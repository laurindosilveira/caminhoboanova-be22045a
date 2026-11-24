// Build the exact candidate for review. This command never connects to a DB.
import { readFileSync, writeFileSync } from "node:fs";

const parts = [
  "supabase/rollout/20261106221735_learning_compatibility.sql",
  "supabase/rollout/20261106225947_per_item_learning_conflict_guard.sql",
  "supabase/rollout/20261123_owned_learning_guard.sql",
  "supabase/rollout/attendance_scope_candidate.sql",
  "supabase/rollout/historical_response_read_candidate.sql",
];
const output = "supabase/rollout/20261123_coordinated_learning_candidate.sql";
const header = `-- REVIEW CANDIDATE ONLY. Do not run an automatic migration batch.
-- All reviewed steps must commit atomically with the matching client.
-- Validate current production signatures, privileges, backup and rollback.
BEGIN;\n`;
const sections = parts.map((file) => `\n-- Reviewed source: ${file}\n${readFileSync(file, "utf8").trim()}\n`);
writeFileSync(output, `${header}${sections.join("")}\nNOTIFY pgrst, 'reload schema';\nCOMMIT;\n`, "utf8");
console.log(`Prepared ${output} from ${parts.length} sources; no database was contacted.`);
