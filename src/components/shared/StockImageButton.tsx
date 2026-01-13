import React, { useState } from 'react';
import { Image, ImagePlus, Sparkles } from 'lucide-react';
import StockImagePicker from './StockImagePicker';
import { StockResource } from '../../services/stockImageService';

interface StockImageButtonProps {
  onSelect: (resource: StockResource) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  icon?: 'image' | 'plus' | 'sparkles';
  className?: string;
  disabled?: boolean;
  moduleName?: string;
  allowedTypes?: Array<'photo' | 'vector' | 'psd' | 'icon' | 'video'>;
}

export function StockImageButton({
  onSelect,
  variant = 'secondary',
  size = 'md',
  label = 'Browse Stock',
  icon = 'image',
  className = '',
  disabled = false,
  moduleName = 'stock-button',
  allowedTypes
}: StockImageButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelect = (resource: StockResource) => {
    onSelect(resource);
    setIsPickerOpen(false);
  };

  const icons = {
    image: Image,
    plus: ImagePlus,
    sparkles: Sparkles
  };

  const IconComponent = icons[icon];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
    outline: 'bg-transparent text-gray-700 hover:bg-gray-50 border-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent'
  };

  return (
    <>
      <button
        onClick={() => setIsPickerOpen(true)}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg border
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      >
        <IconComponent className={iconSizes[size]} />
        {label}
      </button>

      <StockImagePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        moduleName={moduleName}
        allowedTypes={allowedTypes}
      />
    </>
  );
}

interface StockImageTriggerProps {
  onSelect: (resource: StockResource) => void;
  children: React.ReactNode;
  moduleName?: string;
  allowedTypes?: Array<'photo' | 'vector' | 'psd' | 'icon' | 'video'>;
  title?: string;
}

export function StockImageTrigger({
  onSelect,
  children,
  moduleName = 'stock-trigger',
  allowedTypes,
  title = 'Stock Image Library'
}: StockImageTriggerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsPickerOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <StockImagePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(resource) => {
          onSelect(resource);
          setIsPickerOpen(false);
        }}
        moduleName={moduleName}
        allowedTypes={allowedTypes}
        title={title}
      />
    </>
  );
}

interface StockImageInlineProps {
  onSelect: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
  moduleName?: string;
}

export function StockImageInline({
  onSelect,
  placeholder = 'Select from stock library...',
  className = '',
  moduleName = 'stock-inline'
}: StockImageInlineProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const handleSelect = (resource: StockResource) => {
    const url = resource.thumbnailUrl || resource.url;
    setSelectedUrl(url);
    onSelect(url);
    setIsPickerOpen(false);
  };

  return (
    <>
      <div
        onClick={() => setIsPickerOpen(true)}
        className={`
          flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg
          cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors
          ${className}
        `}
      >
        {selectedUrl ? (
          <img
            src={selectedUrl}
            alt="Selected"
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">
            {selectedUrl ? 'Change image' : placeholder}
          </p>
          <p className="text-xs text-gray-500">Click to browse stock images</p>
        </div>
        <ImagePlus className="w-5 h-5 text-gray-400" />
      </div>

      <StockImagePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        moduleName={moduleName}
      />
    </>
  );
}

export default StockImageButton;
