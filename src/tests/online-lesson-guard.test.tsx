import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ save: vi.fn(), queue: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "user-1" }, profile: { church_id: "church-1" }, role: "user" }) }));
vi.mock("@/contexts/AreaSwitchContext", () => ({ useAreaSwitch: () => ({ effectiveArea: null, effectiveTurmaId: null }) }));
vi.mock("@/components/admin/tabs/LeaderGuideEditor", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
vi.mock("@/lib/studentOffline", () => ({
  cachedStudentQuery: async (key: string) => {
    if (key.startsWith("lesson-content:")) return { data: { greeting: "Bem vindo", icebreaker: "Pergunta inicial", summary: "Resumo", bible_texts: [], questions: ["Pergunta"], practice: "Pratica", prayer_prompt: "Oracao", video_link: "", audio_link: "", pdf_link: "" } };
    if (key.startsWith("lesson-responses:")) return { data: [{ question_key: "icebreaker", response: "versao carregada" }] };
    return { data: null };
  },
  getPendingStudentOverlay: async () => ({ actions: [], lessonResponses: [], lessonProgress: [] }),
  mergeByKey: (base: unknown[]) => base,
  isStudentOffline: () => false,
  enqueueStudentAction: mocks.queue,
  syncLearningActionWithCurrent: mocks.save,
}));
vi.mock("@/lib/lessonMediaProgress", () => ({ getStoredLessonMediaProgress: () => ({}), storeLessonMediaProgress: vi.fn() }));
import JourneyLessonView from "@/components/home/JourneyLessonView";

describe("online lesson protection", () => {
  beforeEach(() => { mocks.save.mockReset(); mocks.queue.mockReset(); });
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

});
