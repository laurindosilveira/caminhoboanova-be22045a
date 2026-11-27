import "fake-indexeddb/auto";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

const bridge=vi.hoisted(() => ({ rpc:vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase:{ rpc:bridge.rpc } }));

describe.skipIf(process.env.RUN_ROLLBACK_LOCAL_E2E !== "1")("reversão protegida", () => {
  it("mantém a fila publicada quando os salvamentos estão temporariamente pausados", async () => {
    const db="caminho-caixa-db-http-20261110", api="caminho-caixa-postgrest-20261110";
    const docker=(...args:string[]) => execFileSync("docker",args,{encoding:"utf8",maxBuffer:1_000_000}).trim();
    const owner="00000000-0000-0000-0000-000000000201";
    const row=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('lesson',lesson_id,'key',question_key,'answer',response) FROM public.lesson_responses WHERE user_id='${owner}' LIMIT 1`));
    const encode=(x:unknown)=>Buffer.from(JSON.stringify(x)).toString("base64url");
    const claims=`${encode({alg:"HS256",typ:"JWT"})}.${encode({role:"authenticated",sub:owner,exp:Math.floor(Date.now()/1000)+300})}`;
    const jwt=`${claims}.${createHmac("sha256","synthetic-jwt-secret-for-isolated-tests-only-20261110").update(claims).digest("base64url")}`;
    bridge.rpc.mockImplementation(async (name,args) => {
      const raw=docker("exec",db,"curl","-sS","--max-time","15","-w","%{http_code}","-X","POST","-H",`Authorization: Bearer ${jwt}`,
        "-H","Content-Type: application/json","--data",JSON.stringify(args),`http://${api}:3000/rpc/${name}`);
      const code=Number(raw.slice(-3));
      return code===200 ? {data:JSON.parse(raw.slice(0,-3)),error:null} : {data:null,error:new Error(`RPC HTTP ${code}`)};
    });
    const old=await import("./fixtures/studentOffline-published");
    await old.enqueueStudentAction({type:"save_lesson_draft",userId:owner,payload:{lessonId:row.lesson,responses:{[row.key]:"[rascunho ficticio]"},videoWatched:false,audioListened:false}});
    await expect(old.syncStudentOfflineQueue(owner)).rejects.toThrow();
    expect(await old.getQueuedStudentActions(owner)).toHaveLength(1);
    const after=JSON.parse(docker("exec",db,"psql","-h","/tmp","-U","supabase_admin","-d","postgres","-qAt","-v","ON_ERROR_STOP=1","-c",
      `SELECT json_build_object('answer',response) FROM public.lesson_responses WHERE user_id='${owner}' AND lesson_id='${row.lesson}' AND question_key='${row.key}'`));
    expect(after.answer).toBe(row.answer);
  },45000);
});
