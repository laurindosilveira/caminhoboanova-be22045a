import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Music, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Youtube, 
  Play,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorshipSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'other';
  theme: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
}

export default function WorshipTab() {
  const { toast } = useToast();
  const [songs, setSongs] = useState<WorshipSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSong, setEditingSong] = useState<WorshipSong | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    artist: "",
    url: "",
    platform: "youtube" as WorshipSong['platform'],
    theme: "",
    thumbnail_url: "",
    is_active: true
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("worship_songs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Erro ao carregar músicas", description: error.message, variant: "destructive" });
    } else {
      setSongs((data || []) as WorshipSong[]);
    }
    setLoading(false);
  }

  function validateUrl(url: string, platform: string): string | null {
    if (!url.trim()) return "O link não pode estar vazio";
    
    try {
      const parsedUrl = new URL(url);
      if (platform === 'youtube') {
        if (!parsedUrl.hostname.includes('youtube.com') && !parsedUrl.hostname.includes('youtu.be')) {
          return "Link inválido. Deve ser um link do YouTube.";
        }
      } else if (platform === 'spotify') {
        if (!parsedUrl.hostname.includes('spotify.com')) {
          return "Link inválido. Deve ser um link do Spotify.";
        }
      }
      return null;
    } catch (e) {
      return "URL inválida. Verifique o formato do link.";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.artist || !form.url) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, artista e link.", variant: "destructive" });
      return;
    }

    const urlError = validateUrl(form.url, form.platform);
    if (urlError) {
      toast({ title: "Link Inválido", description: urlError, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    
    if (editingSong) {
      const { error } = await supabase
        .from("worship_songs")
        .update(form)
        .eq("id", editingSong.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Música atualizada com sucesso! 🎶" });
        resetForm();
        fetchSongs();
      }
    } else {
      const { error } = await supabase.from("worship_songs").insert([form]);

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Música cadastrada com sucesso! 🎶" });
        resetForm();
        fetchSongs();
      }
    }
    setSubmitting(false);
  }

  function resetForm() {
    setForm({
      title: "",
      artist: "",
      url: "",
      platform: "youtube",
      theme: "",
      thumbnail_url: "",
      is_active: true
    });
    setEditingSong(null);
    setShowForm(false);
  }

  function handleEdit(song: WorshipSong) {
    setEditingSong(song);
    setForm({
      title: song.title,
      artist: song.artist,
      url: song.url,
      platform: song.platform,
      theme: song.theme || "",
      thumbnail_url: song.thumbnail_url || "",
      is_active: song.is_active
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleStatus(song: WorshipSong) {
    const { error } = await supabase
      .from("worship_songs")
      .update({ is_active: !song.is_active })
      .eq("id", song.id);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, is_active: !s.is_active } : s));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta música?")) return;
    const { error } = await supabase.from("worship_songs").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setSongs(prev => prev.filter(s => s.id !== id));
      toast({ title: "Música removida" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-montserrat font-black text-foreground text-lg">Louvor para o Caminho</h2>
            <p className="text-muted-foreground text-xs font-inter">Gerencie as músicas sugeridas para os jovens</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          {showForm ? "Cancelar" : <><Plus className="w-4 h-4" /> Cadastrar Música</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">Título da Música</label>
              <Input 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Ex: Teu Reino"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">Artista / Banda</label>
              <Input 
                value={form.artist}
                onChange={e => setForm({...form, artist: e.target.value})}
                placeholder="Ex: Central 3"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">URL (Link)</label>
              <Input 
                value={form.url}
                onChange={e => setForm({...form, url: e.target.value})}
                placeholder="https://youtube.com/..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">Plataforma</label>
              <Select 
                value={form.platform}
                onValueChange={(val: any) => setForm({...form, platform: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">Tema Espiritual</label>
              <Input 
                value={form.theme}
                onChange={e => setForm({...form, theme: e.target.value})}
                placeholder="Ex: Oração, Entrega, Missões"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-1">URL da Capa (Opcional)</label>
              <Input 
                value={form.thumbnail_url}
                onChange={e => setForm({...form, thumbnail_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold">
            {submitting ? "Salvando..." : "Salvar Música"}
          </Button>
        </form>
      )}

      <div className="grid gap-3">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-inter text-sm">Carregando catálogo...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="bg-muted/20 border-2 border-dashed border-border rounded-3xl py-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-inter">Nenhuma música cadastrada ainda.</p>
          </div>
        ) : (
          songs.map(song => (
            <div key={song.id} className={`flex items-center gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm transition-all ${!song.is_active ? 'opacity-60 grayscale' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {song.thumbnail_url ? (
                  <img src={song.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  song.platform === 'youtube' ? <Youtube className="w-6 h-6 text-red-500" /> : <Music className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-montserrat font-bold text-sm text-foreground truncate">{song.title}</h4>
                <p className="text-xs text-muted-foreground font-inter truncate">{song.artist} • {song.theme || "Sem tema"}</p>
              </div>

              <div className="flex items-center gap-1">
                <a href={song.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-muted text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => toggleStatus(song)}
                  className={`p-2.5 rounded-xl transition-colors ${song.is_active ? 'text-brand-green hover:bg-brand-green/10' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(song.id)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
