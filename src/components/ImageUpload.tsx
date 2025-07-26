import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploadProps {
  currentImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucketName: string;
  label: string;
  isProfilePicture?: boolean;
}

export const ImageUpload = ({ 
  currentImages = [], 
  onImagesChange, 
  maxImages = 4, 
  bucketName,
  label,
  isProfilePicture = false
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    const remainingSlots = maxImages - currentImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Upload limit reached",
        description: `You can only upload ${maxImages} image${maxImages > 1 ? 's' : ''}.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        newImageUrls.push(publicUrl);
      }

      const updatedImages = isProfilePicture ? newImageUrls : [...currentImages, ...newImageUrls];
      onImagesChange(updatedImages);

      toast({
        title: "Upload successful",
        description: `${newImageUrls.length} image${newImageUrls.length > 1 ? 's' : ''} uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract the file path from the URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Storage deletion error:', error);
        // Continue with UI update even if storage deletion fails
      }

      // Update the images array
      const updatedImages = currentImages.filter((_, i) => i !== index);
      onImagesChange(updatedImages);

      toast({
        title: "Image removed",
        description: "Image has been removed successfully.",
      });
    } catch (error) {
      console.error('Remove image error:', error);
      toast({
        title: "Removal failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {!isProfilePicture && (
          <span className="text-xs text-muted-foreground">
            {currentImages.length}/{maxImages} images
          </span>
        )}
      </div>

      {/* Current Images Display */}
      {currentImages.length > 0 && (
        <div className={`grid gap-4 ${isProfilePicture ? 'grid-cols-1 max-w-xs' : 'grid-cols-2 md:grid-cols-4'}`}>
          {currentImages.map((imageUrl, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <img
                src={imageUrl}
                alt={`${label} ${index + 1}`}
                className={`w-full object-cover ${isProfilePicture ? 'aspect-square' : 'aspect-video'}`}
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(imageUrl, index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(isProfilePicture || currentImages.length < maxImages) && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={!isProfilePicture && maxImages > 1}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-dashed border-2 hover:bg-muted/50"
          >
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  {isProfilePicture ? <Camera className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                  <span>
                    {isProfilePicture 
                      ? currentImages.length > 0 ? 'Change Profile Picture' : 'Upload Profile Picture'
                      : `Upload Image${maxImages > 1 ? 's' : ''}`
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isProfilePicture ? 'JPG, PNG up to 10MB' : `Up to ${maxImages} images, JPG/PNG`}
                  </span>
                </>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};