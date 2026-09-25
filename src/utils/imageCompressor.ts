/**
 * Client-side image compression utility.
 * Automatically resizes large camera/phone uploads to optimal web size (< 300KB)
 * without requiring Photoshop.
 */
export async function compressAndReadFile(file: File, maxWidth = 1200, maxHeight = 1500): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (JPEG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG at 85% quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Unable to read the image file. Please try another photo.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error reading the selected file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Built-in 4:5 Aspect Ratio Cropper
 * Crops or frames image to exact standard 4:5 portrait ratio (e.g., 1000 x 1250 px)
 */
export async function cropToFourFiveRatio(
  dataUrl: string,
  zoom = 1,
  offsetY = 0
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetWidth = 1000;
      const targetHeight = 1250; // 4:5 ratio (1000 / 1250 = 4 / 5)

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Compute covering crop dimensions
      const imgAspect = img.width / img.height;
      const targetAspect = 4 / 5;

      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      if (imgAspect > targetAspect) {
        // Image is wider than 4:5
        drawH = targetHeight * zoom;
        drawW = drawH * imgAspect;
        drawX = (targetWidth - drawW) / 2;
        drawY = ((targetHeight - drawH) / 2) + offsetY;
      } else {
        // Image is taller or equal to 4:5
        drawW = targetWidth * zoom;
        drawH = drawW / imgAspect;
        drawX = (targetWidth - drawW) / 2;
        drawY = ((targetHeight - drawH) / 2) + offsetY;
      }

      // Draw neutral background if zoom < 1
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });
}

/**
 * Generate a friendly URL slug from title
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
