// Stub for deno.land std server imports used by some edge functions.
// Delegates to the test harness's global Deno.serve stub so the handler is
// registered exactly as it would be with the real `serve` wrapper.
export function serve(handler) {
  if (globalThis.Deno && typeof globalThis.Deno.serve === 'function') {
    globalThis.Deno.serve(handler);
  }
}
