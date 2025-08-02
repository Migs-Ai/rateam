
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const VendorReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [contactVisible, setContactVisible] = useState(false);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, image_url, category')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Authentication required');
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          vendor_id: id,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          customer_contact_visible: contactVisible
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review has been submitted for approval.",
      });
      // Invalidate both vendor-specific reviews and admin vendors list
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      navigate(`/vendor/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      console.error('Review submission error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitReview.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vendor/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {vendor.business_name}
          </Button>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Write a Review for {vendor.business_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rating *
                    </label>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            index < (hoveredRating || rating)
                              ? "text-warning fill-current"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setRating(index + 1)}
                          onMouseEnter={() => setHoveredRating(index + 1)}
                          onMouseLeave={() => setHoveredRating(0)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                      Comment (Optional)
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this business..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact-visible"
                  checked={contactVisible}
                  onCheckedChange={(checked) => setContactVisible(checked === true)}
                />
                    <label
                      htmlFor="contact-visible"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow the business owner to contact me about this review
                    </label>
                  </div>
                  
                  {contactVisible && (
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded border">
                      <p className="font-medium mb-1">Contact Information Sharing:</p>
                      <p>
                        By checking this option, you allow the business owner to see your email address and phone number (if provided in your profile) so they can follow up on your review if needed.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/vendor/${id}`)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitReview.isPending || rating === 0}
                      className="flex-1 bg-gradient-primary text-white"
                    >
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorReview;
