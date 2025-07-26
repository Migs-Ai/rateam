import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Star } from "lucide-react";

export const ReviewManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          vendor_reply,
          vendor_reply_at,
          profiles (
            full_name,
            email
          ),
          vendors (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string, status: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: "Success",
        description: "Review status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
      console.error('Error updating review status:', error);
    }
  });

  const handleStatusUpdate = (reviewId: string, status: string) => {
    updateStatusMutation.mutate({ reviewId, status });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>Loading reviews...</CardDescription>
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
        <CardTitle>Review Management</CardTitle>
        <CardDescription>Moderate and manage user reviews</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor Reply</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews?.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{review.profiles?.full_name || 'Anonymous'}</div>
                    <div className="text-sm text-muted-foreground">{review.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {review.vendors?.business_name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{review.rating}/5</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate" title={review.comment || ''}>
                    {review.comment || 'No comment'}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    review.status === 'approved' ? 'default' :
                    review.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs">
                  {review.vendor_reply ? (
                    <div className="space-y-1">
                      <p className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        {review.vendor_reply}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.vendor_reply_at!).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No reply</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(review.id, 'approved')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(review.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
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