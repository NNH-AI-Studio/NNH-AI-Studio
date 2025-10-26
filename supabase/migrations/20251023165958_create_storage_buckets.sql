/*
  # Create Storage Buckets for Media Files

  ## Overview
  This migration creates storage buckets for handling image uploads for posts, profile pictures, and other media files.

  ## New Storage Buckets

  ### 1. post-images
  - Public bucket for GMB post images
  - Users can upload their own post images
  - Images are publicly accessible via URL
  - File size limit: 5MB
  - Allowed file types: image/jpeg, image/png, image/webp, image/gif

  ### 2. avatars
  - Public bucket for user profile pictures
  - Users can upload and update their own avatars
  - Images are publicly accessible via URL
  - File size limit: 2MB
  - Allowed file types: image/jpeg, image/png, image/webp

  ## Security
  - Users can only upload to their own folders (user_id based)
  - Users can only delete their own files
  - Public read access for all uploaded images
  - RLS policies ensure proper access control

  ## Important Notes
  - Files are organized by user_id to prevent naming conflicts
  - Automatic cleanup can be added later for deleted posts
  - CDN caching enabled for better performance
*/

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-images bucket
CREATE POLICY "Users can upload post images to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own post images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload avatar to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');