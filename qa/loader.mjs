// Module resolution hook used by qa/edge-functions.test.mjs.
//
// The Supabase edge functions are Deno modules. Most of them resolve plain
// relative "./x.ts" specifiers that Node can load directly (with
// --experimental-strip-types), but some files also contain Deno-only imports
// such as `import "jsr:@supabase/functions-js/edge-runtime.d.ts"` (a type-only
// import that has no runtime effect). Node cannot resolve the "jsr:" scheme,
// so redirect any such specifier to an empty local stub module. Everything
// else falls through to Node's default resolver, which means the real edge
// function files on disk are imported unchanged.

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('jsr:')) {
    return {
      url: new URL('./stubs/empty-module.mjs', import.meta.url).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
