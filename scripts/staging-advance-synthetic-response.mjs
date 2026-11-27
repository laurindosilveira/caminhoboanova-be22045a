// Test-only update to the single known synthetic Android fixture.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const key=process.env.STAGING_PUBLIC_KEY, password=process.env.STAGING_TEST_PASSWORD;
if (!key || !password) throw new Error("Missing test credentials");
const client=createClient("https://nuqwwlzklqdlnvqdbpjy.supabase.co",key,{auth:{persistSession:false,autoRefreshToken:false}});
const login=await client.auth.signInWithPassword({email:"android38@example.com",password,options:{captchaToken:"XXXX.DUMMY.TOKEN.XXXX"}});
assert.ifError(login.error);
const user=login.data.user;
assert.ok(user?.id);
const read=await client.from("lesson_responses").select("lesson_id,question_key,response").eq("user_id",user.id);
assert.ifError(read.error);
assert.equal(read.data.length,1,"Synthetic fixture changed; refusing to modify it");
const row=read.data[0];
assert.equal(row.response,"Teste 24","Synthetic fixture no longer matches expected state");
const saved=await client.rpc("sync_owned_learning",{
  p_user_id:user.id,p_kind:"save_lesson_draft",p_item_id:row.lesson_id,
  p_responses:{[row.question_key]:"Mais recente 24"},p_expected:{[row.question_key]:row.response},
});
assert.ifError(saved.error);
assert.equal(saved.data?.status,"synced");
await client.auth.signOut();
console.log("A resposta fictícia mais recente foi salva na homologação.");
