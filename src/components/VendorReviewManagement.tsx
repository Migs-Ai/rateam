import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Send, Phone, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface VendorReviewManagementProps {
  vendorId: string;
}

export const VendorReviewManagement = ({ vendorId }: VendorReviewManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['vendor-reviews-management', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_vendor_reviews_with_profiles', { 
          p_vendor_id: vendorId 
        });

      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      console.log('Reviews data:', data);
      return data;
    },
    enabled: !!vendorId
  });

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string, reply: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          vendor_reply: reply,
          vendor_reply_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Reply sent!",
        description: "Your reply has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews-management', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      setReplyTexts({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
      console.error('Reply error:', error);
    }
  });

  const handleReply = (reviewId: string) => {
    const reply = replyTexts[reviewId];
    if (!reply?.trim()) {
      toast({
        title: "Reply required",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }
    replyMutation.mutate({ reviewId, reply: reply.trim() });
  };

  const updateReplyText = (reviewId: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleContactCustomer = (email?: string, whatsapp?: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else if (whatsapp) {
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>Loading reviews...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews & Replies</CardTitle>
        <CardDescription>
          Manage your customer reviews and engage with feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              Reviews will appear here once customers start rating your business
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-4">
                {/* Review Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {review.profiles?.full_name || 'Anonymous Customer'}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <p className="text-foreground bg-muted/50 p-3 rounded">
                    "{review.comment}"
                  </p>
                )}

                {/* Contact Information (if customer chose to be visible) */}
                {review.customer_contact_visible && review.profiles && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Customer Contact Information:
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactCustomer(review.profiles?.email, review.profiles?.whatsapp)}
                        className="text-blue-700 dark:text-blue-300 border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {review.profiles.email && (
                        <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                          <Mail className="h-3 w-3" />
                          <span>{review.profiles.email}</span>
                        </div>
                      )}
                      {review.profiles.whatsapp && (
                        <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                          <Phone className="h-3 w-3" />
                          <span>{review.profiles.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Existing Vendor Reply */}
                {review.vendor_reply && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-green-700 dark:text-green-300">
                        Your Reply
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.vendor_reply_at!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-green-800 dark:text-green-200">{review.vendor_reply}</p>
                  </div>
                )}

                {/* Reply Form (if no reply exists) */}
                {!review.vendor_reply && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-sm font-medium">Reply to this review:</label>
                    <Textarea
                      placeholder="Write a professional response to this customer..."
                      value={replyTexts[review.id] || ''}
                      onChange={(e) => updateReplyText(review.id, e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => handleReply(review.id)}
                      disabled={replyMutation.isPending}
                      size="sm"
                      className="bg-gradient-primary text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
