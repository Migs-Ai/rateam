
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        console.log('useUserRole: No user found');
        setRole(null);
        setLoading(false);
        return;
      }

      console.log('useUserRole: Fetching role for user:', user.email, user.id);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
        }

        console.log('useUserRole: Role data:', data);
        setRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isVendor = role === 'vendor';

  console.log('useUserRole: Final values - role:', role, 'isAdmin:', isAdmin, 'isVendor:', isVendor);

  return { role, loading, isAdmin, isVendor };
};
