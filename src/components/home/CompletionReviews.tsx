import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Review = { id:string; student_name:string; kind:string; activity_title:string; requested_at:string };
export default function CompletionReviews({ turmaId }: { turmaId:string | null }) {
  const currentTurma=useRef(turmaId);
  currentTurma.current=turmaId;
  const [items,setItems]=useState<Review[]>([]);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState<string | null>(null);
  const [confirmed,setConfirmed]=useState<Record<string,boolean>>({});
  const refresh=useCallback(async () => {
    if (!turmaId) { setItems([]); return; }
    const {data,error}=await supabase.rpc("list_completion_reviews" as never,{p_turma_id:turmaId} as never);
    if (currentTurma.current !== turmaId) return;
    if (error) { setError("Não foi possível consultar as revisões. Tente novamente."); return; }
    setError(""); setItems((data ?? []) as unknown as Review[]);
  },[turmaId]);
  useEffect(() => {
    setItems([]); setConfirmed({}); setError(""); setBusy(null); void refresh();
    const timer=window.setInterval(() => { if (!document.hidden && navigator.onLine) void refresh(); },60_000);
    return () => window.clearInterval(timer);
  },[refresh]);
  async function approve(item:Review) {
    if (!confirmed[item.id] || busy || currentTurma.current !== turmaId) return;
    if (!window.confirm("Liberar esta conclusão para a turma atual? A turma de origem não foi comprovada.")) return;
    if (currentTurma.current !== turmaId) return;
    setBusy(item.id);
    try {
      const {data,error}=await supabase.rpc("approve_completion_review" as never,{p_id:item.id,p_confirm:true} as never);
      if (currentTurma.current !== turmaId) return;
      if (error || (data as {status?:string}|null)?.status!=="approved") throw new Error("review unavailable");
      setConfirmed(prev=>({...prev,[item.id]:false}));
      await refresh();
    } catch { if (currentTurma.current === turmaId) setError("Não foi possível liberar. Confira a turma e tente novamente."); }
    finally { if (currentTurma.current === turmaId) setBusy(null); }
  }
  if (!items.length && !error) return null;
  return <section className="mx-3 my-3 rounded-xl border bg-card p-4 space-y-3" aria-label="Conclusões para revisão">
    <h3 className="font-bold">Conclusões para revisão</h3>
    <p className="text-sm">A turma de origem não foi registrada. Confira a atividade com o aluno antes de autorizar sua conclusão na turma atual. O texto das respostas não é exibido aqui.</p>
    {error && <p role="alert" className="text-sm">{error} <button type="button" onClick={()=>void refresh()} className="underline">Tentar novamente</button></p>}
    {items.map(item=><div key={item.id} className="rounded-lg border p-3 space-y-2">
      <p className="font-semibold">{item.student_name}</p>
      <p className="text-sm">{item.kind==="complete_lesson" ? "Lição" : "Devocional"}: {item.activity_title}</p>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={!!confirmed[item.id]} onChange={e=>setConfirmed(prev=>({...prev,[item.id]:e.target.checked}))} />Conferi a atividade e autorizo o registro na turma atual, sem afirmar a origem.</label>
      <button type="button" disabled={!confirmed[item.id] || !!busy} onClick={()=>void approve(item)} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50">Liberar conclusão</button>
    </div>)}
  </section>;
}
