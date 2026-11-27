// Only the synthetic android38 account in staging. Do not print tokens or answers.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const key = process.env.STAGING_PUBLIC_KEY;
const password = process.env.STAGING_TEST_PASSWORD;
if (!key || !password) throw new Error("Missing test credentials");
const url = "https://nuqwwlzklqdlnvqdbpjy.supabase.co";
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const auth = await client.auth.signInWithPassword({
  email: "android38@example.com", password,
  options: { captchaToken: "XXXX.DUMMY.TOKEN.XXXX" },
});
assert.ifError(auth.error);
const user = auth.data.user;
assert.ok(user?.id);
const first = await client.from("lesson_responses").select("lesson_id,question_key,response").eq("user_id", user.id).limit(1).single();
assert.ifError(first.error);
assert.ok(first.data);
const { lesson_id, question_key, response } = first.data;

const old = await client.rpc("save_lesson_draft", { p_lesson_id: lesson_id, p_responses: { [question_key]: "[ensaio ficticio antigo]" }, p_video_watched: false, p_audio_listened: false });
assert.ok(old.error, "Legacy save unexpectedly succeeded");
assert.equal(old.error.message, "APP_UPDATE_REQUIRED");

const wrong = await client.rpc("sync_owned_learning", { p_user_id: "00000000-0000-0000-0000-000000000201", p_kind: "save_lesson_draft", p_item_id: lesson_id, p_responses: { [question_key]: "[conta incorreta]" }, p_expected: { [question_key]: response } });
assert.ok(wrong.error, "Wrong account unexpectedly succeeded");
assert.equal(wrong.error.code, "42501");

const conflict = await client.rpc("sync_owned_learning", { p_user_id: user.id, p_kind: "save_lesson_draft", p_item_id: lesson_id, p_responses: { [question_key]: "[fila antiga ficticia]" }, p_expected: { [question_key]: "[estado anterior ficticio]" } });
assert.ifError(conflict.error);
assert.equal(conflict.data?.status, "conflict");
const after = await client.from("lesson_responses").select("response").eq("user_id", user.id).eq("lesson_id", lesson_id).eq("question_key", question_key).single();
assert.ifError(after.error);
assert.equal(after.data?.response, response, "A rejected attempt changed the existing answer");
await client.auth.signOut();
console.log(JSON.stringify({ captcha: "simulado", legacyRejected: true, otherAccountRejected: true, conflictRetained: true }));
