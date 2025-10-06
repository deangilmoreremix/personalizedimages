# Features with Image Generation

## Components that Generate Images

### 1. **AIImageGenerator** (`/src/components/AIImageGenerator.tsx`)
- Primary AI image generation component
- Supports multiple providers: OpenAI DALL-E, Gemini, Imagen, Gemini 2 Flash
- Token-based personalization
- Advanced options: aspect ratio, style, quality
- **Needs Editor:** Yes - for post-generation editing

### 2. **ActionFigureGenerator** (`/src/components/ActionFigureGenerator.tsx`)
- Generates action figure images
- Multiple templates and styles
- Reference image support
- **Needs Editor:** Yes - for customization and effects

### 3. **RetroActionFigureGenerator** (`/src/components/RetroActionFigureGenerator.tsx`)
- Retro-style action figures
- 80s/90s themed designs
- **Needs Editor:** Yes - for vintage effects

### 4. **MusicStarActionFigureGenerator** (`/src/components/MusicStarActionFigureGenerator.tsx`)
- Music-themed action figures
- Various music genres
- **Needs Editor:** Yes - for styling and effects

### 5. **TVShowActionFigureGenerator** (`/src/components/TVShowActionFigureGenerator.tsx`)
- TV show character figures
- Multiple show themes
- **Needs Editor:** Yes - for character customization

### 6. **WrestlingActionFigureGenerator** (`/src/components/WrestlingActionFigureGenerator.tsx`)
- Wrestling-themed figures
- Championship belts and accessories
- **Needs Editor:** Yes - for pose and effects

### 7. **EnhancedActionFigureGenerator** (`/src/components/EnhancedActionFigureGenerator.tsx`)
- Enhanced version with more features
- Advanced customization
- **Needs Editor:** Yes - for detailed editing

### 8. **GhibliImageGenerator** (`/src/components/GhibliImageGenerator.tsx`)
- Studio Ghibli style images
- Magical, whimsical aesthetic
- **Needs Editor:** Yes - for style refinement

### 9. **CartoonImageGenerator** (`/src/components/CartoonImageGenerator.tsx`)
- Cartoon-style transformations
- Multiple cartoon styles
- **Needs Editor:** Yes - for style adjustments

### 10. **MemeGenerator** (`/src/components/MemeGenerator.tsx`)
- Meme creation with text
- Template-based
- **Needs Editor:** Yes - for text and effects

### 11. **EmailImageEditor** (`/src/components/EmailImageEditor.tsx`)
- Email template image creation
- Personalization tokens
- **Needs Editor:** Already has editing, needs Gemini Nano option

### 12. **ImageEditor** (`/src/components/ImageEditor.tsx`)
- General purpose image editor
- Token placement
- **Needs Editor:** Already has editing, needs Gemini Nano option

### 13. **GeminiNanoPersonalizationEditor** (`/src/components/GeminiNanoPersonalizationEditor.tsx`)
- New Gemini Nano powered editor
- Advanced AI editing capabilities
- **Needs Editor:** This IS the editor

## Editor Enhancement Requirements

### Features Needed in All Generators:
1. **Editor Selection Toggle**
   - Switch between Classic Editor and Gemini Nano Editor
   - Preserve current image when switching
   - Remember user preference

2. **Gemini Nano Editor Capabilities**
   - Enhance quality
   - Colorize
   - Stylize
   - Custom edits
   - Background removal/blur
   - Restore/improve

3. **Classic Editor Capabilities**
   - Manual token placement
   - Color adjustments
   - Filters
   - Cropping
   - Download

4. **Shared Features**
   - Undo/Redo
   - Download
   - Save to gallery
   - Share functionality

## Implementation Strategy

1. Create `EnhancedImageEditorWithChoice.tsx` - Wrapper component
2. Add editor selection UI (tabs or toggle)
3. Integrate both editors side-by-side
4. Share state between editors
5. Add to all image generation components
6. Update all feature pages

## Priority Order

1. **High Priority** (Most Used)
   - AIImageGenerator
   - ActionFigureGenerator
   - GhibliImageGenerator
   - CartoonImageGenerator

2. **Medium Priority**
   - All specialized action figure generators
   - MemeGenerator

3. **Low Priority** (Already have editors)
   - EmailImageEditor
   - ImageEditor (enhance existing)
