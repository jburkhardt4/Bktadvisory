import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client'; 
import { Building, Mail, Phone, Pen } from 'lucide-react';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string;
  company_name: string | null;
  role: string;
  phone: string | null;
}

// Utility to format raw 10-digit strings into (###) ###-####
const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return null;
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone; // Return original if it doesn't match 10 digits
};

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
          .select('first_name, last_name, email, company_name, role, phone')
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

  if (loading) {
    return <div className="h-32 animate-pulse bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>;
  }

  if (error || !profile) {
    return <div className="p-6 text-red-400 bg-slate-800/50 rounded-2xl border border-slate-700/50">Failed to load profile.</div>;
  }

  return (
    <div className="relative bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
      {/* Edit Button */}
      <button className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
        <Pen size={18} />
      </button>

      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/20">
          {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
        </div>
        
        <div className="flex-1">
          {/* Name & Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {profile.first_name} {profile.last_name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          
          {/* Role */}
          <div className="text-slate-400 text-sm mt-1 capitalize">
            {profile.role}
          </div>

          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-300">
            {profile.company_name && (
              <div className="flex items-center gap-2">
                <Building size={16} className="text-slate-500" />
                <span>{profile.company_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-500" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-500" />
                {/* Render formatted phone number */}
                <span>{formatPhoneNumber(profile.phone)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}