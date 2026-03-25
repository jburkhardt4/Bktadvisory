import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { MailIcon, BuildingIcon } from 'lucide-react';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  role: string;
}

export function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('No user logged in');

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, company_name, role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, []);

  if (loading) return <div className="p-6 animate-pulse bg-slate-50 rounded-xl">Loading profile...</div>;
  if (error || !profile) return <div className="p-6 text-red-500 bg-red-50 rounded-xl">Failed to load profile.</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <MailIcon size={16} className="text-slate-400" />
          <span>{profile.email}</span>
        </div>
        {profile.company_name && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <BuildingIcon size={16} className="text-slate-400" />
            <span>{profile.company_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}