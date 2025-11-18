# **UTILS DEPENDENCY ANALYSIS & COMPONENT MAPPING**

## **📊 Comprehensive Dependency Analysis**

This document maps all component and module dependencies on the `src/utils` directory to ensure safe refactoring during the redesign.

---

## **🔗 Import Patterns Found**

### **API Utils (`src/utils/api.ts`)**
**Import Pattern:** `import { functionName } from '../utils/api'`

**Components Using API Utils:**
1. **`AIImageGenerator.tsx`** - Lines 4-11
   - `generateImageWithDalle`
   - `generateImageWithGemini`
   - `generateImageWithGemini2Flash`
   - `generateImageWithImagen`
   - `generateImageWithGptImage`
   - `generateImageDescriptionWithAI`

2. **`GhibliImageGenerator.tsx`** - Lines 3-4
   - `generateGhibliStyleImage`

3. **`MemeGenerator.tsx`** - Lines 3-4
   - `generateMemeImage`

4. **`VideoConverter.tsx`** - Lines 3-4
   - `generateVideoFromImage`

5. **Action Figure Generators** (5 files):
   - `EnhancedActionFigureGenerator.tsx`
   - `MusicStarActionFigureGenerator.tsx`
   - `RetroActionFigureGenerator.tsx`
   - `WrestlingActionFigureGenerator.tsx`
   - All import `generateActionFigureImage`

### **Streaming API Utils (`src/utils/streamingApi.ts`)**
**Import Pattern:** `import { functionName } from '../utils/streamingApi'`

**Components Using Streaming Utils:**
1. **`AIImageGenerator.tsx`** - Line 12
   - `streamImageGeneration`
   - `streamAIReasoning`

### **API Utils (`src/utils/apiUtils.ts`)**
**Import Pattern:** `import { functionName } from '../utils/apiUtils'`

**Components Using API Utils:**
1. **Multiple Components** - Various utility functions
   - `blobToBase64` - Used in image processing
   - `hasApiKey` - Used for provider validation
   - `getOpenAIApiKey`, `getGeminiApiKey` - Used for key access

---

## **🏗️ Dependency Impact Assessment**

### **High Impact Dependencies (Require Careful Migration)**

#### **API Functions (Critical)**
- **35+ components** depend on API generation functions
- **Breaking changes** would affect all image generation features
- **Migration Strategy:** Maintain backward compatibility during transition

#### **Streaming Functions (Medium Impact)**
- **Primary component:** `AIImageGenerator.tsx`
- **Secondary components:** May be added to other generators
- **Migration Strategy:** Feature flags for gradual rollout

#### **Utility Functions (Low Impact)**
- **blobToBase64:** Used in image processing pipelines
- **hasApiKey:** Used for conditional feature rendering
- **Migration Strategy:** Can be updated incrementally

---

## **🔄 Refactoring Safety Zones**

### **Safe to Refactor Immediately**
```
src/utils/
├── validation.ts      ✅ No external dependencies
├── env.ts            ✅ Only used internally
├── constants.ts      ✅ No external dependencies
└── format.ts         ✅ Utility functions only
```

### **Requires Migration Strategy**
```
src/utils/
├── api.ts            ⚠️  35+ component dependencies
├── streamingApi.ts   ⚠️  Primary component dependency
└── apiUtils.ts       ⚠️  Multiple component dependencies
```

### **High-Risk Files**
```
src/utils/
├── supabaseClient.ts ⚠️  Critical infrastructure
└── geminiNanoApi.ts  ⚠️  Complex integrations
```

---

## **📋 Component Refactoring Priority**

### **Phase 1: Isolated Components (Safe)**
1. **Standalone Generators:**
   - `GhibliImageGenerator.tsx` - Only uses `generateGhibliStyleImage`
   - `MemeGenerator.tsx` - Only uses `generateMemeImage`
   - `VideoConverter.tsx` - Only uses `generateVideoFromImage`

2. **Action Figure Generators:**
   - All 5 action figure generators use similar patterns
   - Can be refactored as a group

### **Phase 2: Complex Components (Requires Planning)**
1. **`AIImageGenerator.tsx`** - Most complex, uses multiple utils
   - API functions: 6 imports
   - Streaming functions: 2 imports
   - Utility functions: Multiple

