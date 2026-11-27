import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bridge=vi.hoisted(() => ({ rpc:vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase:{rpc:bridge.rpc} }));
import { enqueueStudentAction, getQueuedStudentActions, syncStudentOfflineQueue } from "@/lib/studentOffline";

beforeEach(() => { bridge.rpc.mockReset(); });
const request={eventId:"event-1",status:"pendente_falta" as const,confirmationSource:"user" as const,requestedAt:"2026-01-01T10:00:00Z",justification:"[ficticio]"};

describe("presenças aguardando sincronização", () => {
  it("preserves a request when the leader has already confirmed the event, and continues other events", async () => {
    await enqueueStudentAction({type:"attendance_upsert",userId:"attendance-test-a",churchId:"church-a",payload:request});
    const worship=await enqueueStudentAction({type:"worship_manual",userId:"attendance-test-a",churchId:"church-a",payload:{worshipDate:"2026-01-01",worshipTime:"10:00",preacherName:"evento",eventType:"culto"}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"finalized",current_status:"presente"},error:null}).mockResolvedValueOnce({data:{status:"saved"},error:null});
    const result=await syncStudentOfflineQueue("attendance-test-a");
    expect(result).toMatchObject({synced:1,remaining:1,attendanceReview:{reason:"finalized",currentStatus:"presente"}});
    expect(await getQueuedStudentActions("attendance-test-a")).toHaveLength(1);
    expect(bridge.rpc).toHaveBeenLastCalledWith("sync_owned_worship",expect.objectContaining({p_user_id:"attendance-test-a",p_action_id:worship.id}));
  });
  it("keeps a request for an event outside the current group", async () => {
    await enqueueStudentAction({type:"attendance_upsert",userId:"attendance-test-b",churchId:"church-a",payload:request});
    bridge.rpc.mockResolvedValueOnce({data:{status:"scope_review_required"},error:null});
    expect(await syncStudentOfflineQueue("attendance-test-b")).toMatchObject({synced:0,remaining:1,attendanceReview:{reason:"scope_review_required"}});
    expect(await getQueuedStudentActions("attendance-test-b")).toHaveLength(1);
  });
  it("retains a manual worship record when its church is unknown", async () => {
    await enqueueStudentAction({type:"worship_manual",userId:"attendance-test-c",payload:{worshipDate:"2026-01-01",worshipTime:"10:00",preacherName:"evento",eventType:"culto"}});
    bridge.rpc.mockResolvedValueOnce({data:{status:"scope_review_required"},error:null});
    expect(await syncStudentOfflineQueue("attendance-test-c")).toMatchObject({synced:0,remaining:1,attendanceReview:{reason:"scope_review_required"}});
    expect(await getQueuedStudentActions("attendance-test-c")).toHaveLength(1);
  });
});
