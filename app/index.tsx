import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { getUserRole } from '@/lib/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      try {
        const role = await getUserRole(user.id);

        if (role === 'Koch') {
          router.replace('/chef');
        } else {
          router.replace('/home');
        }
      } catch (err) {
        console.error('Fehler bei der Rollenprüfung', err);
        router.replace('/home'); // Fallback
      }
    };

    redirectBasedOnRole();
  }, []);

  return null; // Kein UI
}
