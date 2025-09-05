/**
 * Utility functions for storing and retrieving reference images
 */

// Maximum number of reference images to store per category
const MAX_STORED_IMAGES = 10;

export interface StoredImage {
  id: string;
  imageUrl: string;
  thumbnail?: string;
  name?: string;
  createdAt: number;
  category: string;
  metadata?: Record<string, any>;
}

/**
 * Get all stored reference images for a specific category
 */
export function getStoredReferenceImages(category: string = 'general'): StoredImage[] {
  try {
    const storedImagesJson = localStorage.getItem(`referenceImages-${category}`);
    if (!storedImagesJson) return [];
    
    const storedImages = JSON.parse(storedImagesJson) as StoredImage[];
    return storedImages.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error retrieving stored reference images:', error);
    return [];
  }
}

/**
 * Store a reference image for future use
 */
export function storeReferenceImage(imageUrl: string, category: string = 'general', metadata: Record<string, any> = {}): StoredImage {
  try {
    const storedImages = getStoredReferenceImages(category);
    
    // Check if the image URL already exists
    const existingImageIndex = storedImages.findIndex(img => img.imageUrl === imageUrl);
    
    // If image exists, update its timestamp and move to top
    if (existingImageIndex >= 0) {
      const updatedImage = {
        ...storedImages[existingImageIndex],
        createdAt: Date.now(),
        metadata: { ...storedImages[existingImageIndex].metadata, ...metadata }
      };
      
      storedImages.splice(existingImageIndex, 1);
      storedImages.unshift(updatedImage);
      
      localStorage.setItem(`referenceImages-${category}`, JSON.stringify(storedImages));
      return updatedImage;
    }
    
    // Create new image entry
    const newImage: StoredImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      createdAt: Date.now(),
      category,
      metadata
    };
    
    // Add to the start of the array and limit to MAX_STORED_IMAGES
    const updatedImages = [newImage, ...storedImages].slice(0, MAX_STORED_IMAGES);
    
    localStorage.setItem(`referenceImages-${category}`, JSON.stringify(updatedImages));
    return newImage;
  } catch (error) {
    console.error('Error storing reference image:', error);
    // Return a basic entry in case of error
    return {
      id: `img_${Date.now()}`,
      imageUrl,
      createdAt: Date.now(),
      category
    };
  }
}

/**
 * Remove a stored reference image
 */
export function removeStoredReferenceImage(imageId: string, category: string = 'general'): boolean {
  try {
    const storedImages = getStoredReferenceImages(category);
    const filteredImages = storedImages.filter(img => img.id !== imageId);
    
    if (filteredImages.length === storedImages.length) {
      return false; // Nothing was removed
    }
    
    localStorage.setItem(`referenceImages-${category}`, JSON.stringify(filteredImages));
    return true;
  } catch (error) {
    console.error('Error removing stored reference image:', error);
    return false;
  }
}

/**
 * Clear all stored reference images for a category
 */
function clearStoredReferenceImages(category: string = 'general'): void {
  try {
    localStorage.removeItem(`referenceImages-${category}`);
  } catch (error) {
    console.error('Error clearing stored reference images:', error);
  }
}

/**
 * Get all reference image categories
 */
function getReferenceImageCategories(): string[] {
  try {
    const categories: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('referenceImages-')) {
        categories.push(key.replace('referenceImages-', ''));
      }
    }
    return categories;
  } catch (error) {
    console.error('Error getting reference image categories:', error);
    return ['general'];
  }
}

/**
 * Create a thumbnail version of an image URL (data URL)
 */
export async function createImageThumbnail(imageUrl: string, maxWidth: number = 100, maxHeight: number = 100): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        // Calculate thumbnail dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw image to canvas with new dimensions
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get data URL
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => {
        console.error('Error creating thumbnail from image');
        resolve(null);
      };
      
      // Handle CORS issues by using a crossorigin attribute
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      
      // Set a timeout in case the image takes too long to load
      setTimeout(() => {
        if (!img.complete) {
          console.warn('Image loading timeout, returning null thumbnail');
          resolve(null);
        }
      }, 5000);
    } catch (error) {
      console.error('Error in createImageThumbnail:', error);
      resolve(null);
    }
  });
}