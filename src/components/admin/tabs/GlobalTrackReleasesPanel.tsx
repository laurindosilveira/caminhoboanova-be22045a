import { useCallback, useEffect, useState } from "react";
import { Building2, ChevronDown, ChevronUp, GraduationCap, Lock, RefreshCw, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Track = {
  id: string;
  name: string;
  description: string;
  order_num: number;
};

type Church = {
  id: string;
  name: string;
  city: string | null;
};

type ReleaseMap = Record<string, Set<string>>;

export default function GlobalTrackReleasesPanel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [releaseMap, setReleaseMap] = useState<ReleaseMap>({});
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: tracksData }, { data: churchesData }, { data: releasesData }] = await Promise.all([
      supabase.from("learning_tracks").select("id, name, description, order_num").order("order_num"),
      supabase.from("churches").select("id, name, city").eq("is_active", true).order("name"),
      supabase.from("track_church_releases").select("track_id, church_id"),
    ]);

    const nextMap: ReleaseMap = {};
    (releasesData ?? []).forEach((release) => {
      if (!nextMap[release.track_id]) nextMap[release.track_id] = new Set();
      nextMap[release.track_id].add(release.church_id);
    });

    setTracks(tracksData ?? []);
    setChurches(churchesData ?? []);
    setReleaseMap(nextMap);
    setExpandedTrack((current) => current ?? tracksData?.[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function toggleRelease(trackId: string, churchId: string) {
    const key = `${trackId}:${churchId}`;
    setTogglingKey(key);
    const isReleased = releaseMap[trackId]?.has(churchId) ?? false;

    if (isReleased) {
      const { error } = await supabase
        .from("track_church_releases")
        .delete()
        .eq("track_id", trackId)
        .eq("church_id", churchId);
      if (error) {
        toast({ title: "Erro ao bloquear trilha", description: error.message, variant: "destructive" });
        setTogglingKey(null);
        return;
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("track_church_releases").insert({
        track_id: trackId,
        church_id: churchId,
        released_by: user?.id ?? null,
      });
      if (error) {
        toast({ title: "Erro ao liberar trilha", description: error.message, variant: "destructive" });
        setTogglingKey(null);
        return;
      }
    }

    setReleaseMap((current) => {
      const next = { ...current };
      const churchIds = new Set(next[trackId] ?? []);
      if (isReleased) churchIds.delete(churchId);
      else churchIds.add(churchId);
      next[trackId] = churchIds;
      return next;
    });
    toast({
      title: isReleased ? "Trilha bloqueada" : "Trilha liberada",
      description: isReleased
        ? "A igreja não terá mais acesso a esta trilha."
        : "Líderes e admins já podem acessar; os usuários dependem da liberação local.",
    });
    setTogglingKey(null);
  }

  if (loading) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />;
  }

  if (tracks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-montserrat font-bold text-foreground text-sm">Liberação de Trilhas</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            O Admin Geral escolhe quais igrejas podem usar cada trilha.
          </p>
        </div>
        <button type="button" onClick={fetchAll} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-3 font-inter text-xs text-secondary">
        Liberar uma trilha dá acesso imediato aos líderes e admins da igreja. Para usuários, os cursos continuam bloqueados até a liberação local por área.
      </div>

      {tracks.map((track) => {
        const released = releaseMap[track.id] ?? new Set<string>();
        const isOpen = expandedTrack === track.id;
        return (
          <div key={track.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedTrack(isOpen ? null : track.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-foreground text-sm">{track.name}</p>
                <p className="font-inter text-xs text-muted-foreground">
                  {released.size === 0 ? "Nenhuma igreja com acesso" : `${released.size} igreja(s) com acesso`}
                </p>
              </div>
              {isOpen
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="border-t border-border p-4 space-y-2">
                {churches.map((church) => {
                  const isReleased = released.has(church.id);
                  const busy = togglingKey === `${track.id}:${church.id}`;
                  return (
                    <div
                      key={church.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                        isReleased ? "border-brand-green/30 bg-brand-green/5" : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isReleased ? "bg-brand-green/15" : "bg-muted"
                        }`}>
                          {isReleased
                            ? <Unlock className="w-4 h-4 text-brand-green" />
                            : <Building2 className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-inter text-sm font-medium text-foreground truncate">{church.name}</p>
                          {church.city && <p className="font-inter text-xs text-muted-foreground">{church.city}</p>}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleRelease(track.id, church.id)}
                        className={`px-3 py-1.5 rounded-lg font-inter text-xs font-semibold disabled:opacity-40 ${
                          isReleased
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
                        }`}
                      >
                        {busy ? "..." : isReleased ? "Bloquear" : "Liberar"}
                      </button>
                    </div>
                  );
                })}
                {churches.length === 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground font-inter text-xs">
                    <Lock className="w-4 h-4" />
                    Nenhuma igreja ativa cadastrada.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
