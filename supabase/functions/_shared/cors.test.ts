// Basic test suite for shared utilities
// Run with: deno test --allow-env cors.test.ts

import { assertEquals, assert } from "https://deno.land/std@0.224.0/testing/asserts.ts"
import { validateApiKey, sanitizeInput, isValidUrl, checkRateLimit, checkCredits } from "./cors.ts"

Deno.test("API Key Validation", () => {
  // Test OpenAI key validation
  assert(validateApiKey("sk-test123", "openai"), "Should validate OpenAI key")
  assert(!validateApiKey("invalid", "openai"), "Should reject invalid OpenAI key")

  // Test Gemini key validation
  assert(validateApiKey("AIzaSyTest", "gemini"), "Should validate Gemini key")
  assert(!validateApiKey("invalid", "gemini"), "Should reject invalid Gemini key")

  // Test Stripe key validation
  assert(validateApiKey("sk_test_123", "stripe"), "Should validate Stripe key")
  assert(!validateApiKey("invalid", "stripe"), "Should reject invalid Stripe key")
})

Deno.test("Input Sanitization", () => {
  assertEquals(sanitizeInput("Hello <script>alert('xss')</script> World"), "Hello  World")
  assertEquals(sanitizeInput("Normal text"), "Normal text")
  assert(sanitizeInput("A".repeat(2000)).length <= 1000, "Should limit length")
})

Deno.test("URL Validation", () => {
  assert(isValidUrl("https://example.com"), "Should validate HTTPS URL")
  assert(isValidUrl("http://example.com"), "Should validate HTTP URL")
  assert(!isValidUrl("javascript:alert('xss')"), "Should reject invalid protocol")
  assert(!isValidUrl("not-a-url"), "Should reject invalid URL")
})

Deno.test("Rate Limiting", () => {
  const userId = "test-user"

  // First request should be allowed
  const result1 = checkRateLimit(userId, true)
  assert(result1.allowed, "First request should be allowed")
  assertEquals(result1.remaining, 99, "Should have 99 requests remaining")

  // Subsequent requests should still be allowed
  for (let i = 0; i < 10; i++) {
    const result = checkRateLimit(userId, true)
    assert(result.allowed, `Request ${i} should be allowed`)
  }
})

Deno.test("Credit System", () => {
  const userId = "test-user-credits"

  // First request should be allowed
  const result1 = checkCredits(userId)
  assert(result1.allowed, "First credit check should be allowed")
  assertEquals(result1.remainingCredits, 49, "Should have 49 credits remaining")

  // Subsequent requests should deduct credits
  for (let i = 0; i < 10; i++) {
    const result = checkCredits(userId)
    assert(result.allowed, `Credit check ${i} should be allowed`)
  }

  // Check remaining credits
  const finalCheck = checkCredits(userId)
  assertEquals(finalCheck.remainingCredits, 39, "Should have 39 credits remaining")
})

console.log("✅ All tests passed!")