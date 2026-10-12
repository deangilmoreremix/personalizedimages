// Empty stand-in module for Deno-only "jsr:" specifiers (see ../loader.mjs).
// The original imports are type-only, so an empty module is behaviorally
// equivalent when the edge functions run under Node.
export {};
