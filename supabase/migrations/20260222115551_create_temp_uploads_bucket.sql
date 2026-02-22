/*
  # Create temp-uploads storage bucket

  1. New Storage
    - `temp-uploads` bucket for temporary image uploads
    - Public access enabled so Freepik API can fetch images
  2. Notes
    - Used by Freepik edge functions to convert base64 images to public URLs
    - Files stored under freepik-tmp/ prefix
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('temp-uploads', 'temp-uploads', true)
ON CONFLICT (id) DO NOTHING;
