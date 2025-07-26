-- Create storage buckets for vendor images
INSERT INTO storage.buckets (id, name, public) VALUES 
('vendor-profiles', 'vendor-profiles', true),
('vendor-galleries', 'vendor-galleries', true);

-- Create storage policies for vendor profile pictures
CREATE POLICY "Anyone can view vendor profile pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vendor-profiles');

CREATE POLICY "Vendors can upload their own profile pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vendor-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can update their own profile pictures" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'vendor-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can delete their own profile pictures" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'vendor-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for vendor gallery images
CREATE POLICY "Anyone can view vendor gallery images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vendor-galleries');

CREATE POLICY "Vendors can upload their own gallery images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vendor-galleries' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can update their own gallery images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'vendor-galleries' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can delete their own gallery images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'vendor-galleries' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);