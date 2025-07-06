
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
  id: string;
  business_name: string;
  category: string | null;
  description: string | null;
  rating: number | null;
  review_count: number | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  image_url: string | null;
  status: string | null;
  gallery: any[] | null;
  created_at: string | null;
  categories?: {
    name: string;
    icon: string | null;
  };
}

export const useVendors = (searchTerm?: string, category?: string, sortBy?: string) => {
  return useQuery({
    queryKey: ['vendors', searchTerm, category, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('status', 'approved');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (category && category !== 'All Categories') {
        query = query.eq('category', category);
      }

      // Apply sorting
      if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'reviews') {
        query = query.order('review_count', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('business_name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      return data as Vendor[];
    },
  });
};
