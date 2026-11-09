import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
const { getQueued, sync, resolve } = vi.hoisted(() => ({ getQueued: vi.fn(), sync: vi.fn(), resolve: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
vi.mock("@/lib/studentOffline", () => ({ getQueuedStudentActions: getQueued, syncStudentOfflineQueue: sync, resolveOfflineConflict: resolve }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import StudentOfflineSync from "@/components/home/StudentOfflineSync";

it("shows both versions and passes the reviewed version to resolution", async () => {
  const action = { id: "1", userId: "user-1", type: "save_lesson_draft", payload: { lessonId: "lesson", responses: { q0: "antiga" } } };
  const conflict = { action, current: { q0: "recente" } };
  getQueued.mockResolvedValue([action]); sync.mockResolvedValue({ synced: 0, remaining: 1, conflict });
  resolve.mockResolvedValue(null); vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<StudentOfflineSync />);
  expect(await screen.findByText(/respostas diferentes encontradas/i)).toBeInTheDocument();
  expect(screen.getByText(/antiga/)).toBeInTheDocument();
  expect(screen.getByText(/recente/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Usar este aparelho" }));
  await waitFor(() => expect(resolve).toHaveBeenCalledWith(conflict, "offline"));
});
