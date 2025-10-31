import React, { useRef, useState, useCallback, memo } from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { isValidImageUrl } from '../../utils/validation';

interface EmailCanvasProps {
  image: string | null;
  personalizationTokens: PersonalizationToken[];
  activeToken: string | null;
  imageHeight: number;
  previewSize: 'desktop' | 'mobile';
  onImageUpload: (files: File[]) => void;
  onTokenMouseDown: (e: React.MouseEvent, tokenId: string) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onSelectTemplate: (templateUrl: string) => void;
}

interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
}

const EmailCanvas: React.FC<EmailCanvasProps> = memo(({
  image,
  personalizationTokens,
  activeToken,
  imageHeight,
  previewSize,
  onImageUpload,
  onTokenMouseDown,
  onMouseMove,
  onMouseUp,
  onSelectTemplate
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sample template images
  const templateImages = [
    'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/6177645/pexels-photo-6177645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: onImageUpload
  });

  return (
    <div className="flex-1">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-gray-200"
        style={{
          height: `${imageHeight}px`,
          maxWidth: previewSize === 'mobile' ? '375px' : '100%',
          margin: previewSize === 'mobile' ? '0 auto' : undefined
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {image && (
          <img
            src={image}
            alt="Canvas"
            className="w-full h-full object-cover"
          />
        )}

        {personalizationTokens.map(token => (
          <div
            key={token.id}
            className={`absolute cursor-move ${activeToken === token.id ? 'ring-2 ring-primary-500' : ''}`}
            style={{
              left: `${token.x}%`,
              top: `${token.y}%`,
              transform: 'translate(-50%, -50%)',
              color: token.color,
              fontSize: `${token.fontSize}px`,
              fontFamily: token.fontFamily || 'Arial',
              opacity: token.opacity,
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              userSelect: 'none',
              zIndex: 10
            }}
            onMouseDown={(e) => onTokenMouseDown(e, token.id)}
          >
            {token.value}
          </div>
        ))}

        {/* Drop zone overlay when no image */}
        {!image && (
          <div
            {...getRootProps()}
            className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Drag & drop or click to add image</p>
            </div>
          </div>
        )}
      </div>

      {/* Image templates */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {templateImages.map((templateUrl, index) => (
          <div
            key={index}
            className={`relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 ${
              image === templateUrl ? 'border-primary-500' : 'border-gray-200'
            }`}
            onClick={() => onSelectTemplate(templateUrl)}
          >
            <img
              src={templateUrl}
              alt={`Template ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

EmailCanvas.displayName = 'EmailCanvas';

export default EmailCanvas;