import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserRole } from '@/lib/useUserRole';

export default function Index() {
  const router = useRouter();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (loading) return;

    if (role === 'Koch') {
      router.replace('/chef');
    } else {
      router.replace('/home');
    }
  }, [role, loading]);

  return null; // kein UI, nur Redirect
}
