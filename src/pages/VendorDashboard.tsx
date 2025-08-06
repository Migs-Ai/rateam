
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageCircle, TrendingUp, Building2, Phone, Mail, MapPin, Edit, Image as ImageIcon } from "lucide-react";
import { VendorProfileEdit } from "@/components/VendorProfileEdit";
import { VendorReviewManagement } from "@/components/VendorReviewManagement";
import { ImageUpload } from "@/components/ImageUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/transitions/PageTransition";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching vendor data for user:', user.id);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching vendor:', error);
        throw error;
      }
      
      console.log('Vendor data fetched:', data);
      return data;
    },
    enabled: !!user?.id
  });

  const updateVendorImagesMutation = useMutation({
    mutationFn: async ({ profileImage, galleryImages }: { profileImage?: string[], galleryImages?: string[] }) => {
      if (!vendor?.id) throw new Error('No vendor found');
      
      const updates: any = {};
      if (profileImage !== undefined) {
        updates.image_url = profileImage[0] || null;
      }
      if (galleryImages !== undefined) {
        updates.gallery = galleryImages;
      }

      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile', user?.id] });
      toast({
        title: "Images updated",
        description: "Your business images have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update images. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Business Found</CardTitle>
            <CardDescription>
              You need to register your business first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/vendor-onboarding")} className="w-full">
              Register Your Business
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <VendorProfileEdit 
            vendor={vendor} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <p className="text-muted-foreground">Manage your business profile and reviews</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              View Public Profile
            </Button>
            <Button variant="outline" onClick={() => setShowImageUpload(!showImageUpload)}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Manage Images
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Business Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {vendor.business_name}
                </CardTitle>
                <CardDescription>{vendor.description}</CardDescription>
              </div>
              <Badge variant={getStatusColor(vendor.status)}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          {/* Business Image */}
          {vendor.image_url && (
            <div className="px-6 pb-4">
              <img 
                src={vendor.image_url} 
                alt={vendor.business_name} 
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{(vendor.rating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{vendor.review_count || 0}</span>
                <span className="text-muted-foreground">Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{vendor.category}</span>
                <span className="text-muted-foreground">Category</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-semibold">{vendor.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Management Section */}
        {showImageUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Manage Business Images
              </CardTitle>
              <CardDescription>
                Upload your profile picture and gallery images to showcase your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Upload */}
              <ImageUpload
                currentImages={vendor.image_url ? [vendor.image_url] : []}
                onImagesChange={(images) => updateVendorImagesMutation.mutate({ profileImage: images })}
                maxImages={1}
                bucketName="vendor-profiles"
                label="Profile Picture"
                isProfilePicture={true}
              />

              {/* Gallery Upload */}
              <ImageUpload
                currentImages={Array.isArray(vendor.gallery) ? vendor.gallery as string[] : []}
                onImagesChange={(images) => updateVendorImagesMutation.mutate({ galleryImages: images })}
                maxImages={4}
                bucketName="vendor-galleries"
                label="Business Gallery"
              />
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>{vendor.whatsapp}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Management Section */}
        <VendorReviewManagement vendorId={vendor.id} />
      </div>
    </div>
    </PageTransition>
  );
};

export default VendorDashboard;
