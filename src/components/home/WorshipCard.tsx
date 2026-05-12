import { Music, ExternalLink, Play, Youtube } from "lucide-react";

interface WorshipSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'other';
  theme: string | null;
  thumbnail_url: string | null;
}

interface WorshipCardProps {
  song: WorshipSong;
  variant?: 'compact' | 'full';
  suggestionText?: string;
}

export default function WorshipCard({ song, variant = 'full', suggestionText }: WorshipCardProps) {
  const isYoutube = song.platform === 'youtube' || song.url.includes('youtube.com') || song.url.includes('youtu.be');
  const isSpotify = song.platform === 'spotify' || song.url.includes('spotify.com');

  if (variant === 'compact') {
    return (
      <a 
        href={song.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-1">
            Sugestão de Louvor
          </p>
          <h4 className="text-sm font-montserrat font-bold text-foreground truncate">{song.title}</h4>
        </div>
        <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="p-5 space-y-4">
        {suggestionText && (
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-xs font-montserrat font-bold text-muted-foreground uppercase tracking-widest">
              {suggestionText}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative group">
            {song.thumbnail_url ? (
              <img src={song.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              isYoutube ? <Youtube className="w-8 h-8 text-red-500" /> : <Music className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-montserrat font-black text-foreground text-lg leading-tight truncate">{song.title}</h4>
            <p className="font-inter text-sm text-muted-foreground truncate">{song.artist}</p>
            {song.theme && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                {song.theme}
              </span>
            )}
          </div>
        </div>

        <a 
          href={song.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-montserrat font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          {isYoutube ? <Youtube className="w-4 h-4" /> : isSpotify ? <Music className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          Ouvir agora
        </a>
      </div>
    </div>
  );
}
