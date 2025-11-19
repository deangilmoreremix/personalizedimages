import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import {
  Type,
  Palette,
  Filter,
  Sparkles,
  Image as ImageIcon,
  Hash,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Heart,
  Zap,
  Crown
} from 'lucide-react';

export interface TokenData {
  id: string;
  key: string;
  value: string;
  displayName: string;
  category: 'user' | 'brand' | 'dynamic' | 'style' | 'filter' | 'text';
  type: 'text' | 'color' | 'image' | 'style' | 'filter';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
  preview?: string;
}

interface DraggableTokenProps {
  token: TokenData;
  onTokenSelect?: (token: TokenData) => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DraggableToken: React.FC<DraggableTokenProps> = ({
  token,
  onTokenSelect,
  isSelected = false,
  size = 'md'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'token',
    item: { token },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const Icon = token.icon;

  return (
    <div
      ref={drag}
      className={`
        relative group cursor-move transition-all duration-200 rounded-lg border-2 overflow-hidden
        ${sizeClasses[size]}
        ${isSelected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600'
        }
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isHovered ? 'shadow-md' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onTokenSelect?.(token)}
      title={`${token.displayName}: ${token.value}`}
    >
      {/* Background gradient based on category */}
      <div className={`absolute inset-0 opacity-10 ${token.color}`} />

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'} text-gray-700 dark:text-gray-300`} />
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Hover tooltip */}
      {isHovered && !isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
          {token.displayName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Predefined token templates
export const createTokenTemplates = (userData: Record<string, string> = {}): TokenData[] => [
  // User Information Tokens
  {
    id: 'user-name',
    key: 'FIRSTNAME',
    value: userData.FIRSTNAME || 'John',
    displayName: 'First Name',
    category: 'user',
    type: 'text',
    icon: User,
    color: 'bg-blue-500',
    description: 'User first name'
  },
  {
    id: 'user-lastname',
    key: 'LASTNAME',
    value: userData.LASTNAME || 'Doe',
    displayName: 'Last Name',
    category: 'user',
    type: 'text',
    icon: User,
    color: 'bg-blue-600',
    description: 'User last name'
  },
  {
    id: 'user-email',
    key: 'EMAIL',
    value: userData.EMAIL || 'john@example.com',
    displayName: 'Email',
    category: 'user',
    type: 'text',
    icon: Mail,
    color: 'bg-green-500',
    description: 'User email address'
  },
  {
    id: 'user-phone',
    key: 'PHONE',
    value: userData.PHONE || '+1-555-0123',
    displayName: 'Phone',
    category: 'user',
    type: 'text',
    icon: Phone,
    color: 'bg-green-600',
    description: 'User phone number'
  },

  // Brand Tokens
  {
    id: 'brand-name',
    key: 'COMPANY',
    value: userData.COMPANY || 'Acme Corp',
    displayName: 'Company',
    category: 'brand',
    type: 'text',
    icon: Building,
    color: 'bg-purple-500',
    description: 'Company/brand name'
  },
  {
    id: 'brand-color',
    key: 'BRAND_COLOR',
    value: userData.BRAND_COLOR || '#3B82F6',
    displayName: 'Brand Color',
    category: 'brand',
    type: 'color',
    icon: Palette,
    color: 'bg-purple-600',
    description: 'Brand primary color'
  },
  {
    id: 'brand-tagline',
    key: 'TAGLINE',
    value: userData.TAGLINE || 'Innovation at its best',
    displayName: 'Tagline',
    category: 'brand',
    type: 'text',
    icon: Star,
    color: 'bg-purple-700',
    description: 'Brand tagline or slogan'
  },

  // Dynamic Tokens
  {
    id: 'current-date',
    key: 'CURRENT_DATE',
    value: new Date().toLocaleDateString(),
    displayName: 'Current Date',
    category: 'dynamic',
    type: 'text',
    icon: Calendar,
    color: 'bg-orange-500',
    description: 'Current date (updates automatically)'
  },
  {
    id: 'current-year',
    key: 'CURRENT_YEAR',
    value: new Date().getFullYear().toString(),
    displayName: 'Current Year',
    category: 'dynamic',
    type: 'text',
    icon: Calendar,
    color: 'bg-orange-600',
    description: 'Current year'
  },

  // Style Tokens
  {
    id: 'style-vintage',
    key: 'STYLE_VINTAGE',
    value: 'vintage retro style',
    displayName: 'Vintage Style',
    category: 'style',
    type: 'style',
    icon: Sparkles,
    color: 'bg-pink-500',
    description: 'Apply vintage aesthetic'
  },
  {
    id: 'style-modern',
    key: 'STYLE_MODERN',
    value: 'modern minimalist style',
    displayName: 'Modern Style',
    category: 'style',
    type: 'style',
    icon: Zap,
    color: 'bg-pink-600',
    description: 'Apply modern aesthetic'
  },
  {
    id: 'style-luxury',
    key: 'STYLE_LUXURY',
    value: 'luxury premium style',
    displayName: 'Luxury Style',
    category: 'style',
    type: 'style',
    icon: Crown,
    color: 'bg-yellow-500',
    description: 'Apply luxury aesthetic'
  },

  // Filter Tokens
  {
    id: 'filter-warm',
    key: 'FILTER_WARM',
    value: 'warm color filter',
    displayName: 'Warm Filter',
    category: 'filter',
    type: 'filter',
    icon: Filter,
    color: 'bg-red-500',
    description: 'Apply warm color filter'
  },
  {
    id: 'filter-cool',
    key: 'FILTER_COOL',
    value: 'cool color filter',
    displayName: 'Cool Filter',
    category: 'filter',
    type: 'filter',
    icon: Filter,
    color: 'bg-blue-500',
    description: 'Apply cool color filter'
  },
  {
    id: 'filter-vintage',
    key: 'FILTER_VINTAGE',
    value: 'vintage film filter',
    displayName: 'Vintage Filter',
    category: 'filter',
    type: 'filter',
    icon: Filter,
    color: 'bg-amber-500',
    description: 'Apply vintage film filter'
  },

  // Text Overlay Tokens
  {
    id: 'text-welcome',
    key: 'TEXT_WELCOME',
    value: 'Welcome to our world',
    displayName: 'Welcome Text',
    category: 'text',
    type: 'text',
    icon: Type,
    color: 'bg-indigo-500',
    description: 'Welcome message overlay'
  },
  {
    id: 'text-limited',
    key: 'TEXT_LIMITED',
    value: 'Limited Time Offer',
    displayName: 'Limited Offer',
    category: 'text',
    type: 'text',
    icon: Type,
    color: 'bg-red-600',
    description: 'Limited time offer text'
  }
];

export default DraggableToken;