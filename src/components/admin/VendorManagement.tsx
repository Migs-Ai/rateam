import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";

export const VendorManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          id,
          business_name,
          category,
          location,
          status,
          rating,
          review_count,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string, status: string }) => {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', vendorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast({
        title: "Success",
        description: "Vendor status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
      console.error('Error updating vendor status:', error);
    }
  });

  const handleStatusUpdate = (vendorId: string, status: string) => {
    updateStatusMutation.mutate({ vendorId, status });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Management</CardTitle>
          <CardDescription>Loading vendors...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Management</CardTitle>
        <CardDescription>Approve and manage vendor accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors?.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  {vendor.business_name}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{vendor.profiles?.full_name || 'No name'}</div>
                    <div className="text-sm text-muted-foreground">{vendor.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>{vendor.category || 'No category'}</TableCell>
                <TableCell>{vendor.location || 'No location'}</TableCell>
                <TableCell>
                  <Badge variant={
                    vendor.status === 'approved' ? 'default' :
                    vendor.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{vendor.rating || 0}/5</span>
                    <span className="text-sm text-muted-foreground">
                      ({vendor.review_count || 0})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {vendor.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(vendor.id, 'suspended')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Suspend
                      </Button>
                    )}
                    {vendor.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};