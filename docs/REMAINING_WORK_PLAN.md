# Remaining Work Plan: Finalizing the Unified AI Image Generation Platform

This document outlines the remaining tasks required to complete the transition to the Unified AI Image Generation Platform, focusing on backend integration, testing, and full module compatibility.

## Phase 1: Backend Integration & Token System

**Goal:** Ensure the new drag-and-drop token system is fully supported by the backend API and that token processing is robust and secure.

### 1.1. Connect New Token System to Backend
*   **Description:** The frontend `useTokenApplication` hook currently simulates token application. This needs to be connected to the actual backend image generation/editing endpoints.
*   **Steps:**
    1.  Modify `src/hooks/useTokenApplication.ts` to call the unified API (`src/utils/api/image/generation.ts`) when applying tokens.
    2.  Update the `generateImage` function in `src/utils/api/image/generation.ts` to accept an array of applied tokens.
    3.  Ensure the backend (Supabase Edge Functions) can parse and apply these tokens during image generation or post-processing.

### 1.2. Update API Endpoints for Token Processing
*   **Description:** The backend Edge Functions need to be updated to handle the new token structure (text, style, filter, etc.) passed from the frontend.
*   **Steps:**
    1.  Review `supabase/functions/image-generation/index.ts` and other relevant functions.
    2.  Update the request schema to include `appliedTokens`.
    3.  Implement logic within the Edge Functions to apply token effects (e.g., text overlay, style transfer) using the appropriate AI provider (OpenAI, Gemini, etc.).

### 1.3. Implement Token Validation on Server
*   **Description:** Security and data integrity require server-side validation of tokens.
*   **Steps:**
    1.  Create a shared validation utility (or update `src/utils/validation.ts` and sync with backend) to validate token structure and values.
    2.  Integrate this validation into the Edge Functions before processing any image generation request.

## Phase 2: Testing & Quality Assurance

**Goal:** Verify the stability, functionality, and user experience of the new features, particularly the drag-and-drop interactions.

### 2.1. Create Unit Tests for Drag-and-Drop Functionality
*   **Description:** Ensure the `DraggableToken` and `DroppableImage` components behave as expected.
*   **Steps:**
    1.  Create test files: `src/components/ui/__tests__/DraggableToken.test.tsx` and `src/components/ui/__tests__/DroppableImage.test.tsx`.
    2.  Write tests to verify drag start, drop events, and visual feedback states (hover, active).
    3.  Test token data transfer during the drag-and-drop operation.

### 2.2. Perform Integration Testing for Token Application
*   **Description:** Test the end-to-end flow of applying a token to an image and receiving a processed result.
*   **Steps:**
    1.  Create an integration test suite in `src/tests/integration/token-application.test.ts`.
    2.  Simulate a user dropping a token on an image.
    3.  Mock the backend response to verify the frontend correctly updates the image state with the applied effect.

### 2.3. Verify Cross-Module Compatibility
*   **Description:** Ensure the new system works seamlessly across all different generation modes (AI Image, Ghibli, Cartoon, etc.).
*   **Steps:**
    1.  Manually test the drag-and-drop token system in each of the main generation modes within the `UnifiedImageDashboard`.
    2.  Automate this where possible using Cypress or Playwright (if available in the stack) to visit each mode and perform a basic token application.

## Phase 3: Full Module Compatibility

**Goal:** Ensure all 35+ legacy and specialized modules are fully integrated into the new unified system or properly deprecated/redirected.

### 3.1. Ensure All 35+ Modules Support New Token System
*   **Description:** Review the list of 35+ modules identified in `docs/UNIFIED_PLATFORM_REDESIGN.md` and ensure they are accessible and functional within the new `UnifiedImageDashboard`.
*   **Steps:**
    1.  Audit `src/components/UnifiedImageDashboard.tsx` to ensure all generation modes map correctly to the underlying API capabilities.
    2.  If any specialized logic exists in legacy components (e.g., `WrestlingActionFigureGenerator.tsx`), ensure it is either ported to the unified dashboard or the dashboard correctly routes/uses the specialized component logic.

### 3.2. Update Legacy Modules to Use New Token Hooks
*   **Description:** Refactor any remaining standalone generator components to use `useTokenApplication` and `TokenPanel` if they are to be kept as alternative views.
*   **Steps:**
    1.  Identify any components still using the old token system.
    2.  Replace local state management for tokens with the `useTokenApplication` hook.
    3.  Replace custom token UI with the shared `TokenPanel` component.

## Phase 4: Final Polish & Optimization

**Goal:** Refine the user experience and ensure high performance.

### 4.1. Optimize Performance of Drag Operations
*   **Description:** Ensure drag-and-drop is smooth, even with many tokens or large images.
*   **Steps:**
    1.  Profile the drag-and-drop interaction using React DevTools Profiler.
    2.  Optimize re-renders in `UnifiedImageDashboard` and `DroppableImage` using `React.memo` and `useCallback` where necessary.

### 4.2. Enhance Visual Feedback and Animations
*   **Description:** Improve the "feel" of the application.
*   **Steps:**
    1.  Add smoother transitions for token application (e.g., a "poof" or "flash" effect when a token is dropped).
    2.  Improve the visual cues for valid drop zones.
    3.  Ensure loading states for token processing are clear and non-intrusive.