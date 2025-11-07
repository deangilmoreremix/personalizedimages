// Design System for VideoRemix Components
// This file defines consistent design patterns, spacing, colors, and typography

export const DESIGN_SYSTEM = {
  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Container padding
  container: {
    padding: 'p-6',
    responsive: 'p-4 md:p-6',
  },

  // Grid systems
  grid: {
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    sidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  },

  // Typography
  typography: {
    h1: 'text-2xl md:text-3xl font-bold text-gray-900',
    h2: 'text-xl md:text-2xl font-bold text-gray-900',
    h3: 'text-lg md:text-xl font-bold text-gray-900',
    h4: 'text-base font-semibold text-gray-900',
    body: 'text-sm text-gray-700',
    caption: 'text-xs text-gray-500',
    label: 'text-sm font-medium text-gray-700',
  },

  // Colors
  colors: {
    primary: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
    },
    gray: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      900: 'bg-gray-900',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'text-green-500',
      600: 'text-green-600',
      700: 'text-green-700',
    },
    error: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'text-red-500',
      600: 'text-red-600',
      700: 'text-red-700',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'text-yellow-500',
      600: 'text-yellow-600',
      700: 'text-yellow-700',
    },
    info: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'text-blue-500',
      600: 'text-blue-600',
      700: 'text-blue-700',
    },
  },

  // Component styles
  components: {
    card: 'bg-white rounded-xl shadow-md border border-gray-100',
    section: 'bg-white rounded-xl shadow-md p-6',
    panel: 'bg-gray-50 rounded-lg p-4',
    input: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    textarea: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] resize-vertical',
    select: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    checkbox: 'rounded text-primary-600 focus:ring-primary-500',
    button: {
      primary: 'btn btn-primary w-full flex justify-center items-center',
      secondary: 'btn btn-outline w-full flex justify-center items-center',
      small: 'px-3 py-1.5 text-sm rounded-md',
      large: 'px-6 py-3 text-base rounded-lg',
    },
    badge: 'px-2 py-1 text-xs rounded-full font-medium',
    alert: {
      error: 'p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200',
      success: 'p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200',
      warning: 'p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200',
      info: 'p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200',
    },
    loading: {
      spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
      skeleton: 'animate-pulse bg-gray-200 rounded',
      overlay: 'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10',
    },
  },

  // Layout patterns
  layout: {
    formGroup: 'space-y-2',
    buttonGroup: 'flex gap-3',
    actionBar: 'flex justify-between items-center',
    contentArea: 'space-y-4',
  },

  // Accessibility
  accessibility: {
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    srOnly: 'sr-only',
    ariaLabel: 'aria-label',
    ariaDescribedBy: 'aria-describedby',
    role: 'role',
  },

  // Animation
  animation: {
    fadeIn: 'animate-in fade-in duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
  },

  // Responsive breakpoints
  breakpoints: {
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },

  // Border radius
  radius: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
};

// Utility functions for consistent styling
export const getGridClasses = (columns: 1 | 2 | 3 | 4 = 2) => {
  switch (columns) {
    case 1: return 'grid grid-cols-1 gap-6';
    case 2: return DESIGN_SYSTEM.grid.twoColumn;
    case 3: return DESIGN_SYSTEM.grid.threeColumn;
    case 4: return DESIGN_SYSTEM.grid.fourColumn;
    default: return DESIGN_SYSTEM.grid.twoColumn;
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary', size: 'default' | 'small' | 'large' = 'default') => {
  const baseClasses = DESIGN_SYSTEM.components.button[variant];
  const sizeClasses = size === 'small' ? DESIGN_SYSTEM.components.button.small :
                     size === 'large' ? DESIGN_SYSTEM.components.button.large : '';

  return `${baseClasses} ${sizeClasses}`.trim();
};

export const getAlertClasses = (type: 'error' | 'success' | 'warning' | 'info') => {
  return DESIGN_SYSTEM.components.alert[type];
};

export const getColorClasses = (color: keyof typeof DESIGN_SYSTEM.colors, shade: string) => {
  const colorObj = DESIGN_SYSTEM.colors[color];
  return (colorObj as any)[shade] || '';
};

// Common component patterns
export const commonStyles = {
  sectionHeader: `${DESIGN_SYSTEM.typography.h2} mb-6`,
  formLabel: `${DESIGN_SYSTEM.typography.label} mb-2 block`,
  formGroup: DESIGN_SYSTEM.layout.formGroup,
  contentArea: DESIGN_SYSTEM.layout.contentArea,
  actionBar: DESIGN_SYSTEM.layout.actionBar,
  buttonGroup: DESIGN_SYSTEM.layout.buttonGroup,
};