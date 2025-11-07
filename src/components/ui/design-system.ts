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

  // Grid systems - Extended with creative app patterns
  grid: {
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    sidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
    // Creative app patterns (Canva/Figma/Adobe)
    creativeWorkflow: 'grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-screen',
    toolPanel: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3',
    canvasLayout: 'grid grid-cols-1 xl:grid-cols-5 gap-6',
    editorGrid: 'grid grid-cols-1 lg:grid-cols-12 gap-4',
    // Material Design responsive grids
    materialResponsive: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4',
    // Chakra UI fluid grids
    chakraFluid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    // Ant Design admin layouts
    antAdmin: 'grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6',
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

  // Component styles - Extended with Material Design, Chakra UI, Ant Design, and Radix UI patterns
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
      // Material Design variants
      elevated: 'bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all',
      filled: 'bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all',
      outlined: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg px-4 py-2 transition-all',
      text: 'text-primary-600 hover:bg-primary-50 rounded-lg px-4 py-2 transition-all',
      // Chakra UI variants
      ghost: 'text-primary-600 hover:bg-primary-50 rounded-lg px-4 py-2 transition-all',
      link: 'text-primary-600 hover:underline rounded-lg px-4 py-2 transition-all',
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
      // Ant Design patterns
      skeletonBlock: 'animate-pulse bg-gray-200 rounded h-4 w-full mb-2',
      skeletonCircle: 'animate-pulse bg-gray-200 rounded-full h-8 w-8',
      skeletonText: 'animate-pulse bg-gray-200 rounded h-4 w-3/4',
    },
    // Material Design elevation system
    elevation: {
      0: 'shadow-none',
      1: 'shadow-sm',
      2: 'shadow',
      3: 'shadow-md',
      4: 'shadow-lg',
      5: 'shadow-xl',
      6: 'shadow-2xl',
    },
    // Chakra UI modal patterns
    modal: {
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
      content: 'bg-white rounded-xl shadow-xl max-w-md mx-auto mt-20 p-6',
      header: 'border-b border-gray-200 pb-4 mb-4',
      body: 'mb-6',
      footer: 'flex justify-end gap-3 pt-4 border-t border-gray-200',
    },
    // Ant Design drawer/sidebar patterns
    drawer: {
      overlay: 'fixed inset-0 bg-black/20 backdrop-blur-sm z-30',
      content: 'fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform',
      header: 'p-4 border-b border-gray-200 flex justify-between items-center',
      body: 'p-4 overflow-y-auto flex-1',
    },
    // Radix UI primitive patterns
    primitive: {
      dialog: 'fixed inset-0 z-50 flex items-center justify-center',
      dialogContent: 'bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6',
      popover: 'bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50',
      tooltip: 'bg-gray-900 text-white text-sm rounded px-2 py-1 z-50',
      collapsible: 'overflow-hidden transition-all duration-300',
      accordion: 'border border-gray-200 rounded-lg overflow-hidden',
      accordionItem: 'border-b border-gray-200 last:border-b-0',
      accordionTrigger: 'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex justify-between items-center',
      accordionContent: 'px-4 pb-3 text-sm text-gray-600',
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

  // Animation - Extended with creative app micro-interactions
  animation: {
    fadeIn: 'animate-in fade-in duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
    // Material Design micro-interactions
    ripple: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:scale-0 before:rounded-full before:transition-transform hover:before:scale-150',
    stateLayer: 'relative before:absolute before:inset-0 before:bg-black/4 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
    // Chakra UI transitions
    smooth: 'transition-all duration-200 ease-in-out',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    // Ant Design loading animations
    spin: 'animate-spin',
    ping: 'animate-ping',
    // Creative app patterns (Canva/Figma style)
    dragFeedback: 'transition-transform duration-150 ease-out hover:scale-105 active:scale-95',
    panelSlide: 'transform transition-transform duration-300 ease-in-out',
    toolHover: 'hover:bg-primary-50 transition-colors duration-150',
    canvasZoom: 'transition-transform duration-200 ease-out',
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

// Utility functions for consistent styling - Extended with new patterns
export const getGridClasses = (columns: 1 | 2 | 3 | 4 | 'creative' | 'material' | 'chakra' | 'ant' = 2) => {
  switch (columns) {
    case 1: return 'grid grid-cols-1 gap-6';
    case 2: return DESIGN_SYSTEM.grid.twoColumn;
    case 3: return DESIGN_SYSTEM.grid.threeColumn;
    case 4: return DESIGN_SYSTEM.grid.fourColumn;
    case 'creative': return DESIGN_SYSTEM.grid.creativeWorkflow;
    case 'material': return DESIGN_SYSTEM.grid.materialResponsive;
    case 'chakra': return DESIGN_SYSTEM.grid.chakraFluid;
    case 'ant': return DESIGN_SYSTEM.grid.antAdmin;
    default: return DESIGN_SYSTEM.grid.twoColumn;
  }
};

export const getButtonClasses = (
  variant: 'primary' | 'secondary' | 'elevated' | 'filled' | 'outlined' | 'text' | 'ghost' | 'link' = 'primary',
  size: 'default' | 'small' | 'large' = 'default'
) => {
  const baseClasses = DESIGN_SYSTEM.components.button[variant] || DESIGN_SYSTEM.components.button.primary;
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

export const getElevationClasses = (level: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1) => {
  return DESIGN_SYSTEM.components.elevation[level];
};

export const getModalClasses = (variant: 'default' | 'chakra' | 'radix' = 'default') => {
  switch (variant) {
    case 'chakra': return DESIGN_SYSTEM.components.modal;
    case 'radix': return DESIGN_SYSTEM.components.primitive;
    default: return DESIGN_SYSTEM.components.modal;
  }
};

export const getDrawerClasses = (variant: 'ant' | 'material' = 'ant') => {
  return DESIGN_SYSTEM.components.drawer;
};

export const getAnimationClasses = (type: keyof typeof DESIGN_SYSTEM.animation) => {
  return DESIGN_SYSTEM.animation[type];
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