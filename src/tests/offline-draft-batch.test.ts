import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bridge = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: bridge.rpc, auth: { getUser: bridge.getUser } } }));
import { enqueueStudentAction, getQueuedStudentActions, resolveOfflineConflict, syncStudentOfflineQueue } from "@/lib/studentOffline";

const scope = { churchId:"church-a", turmaId:"group-a", area:"1", membershipVersion:"membership-a" };
const delay = () => new Promise(resolve => setTimeout(resolve, 3));
async function draft(userId: string, responses: Record<string,string>, override: { scope?: typeof scope; lessonId?: string; videoWatched?: boolean; audioListened?: boolean } = {}) {
  const action = await enqueueStudentAction({ type:"save_lesson_draft", userId, churchId:"church-a", scope:override.scope ?? scope,
    payload:{ lessonId:override.lessonId ?? "lesson-a", responses, videoWatched:override.videoWatched ?? false, audioListened:override.audioListened ?? false } });
  await delay();
  if (action.type !== "save_lesson_draft") throw new Error("invalid fixture");
  return action;
}
beforeEach(() => { bridge.rpc.mockReset(); bridge.getUser.mockReset(); });

describe("consecutive offline lesson drafts", () => {
  it("shows the latest complete snapshot once and retains all drafts until the student decides", async () => {
    const user="batch-conflict-a";
    const first=await draft(user,{q0:"rascunho 1",q1:"outra"});
    await draft(user,{q0:"rascunho 2",q1:"outra"});
    const last=await draft(user,{q0:"rascunho final",q1:"outra"});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"outro aparelho",q1:"outra"}},error:null});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    const result=await syncStudentOfflineQueue(user);
    expect(result.conflict?.action.id).toBe(last.id);
    expect(result.conflict?.draftBatch?.map(x=>x.id)).toEqual([first.id,expect.any(String),last.id]);
    expect((await getQueuedStudentActions(user)).length).toBe(3);
    expect(bridge.rpc).toHaveBeenCalledTimes(1);
    bridge.rpc.mockResolvedValueOnce({data:{status:"synced"},error:null});
    expect(await resolveOfflineConflict(result.conflict!,"offline")).toBeNull();
    expect(bridge.rpc.mock.calls[1][1]).toMatchObject({p_responses:{q0:"rascunho final",q1:"outra"},p_expected:{q0:"outro aparelho",q1:"outra"}});
    expect(await getQueuedStudentActions(user)).toHaveLength(0);
  });
  it("discards only the drafts reviewed together when the student keeps the server", async () => {
    const user="batch-keep-server-k";
    await draft(user,{q0:"first"}); await draft(user,{q0:"last"});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    const newer=await draft(user,{q0:"written after dialog"});
    expect(await resolveOfflineConflict(result.conflict!,"server")).toBeNull();
    expect(bridge.rpc).toHaveBeenCalledTimes(1);
    expect((await getQueuedStudentActions(user)).map(x=>x.id)).toEqual([newer.id]);
  });
  it("does not remove any snapshot if the server changes again or is unavailable", async () => {
    const user="batch-changed-b";
    await draft(user,{q0:"1"}); await draft(user,{q0:"2"});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"servidor"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"mudou novamente"}},error:null});
    const changed=await resolveOfflineConflict(result.conflict!,"offline");
    expect(changed?.current.q0).toBe("mudou novamente");
    // The batch metadata must survive a second comparison.
    expect(changed?.draftBatch).toHaveLength(2);
    bridge.rpc.mockResolvedValueOnce({data:null,error:new Error("offline")});
    await expect(resolveOfflineConflict(changed!,"offline")).rejects.toThrow("offline");
    expect(await getQueuedStudentActions(user)).toHaveLength(2);
  });
  it("keeps newer edits queued if they arrive while a choice is being saved", async () => {
    const user="batch-concurrent-c";
    await draft(user,{q0:"1"}); await draft(user,{q0:"2"});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    let finish!: (result: unknown)=>void;
    const pending=new Promise(resolve=>{finish=resolve;});
    bridge.rpc.mockReturnValueOnce(pending);
    const resolving=resolveOfflineConflict(result.conflict!,"offline");
    await vi.waitFor(()=>expect(bridge.rpc).toHaveBeenCalledTimes(2));
    const newer=await draft(user,{q0:"3"});
    finish({data:{status:"synced"},error:null});
    await resolving;
    expect((await getQueuedStudentActions(user)).map(x=>x.id)).toEqual([newer.id]);
  });
  it("removes consecutive drafts after the latest snapshot is confirmed without conflict", async () => {
    const user="batch-direct-h";
    await draft(user,{q0:"one"}); await draft(user,{q0:"two"}); await draft(user,{q0:"three"});
    bridge.rpc.mockResolvedValueOnce({data:{status:"synced"},error:null});
    expect(await syncStudentOfflineQueue(user)).toMatchObject({synced:3,remaining:0});
    expect(bridge.rpc).toHaveBeenCalledTimes(1);
    expect(bridge.rpc.mock.calls[0][1].p_responses).toEqual({q0:"three"});
  });
  it("does not group drafts across a completion, another lesson or another account", async () => {
    const user="batch-scoped-barrier-i";
    const p={lessonId:"lesson-a",responses:{q0:"complete"},videoWatched:false,audioListened:false};
    await draft(user,{q0:"before"});
    await enqueueStudentAction({type:"complete_lesson",userId:user,churchId:"church-a",scope,payload:p}); await delay();
    await draft(user,{q0:"different"},{lessonId:"lesson-b"});
    await draft("batch-other-user-i",{q0:"other"});
    await draft(user,{q0:"after"});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    expect(result.conflict?.action.payload.responses.q0).toBe("before");
    expect(result.conflict?.draftBatch).toBeUndefined();
    expect(await getQueuedStudentActions(user)).toHaveLength(4);
    expect(await getQueuedStudentActions("batch-other-user-i")).toHaveLength(1);
  });
  it("refuses the reviewed batch if another tab changes one of its entries", async () => {
    const user="batch-mutated-j";
    const first=await draft(user,{q0:"one"}); await draft(user,{q0:"two"});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    await new Promise<void>((resolve,reject) => {
      const open=indexedDB.open("caminho-student-offline",1);
      open.onerror=()=>reject(open.error);
      open.onsuccess=()=>{
        const db=open.result; const tx=db.transaction("queue","readwrite");
        tx.objectStore("queue").put({...first,payload:{...first.payload,responses:{q0:"modified elsewhere"}}});
        tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>reject(tx.error);
      };
    });
    await expect(resolveOfflineConflict(result.conflict!,"server")).rejects.toThrow("fila mudou");
    expect(await getQueuedStudentActions(user)).toHaveLength(2);
    expect(bridge.rpc).toHaveBeenCalledTimes(1);
  });
  it("does not partially remove drafts if another tab changes one during the save", async () => {
    const user="batch-write-race-m";
    const first=await draft(user,{q0:"one"}); await draft(user,{q0:"two"});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    let finish!: (value:unknown)=>void;
    bridge.rpc.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    const operation=resolveOfflineConflict(result.conflict!,"offline");
    await vi.waitFor(()=>expect(bridge.rpc).toHaveBeenCalledTimes(2));
    await new Promise<void>((resolve,reject)=>{
      const open=indexedDB.open("caminho-student-offline",1);
      open.onerror=()=>reject(open.error);
      open.onsuccess=()=>{
        const db=open.result,tx=db.transaction("queue","readwrite");
        tx.objectStore("queue").put({...first,payload:{...first.payload,responses:{q0:"modified while saving"}}});
        tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>reject(tx.error);
      };
    });
    finish({data:{status:"synced"},error:null});
    await expect(operation).rejects.toThrow("fila mudou");
    expect(await getQueuedStudentActions(user)).toHaveLength(2);
  });
  it("keeps unscoped legacy entries and entries separated by a completion distinct", async () => {
    const user="batch-barriers-d";
    const p={lessonId:"lesson-a",responses:{q0:"old"},videoWatched:false,audioListened:false};
    await enqueueStudentAction({type:"save_lesson_draft",userId:user,churchId:"church-a",payload:p}); await delay();
    await enqueueStudentAction({type:"save_lesson_draft",userId:user,churchId:"church-a",payload:{...p,responses:{q0:"new"}}}); await delay();
    await enqueueStudentAction({type:"complete_lesson",userId:user,churchId:"church-a",scope,payload:p}); await delay();
    await draft(user,{q0:"after"});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    expect(result.conflict?.action.payload.responses.q0).toBe("old");
    expect(result.conflict?.draftBatch).toBeUndefined();
    expect(await getQueuedStudentActions(user)).toHaveLength(4);
  });
  it("does not infer an order when two drafts have the same timestamp", async () => {
    const user="batch-same-time-n";
    const first=await draft(user,{q0:"one"});
    const second=await draft(user,{q0:"two"});
    await new Promise<void>((resolve,reject)=>{
      const open=indexedDB.open("caminho-student-offline",1);
      open.onerror=()=>reject(open.error);
      open.onsuccess=()=>{
        const db=open.result,tx=db.transaction("queue","readwrite"),store=tx.objectStore("queue");
        store.put({...first,createdAt:"2026-11-25T12:00:00.000Z"});
        store.put({...second,createdAt:"2026-11-25T12:00:00.000Z"});
        tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>reject(tx.error);
      };
    });
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    expect(result.conflict?.draftBatch).toBeUndefined();
    expect(await getQueuedStudentActions(user)).toHaveLength(2);
  });
  it("groups only exactly identical legacy drafts when enrollment was not recorded", async () => {
    const user="batch-legacy-duplicates-l";
    const payload={lessonId:"lesson-a",responses:{q0:"igual"},videoWatched:false,audioListened:false};
    await enqueueStudentAction({type:"save_lesson_draft",userId:user,churchId:"church-a",payload}); await delay();
    await enqueueStudentAction({type:"save_lesson_draft",userId:user,churchId:"church-a",payload}); await delay();
    const different=await enqueueStudentAction({type:"save_lesson_draft",userId:user,churchId:"church-a",payload:{...payload,responses:{q0:"diferente"}}});
    bridge.getUser.mockResolvedValue({data:{user:{id:user}}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
    const result=await syncStudentOfflineQueue(user);
    expect(result.conflict?.draftBatch).toHaveLength(2);
    expect(await getQueuedStudentActions(user)).toHaveLength(3);
    await resolveOfflineConflict(result.conflict!,"server");
    expect((await getQueuedStudentActions(user)).map(x=>x.id)).toEqual([different.id]);
  });
  it("does not group drafts after a transfer, when a key disappears or a media flag regresses", async () => {
    for (const [user, second] of [
      ["batch-transfer-e", {scope:{...scope,membershipVersion:"membership-b"}, responses:{q0:"2",q1:"x"}}],
      ["batch-key-f", {responses:{q0:"2"}}],
      ["batch-media-g", {responses:{q0:"2",q1:"x"},videoWatched:false}],
    ] as const) {
      await draft(user,{q0:"1",q1:"x"},{videoWatched:user.endsWith("g")});
      const {responses,...options}=second;
      await draft(user,responses,options);
      bridge.rpc.mockResolvedValueOnce({data:{status:"conflict",current:{q0:"server"}},error:null});
      const result=await syncStudentOfflineQueue(user);
      expect(result.conflict?.action.payload.responses.q0).toBe("1");
      expect(result.conflict?.draftBatch).toBeUndefined();
      expect(await getQueuedStudentActions(user)).toHaveLength(2);
    }
  });
});
