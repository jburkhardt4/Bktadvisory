import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';

export function useUserProjects() {
  const { session, role } = useAuth();
  const user = session?.user ?? null;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;
      let query = supabase.from('projects').select('*, milestones(*), activity_events(*)');

      if (role === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;
      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    fetchProjects();
  }, [user, role]);

  return { projects, loading };
}
