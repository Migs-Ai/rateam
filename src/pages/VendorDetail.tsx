
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, MessageCircle, ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching vendor:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id
  });

  const { data: reviews } = useQuery({
    queryKey: ['vendor-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('vendor_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-warning fill-current"
            : index < rating
            ? "text-warning fill-current opacity-50"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const handleWriteReview = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/vendor/${id}/review`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vendor details...</p>
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
            <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist or has been removed.</p>
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
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Section */}
              <Card>
                <CardContent className="p-0">
                  {vendor.image_url && (
                    <div className="h-64 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={vendor.image_url}
                        alt={vendor.business_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          {vendor.business_name}
                        </h1>
                        <Badge variant="secondary" className="mb-2">
                          {vendor.categories?.name || vendor.category || 'Uncategorized'}
                        </Badge>
                      </div>
                      <Badge variant="default" className="bg-success text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        Open
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex space-x-1">
                        {renderStars(vendor.rating || 0)}
                      </div>
                      <span className="text-lg font-medium text-foreground">
                        {(vendor.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({vendor.review_count || 0} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    {vendor.description && (
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Customer Reviews</span>
                    <Button onClick={handleWriteReview}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!reviews || reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No reviews yet</p>
                      <p className="text-sm text-muted-foreground">
                        Be the first to review this business!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {review.profiles?.full_name || 'Anonymous'}
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
                          
                          {/* Customer Review */}
                          {review.comment && (
                            <p className="text-muted-foreground bg-muted/50 p-3 rounded">
                              "{review.comment}"
                            </p>
                          )}
                          
                          {/* Vendor Reply */}
                          {review.vendor_reply && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-blue-700 dark:text-blue-300">
                                  Business Reply
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.vendor_reply_at!).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-blue-800 dark:text-blue-200">{review.vendor_reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vendor.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{vendor.location}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                  {vendor.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span>{vendor.whatsapp}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-primary text-white"
                    onClick={handleWriteReview}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                  {vendor.phone && (
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                  {vendor.whatsapp && (
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorDetail;
