import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({ viewer: "leader", from: vi.fn(), rpc: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: fixture.viewer } }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: fixture.from, rpc: fixture.rpc } }));

import PastoralReportPDF from "@/components/admin/PastoralReportPDF";

function tableQuery(table: string) {
  const result = { data: [], error: null };
  const query: Record<string, unknown> = {};
  for (const method of ["select", "eq", "or", "order"]) query[method] = () => query;
  query.maybeSingle = async () => ({ data: { church_id: "church", community: "Centro", area: "Área 1" }, error: null });
  query.then = (resolve: (value: typeof result) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return query;
}

const participant = { user_id: "student", full_name: "Aluno fictício", community: "Centro", area: "Área 1", birth_date: "2000-01-01", phone: "", completed_count: 0, completed_activity_ids: [] };

beforeEach(() => {
  fixture.viewer = "leader";
  fixture.from.mockReset().mockImplementation(tableQuery);
  fixture.rpc.mockReset().mockResolvedValue({ data: [], error: null });
});

describe("relatório pastoral e respostas pessoais", () => {
  it("não consulta respostas de outro aluno e explica a restrição", async () => {
    render(<PastoralReportPDF participant={participant} activities={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar dados/i }));
    fireEvent.click(await screen.findByRole("button", { name: /relatório completo/i }));
    expect(screen.getByText(/respostas pessoais estão disponíveis somente ao aluno/i)).toBeInTheDocument();
    expect(fixture.from).not.toHaveBeenCalledWith("lesson_responses");
    expect(fixture.from).not.toHaveBeenCalledWith("devotional_responses");
  });

  it("consulta as próprias respostas e descarta o relatório ao trocar de conta", async () => {
    fixture.viewer = "student";
    const page = render(<PastoralReportPDF participant={participant} activities={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar dados/i }));
    await screen.findByRole("button", { name: /relatório completo/i });
    expect(fixture.from).toHaveBeenCalledWith("lesson_responses");
    expect(fixture.from).toHaveBeenCalledWith("devotional_responses");
    fixture.viewer = "leader";
    page.rerender(<PastoralReportPDF participant={participant} activities={[]} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /carregar dados/i })).toBeInTheDocument());
  });
});
