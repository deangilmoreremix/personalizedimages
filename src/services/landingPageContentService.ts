import { supabase } from '../utils/supabaseClient';

export interface LandingPageImage {
  id: string;
  section: string;
  slot: string;
  image_url: string;
  alt_text: string;
  title?: string;
  is_active: boolean;
  metadata: Record<string, any>;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentRevision {
  id: string;
  landing_page_image_id: string;
  previous_image_url: string;
  new_image_url: string;
  changed_by?: string;
  change_reason?: string;
  created_at: string;
}

const STORAGE_BUCKET = 'landing-page-images';

export async function getImageBySlot(section: string, slot: string): Promise<LandingPageImage | null> {
  try {
    const { data, error } = await supabase
      .from('landing_page_images')
      .select('*')
      .eq('section', section)
      .eq('slot', slot)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching image:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

export async function getAllImagesBySection(section: string): Promise<LandingPageImage[]> {
  try {
    const { data, error } = await supabase
      .from('landing_page_images')
      .select('*')
      .eq('section', section)
      .eq('is_active', true)
      .order('slot', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export async function uploadImageToStorage(file: File, section: string, slot: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${section}/${slot}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function updateLandingPageImage(
  section: string,
  slot: string,
  imageUrl: string,
  altText: string,
  title?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const existingImage = await getImageBySlot(section, slot);

    if (existingImage) {
      const { error } = await supabase
        .from('landing_page_images')
        .update({
          image_url: imageUrl,
          alt_text: altText,
          title,
          uploaded_by: user.id
        })
        .eq('id', existingImage.id);

      if (error) {
        console.error('Error updating image:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('landing_page_images')
        .insert({
          section,
          slot,
          image_url: imageUrl,
          alt_text: altText,
          title,
          is_active: true,
          uploaded_by: user.id,
          metadata: {}
        });

      if (error) {
        console.error('Error inserting image:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating landing page image:', error);
    return false;
  }
}

export async function deactivateImage(imageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('landing_page_images')
      .update({ is_active: false })
      .eq('id', imageId);

    if (error) {
      console.error('Error deactivating image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deactivating image:', error);
    return false;
  }
}

export async function getImageRevisions(imageId: string): Promise<ContentRevision[]> {
  try {
    const { data, error } = await supabase
      .from('content_revisions')
      .select('*')
      .eq('landing_page_image_id', imageId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching revisions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return [];
  }
}

export async function ensureStorageBucketExists(): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      });

      if (error) {
        console.error('Error creating storage bucket:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
}
