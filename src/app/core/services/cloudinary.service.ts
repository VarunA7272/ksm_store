import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = (environment as any).cloudinary?.cloudName || 'ksm-grocery';
  private uploadPreset = (environment as any).cloudinary?.uploadPreset || 'ksm_unsigned';

  /**
   * Uploads a file directly to Cloudinary and returns the secure HTTPS URL
   */
  async uploadImage(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.warn('Cloudinary API upload fallback to base64 reader:', error);
      // Fallback if preset is not configured yet
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Formats any image URL or Cloudinary URL with auto-optimization (f_auto, q_auto)
   */
  getOptimizedUrl(originalUrl: string, width = 800, height = 800): string {
    if (!originalUrl) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

    if (originalUrl.includes('res.cloudinary.com')) {
      // Inject transformation params into Cloudinary URL
      return originalUrl.replace('/upload/', `/upload/c_fill,w_${width},h_${height},f_auto,q_auto/`);
    }

    return originalUrl;
  }
}
