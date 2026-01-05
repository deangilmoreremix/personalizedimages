// lib/cache.ts
import { supaAdmin } from "./supabase";

// In-memory cache for frequently accessed items
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useMemory?: boolean; // Use in-memory cache
}

export async function getCached(
  templateId: string,
  tokenHash: string,
  options: CacheOptions = {}
): Promise<string | null> {
  const cacheKey = `${templateId}:${tokenHash}`;
  const { ttl = DEFAULT_TTL, useMemory = true } = options;

  // Check memory cache first
  if (useMemory) {
    const memoryItem = memoryCache.get(cacheKey);
    if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
      return memoryItem.data;
    } else if (memoryItem) {
      // Remove expired item
      memoryCache.delete(cacheKey);
    }
  }

  try {
    const { data, error } = await supaAdmin
      .from("personalization_renders")
      .select("storage_url, created_at")
      .eq("template_id", templateId)
      .eq("token_hash", tokenHash)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Cache retrieval error:', error);
      return null;
    }

    const result = data?.storage_url || null;

    // Cache in memory if enabled
    if (useMemory && result) {
      memoryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl
      });
    }

    return result;
  } catch (error) {
    console.error('Cache get operation failed:', error);
    return null;
  }
}

export async function putCached(
  templateId: string,
  tokenHash: string,
  storageUrl: string,
  options: CacheOptions = {}
): Promise<boolean> {
  const cacheKey = `${templateId}:${tokenHash}`;
  const { ttl = DEFAULT_TTL, useMemory = true } = options;

  try {
    const result = await supaAdmin
      .from("personalization_renders")
      .insert([{
        template_id: templateId,
        token_hash: tokenHash,
        storage_url: storageUrl,
        created_at: new Date().toISOString()
      }])
      .select();

    if (result.error) {
      console.warn('Cache insert failed:', result.error);
      return false;
    }

    // Update memory cache
    if (useMemory) {
      memoryCache.set(cacheKey, {
        data: storageUrl,
        timestamp: Date.now(),
        ttl
      });
    }

    return true;
  } catch (error) {
    console.error('Cache put operation failed:', error);
    return false;
  }
}

// Clear expired items from memory cache
export function cleanupMemoryCache(): number {
  const now = Date.now();
  let removed = 0;

  for (const [key, item] of memoryCache.entries()) {
    if (now - item.timestamp >= item.ttl) {
      memoryCache.delete(key);
      removed++;
    }
  }

  return removed;
}

// Get cache statistics
export function getCacheStats() {
  return {
    memoryCacheSize: memoryCache.size,
    memoryCacheItems: Array.from(memoryCache.keys())
  };
}

// Auto-cleanup memory cache every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(cleanupMemoryCache, 1000 * 60 * 5);
}