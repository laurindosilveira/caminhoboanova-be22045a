import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Church,
  Copy,
  GraduationCap,
  Link2,
  MessageCircle,
  Plus,
  Settings2,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type OrganizationChurch = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  address: string | null;
  group_naming: "growth_groups" | "confirmation";
  is_active: boolean | null;
};

export type OrganizationTurma = {
  id: string;
  name: string;
  area: string | null;
  year: number;
  is_active: boolean;
  description: string | null;
  church_id?: string | null;
};

type OrganizationParticipant = {
  user_id: string;
  full_name?: string | null;
  turma_id?: string | null;
};

type TurmaLeader = {
  turma_id: string;
  user_id: string;
  is_fallback: boolean;
};

type HubTab = "overview" | "church" | "groups";

type Props = {
  loading: boolean;
  churches: OrganizationChurch[];
  selectedChurchId: string | null;
  turmas: OrganizationTurma[];
  participants: OrganizationParticipant[];
  isSuper: boolean;
  adminArea: string;
  onSelectChurch: (churchId: string) => void;
  onSelectTurma: (turma: OrganizationTurma) => void;
  onRefresh: () => Promise<void>;
  onBack: () => void;
};

const tabItems: Array<{ id: HubTab; label: string; icon: typeof Church }> = [
  { id: "overview", label: "Visão geral", icon: Sparkles },
  { id: "church", label: "Igreja", icon: Church },
  { id: "groups", label: "Grupos e convites", icon: Users },
];

function groupLabels(mode: OrganizationChurch["group_naming"] | undefined) {
  if (mode === "confirmation") {
    return { singular: "turma de Ensino Confirmatório", plural: "turmas de Ensino Confirmatório", short: "Ensino Confirmatório" };
  }
  return { singular: "Grupo de Crescimento", plural: "Grupos de Crescimento", short: "Grupo de Crescimento" };
}

