/**
 * Canvas operations worker for offloading heavy image processing
 */

export interface CanvasWorkerMessage {
  type: 'generatePersonalizedImage';
  imageUrl: string;
  tokens: Record<string, string>;
  personalizationTokens: Array<{
    id: string;
    type: 'text' | 'image';
    value: string;
    x: number;
    y: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
    fontFamily?: string;
  }>;
}

export interface CanvasWorkerResponse {
  type: 'success' | 'error';
  imageUrl?: string;
  error?: string;
}

/**
 * Create a Web Worker for canvas operations
 */
export const createCanvasWorker = (): Worker => {
  const workerCode = `
    self.onmessage = async function(e) {
      const { type, imageUrl, tokens, personalizationTokens } = e.data;

      if (type === 'generatePersonalizedImage') {
        try {
          // Load the original image
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch image');
          }

          const imageBlob = await response.blob();

          // Create canvas and context
          const canvas = new OffscreenCanvas(800, 600);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          // Load image onto canvas
          const img = await createImageBitmap(imageBlob);
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Apply personalization tokens
          personalizationTokens.forEach(token => {
            if (token.type === 'text') {
              // Replace token with actual value if available
              let displayText = token.value;
              Object.entries(tokens).forEach(([key, value]) => {
                displayText = displayText.replace(new RegExp(\`\\\\[\${key}\\\\]\`, 'g'), value || \`[\${key}]\`);
              });

              // Set text styles
              ctx.font = \`\${token.fontSize || 24}px \${token.fontFamily || 'Arial'}\`;
              ctx.fillStyle = token.color || '#ffffff';
              ctx.globalAlpha = token.opacity || 1;
              ctx.textAlign = 'center';

              // Calculate position
              const x = (token.x / 100) * canvas.width;
              const y = (token.y / 100) * canvas.height;

              // Draw text with shadow for better visibility
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 2;
              ctx.strokeText(displayText, x, y);
              ctx.fillText(displayText, x, y);

              ctx.globalAlpha = 1;
            }
          });

          // Convert canvas to blob
          const resultBlob = await canvas.convertToBlob({ type: 'image/png', quality: 0.9 });
          const resultUrl = URL.createObjectURL(resultBlob);

          self.postMessage({
            type: 'success',
            imageUrl: resultUrl
          });
        } catch (error) {
          self.postMessage({
            type: 'error',
            error: error.message
          });
        }
      }
    };
  `;

  // Create blob URL for the worker
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);

  return new Worker(workerUrl);
};

/**
 * Generate personalized image using Web Worker
 */
export const generatePersonalizedImageWithWorker = (
  imageUrl: string,
  tokens: Record<string, string>,
  personalizationTokens: CanvasWorkerMessage['personalizationTokens']
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = createCanvasWorker();

    worker.onmessage = (e) => {
      const response: CanvasWorkerResponse = e.data;

      if (response.type === 'success' && response.imageUrl) {
        resolve(response.imageUrl);
      } else {
        reject(new Error(response.error || 'Worker operation failed'));
      }

      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(new Error('Canvas worker error: ' + error.message));
      worker.terminate();
    };

    const message: CanvasWorkerMessage = {
      type: 'generatePersonalizedImage',
      imageUrl,
      tokens,
      personalizationTokens
    };

    worker.postMessage(message);
  });
};