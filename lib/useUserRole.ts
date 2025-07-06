import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      setUserId(uid);

      const { data, error } = await supabase
        .from('User')
        .select('role')
        .eq('user_id', uid)
        .single();

      if (!error && data?.role) {
        setRole(data.role); // Wichtig: exakt so wie in der DB (Groß-/Kleinschreibung!)
      }

      setLoading(false);
    };

    fetchUserRole();
  }, []);

  return { role, userId, loading };
}

