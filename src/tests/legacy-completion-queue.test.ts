import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
const bridge=vi.hoisted(() => ({rpc:vi.fn(), getUser:vi.fn()}));
vi.mock("@/integrations/supabase/client", () => ({supabase:{rpc:bridge.rpc,auth:{getUser:bridge.getUser}}}));
import {enqueueStudentAction,getPendingStudentOverlay,getQueuedStudentActions,syncStudentOfflineQueue,resolveOfflineConflict,getOwnedCompletionScope} from "@/lib/studentOffline";
const scope={churchId:"church-a",turmaId:"group-a",area:"area-a",membershipVersion:"version-a"};
const payload={lessonId:"lesson-a",responses:{q:"[ficticio]"},videoWatched:false,audioListened:false};
beforeEach(() => bridge.rpc.mockReset());
describe("conclusões offline e mudança de turma", () => {
 it("retém conclusão sem turma sem impedi-la de processar outras solicitações", async () => {
  await enqueueStudentAction({type:"complete_lesson",userId:"legacy-completion-a",payload});
  await enqueueStudentAction({type:"attendance_upsert",userId:"legacy-completion-a",churchId:"church-a",payload:{eventId:"event-a",status:"pendente_presente",confirmationSource:"user",requestedAt:"2026-01-01T00:00:00Z"}});
  bridge.rpc.mockResolvedValueOnce({data:{status:"pending"},error:null}).mockResolvedValueOnce({data:{status:"saved"},error:null});
  const result=await syncStudentOfflineQueue("legacy-completion-a");
  expect(result).toMatchObject({synced:1,remaining:1,legacyCompletionPending:true});
  expect(bridge.rpc).toHaveBeenCalledTimes(2);
  expect(bridge.rpc).toHaveBeenCalledWith("request_completion_review",{p_action_id:expect.any(String),p_kind:"complete_lesson",p_item_id:"lesson-a"});
  expect(bridge.rpc).toHaveBeenCalledWith("sync_owned_attendance",expect.anything());
  expect((await getPendingStudentOverlay("legacy-completion-a",{scope})).lessonProgress).toHaveLength(0);
  expect(await getQueuedStudentActions("legacy-completion-a")).toHaveLength(1);
 });
 it("retém conclusão quando o servidor detecta alteração de turma",async () => {
  await enqueueStudentAction({type:"complete_lesson",userId:"transferred-completion-b",scope,payload});
  bridge.rpc.mockResolvedValueOnce({data:{status:"scope_review_required"},error:null}).mockResolvedValueOnce({data:{status:"pending"},error:null});
  expect(await syncStudentOfflineQueue("transferred-completion-b")).toMatchObject({synced:0,remaining:1,legacyCompletionPending:true});
  expect(bridge.rpc).toHaveBeenCalledWith("sync_owned_completion",expect.objectContaining({p_turma_id:"group-a",p_area:"area-a"}));
  expect((await getPendingStudentOverlay("transferred-completion-b",{scope:{...scope,turmaId:"group-b"}})).lessonProgress).toHaveLength(0);
  expect(await getQueuedStudentActions("transferred-completion-b")).toHaveLength(1);
 });
 it("sincroniza a conclusão apenas com o contexto original confirmado",async () => {
  await enqueueStudentAction({type:"complete_lesson",userId:"scoped-completion-c",scope,payload});
  bridge.rpc.mockResolvedValueOnce({data:{status:"synced"},error:null});
  expect(await syncStudentOfflineQueue("scoped-completion-c")).toMatchObject({synced:1,remaining:0});
  expect(bridge.rpc).toHaveBeenCalledWith("sync_owned_completion",expect.objectContaining({p_turma_id:"group-a"}));
 });
 it("retains a completion when keeping the server answers",async () => {
  const action=await enqueueStudentAction({type:"complete_lesson",userId:"conflict-completion-d",scope,payload});
  if (action.type !== "complete_lesson") throw new Error("unexpected action");
  bridge.getUser.mockResolvedValue({data:{user:{id:"conflict-completion-d"}}});
  bridge.rpc.mockResolvedValueOnce({data:null,error:new Error("incomplete")});
  await expect(resolveOfflineConflict({action,current:{q:"[servidor]"}},"server")).rejects.toThrow("incomplete");
  expect(bridge.rpc).toHaveBeenCalledWith("sync_owned_completion",expect.objectContaining({p_responses:{q:"[servidor]"},p_expected:{q:"[servidor]"}}));
  expect(await getQueuedStudentActions("conflict-completion-d")).toHaveLength(1);
 });
 it("uses an approved destination without sending answer text to the review request",async () => {
  await enqueueStudentAction({type:"complete_lesson",userId:"reviewed-completion-e",payload});
  bridge.rpc.mockResolvedValueOnce({data:{status:"approved",scope},error:null}).mockResolvedValueOnce({data:{status:"synced"},error:null});
  expect(await syncStudentOfflineQueue("reviewed-completion-e")).toMatchObject({synced:1,remaining:0});
  expect(bridge.rpc.mock.calls[0][0]).toBe("request_completion_review");
  expect(JSON.stringify(bridge.rpc.mock.calls[0][1])).not.toContain("[ficticio]");
  expect(bridge.rpc.mock.calls[1][0]).toBe("sync_owned_completion");
 });
 it("removes a completion only after the server accepts its displayed version",async () => {
  const action=await enqueueStudentAction({type:"complete_lesson",userId:"server-completion-f",scope,payload});
  if (action.type !== "complete_lesson") throw new Error("unexpected action");
  bridge.getUser.mockResolvedValue({data:{user:{id:"server-completion-f"}}});
  bridge.rpc.mockResolvedValueOnce({data:{status:"synced"},error:null});
  expect(await resolveOfflineConflict({action,current:{q:"[servidor]"}},"server")).toBeNull();
  expect(await getQueuedStudentActions("server-completion-f")).toHaveLength(0);
 });
 it("stops waiting for an unavailable scope service and keeps the editor usable",async () => {
  bridge.rpc.mockReturnValueOnce({abortSignal:(signal:AbortSignal)=>new Promise((_resolve,reject)=>signal.addEventListener("abort",()=>reject(new Error("timeout"))))});
  expect(await getOwnedCompletionScope("scope-timeout-owner",scope)).toBeUndefined();
 },10000);
});
