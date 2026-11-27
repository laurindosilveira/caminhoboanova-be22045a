import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

const state = vi.hoisted(() => ({ user: "user-a", list: vi.fn(), sync: vi.fn(), resolve: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: state.user ? { id: state.user } : null }) }));
vi.mock("@/lib/studentOffline", () => ({ getQueuedStudentActions: state.list, syncStudentOfflineQueue: state.sync, resolveOfflineConflict: state.resolve }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import StudentOfflineSync from "@/components/home/StudentOfflineSync";

const conflict = { action: { id:"queued-a", userId:"user-a", type:"save_lesson_draft", payload:{ responses:{ q:"resposta privada da conta A" } } }, current:{ q:"servidor A" } };
beforeEach(() => { state.user="user-a"; state.list.mockReset(); state.sync.mockReset(); state.resolve.mockReset(); });

describe("offline conflict account isolation", () => {
  it("hides an existing conflict immediately when a different account signs in", async () => {
    state.list.mockImplementation(async (id: string) => id === "user-a" ? [conflict.action] : []);
    state.sync.mockImplementation(async (id: string) => id === "user-a" ? { synced:0, conflict } : { synced:0 });
    const view=render(<StudentOfflineSync />);
    expect(await screen.findByText("resposta privada da conta A")).toBeInTheDocument();
    state.user="user-b"; view.rerender(<StudentOfflineSync />);
    expect(screen.queryByText("resposta privada da conta A")).not.toBeInTheDocument();
  });

  it("ignores a delayed conflict returned after a different account signs in", async () => {
    let release!: (value: unknown) => void;
    state.list.mockImplementation(async (id: string) => id === "user-a" ? [conflict.action] : []);
    state.sync.mockImplementation((id: string) => id === "user-a" ? new Promise(resolve => { release=resolve; }) : Promise.resolve({ synced:0 }));
    const view=render(<StudentOfflineSync />);
    await waitFor(() => expect(release).toBeDefined());
    state.user="user-b"; view.rerender(<StudentOfflineSync />);
    await act(async () => { release({ synced:0, conflict }); });
    expect(screen.queryByText("resposta privada da conta A")).not.toBeInTheDocument();
    await waitFor(() => expect(state.sync.mock.calls.filter(([id]) => id === "user-b").length).toBeGreaterThanOrEqual(2));
  });

  it("warns when device storage cannot be read instead of showing an empty queue", async () => {
    state.list.mockRejectedValue(new Error("storage unavailable"));
    state.sync.mockRejectedValue(new Error("storage unavailable"));
    render(<StudentOfflineSync />);
    expect(await screen.findByText(/não foi possível verificar as alterações deste aparelho/i)).toBeInTheDocument();
  });
});
