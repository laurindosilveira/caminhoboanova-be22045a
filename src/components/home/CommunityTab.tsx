import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, MessageCircle, Flame } from "lucide-react";

interface CommunityMember {
  id: string;
  full_name: string;
  community: string;
  area: string;
}

const pastorMessages = [
  {
    id: 1,
    author: "Padre Marcos",
    avatar: "✝️",
    message: "Queridos jovens, lembrem-se: a Crisma é um compromisso de vida! Continuem firmes na jornada. 🙏",
    time: "Hoje",
  },
  {
    id: 2,
    author: "Catequista Ana",
    avatar: "📿",
    message: "Lembrete: próximo encontro no sábado às 14h na paróquia. Tragam seus diários espirituais!",
    time: "Ontem",
  },
];

const highlights = [
  { name: "Maria Silva", feat: "7 dias seguidos", icon: "🔥" },
  { name: "Lucas Alves", feat: "3 módulos concluídos", icon: "🎓" },
  { name: "Júlia Costa", feat: "50 pontos conquistados", icon: "⭐" },
];

export default function CommunityTab() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, community, area")
        .order("full_name");

      if (!error && data) setMembers(data);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const myCommunityMembers = members.filter(
    (m) => profile?.community && m.community === profile.community
  );

  return (
    <div className="px-5 pt-5 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-montserrat font-black text-foreground text-xl">👥 Comunidade</h2>
        {profile?.community && (
          <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
            {profile.community}
          </span>
        )}
      </div>

      {/* Pastor messages */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Mensagens do Pastor</span>
        </div>
        <div className="space-y-3">
          {pastorMessages.map((msg) => (
            <div key={msg.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{msg.avatar}</span>
                <div>
                  <p className="font-montserrat font-bold text-card-foreground text-sm">{msg.author}</p>
                  <p className="text-muted-foreground text-xs font-inter">{msg.time}</p>
                </div>
              </div>
              <p className="text-card-foreground text-sm font-inter leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly highlights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-secondary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Em destaque esta semana</span>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < highlights.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-orange flex items-center justify-center text-sm flex-shrink-0">
                {h.icon}
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-bold text-card-foreground text-sm">{h.name}</p>
                <p className="text-muted-foreground text-xs font-inter">{h.feat}</p>
              </div>
              <span className="text-accent font-montserrat font-black text-sm">#{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-montserrat font-bold text-foreground text-sm">
            Participantes da sua comunidade
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        ) : myCommunityMembers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-muted-foreground text-sm font-inter">Nenhum participante encontrado.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {myCommunityMembers.map((m, i) => {
              const isMe = m.id === profile?.id;
              const initials = m.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < myCommunityMembers.length - 1 ? "border-b border-border" : ""
                  } ${isMe ? "bg-primary/5" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-black text-sm text-primary-foreground flex-shrink-0 ${isMe ? "bg-gradient-orange" : "bg-primary"}`}>
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-montserrat font-bold text-card-foreground text-sm">
                      {m.full_name} {isMe && <span className="text-secondary text-xs font-inter">(você)</span>}
                    </p>
                    <p className="text-muted-foreground text-xs font-inter">{m.area}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">❤️</span>
                    <span className="text-muted-foreground text-xs font-inter">Nível 3</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
