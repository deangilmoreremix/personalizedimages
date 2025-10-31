/**
 * Clipboard utilities with permission checks and fallbacks
 */

/**
 * Check if clipboard API is available and has permission
 */
export const isClipboardAvailable = async (): Promise<boolean> => {
  try {
    // Check if the Clipboard API is available
    if (!navigator.clipboard) {
      return false;
    }

    // Check if we have permission to write to clipboard
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return permission.state === 'granted' || permission.state === 'prompt';
    }

    // Fallback: try to access clipboard (will throw if not allowed)
    return true;
  } catch (error) {
    console.warn('Clipboard permission check failed:', error);
    return false;
  }
};

/**
 * Safely copy text to clipboard with fallbacks
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if clipboard is available
    if (!(await isClipboardAvailable())) {
      console.warn('Clipboard not available, using fallback');
      return fallbackCopyToClipboard(text);
    }

    // Use modern Clipboard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Modern clipboard API failed, using fallback:', error);
    return fallbackCopyToClipboard(text);
  }
};

/**
 * Fallback clipboard copy using textarea element
 */
const fallbackCopyToClipboard = (text: string): boolean => {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make it invisible but selectable
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);

    // Select and copy
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Fallback clipboard copy failed:', error);
    return false;
  }
};

/**
 * Safely read text from clipboard with permission checks
 */
export const readFromClipboard = async (): Promise<string | null> => {
  try {
    // Check if clipboard is available
    if (!(await isClipboardAvailable())) {
      console.warn('Clipboard not available for reading');
      return null;
    }

    // Check read permission if available
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      if (permission.state === 'denied') {
        console.warn('Clipboard read permission denied');
        return null;
      }
    }

    // Read from clipboard
    const text = await navigator.clipboard.readText();
    return text;
  } catch (error) {
    console.warn('Failed to read from clipboard:', error);
    return null;
  }
};