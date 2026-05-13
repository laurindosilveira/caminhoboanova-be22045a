import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useChurch() {
  const { user } = useAuth();
  const [churchId, setChurchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChurch() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setChurchId(data.church_id);
      }
      setLoading(false);
    }

    fetchChurch();
  }, [user]);

  return { churchId, loading };
}
