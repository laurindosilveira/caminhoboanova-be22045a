// Synthetic identities and data in the disposable isolated Docker database only.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHmac} from 'node:crypto';
const db='caminho-caixa-db-http-20261110', api='caminho-caixa-postgrest-20261110', network='caminho-caixa-rede-20261110';
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8',maxBuffer:1_000_000}).trim();
for (const name of [db,api]) {const x=JSON.parse(docker('inspect',name))[0]; assert.equal(x.HostConfig.NetworkMode,network); assert.deepEqual(Object.keys(x.NetworkSettings.Networks),[network]); assert.deepEqual(x.HostConfig.PortBindings??{},{});}
assert.equal(JSON.parse(docker('network','inspect',network))[0].Internal,true);
const sql=q=>docker('exec',db,'psql','-h','/tmp','-U','supabase_admin','-d','postgres','-qAt','-v','ON_ERROR_STOP=1','-c',q);
const a='00000000-0000-0000-0000-000000000201', b='00000000-0000-0000-0000-000000000202';
const row=JSON.parse(sql(`SELECT json_build_object('item',lesson_id,'key',question_key,'previous',response) FROM public.lesson_responses WHERE user_id='${a}' LIMIT 1`));
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
function token(id){const v=`${encode({alg:'HS256',typ:'JWT'})}.${encode({role:'authenticated',sub:id,exp:Math.floor(Date.now()/1000)+300})}`;return `${v}.${createHmac('sha256','synthetic-jwt-secret-for-isolated-tests-only-20261110').update(v).digest('base64url')}`;}
function request(id){
  const body={p_user_id:a,p_kind:'save_lesson_draft',p_item_id:row.item,p_responses:{[row.key]:'[sync identidade ficticio]'},p_expected:{[row.key]:row.previous}};
  const headers=id ? ['-H',`Authorization: Bearer ${token(id)}`] : [];
  const out=docker('exec',db,'curl','-sS','--max-time','15','-w','%{http_code}','-X','POST','-H','Content-Type: application/json',...headers,'--data',JSON.stringify(body),`http://${api}:3000/rpc/sync_owned_learning`);
  return {status:Number(out.slice(-3)),body:out.slice(0,-3)};
}
function oldRequest(endpoint,body){
  const out=docker('exec',db,'curl','-sS','--max-time','15','-w','%{http_code}','-X','POST','-H',`Authorization: Bearer ${token(a)}`,'-H','Content-Type: application/json','--data',JSON.stringify(body),`http://${api}:3000/rpc/${endpoint}`);
  return Number(out.slice(-3));
}
assert.ok(oldRequest('save_lesson_draft',{p_lesson_id:row.item,p_responses:{[row.key]:'[cliente antigo ficticio]'},p_video_watched:false,p_audio_listened:false})>=400);
assert.ok(oldRequest('sync_offline_learning',{p_kind:'save_lesson_draft',p_item_id:row.item,p_responses:{[row.key]:'[cliente antigo ficticio]'}})>=400);
assert.equal(sql(`SELECT response='[resposta atual ficticia]' FROM public.lesson_responses WHERE user_id='${a}' AND lesson_id='${row.item}' AND question_key='${row.key}'`),'t');
assert.ok(request(null).status>=400);
assert.equal(request(b).status,403);
const result=request(a);
assert.equal(result.status,200);
assert.equal(JSON.parse(result.body).status,'synced');
assert.equal(sql(`SELECT response='[sync identidade ficticio]' FROM public.lesson_responses WHERE user_id='${a}' AND lesson_id='${row.item}' AND question_key='${row.key}'`),'t');
console.log('Owned learning HTTP: anonymous and wrong session refused; owner synced synthetic answer.');
