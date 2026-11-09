import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type SwitchableTurma = {
  id: string;
  name: string;
  area: string | null;
  church_id: string | null;
};

interface AreaSwitchContextType {
  effectiveArea: string;
  setEffectiveArea: (area: string) => Promise<void>;
  effectiveTurmaId: string | null;
  effectiveTurma: SwitchableTurma | null;
  availableTurmas: SwitchableTurma[];
  setEffectiveTurma: (turmaId: string) => Promise<void>;
  canSwitchTurma: boolean;
  loadingTurmas: boolean;
  isOverriding: boolean;
  switchNonce: number;
}

const AreaSwitchContext = createContext<AreaSwitchContextType>({
  effectiveArea: "",
  setEffectiveArea: async () => {},
  effectiveTurmaId: null,
  effectiveTurma: null,
  availableTurmas: [],
  setEffectiveTurma: async () => {},
  canSwitchTurma: false,
  loadingTurmas: false,
  isOverriding: false,
  switchNonce: 0,
});

export function AreaSwitchProvider({ children }: { children: ReactNode }) {
  const { user, profile, role, isSuper } = useAuth();
  const [availableTurmas, setAvailableTurmas] = useState<SwitchableTurma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [switchNonce, setSwitchNonce] = useState(0);

  const profileArea = profile?.area ?? "";
  const profileTurmaId = profile?.turma_id ?? null;
  const churchId = profile?.church_id ?? null;
  const canManageGroups = isSuper || role === "admin" || role === "lider";

  useEffect(() => {
    let active = true;

    if (!user || !churchId) {
      setAvailableTurmas([]);
      setSelectedTurmaId(profileTurmaId);
      setLoadingTurmas(false);
      return () => {
        active = false;
      };
    }

    async function loadTurmas() {
      setLoadingTurmas(true);
      let allowedTurmaIds: string[] | null = null;

      if (role === "lider" && !isSuper) {
        const { data: leaderRows, error: leaderError } = await supabase
          .from("turma_leaders")
          .select("turma_id")
          .eq("user_id", user.id)
          .eq("church_id", churchId);

        if (leaderError) {
          console.error("Erro ao carregar grupos do líder:", leaderError);
          if (active) {
            setAvailableTurmas([]);
            setSelectedTurmaId(profileTurmaId);
            setLoadingTurmas(false);
          }
          return;
        }
        allowedTurmaIds = (leaderRows ?? []).map((row) => row.turma_id);
      } else if (role !== "admin" && !isSuper) {
        allowedTurmaIds = profileTurmaId ? [profileTurmaId] : [];
      }

      let query = supabase
        .from("turmas")
        .select("id, name, area, church_id")
        .eq("church_id", churchId)
        .eq("is_active", true)
        .order("name");

      if (allowedTurmaIds !== null) {
        if (allowedTurmaIds.length === 0) {
          if (active) {
            setAvailableTurmas([]);
            setSelectedTurmaId(profileTurmaId);
            setLoadingTurmas(false);
          }
          return;
        }
        query = query.in("id", allowedTurmaIds);
      }

      const { data, error } = await query;
      if (!active) return;
      if (error) {
        console.error("Erro ao carregar grupos da igreja:", error);
        setAvailableTurmas([]);
        setSelectedTurmaId(profileTurmaId);
        setLoadingTurmas(false);
        return;
      }

      const turmas = (data ?? []) as SwitchableTurma[];
      const storageKey = `caminho_selected_turma:${user.id}:${churchId}`;
      const storedTurmaId = window.localStorage.getItem(storageKey);
      const preferredTurmaId = [storedTurmaId, profileTurmaId, turmas[0]?.id]
        .find((id): id is string => Boolean(id && turmas.some((turma) => turma.id === id))) ?? null;

      setAvailableTurmas(turmas);
      setSelectedTurmaId(preferredTurmaId);
      setLoadingTurmas(false);
    }

    void loadTurmas();
    return () => {
      active = false;
    };
  }, [churchId, isSuper, profileTurmaId, role, user]);

  const effectiveTurma = useMemo(
    () => availableTurmas.find((turma) => turma.id === selectedTurmaId) ?? null,
    [availableTurmas, selectedTurmaId],
  );
  const effectiveTurmaId = effectiveTurma?.id ?? profileTurmaId;
  const effectiveArea = effectiveTurma?.area || profileArea;
  const canSwitchTurma = canManageGroups && availableTurmas.length > 1;
  const isOverriding = canSwitchTurma
    && Boolean(effectiveTurmaId)
    && effectiveTurmaId !== profileTurmaId;

  async function selectTurma(turmaId: string) {
    if (!user || !churchId) return;
    const turma = availableTurmas.find((item) => item.id === turmaId);
    if (!turma) return;

    setSelectedTurmaId(turma.id);
    window.localStorage.setItem(`caminho_selected_turma:${user.id}:${churchId}`, turma.id);
    setSwitchNonce((value) => value + 1);
  }

  return (
    <AreaSwitchContext.Provider value={{
      effectiveArea,
      setEffectiveArea: async (area: string) => {
        const turma = availableTurmas.find((item) => (item.area || profileArea) === area);
        if (turma) await selectTurma(turma.id);
      },
      effectiveTurmaId,
      effectiveTurma,
      availableTurmas,
      setEffectiveTurma: selectTurma,
      canSwitchTurma,
      loadingTurmas,
      isOverriding,
      switchNonce,
    }}>
      {children}
    </AreaSwitchContext.Provider>
  );
}

export function useAreaSwitch() {
  return useContext(AreaSwitchContext);
}