export default function AdminOrganizationHub({
  loading,
  churches,
  selectedChurchId,
  turmas,
  participants,
  isSuper,
  adminArea,
  onSelectChurch,
  onSelectTurma,
  onRefresh,
  onBack,
}: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [savingChurch, setSavingChurch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [turmaLeaders, setTurmaLeaders] = useState<TurmaLeader[]>([]);
  const [leaderDialogTurma, setLeaderDialogTurma] = useState<OrganizationTurma | null>(null);
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);
  const [savingLeaders, setSavingLeaders] = useState(false);
  const [churchForm, setChurchForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    group_naming: "growth_groups" as OrganizationChurch["group_naming"],
  });
  const [groupForm, setGroupForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    area: "",
    description: "",
  });

  const selectedChurch = useMemo(
    () => churches.find((church) => church.id === selectedChurchId) ?? churches[0] ?? null,
    [churches, selectedChurchId],
  );
  const labels = groupLabels(selectedChurch?.group_naming);
  const scopedTurmas = useMemo(
    () => turmas.filter((turma) => !selectedChurch?.id || turma.church_id === selectedChurch.id),
    [selectedChurch?.id, turmas],
  );
  const assignedParticipants = useMemo(
    () => participants.filter((participant) => participant.turma_id).length,
    [participants],
  );

  useEffect(() => {
    if (!selectedChurch) return;
    setChurchForm({
      name: selectedChurch.name,
      city: selectedChurch.city ?? "",
      state: selectedChurch.state ?? "",
      address: selectedChurch.address ?? "",
      group_naming: selectedChurch.group_naming ?? "growth_groups",
    });
  }, [selectedChurch]);

  useEffect(() => {
    setGeneratedLinks({});
    setLeaderDialogTurma(null);
    setSelectedLeaderIds([]);
  }, [selectedChurch?.id]);

  const loadTurmaLeaders = useCallback(async () => {
    if (!selectedChurch?.id) {
      setTurmaLeaders([]);
      return;
    }
    const { data, error } = await supabase
      .from("turma_leaders")
      .select("turma_id, user_id, is_fallback")
      .eq("church_id", selectedChurch.id);

    if (error) {
      console.error("Erro ao carregar líderes dos grupos:", error);
      return;
    }
    setTurmaLeaders((data ?? []) as TurmaLeader[]);
  }, [selectedChurch?.id]);

  useEffect(() => {
    void loadTurmaLeaders();
  }, [loadTurmaLeaders, turmas]);

  function openLeaderDialog(turma: OrganizationTurma) {
    setLeaderDialogTurma(turma);
    setSelectedLeaderIds(
      turmaLeaders
        .filter((leader) => leader.turma_id === turma.id && !leader.is_fallback)
        .map((leader) => leader.user_id),
    );
  }

  function toggleLeader(userId: string) {
    setSelectedLeaderIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ));
  }

  async function handleSaveLeaders() {
    if (!leaderDialogTurma) return;
    setSavingLeaders(true);

    const existingIds = turmaLeaders
      .filter((leader) => leader.turma_id === leaderDialogTurma.id && !leader.is_fallback)
      .map((leader) => leader.user_id);
    const additions = selectedLeaderIds.filter((userId) => !existingIds.includes(userId));
    const removals = existingIds.filter((userId) => !selectedLeaderIds.includes(userId));

    const results = await Promise.all([
      ...additions.map((userId) => supabase.rpc("set_turma_leader", {
        p_turma_id: leaderDialogTurma.id,
        p_user_id: userId,
        p_assigned: true,
      })),
      ...removals.map((userId) => supabase.rpc("set_turma_leader", {
        p_turma_id: leaderDialogTurma.id,
        p_user_id: userId,
        p_assigned: false,
      })),
    ]);
    const error = results.find((result) => result.error)?.error;

    if (error) {
      toast({ title: "Não foi possível salvar os líderes", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Liderança atualizada",
        description: selectedLeaderIds.length
          ? "Os líderes selecionados já podem administrar este grupo."
          : "Sem líder selecionado, o administrador da igreja ficará responsável.",
      });
      await loadTurmaLeaders();
      setLeaderDialogTurma(null);
    }
    setSavingLeaders(false);
  }

  async function handleSaveChurch() {
    if (!selectedChurch || !churchForm.name.trim()) return;
    setSavingChurch(true);
    const { error } = await supabase
      .from("churches")
      .update({
        name: churchForm.name.trim(),
        city: churchForm.city.trim() || null,
        state: churchForm.state.trim().toUpperCase().slice(0, 2) || null,
        address: churchForm.address.trim() || null,
        group_naming: churchForm.group_naming,
      })
      .eq("id", selectedChurch.id);

    if (error) {
      toast({ title: "Não foi possível salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Igreja atualizada", description: "Os dados e a nomenclatura foram salvos." });
      await onRefresh();
    }
    setSavingChurch(false);
  }

  async function handleCreateGroup() {
    if (!selectedChurch || !groupForm.name.trim()) return;
    setCreatingGroup(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("turmas")
      .insert({
        church_id: selectedChurch.id,
        name: groupForm.name.trim(),
        year: groupForm.year,
        area: groupForm.area || (!isSuper && adminArea && adminArea !== "Sem area" ? adminArea : null),
        description: groupForm.description.trim() || null,
        created_by: user?.id,
      })
      .select("id, name, year, area, description, is_active, church_id")
      .single();

    if (error || !data) {
      toast({ title: `Erro ao criar ${labels.singular}`, description: error?.message, variant: "destructive" });
    } else {
      toast({ title: `${labels.short} criado`, description: "Agora você já pode gerar o link de convite." });
      setGroupForm({ name: "", year: new Date().getFullYear(), area: "", description: "" });
      setShowCreateGroup(false);
      await onRefresh();
    }
    setCreatingGroup(false);
  }

  async function handleGenerateInvite(turma: OrganizationTurma) {
    setGeneratingInvite(turma.id);
    const { data, error } = await supabase.rpc("create_turma_invite", {
      p_turma_id: turma.id,
      p_expires_in_days: 30,
      p_max_uses: null,
    });

    const invite = data?.[0];
    if (error || !invite?.invite_token) {
      toast({ title: "Não foi possível gerar o convite", description: error?.message, variant: "destructive" });
      setGeneratingInvite(null);
      return;
    }

    const link = `${window.location.origin}/convite/${invite.invite_token}`;
    setGeneratedLinks((current) => ({ ...current, [turma.id]: link }));
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link criado e copiado", description: "O convite é válido por 30 dias." });
    } catch {
      toast({ title: "Link criado", description: "Use o botão Copiar para compartilhar." });
    }
    setGeneratingInvite(null);
  }

  async function copyInvite(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado" });
    } catch {
      toast({ title: "Não foi possível copiar", description: "Selecione e copie o endereço manualmente.", variant: "destructive" });
    }
  }

  function shareInvite(turma: OrganizationTurma, link: string) {
    const message = `Olá! Você foi convidado(a) para ${labels.singular} “${turma.name}” da ${selectedChurch?.name}. Faça seu cadastro por este link: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  const churchReady = Boolean(selectedChurch?.name && selectedChurch?.city);
  const groupsReady = scopedTurmas.length > 0;
  const inviteReady = Object.keys(generatedLinks).length > 0;
  const setupDone = [churchReady, groupsReady, inviteReady].filter(Boolean).length;

  if (loading && !selectedChurch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-11 w-11 animate-pulse rounded-xl bg-primary/15" />
          <p className="font-inter text-sm text-muted-foreground">Preparando sua área administrativa…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-slate-950 px-4 pb-7 pt-7 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button onClick={onBack} className="mb-5 flex items-center gap-1.5 text-xs text-white/65 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> Voltar para a área geral
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-200/25 bg-orange-400/10">
                <Church className="h-6 w-6 text-orange-200" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Caminho 3M</p>
                <h1 className="mt-1 font-montserrat text-2xl font-black">Organize sua igreja</h1>
                <p className="mt-1 max-w-xl text-sm text-white/65">
                  Configure a igreja, crie seus grupos e convide as pessoas para a turma correta.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-5 text-xs">
                <span className="font-semibold text-white/70">Configuração inicial</span>
                <span className="font-bold text-emerald-300">{setupDone}/3</span>
              </div>
              <div className="flex gap-1.5">
                {[churchReady, groupsReady, inviteReady].map((done, index) => (
                  <div key={index} className={`h-1.5 w-14 rounded-full ${done ? "bg-emerald-400" : "bg-white/15"}`} />
                ))}
              </div>
            </div>
          </div>

          {isSuper && churches.length > 1 && (
            <div className="relative mt-5 max-w-md">
              <select
                value={selectedChurch?.id ?? ""}
                onChange={(event) => onSelectChurch(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-white/15 bg-white/10 px-3 pr-9 text-sm font-semibold text-white outline-none"
              >
                {churches.map((church) => (
                  <option key={church.id} value={church.id} className="text-slate-950">
                    {[church.name, church.city, church.state].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <nav className="mb-6 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition sm:text-sm ${
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.id === "groups" ? "Grupos" : item.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === "overview" && (
          <section className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Primeiros passos</p>
              <h2 className="mt-1 font-montserrat text-2xl font-black text-foreground">
                Deixe tudo pronto para receber sua comunidade
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Siga esta ordem. Quando a pessoa usar o convite, o cadastro já ficará ligado à igreja e ao grupo escolhido.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SetupCard
                step={1}
                done={churchReady}
                icon={Church}
                title="Dados da igreja"
                description="Confirme nome, cidade e como os grupos serão chamados."
                action="Configurar igreja"
                onClick={() => setActiveTab("church")}
              />
              <SetupCard
                step={2}
                done={groupsReady}
                icon={GraduationCap}
                title={`Criar ${labels.plural}`}
                description="Organize as pessoas por turma, ano ou local de encontro."
                action={`Ver ${labels.plural}`}
                onClick={() => setActiveTab("groups")}
              />
              <SetupCard
                step={3}
                done={inviteReady}
                icon={Share2}
                title="Convidar participantes"
                description="Gere um link próprio para cada grupo e envie pelo WhatsApp."
                action="Gerar convite"
                onClick={() => setActiveTab("groups")}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Church} label="Igreja" value={selectedChurch?.name ?? "Não configurada"} />
              <Metric icon={Users} label={labels.plural} value={String(scopedTurmas.length)} />
              <Metric icon={Check} label="Pessoas em grupos" value={String(assignedParticipants)} />
            </div>
          </section>
        )}

        {activeTab === "church" && (
          <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5"><Church className="h-5 w-5 text-primary" /></div>
                <div>
                  <h2 className="font-montserrat text-xl font-black text-foreground">Cadastro da igreja</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Essas informações identificam sua igreja dentro da plataforma.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Nome da igreja</span>
                  <Input value={churchForm.name} onChange={(event) => setChurchForm((form) => ({ ...form, name: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Cidade</span>
                  <Input value={churchForm.city} onChange={(event) => setChurchForm((form) => ({ ...form, city: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Estado</span>
                  <Input maxLength={2} value={churchForm.state} onChange={(event) => setChurchForm((form) => ({ ...form, state: event.target.value }))} placeholder="RS" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Endereço</span>
                  <Input value={churchForm.address} onChange={(event) => setChurchForm((form) => ({ ...form, address: event.target.value }))} />
                </label>
              </div>

              <button
                onClick={handleSaveChurch}
                disabled={savingChurch || !churchForm.name.trim()}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {savingChurch ? "Salvando…" : "Salvar dados da igreja"}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h3 className="font-montserrat text-lg font-black text-foreground">Como chamar os grupos?</h3>
              </div>
              <p className="mb-4 text-sm leading-6 text-muted-foreground">
                Escolha o nome que sua igreja já utiliza. Ele aparecerá em toda esta área de gestão.
              </p>
              <div className="space-y-2">
                <NamingOption
                  selected={churchForm.group_naming === "growth_groups"}
                  title="Grupos de Crescimento"
                  description="Ideal para pequenos grupos, células ou grupos de discipulado."
                  onClick={() => setChurchForm((form) => ({ ...form, group_naming: "growth_groups" }))}
                />
                <NamingOption
                  selected={churchForm.group_naming === "confirmation"}
                  title="Ensino Confirmatório"
                  description="Ideal para turmas de preparação e formação confirmatória."
                  onClick={() => setChurchForm((form) => ({ ...form, group_naming: "confirmation" }))}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "groups" && (
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{selectedChurch?.name}</p>
                <h2 className="font-montserrat text-2xl font-black text-foreground">{labels.plural}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Crie um grupo e gere o link que colocará cada pessoa na turma correta.</p>
              </div>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Novo grupo
              </button>
            </div>

            {scopedTurmas.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-montserrat text-lg font-black text-foreground">Crie seu primeiro grupo</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Depois de criar, você poderá copiar um convite específico. Cada cadastro feito por ele entrará automaticamente nesse grupo.
                </p>
                <button onClick={() => setShowCreateGroup(true)} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
                  Criar primeiro grupo
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {scopedTurmas.map((turma) => {
                  const memberCount = participants.filter((participant) => participant.turma_id === turma.id).length;
                  const inviteLink = generatedLinks[turma.id];
                  const leaders = turmaLeaders.filter((leader) => leader.turma_id === turma.id);
                  const explicitLeaders = leaders.filter((leader) => !leader.is_fallback);
                  const leaderNames = explicitLeaders
                    .map((leader) => participants.find((participant) => participant.user_id === leader.user_id)?.full_name)
                    .filter(Boolean);
                  return (
                    <article key={turma.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-xl bg-primary/10 p-2.5"><Users className="h-5 w-5 text-primary" /></div>
                          <div className="min-w-0">
                            <h3 className="truncate font-montserrat text-lg font-black text-foreground">{turma.name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {turma.year} · {memberCount} participante{memberCount === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => onSelectTurma(turma)} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted" title="Abrir painel">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      {turma.description && <p className="mt-3 text-sm leading-5 text-muted-foreground">{turma.description}</p>}

                      <div className="mt-4 rounded-xl border border-border bg-muted/35 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Liderança</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {leaderNames.length > 0
                                ? leaderNames.join(", ")
                                : "Administrador da igreja (responsável provisório)"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLeaderDialog(turma)}
                            className="shrink-0 rounded-lg border border-primary/25 bg-background px-3 py-2 text-xs font-bold text-primary"
                          >
                            Definir líderes
                          </button>
                        </div>
                      </div>

                      {inviteLink ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <Link2 className="h-4 w-4" /> Convite pronto
                          </div>
                          <input readOnly value={inviteLink} className="w-full truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700" />
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button onClick={() => copyInvite(inviteLink)} className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-800">
                              <Copy className="h-3.5 w-3.5" /> Copiar
                            </button>
                            <button onClick={() => shareInvite(turma, inviteLink)} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-bold text-white">
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateInvite(turma)}
                          disabled={generatingInvite === turma.id}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-bold text-primary disabled:opacity-50"
                        >
                          <Link2 className="h-4 w-4" />
                          {generatingInvite === turma.id ? "Gerando convite…" : "Gerar link de convite"}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-lg font-black">Criar {labels.singular}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label>
              <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Nome do grupo</span>
              <Input value={groupForm.name} onChange={(event) => setGroupForm((form) => ({ ...form, name: event.target.value }))} placeholder={selectedChurch?.group_naming === "confirmation" ? "Ex.: Confirmatório 2026" : "Ex.: GC Famílias"} />
            </label>
            <div>
              <label>
                <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Ano</span>
                <Input type="number" value={groupForm.year} onChange={(event) => setGroupForm((form) => ({ ...form, year: Number(event.target.value) || new Date().getFullYear() }))} />
              </label>
            </div>
            <label>
              <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Descrição (opcional)</span>
              <Input value={groupForm.description} onChange={(event) => setGroupForm((form) => ({ ...form, description: event.target.value }))} placeholder="Dia, horário ou local de encontro" />
            </label>
            <button
              onClick={handleCreateGroup}
              disabled={creatingGroup || !groupForm.name.trim()}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {creatingGroup ? "Criando…" : "Criar grupo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(leaderDialogTurma)}
        onOpenChange={(open) => {
          if (!open && !savingLeaders) setLeaderDialogTurma(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-lg font-black">
              Líderes de {leaderDialogTurma?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm leading-5 text-blue-900">
            Você pode escolher mais de um líder. Se ninguém for selecionado, o administrador da igreja assume este grupo provisoriamente.
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto py-1">
            {participants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Cadastre ou convide participantes antes de escolher um líder.
              </p>
            ) : (
              [...participants]
                .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? "", "pt-BR"))
                .map((participant) => {
                  const selected = selectedLeaderIds.includes(participant.user_id);
                  return (
                    <button
                      type="button"
                      key={participant.user_id}
                      onClick={() => toggleLeader(participant.user_id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                        selected ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/35"
                      }`}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {participant.full_name || "Usuário sem nome"}
                      </span>
                    </button>
                  );
                })
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveLeaders}
            disabled={savingLeaders}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {savingLeaders ? "Salvando…" : "Salvar líderes"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetupCard({
  step,
  done,
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  step: number;
  done: boolean;
  icon: typeof Church;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${done ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-card"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${done ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
          {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Passo {step}</span>
      </div>
      <h3 className="font-montserrat text-base font-black text-foreground">{title}</h3>
      <p className="mt-2 min-h-16 text-sm leading-5 text-muted-foreground">{description}</p>
      <button onClick={onClick} className="mt-4 flex items-center gap-1.5 text-sm font-bold text-primary">
        {action} <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Church; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="rounded-lg bg-muted p-2"><Icon className="h-4 w-4 text-primary" /></div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-montserrat text-sm font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function NamingOption({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
          {selected && <Check className="h-3 w-3" />}
        </div>
        <div>
          <p className="font-montserrat text-sm font-black text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}
