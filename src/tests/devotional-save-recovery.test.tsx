import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const state=vi.hoisted(() => ({ user:"student-a", offline:false, load:vi.fn(), save:vi.fn(), queue:vi.fn(), toastError:vi.fn(), toastSuccess:vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user:{ id:state.user }, profile:{ church_id:"church-a" } }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase:{ auth:{ getUser:vi.fn(() => { throw new Error("network unavailable"); }) }, from:vi.fn() } }));
vi.mock("@/lib/studentOffline", () => ({
  scopedLearningEnabled: false,
  learningScope: () => undefined,
  getOwnedCompletionScope: async (_user: string, scope?: unknown) => scope,
  scopedLearningCacheKey: () => "",
  inspectLearningScope: async () => "ready",
  requestExistingLearningReview: vi.fn(),
  cachedStudentQuery:state.load,
  getPendingStudentOverlay:async () => ({ actions:[], devotionalResponses:[] }),
  mergeByKey:(base: unknown[]) => base,
  isStudentOffline:() => state.offline,
  enqueueStudentAction:state.queue,
  syncLearningActionWithCurrent:state.save,
}));
vi.mock("sonner", () => ({ toast:{ error:state.toastError, success:state.toastSuccess } }));
vi.mock("@/components/home/BibleModal", () => ({ default:() => null }));
vi.mock("@/components/home/WorshipCard", () => ({ default:() => null }));
import DevotionalView from "@/components/home/DevotionalView";

const data={ bible_text:"texto", bible_reference:"", reflection:"reflexão", prayer:"", practice:"", questions:["Pergunta?"], worship_songs:[{ id:"s", title:"", artist:"", url:"", platform:"other" as const, theme:null, thumbnail_url:null }] };
beforeEach(() => { state.user="student-a"; state.offline=false; state.load.mockReset(); state.load.mockResolvedValue({ data:[] }); state.save.mockReset(); state.queue.mockReset(); state.toastError.mockReset(); state.toastSuccess.mockReset(); });
async function fill(onComplete: (activityId: string) => void) {
  render(<DevotionalView activity={{ id:"dev-a", title:"Devocional", subtitle:null, points:10 }} devotionalData={data} onBack={() => {}} onComplete={onComplete} isCompleted={false} />);
  const input=await screen.findByPlaceholderText("Escreva sua reflexão...");
  fireEvent.change(input,{ target:{ value:"resposta fictícia" } });
  fireEvent.click(screen.getByRole("button",{ name:/concluir devocional/i }));
  return input;
}

describe("devotional save recovery", () => {
  it("keeps an uncertain online completion in the local queue without claiming completion", async () => {
    state.save.mockRejectedValue(new Error("network failure")); state.queue.mockResolvedValue({});
    const complete=vi.fn(); await fill(complete);
    await waitFor(() => expect(state.queue).toHaveBeenCalledOnce());
    expect(state.queue.mock.calls[0][0]).toMatchObject({ userId:"student-a", churchId:"church-a", type:"complete_devotional", payload:{ responses:{ "0":"resposta fictícia" } } });
    expect(complete).not.toHaveBeenCalled();
    expect(state.toastError).toHaveBeenCalledWith(expect.stringMatching(/a conclusão ainda não foi confirmada/i));
  });
  it("keeps the text editable and warns when both server and local storage fail", async () => {
    state.save.mockRejectedValue(new Error("network failure")); state.queue.mockRejectedValue(new Error("storage failure"));
    const complete=vi.fn(); const input=await fill(complete);
    await waitFor(() => expect(state.toastError).toHaveBeenCalledWith(expect.stringMatching(/mantenha esta tela aberta/i)));
    expect(input).toHaveValue("resposta fictícia"); expect(input).not.toHaveAttribute("readonly");
    expect(complete).not.toHaveBeenCalled();
  });
  it("does not present a locally queued offline completion as confirmed", async () => {
    state.offline=true; state.queue.mockResolvedValue({});
    const complete=vi.fn(); await fill(complete);
    await waitFor(() => expect(state.queue).toHaveBeenCalledOnce());
    expect(complete).not.toHaveBeenCalled();
    expect(state.toastSuccess).toHaveBeenCalledWith(expect.stringMatching(/conclusão será confirmada após a sincronização/i));
  });
  it("hides the previous account's answers as soon as the session changes", async () => {
    state.load.mockResolvedValueOnce({ data:[{ question_index:0,response:"texto privado anterior" }] })
      .mockImplementationOnce(() => new Promise(() => {}));
    const props={ activity:{ id:"dev-a", title:"Devocional", subtitle:null, points:10 }, devotionalData:data, onBack:() => {}, onComplete:() => {}, isCompleted:false };
    const view=render(<DevotionalView {...props} />);
    expect(await screen.findByDisplayValue("texto privado anterior")).toBeInTheDocument();
    state.user="student-b"; view.rerender(<DevotionalView {...props} />);
    expect(screen.queryByDisplayValue("texto privado anterior")).not.toBeInTheDocument();
  });
});
