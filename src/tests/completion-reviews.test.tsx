import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks=vi.hoisted(()=>({rpc:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:mocks.rpc}}));
import CompletionReviews from "@/components/home/CompletionReviews";
beforeEach(()=>{mocks.rpc.mockReset();vi.restoreAllMocks();});
describe("completion review for a leader",()=>{
 it("requires an explicit check and confirmation before approving",async()=>{
  mocks.rpc.mockResolvedValueOnce({data:[{id:"review-1",student_name:"Aluno ficticio",kind:"complete_lesson",activity_title:"Licao ficticia",requested_at:"2026-01-01"}],error:null})
   .mockResolvedValueOnce({data:{status:"approved"},error:null}).mockResolvedValueOnce({data:[],error:null});
  vi.spyOn(window,"confirm").mockReturnValue(true);
  render(<CompletionReviews turmaId="group-a" />);
  const button=await screen.findByRole("button",{name:/liberar conclus/i});
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox")); fireEvent.click(button);
  await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith("approve_completion_review",{p_id:"review-1",p_confirm:true}));
  expect(window.confirm).toHaveBeenCalled();
 });
 it("does not show a previous group's delayed response after a switch",async()=>{
  let finish!: (value:unknown)=>void;
  mocks.rpc.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;})).mockResolvedValueOnce({data:[],error:null});
  const view=render(<CompletionReviews turmaId="group-a" />);
  view.rerender(<CompletionReviews turmaId="group-b" />);
  finish({data:[{id:"old",student_name:"Aluno de outra turma",kind:"complete_lesson",activity_title:"Licao",requested_at:"2026-01-01"}],error:null});
  await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledTimes(2));
  expect(screen.queryByText("Aluno de outra turma")).not.toBeInTheDocument();
 });
});
