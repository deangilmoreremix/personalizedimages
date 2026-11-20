/** Server-side model defaults (override with OPENAI_IMAGE_MODEL / OPENAI_TEXT_MODEL secrets). */
import { DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL } from './openai-responses.ts';

export function openaiModelDefaults() {
  return {
    imageModel: Deno.env.get('OPENAI_IMAGE_MODEL') || DEFAULT_IMAGE_MODEL,
    textModel: Deno.env.get('OPENAI_TEXT_MODEL') || DEFAULT_TEXT_MODEL
  };
}
