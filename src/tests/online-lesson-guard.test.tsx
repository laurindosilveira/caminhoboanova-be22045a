import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ save: vi.fn(), queue: vi.fn(), inspect:vi.fn(), requestReview:vi.fn(), offline: false, pending: false, gate: null as Promise<void> | null, scoped:false, area:"area-a", turma:"group-a", owner:"user-1", profile:{ church_id:"church-1", turma_id:null as string | null, area:null as string | null } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: mocks.owner }, profile: mocks.profile, role: "user" }) }));
vi.mock("@/contexts/AreaSwitchContext", () => ({ useAreaSwitch: () => ({ effectiveArea: mocks.area, effectiveTurmaId: mocks.turma }) }));
vi.mock("@/components/admin/tabs/LeaderGuideEditor", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
vi.mock("@/lib/studentOffline", () => ({
  get scopedLearningEnabled() { return mocks.scoped; },
  learningScope: (churchId?: string, turmaId?: string, area?: string) => churchId && turmaId && area ? {churchId,turmaId,area} : undefined,
  getOwnedCompletionScope: async (_user: string, scope?: unknown) => scope,
  scopedLearningCacheKey: () => "",
  inspectLearningScope: mocks.inspect,
  requestExistingLearningReview: mocks.requestReview,
  cachedStudentQuery: async (key: string) => {
    if (key.startsWith("lesson-content:")) return { data: { greeting: "Bem vindo", icebreaker: "Pergunta inicial", summary: "Resumo", bible_texts: [], questions: ["Pergunta"], practice: "Pratica", prayer_prompt: "Oracao", video_link: "", audio_link: "", pdf_link: "" } };
    if (key.startsWith("lesson-responses:")) { if (mocks.gate) await mocks.gate; return { data: [{ question_key: "icebreaker", response: key.includes("user-2") ? "resposta de outra conta" : "versao carregada" }] }; }
    return { data: null };
  },
  getPendingStudentOverlay: async () => mocks.pending ? ({ actions: [{ type: "save_lesson_draft", payload: { lessonId: "lesson-1" } }], lessonResponses: [{ lesson_id: "lesson-1", question_key: "icebreaker", response: "rascunho do aparelho" }], lessonProgress: [] }) : ({ actions: [], lessonResponses: [], lessonProgress: [] }),
  mergeByKey: (base: unknown[]) => base,
  isStudentOffline: () => mocks.offline,
  enqueueStudentAction: mocks.queue,
  syncLearningActionWithCurrent: mocks.save,
}));
vi.mock("@/lib/lessonMediaProgress", () => ({ getStoredLessonMediaProgress: () => ({}), storeLessonMediaProgress: vi.fn() }));
import JourneyLessonView from "@/components/home/JourneyLessonView";

describe("online lesson protection", () => {
  beforeEach(() => { mocks.save.mockReset(); mocks.queue.mockReset(); mocks.inspect.mockReset().mockResolvedValue("ready"); mocks.requestReview.mockReset().mockResolvedValue(undefined); mocks.offline = false; mocks.pending = false; mocks.gate = null; mocks.scoped=false; mocks.area="area-a"; mocks.turma="group-a"; mocks.owner="user-1"; mocks.profile={church_id:"church-1",turma_id:null,area:null}; });
  it("keeps an earlier account's pending edit with its owner after a session switch", async () => {
    let fail!: (reason:Error) => void;
    mocks.save.mockImplementation(() => new Promise((_resolve,reject) => { fail=reject; }));
    mocks.queue.mockResolvedValue({});
    const props={lesson:{id:"lesson-1",title:"Licao",order_num:1,objective:null,topics:null,course_id:"course-1"},onBack:() => {}};
    const view=render(<JourneyLessonView {...props} />);
    const input=await screen.findByDisplayValue("versao carregada");
    fireEvent.change(input,{target:{value:"texto da primeira conta"}});
    await waitFor(() => expect(fail).toBeDefined(),{timeout:4000});
    mocks.owner="user-2"; view.rerender(<JourneyLessonView {...props} />);
    expect(await screen.findByDisplayValue("resposta de outra conta")).toBeInTheDocument();
    fail(new Error("conexão interrompida"));
    await waitFor(() => expect(mocks.queue).toHaveBeenCalled());
    expect(mocks.queue.mock.calls[0][0]).toMatchObject({userId:"user-1",payload:{responses:{icebreaker:"texto da primeira conta"}}});
    expect(screen.getByDisplayValue("resposta de outra conta")).toBeInTheDocument();
  }, 10000);
  it("retries scope verification after the profile finishes loading", async () => {
    mocks.scoped=true;
    mocks.inspect.mockImplementation(async (_user,_kind,_item,scope) => scope ? "ready" : "scope_review_required");
    const props = { lesson:{ id:"lesson-1", title:"Licao", order_num:1, objective:null, topics:null, course_id:"course-1" }, onBack:() => {} };
    const view=render(<JourneyLessonView {...props} />);
    expect(await screen.findByRole("button",{name:/revisar respostas anteriores/i})).toBeInTheDocument();
    mocks.profile={church_id:"church-1",turma_id:"group-a",area:"area-a"};
    view.rerender(<JourneyLessonView {...props} />);
    expect(await screen.findByDisplayValue("versao carregada")).toBeInTheDocument();
    expect(mocks.inspect).toHaveBeenLastCalledWith("user-1","lesson","lesson-1",{churchId:"church-1",turmaId:"group-a",area:"area-a"});
  });
  it("asks for review before showing historical answers without a verified group", async () => {
    mocks.scoped=true; mocks.inspect.mockResolvedValue("scope_review_required");
    render(<JourneyLessonView lesson={{ id:"lesson-1", title:"Licao", order_num:1, objective:null, topics:null, course_id:"course-1" }} onBack={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name:/revisar respostas anteriores/i }));
    expect(mocks.requestReview).toHaveBeenCalledWith("user-1","lesson","lesson-1",undefined);
    expect(screen.queryByDisplayValue("versao carregada")).not.toBeInTheDocument();
  });
  it("prevents editing in a different selected group without discarding existing text", async () => {
    mocks.scoped=true;
    const props = { lesson:{ id:"lesson-1", title:"Licao", order_num:1, objective:null, topics:null, course_id:"course-1" }, onBack:() => {} };
    const view=render(<JourneyLessonView {...props} />);
    const input=await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    expect(input).toHaveValue("versao carregada");
    mocks.area="area-b"; mocks.turma="group-b";
    view.rerender(<JourneyLessonView {...props} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/turma selecionada mudou/i);
    const retained=screen.getByPlaceholderText("Escreva sua resposta aqui...");
    expect(retained).toHaveAttribute("readonly");
    expect(retained).toHaveValue("");
    mocks.area="area-a"; mocks.turma="group-a";
    view.rerender(<JourneyLessonView {...props} />);
    expect(await screen.findByDisplayValue("versao carregada")).toBeInTheDocument();
  });
  it("uses the loaded version and advances it after a successful save", async () => {
    mocks.save.mockImplementation(async (action, expected) => ({ conflict: null, current: { ...expected, ...action.payload.responses } }));
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "primeira alteracao" } });
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1), { timeout: 4000 });
    expect(mocks.save.mock.calls[0][1]).toEqual({ icebreaker: "versao carregada" });
    fireEvent.change(input, { target: { value: "segunda alteracao" } });
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2), { timeout: 4000 });
    expect(mocks.save.mock.calls[1][1]).toEqual({ icebreaker: "primeira alteracao" });
  }, 12000);
  it("preserves the newest local edits if an earlier request discovers a conflict", async () => {
    let finish: ((value: unknown) => void) | undefined;
    mocks.save.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    mocks.queue.mockResolvedValue({});
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "primeira alteracao" } });
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1), { timeout: 4000 });
    fireEvent.change(input, { target: { value: "texto mais recente" } });
    finish?.({ conflict: { action: {}, current: { icebreaker: "mudou no servidor" } }, current: { icebreaker: "mudou no servidor" } });
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(1));
    expect(mocks.queue.mock.calls[0][0].payload.responses).toEqual({ icebreaker: "texto mais recente" });
  }, 10000);

  it("saves pending edits before leaving the lesson", async () => {
    const onBack = vi.fn();
    mocks.save.mockImplementation(async (action, expected) => ({ conflict: null, current: { ...expected, ...action.payload.responses } }));
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={onBack} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "texto antes de sair" } });
    fireEvent.click(screen.getByRole("button", { name: /voltar às lições/i }));
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0][0].payload.responses.icebreaker).toBe("texto antes de sair");
  });
  it("keeps the lesson open when saving before leaving fails", async () => {
    const onBack = vi.fn();
    mocks.save.mockRejectedValue(new Error("offline"));
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={onBack} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "texto importante" } });
    fireEvent.click(screen.getByRole("button", { name: /voltar às lições/i }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(onBack).not.toHaveBeenCalled();
    expect(input).toHaveValue("texto importante");
  });

  it("keeps edits visible when offline storage fails", async () => {
    mocks.offline = true;
    mocks.queue.mockRejectedValue(new Error("storage unavailable"));
    const onBack = vi.fn();
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={onBack} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "resposta importante" } });
    await waitFor(() => expect(mocks.queue).toHaveBeenCalled(), { timeout: 4000 });
    expect(input).toHaveValue("resposta importante");
    expect(onBack).not.toHaveBeenCalled();
    expect(await screen.findByText(/armazenar no aparelho/i)).toBeInTheDocument();
  });

  it("queues the newest edit if an online save fails", async () => {
    let fail: ((reason: Error) => void) | undefined;
    mocks.save.mockImplementation(() => new Promise((_resolve, reject) => { fail = reject; }));
    mocks.queue.mockResolvedValue({});
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "primeira resposta" } });
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1), { timeout: 4000 });
    fireEvent.change(input, { target: { value: "texto mais recente" } });
    fail?.(new Error("conexao indisponivel"));
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(1));
    expect(mocks.queue.mock.calls[0][0].payload.responses).toEqual({ icebreaker: "texto mais recente" });
  }, 10000);

  it("keeps the text visible and warns if both online save and local storage fail", async () => {
    mocks.save.mockRejectedValue(new Error("conexao indisponivel"));
    mocks.queue.mockRejectedValue(new Error("storage unavailable"));
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "resposta importante" } });
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(1), { timeout: 4000 });
    expect(input).toHaveValue("resposta importante");
    expect(await screen.findByText(/armazenar no aparelho/i)).toBeInTheDocument();
  }, 10000);

  it("also stores edits made while the local backup is being written", async () => {
    mocks.save.mockRejectedValue(new Error("conexao indisponivel"));
    let release: (() => void) | undefined;
    mocks.queue.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    mocks.queue.mockResolvedValue({});
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "primeira resposta" } });
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(1), { timeout: 4000 });
    fireEvent.change(input, { target: { value: "resposta alterada durante a gravacao" } });
    release?.();
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(2));
    expect(mocks.queue.mock.calls[1][0].payload.responses.icebreaker).toBe("resposta alterada durante a gravacao");
  }, 10000);

  it("waits for the local backup before leaving after an online failure", async () => {
    mocks.save.mockRejectedValue(new Error("conexao indisponivel"));
    let release: (() => void) | undefined;
    mocks.queue.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const onBack = vi.fn();
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={onBack} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "resposta importante" } });
    await waitFor(() => expect(mocks.queue).toHaveBeenCalledTimes(1), { timeout: 4000 });
    fireEvent.click(screen.getByRole("button", { name: /voltar às lições/i }));
    expect(onBack).not.toHaveBeenCalled();
    release?.();
    expect(await screen.findByText("Respostas guardadas neste aparelho")).toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  }, 10000);

  it("shows pending answers read-only while synchronization is blocked", async () => {
    mocks.pending = true;
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    expect(await screen.findByText("rascunho do aparelho")).toBeInTheDocument();
    expect(screen.getByText("Respostas guardadas neste aparelho")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Escreva sua resposta aqui...")).not.toBeInTheDocument();
  });

  it("does not allow editing until the earlier responses finish loading", async () => {
    let release: () => void = () => {};
    mocks.gate = new Promise<void>((resolve) => { release = resolve; });
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    expect(await screen.findByText("Carregando suas respostas...")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Escreva sua resposta aqui...")).not.toBeInTheDocument();
    release();
    expect(await screen.findByPlaceholderText("Escreva sua resposta aqui...")).toHaveValue("versao carregada");
  });

  it("does not claim a newer edit is saved while its save is pending", async () => {
    mocks.save.mockImplementationOnce(async (action, expected) => ({ conflict: null, current: { ...expected, ...action.payload.responses } }));
    let finish: ((value: unknown) => void) | undefined;
    mocks.save.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    render(<JourneyLessonView lesson={{ id: "lesson-1", title: "Licao", order_num: 1, objective: null, topics: null, course_id: "course-1" }} onBack={() => {}} />);
    const input = await screen.findByPlaceholderText("Escreva sua resposta aqui...");
    fireEvent.change(input, { target: { value: "primeira resposta" } });
    await screen.findByText("Rascunho salvo", {}, { timeout: 5000 });
    fireEvent.change(input, { target: { value: "resposta mais recente" } });
    expect(screen.getByText("Aguardando salvamento")).toBeInTheDocument();
    expect(screen.queryByText("Rascunho salvo")).not.toBeInTheDocument();
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2), { timeout: 5000 });
    finish?.({ conflict: null, current: { icebreaker: "resposta mais recente" } });
    expect(await screen.findByText("Rascunho salvo")).toBeInTheDocument();
  }, 15000);

});
