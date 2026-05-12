import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { Music, Play, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import WorshipCard from "./WorshipCard";

interface WorshipSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'other';
  theme: string | null;
  thumbnail_url: string | null;
}

export default function WorshipPlayerSection() {
  const [songs, setSongs] = useState<WorshipSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { effectiveArea } = useAreaSwitch();

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("worship_songs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error) {
        setSongs((data || []) as WorshipSong[]);
      }
      setLoading(false);
    }
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase()) ||
    (s.theme?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-foreground text-lg leading-tight">Momento de Adoração</h3>
              <p className="text-muted-foreground text-xs font-inter">Trilha sonora para sua jornada espiritual</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por música, artista ou tema..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/30 border-border rounded-xl h-10 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Sincronizando louvores...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="py-12 text-center bg-muted/20 border-2 border-dashed border-border rounded-3xl">
            <Music className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-inter">
              {search ? "Nenhum louvor encontrado para esta busca." : "Ainda não há louvores sugeridos para hoje."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSongs.map(song => (
              <WorshipCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
        <p className="text-[10px] text-muted-foreground font-inter leading-relaxed italic text-center">
          "Cantem ao Senhor um novo cântico; cantem ao Senhor, todos os confins da terra." <br/>
          — Salmos 96:1
        </p>
      </div>
    </div>
  );
}