### **Phase 3: Supporting Components**
1. **UI Components:** Design system, form components
2. **Modal Components:** Editors, panels
3. **Utility Components:** Uploaders, editors

---

## **🛡️ Backward Compatibility Strategy**

### **API Function Preservation**
```typescript
// Old API (maintain during transition)
export const generateImageWithDalle = (prompt: string, options?: any) => {
  // Legacy implementation
  return legacyGenerateImage(prompt, options);
};

// New API (internal use)
export const generateImageWithDALL_E = (request: ImageGenerationRequest) => {
  // Modern implementation
  return modernGenerateImage(request);
};
```

### **Feature Flags for Gradual Rollout**
```typescript
const USE_NEW_API = import.meta.env.VITE_USE_NEW_API === 'true';

export const generateImage = (prompt: string, options?: any) => {
  if (USE_NEW_API) {
    return newGenerateImage({ prompt, ...options });
  } else {
    return legacyGenerateImage(prompt, options);
  }
};
```

### **Migration Timeline**
- **Week 1-2:** Internal refactoring with feature flags
- **Week 3:** Component-by-component migration
- **Week 4:** Remove legacy code and feature flags

---

## **🔧 Refactoring Impact Matrix**

| **Utility Module** | **Components Affected** | **Risk Level** | **Migration Effort** |
|-------------------|------------------------|---------------|---------------------|
| `api.ts` | 35+ | 🔴 Critical | High |
| `streamingApi.ts` | 1 | 🟡 Medium | Medium |
| `apiUtils.ts` | 10+ | 🟡 Medium | Medium |
| `validation.ts` | 5+ | 🟢 Low | Low |
| `env.ts` | 0 | 🟢 None | None |
| `supabaseClient.ts` | All | 🔴 Critical | High |

---

## **📈 Dependency Graph**

```
src/utils/
├── env.ts                    # ✅ No dependencies
├── validation.ts             # ✅ Independent
├── apiUtils.ts              # ⚠️ Used by 10+ components
├── supabaseClient.ts        # ⚠️ Used by all components
├── streamingApi.ts          # ⚠️ Used by AIImageGenerator
├── api.ts                   # 🔴 Used by 35+ components
│   ├── generateImageWithDalle
│   ├── generateImageWithGemini
│   ├── generateImageWithGemini2Flash
│   ├── generateImageWithImagen
│   ├── generateImageWithGptImage
│   └── generateImageDescriptionWithAI
└── geminiNanoApi.ts         # ⚠️ Complex integrations
```

---

## **🚨 Critical Path Components**

### **Must Maintain Compatibility**
1. **`AIImageGenerator.tsx`** - Core product feature
2. **Action Figure Generators** - Revenue-generating features
3. **API Key Management** - System functionality

### **Can Be Refactored Aggressively**
1. **UI Components** - Design system changes
2. **Utility Functions** - Internal improvements
3. **Validation Functions** - Enhanced security

---

## **✅ Testing Strategy for Refactoring**

### **Pre-Refactoring Tests**
- [ ] Full test suite passes
- [ ] All API functions work
- [ ] No console errors in components
- [ ] Performance benchmarks established

### **During Refactoring**
- [ ] Feature flag testing
- [ ] Backward compatibility tests
- [ ] Component-by-component validation
- [ ] Integration tests for each module

### **Post-Refactoring**
- [ ] Complete test suite passes
- [ ] Performance improved or maintained
- [ ] No breaking changes
- [ ] Documentation updated

---

## **🎯 Success Criteria**

### **Functional Requirements**
- ✅ All existing features work identically
- ✅ No breaking changes for components
- ✅ API contracts maintained
- ✅ Performance not degraded

### **Quality Requirements**
- ✅ 95%+ test coverage maintained
- ✅ TypeScript strict mode compliance
- ✅ Bundle size reduction achieved
- ✅ Documentation updated

### **Developer Experience**
- ✅ Clear error messages
- ✅ Better debugging capabilities
- ✅ Easier maintenance
- ✅ Future extensibility

---

## **📋 Next Steps**

1. **Create feature flags** for all major API changes
2. **Implement new architecture** alongside existing code
3. **Migrate components gradually** starting with isolated ones
4. **Remove legacy code** after full migration
5. **Update documentation** and training materials

This dependency analysis ensures the utils redesign can be executed safely without disrupting the user experience or breaking existing functionality.