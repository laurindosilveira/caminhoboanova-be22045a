// Runs only inside the isolated Docker harness, with synthetic responses.
import "fake-indexeddb/auto";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

const bridge=vi.hoisted(() => ({ rpc:vi.fn(), getUser:vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase:{ rpc:bridge.rpc, auth:{ getUser:bridge.getUser } } }));
const enabled=process.env.RUN_UNIFIED_LOCAL_E2E === "1";

describe.skipIf(!enabled)("fila offline e atualização unificada", () => {
  it("preserva uma fila criada pelo código publicado quando o banco recusa o cliente antigo", async () => {
    const db="caminho-caixa-db-http-20261110", api="caminho-caixa-postgrest-20261110";
    const docker=(...args:string[]) => execFileSync("docker",args,{encoding:"utf8",maxBuffer:1_000_000}).trim();
    const owner="00000000-0000-0000-0000-000000000201";
    const row=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('lesson',lesson_id,'key',question_key,'answer',response) FROM public.lesson_responses WHERE user_id='${owner}' LIMIT 1`));
    const encode=(x:unknown) => Buffer.from(JSON.stringify(x)).toString("base64url");
    const claims=`${encode({alg:"HS256",typ:"JWT"})}.${encode({role:"authenticated",sub:owner,exp:Math.floor(Date.now()/1000)+300})}`;
    const jwt=`${claims}.${createHmac("sha256","synthetic-jwt-secret-for-isolated-tests-only-20261110").update(claims).digest("base64url")}`;
    bridge.getUser.mockResolvedValue({data:{user:{id:owner}}});
    bridge.rpc.mockImplementation(async (name,args) => {
      const raw=docker("exec",db,"curl","-sS","--max-time","15","-w","%{http_code}","-X","POST","-H",`Authorization: Bearer ${jwt}`,
        "-H","Content-Type: application/json","--data",JSON.stringify(args),`http://${api}:3000/rpc/${name}`);
      const code=Number(raw.slice(-3));
      return code===200 ? {data:JSON.parse(raw.slice(0,-3)),error:null} : {data:null,error:new Error(`RPC HTTP ${code}`)};
    });
    const old=await import("./fixtures/studentOffline-published");
    const current=await import("@/lib/studentOffline");
    await old.enqueueStudentAction({type:"save_lesson_draft",userId:owner,payload:{lessonId:row.lesson,responses:{[row.key]:"[fila antiga ficticia]"},videoWatched:false,audioListened:false}});
    await expect(old.syncStudentOfflineQueue(owner)).rejects.toThrow();
    expect(await old.getQueuedStudentActions(owner)).toHaveLength(1);
    const result=await current.syncStudentOfflineQueue(owner);
    expect(result.conflict?.current[row.key]).toBe(row.answer);
    expect(await current.getQueuedStudentActions(owner,{strict:true})).toHaveLength(1);
    expect(await current.resolveOfflineConflict(result.conflict!,"server")).toBeNull();
    expect(await current.getQueuedStudentActions(owner,{strict:true})).toHaveLength(0);
    const after=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('answer',response) FROM public.lesson_responses WHERE user_id='${owner}' AND lesson_id='${row.lesson}' AND question_key='${row.key}'`));
    expect(after.answer).toBe(row.answer);
  },45000);
  it("mantém um rascunho antigo, compara e remove somente após confirmação do servidor", async () => {
    const db="caminho-caixa-db-http-20261110", api="caminho-caixa-postgrest-20261110", network="caminho-caixa-rede-20261110";
    const docker=(...args:string[]) => execFileSync("docker",args,{encoding:"utf8",maxBuffer:1_000_000}).trim();
    expect(JSON.parse(docker("network","inspect",network))[0].Internal).toBe(true);
    for (const name of [db,api]) {
      const c=JSON.parse(docker("inspect",name))[0];
      expect(c.HostConfig.NetworkMode).toBe(network);
      expect(c.HostConfig.PortBindings ?? {}).toEqual({});
    }
    const owner="00000000-0000-0000-0000-000000000201";
    const row=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('lesson',lesson_id,'key',question_key) FROM public.lesson_responses WHERE user_id='${owner}' LIMIT 1`));
    const encode=(x:unknown) => Buffer.from(JSON.stringify(x)).toString("base64url");
    const claims=`${encode({alg:"HS256",typ:"JWT"})}.${encode({role:"authenticated",sub:owner,exp:Math.floor(Date.now()/1000)+300})}`;
    const jwt=`${claims}.${createHmac("sha256","synthetic-jwt-secret-for-isolated-tests-only-20261110").update(claims).digest("base64url")}`;
    bridge.getUser.mockResolvedValue({data:{user:{id:owner}}});
    bridge.rpc.mockImplementation(async (name,args) => {
      const raw=docker("exec",db,"curl","-sS","--max-time","15","-w","%{http_code}","-X","POST","-H",`Authorization: Bearer ${jwt}`,
        "-H","Content-Type: application/json","--data",JSON.stringify(args),`http://${api}:3000/rpc/${name}`);
      const code=Number(raw.slice(-3));
      return code===200 ? {data:JSON.parse(raw.slice(0,-3)),error:null} : {data:null,error:new Error(`RPC HTTP ${code}`)};
    });
    const q=await import("@/lib/studentOffline");
    await q.enqueueStudentAction({type:"save_lesson_draft",userId:owner,payload:{lessonId:row.lesson,responses:{[row.key]:"[fila offline ficticia]"},videoWatched:false,audioListened:false}});
    const result=await q.syncStudentOfflineQueue(owner);
    expect(result.conflict).toBeTruthy();
    expect(await q.getQueuedStudentActions(owner,{strict:true})).toHaveLength(1);
    expect(await q.resolveOfflineConflict(result.conflict!,"offline")).toBeNull();
    expect(await q.getQueuedStudentActions(owner,{strict:true})).toHaveLength(0);
  },45000);
  it("reviews and completes a legacy item through the owner, leader and database", async () => {
    const db="caminho-caixa-db-http-20261110", api="caminho-caixa-postgrest-20261110";
    const docker=(...args:string[]) => execFileSync("docker",args,{encoding:"utf8",maxBuffer:1_000_000}).trim();
    const owner="00000000-0000-0000-0000-000000000201", leader="00000000-0000-0000-0000-000000000203", group="00000000-0000-0000-0000-000000000321";
    const row=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('lesson',lesson_id,'key',question_key,'answer',response) FROM public.lesson_responses WHERE user_id='${owner}' LIMIT 1`));
    const encode=(x:unknown) => Buffer.from(JSON.stringify(x)).toString("base64url");
    const jwt=(id:string)=>{const claims=`${encode({alg:"HS256",typ:"JWT"})}.${encode({role:"authenticated",sub:id,exp:Math.floor(Date.now()/1000)+300})}`;return `${claims}.${createHmac("sha256","synthetic-jwt-secret-for-isolated-tests-only-20261110").update(claims).digest("base64url")}`;};
    const rpc=async (id:string,name:string,args:unknown) => {
      const raw=docker("exec",db,"curl","-sS","--max-time","15","-w","%{http_code}","-X","POST","-H",`Authorization: Bearer ${jwt(id)}`,
        "-H","Content-Type: application/json","--data",JSON.stringify(args),`http://${api}:3000/rpc/${name}`);
      const code=Number(raw.slice(-3)); return code===200 ? {data:JSON.parse(raw.slice(0,-3)),error:null} : {data:null,error:new Error(`RPC HTTP ${code}`)};
    };
    bridge.getUser.mockResolvedValue({data:{user:{id:owner}}}); bridge.rpc.mockImplementation((name,args)=>rpc(owner,name,args));
    const old=await import("./fixtures/studentOffline-published"); const current=await import("@/lib/studentOffline");
    const responses:Record<string,string>={ [row.key]:"[fila de conclusao ficticia]",icebreaker:"[ficticio]",practice:"[ficticio]",prayer:"[ficticio]" };
    for(let i=0;i<=50;i++)responses[`q${i}`]="[ficticio]";
    await old.enqueueStudentAction({type:"complete_lesson",userId:owner,payload:{lessonId:row.lesson,responses,videoWatched:true,audioListened:true}});
    const first=await current.syncStudentOfflineQueue(owner);
    expect(first).toMatchObject({synced:0,remaining:1,legacyCompletionPending:true});
    const listed=await rpc(leader,"list_completion_reviews",{p_turma_id:group}); expect(listed.error).toBeNull(); expect(listed.data).toHaveLength(1);
    const approved=await rpc(leader,"approve_completion_review",{p_id:listed.data[0].id,p_confirm:true}); expect(approved.data.status).toBe("approved");
    const second=await current.syncStudentOfflineQueue(owner); expect(second.conflict).toBeTruthy();
    expect(await current.resolveOfflineConflict(second.conflict!,"offline")).toBeNull();
    expect(await current.getQueuedStudentActions(owner,{strict:true})).toHaveLength(0);
    const result=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('completed',coalesce((SELECT is_completed FROM public.lesson_progress WHERE user_id='${owner}' AND lesson_id='${row.lesson}'),false),'approved',EXISTS(SELECT 1 FROM private.completion_review_events WHERE event='approved' AND actor='${leader}'))`));
    expect(result).toEqual({completed:true,approved:true});
  },45000);
  it("reviews a run of drafts once, detects a second device and keeps a later edit", async () => {
    const db="caminho-caixa-db-http-20261110", api="caminho-caixa-postgrest-20261110";
    const docker=(...args:string[]) => execFileSync("docker",args,{encoding:"utf8",maxBuffer:1_000_000}).trim();
    const owner="00000000-0000-0000-0000-000000000201";
    const row=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('lesson',r.lesson_id,'key',r.question_key,'church',p.church_id,'group',p.turma_id,'area',p.area,'version',v.version) FROM public.lesson_responses r JOIN public.profiles p ON p.user_id=r.user_id JOIN private.learning_membership_version v ON v.user_id=r.user_id WHERE r.user_id='${owner}' LIMIT 1`));
    const encode=(x:unknown)=>Buffer.from(JSON.stringify(x)).toString("base64url");
    const claims=`${encode({alg:"HS256",typ:"JWT"})}.${encode({role:"authenticated",sub:owner,exp:Math.floor(Date.now()/1000)+300})}`;
    const token=`${claims}.${createHmac("sha256","synthetic-jwt-secret-for-isolated-tests-only-20261110").update(claims).digest("base64url")}`;
    bridge.getUser.mockResolvedValue({data:{user:{id:owner}}});
    bridge.rpc.mockImplementation(async (name,args) => {
      const raw=docker("exec",db,"curl","-sS","--max-time","15","-w","%{http_code}","-X","POST","-H",`Authorization: Bearer ${token}`,
        "-H","Content-Type: application/json","--data",JSON.stringify(args),`http://${api}:3000/rpc/${name}`);
      const code=Number(raw.slice(-3)); return code===200 ? {data:JSON.parse(raw.slice(0,-3)),error:null} : {data:null,error:new Error(`RPC HTTP ${code}`)};
    });
    const q=await import("@/lib/studentOffline");
    const scope={churchId:row.church,turmaId:row.group,area:row.area,membershipVersion:row.version};
    const queue=async (text:string)=>{
      const x=await q.enqueueStudentAction({type:"save_lesson_draft",userId:owner,churchId:row.church,scope,payload:{lessonId:row.lesson,responses:{[row.key]:text},videoWatched:false,audioListened:false}});
      await new Promise(resolve=>setTimeout(resolve,5)); return x;
    };
    await queue("[versao 1]"); await queue("[versao 2]"); await queue("[versao final]");
    const first=await q.syncStudentOfflineQueue(owner);
    expect(first.conflict?.draftBatch).toHaveLength(3);
    expect(first.conflict?.action.payload.responses[row.key]).toBe("[versao final]");
    docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `UPDATE public.lesson_responses SET response='[outro aparelho]' WHERE user_id='${owner}' AND lesson_id='${row.lesson}' AND question_key='${row.key.replace(/'/g,"''")}'`);
    const changed=await q.resolveOfflineConflict(first.conflict!,"offline");
    expect(changed?.current[row.key]).toBe("[outro aparelho]");
    expect(changed?.draftBatch).toHaveLength(3);
    const newer=await queue("[edicao posterior]");
    expect(await q.resolveOfflineConflict(changed!,"offline")).toBeNull();
    expect((await q.getQueuedStudentActions(owner,{strict:true})).map(x=>x.id)).toEqual([newer.id]);
    const stored=docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT response FROM public.lesson_responses WHERE user_id='${owner}' AND lesson_id='${row.lesson}' AND question_key='${row.key.replace(/'/g,"''")}'`);
    expect(stored).toBe("[versao final]");
  },90000);
});
