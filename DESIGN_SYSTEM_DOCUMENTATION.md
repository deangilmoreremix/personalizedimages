# VideoRemix Design System Documentation

## Overview

This document outlines the comprehensive design system implemented for the VideoRemix application, ensuring consistent design patterns across all components.

## 🎨 Design System Architecture

### Core Principles

- **Consistency**: Unified visual language across all components
- **Maintainability**: Single source of truth for design tokens
- **Scalability**: Easy to extend and modify
- **Accessibility**: Built-in accessibility patterns
- **Performance**: Optimized CSS class reuse

## 📐 Spacing System

```typescript
spacing: {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
}
```

## 🎨 Color Palette

### Primary Colors

- **Primary**: Blue gradient (`primary-500` to `primary-700`)
- **Secondary**: Purple gradient (`secondary-500` to `secondary-700`)
- **Accent**: Orange (`accent-500` to `accent-700`)

### Semantic Colors

- **Success**: Green variants (`green-50`, `green-100`, etc.)
- **Error**: Red variants (`red-50`, `red-100`, etc.)
- **Warning**: Yellow variants (`yellow-50`, `yellow-100`, etc.)
- **Info**: Blue variants (`blue-50`, `blue-100`, etc.)

## 📝 Typography

### Headings
```typescript
typography: {
  h1: 'text-2xl md:text-3xl font-bold text-gray-900',
  h2: 'text-xl md:text-2xl font-bold text-gray-900',
  h3: 'text-lg md:text-xl font-bold text-gray-900',
  h4: 'text-base font-semibold text-gray-900',
  body: 'text-sm text-gray-700',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
}
```

## 🧩 Component Patterns

### Cards and Sections

```typescript
components: {
  card: 'bg-white rounded-xl shadow-md border border-gray-100',
  section: 'bg-white rounded-xl shadow-md p-6',
  panel: 'bg-gray-50 rounded-lg p-4',
}
```

### Form Elements

```typescript
input: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
textarea: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] resize-vertical',
select: 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
checkbox: 'rounded text-primary-600 focus:ring-primary-500',
```

### Buttons

```typescript
button: {
  primary: 'btn btn-primary w-full flex justify-center items-center',
  secondary: 'btn btn-outline w-full flex justify-center items-center',
  small: 'px-3 py-1.5 text-sm rounded-md',
  large: 'px-6 py-3 text-base rounded-lg',
}
```

### Alerts

```typescript
alert: {
  error: 'p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200',
  success: 'p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200',
  warning: 'p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200',
  info: 'p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200',
}
```

### Loading States

```typescript
loading: {
  spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
  skeleton: 'animate-pulse bg-gray-200 rounded',
  overlay: 'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10',
}
```

## 📐 Grid Systems

### Responsive Grids

```typescript
grid: {
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  sidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
}
```

### Utility Functions

```typescript
getGridClasses(columns: 1 | 2 | 3 | 4): string
getButtonClasses(variant: 'primary' | 'secondary', size?: 'default' | 'small' | 'large'): string
getAlertClasses(type: 'error' | 'success' | 'warning' | 'info'): string
```

## ♿ Accessibility

### Focus States

```typescript
accessibility: {
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  srOnly: 'sr-only',
  ariaLabel: 'aria-label',
  ariaDescribedBy: 'aria-describedby',
  role: 'role',
}
```

### Implementation Guidelines

- All interactive elements must include proper ARIA labels
- Focus states use consistent primary color theming
- Screen reader support with `sr-only` class
- Keyboard navigation support for all components

## 🏗️ Layout Patterns

### Common Layouts

```typescript
layout: {
  formGroup: 'space-y-2',
  buttonGroup: 'flex gap-3',
  actionBar: 'flex justify-between items-center',
  contentArea: 'space-y-4',
}
```

### Common Styles

```typescript
commonStyles = {
  sectionHeader: `${DESIGN_SYSTEM.typography.h2} mb-6`,
  formLabel: `${DESIGN_SYSTEM.typography.label} mb-2 block`,
  formGroup: DESIGN_SYSTEM.layout.formGroup,
  contentArea: DESIGN_SYSTEM.layout.contentArea,
  actionBar: DESIGN_SYSTEM.layout.actionBar,
  buttonGroup: DESIGN_SYSTEM.layout.buttonGroup,
}
```

## 📱 Responsive Design

### Breakpoints

```typescript
breakpoints: {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
}
```

### Container Patterns

```typescript
container: {
  padding: 'p-6',
  responsive: 'p-4 md:p-6',
}
```

## 🎭 Animation & Interaction

### Animation Variants

```typescript
animation: {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
}
```

### Shadows & Elevation

```typescript
shadows: {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}
```

### Border Radius

```typescript
radius: {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}
```

## 🔧 Implementation Guide

### Using the Design System

1. **Import the design system**:

```typescript
import { DESIGN_SYSTEM, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';
```

2. **Apply component styles**:

```typescript
<div className={DESIGN_SYSTEM.components.section}>
  <h3 className={commonStyles.sectionHeader}>Title</h3>
  <div className={getGridClasses(2)}>
    {/* Content */}
  </div>
</div>
```

3. **Use utility functions**:

```typescript
<button className={`${getButtonClasses('primary')} ${DESIGN_SYSTEM.accessibility.focus}`}>
  Click me
</button>
```

4. **Handle alerts and loading states**:

```typescript
{error && <div className={getAlertClasses('error')}>{error}</div>}

{loading && <div className={DESIGN_SYSTEM.components.loading.overlay}>
  <div className={DESIGN_SYSTEM.components.loading.spinner}></div>
</div>}
```

## 📋 Component Checklist

When creating new components, ensure they include:

- [ ] Consistent spacing using `DESIGN_SYSTEM.spacing`
- [ ] Proper color usage from `DESIGN_SYSTEM.colors`
- [ ] Typography from `DESIGN_SYSTEM.typography`
- [ ] Responsive grid layouts
- [ ] Accessibility features (ARIA labels, focus states)
- [ ] Loading and error states
- [ ] Consistent button and form styling
- [ ] Proper component structure (card/section/panel)

## 🔄 Migration Guide

### From Old Components to Design System

1. **Replace hardcoded classes** with design system equivalents
2. **Use utility functions** for dynamic styling
3. **Apply common styles** for consistent patterns
4. **Add accessibility attributes** where missing
5. **Test responsive behavior** across breakpoints

### Example Migration

**Before:**

```typescript
<div className="bg-white rounded-lg shadow-md p-4">
  <h3 className="text-lg font-bold mb-4">Title</h3>
  <button className="btn btn-primary">Submit</button>
</div>
```

**After:**

```typescript
<div className={DESIGN_SYSTEM.components.section}>
  <h3 className={commonStyles.sectionHeader}>Title</h3>
  <button className={getButtonClasses('primary')}>Submit</button>
</div>
```

## 📈 Benefits

- **Consistency**: Unified design language across the application
- **Maintainability**: Single source of truth for all design tokens
- **Scalability**: Easy to add new components and patterns
- **Performance**: Reduced CSS bundle size through class reuse
- **Developer Experience**: Predictable and fast styling
- **Accessibility**: Built-in accessibility patterns
- **Future-proof**: Easy to modify and extend

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*This design system ensures VideoRemix maintains a cohesive, accessible, and maintainable user interface across all components and features.*