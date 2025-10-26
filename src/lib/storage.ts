import { supabase } from './supabase';

const STORAGE_BUCKET = 'gmb-media';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class StorageService {
  static async uploadImage(
    file: File,
    locationId: string,
    category: 'cover' | 'logo' | 'interior' | 'exterior' | 'team' | 'product' | 'other' = 'other'
  ): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${locationId}/${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type
    };
  }

  static async uploadVideo(
    file: File,
    locationId: string
  ): Promise<UploadResult> {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only MP4, MOV, and WebM videos are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${locationId}/videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type
    };
  }

  static async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  static async listFiles(locationId: string, folder?: string): Promise<string[]> {
    const path = folder ? `${locationId}/${folder}` : locationId;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data.map(file => file.name);
  }

  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  static async saveMediaToDatabase(
    locationId: string,
    uploadResult: UploadResult,
    metadata: {
      title?: string;
      description?: string;
      category?: string;
      width?: number;
      height?: number;
      duration?: number;
    }
  ): Promise<string> {
    const mediaType = uploadResult.type.startsWith('image/') ? 'photo' : 'video';

    const { data, error } = await supabase
      .from('gmb_media')
      .insert({
        location_id: locationId,
        media_type: mediaType,
        category: metadata.category || 'other',
        file_url: uploadResult.url,
        title: metadata.title,
        description: metadata.description,
        file_size: uploadResult.size,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save media: ${error.message}`);
    }

    return data.id;
  }
}
