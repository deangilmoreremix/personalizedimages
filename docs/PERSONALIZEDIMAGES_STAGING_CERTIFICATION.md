# PersonalizedImages — Staging & Live API Certification

- **Repository:** deangilmoreremix/personalizedimages
- **Branch:** `fix/openai-responses-image-2-5`
- **PR:** #1 (updated, OPEN)
- **Git commit SHA:** `5f2f8f06520b833cb17b58cbaa6faf865fcd2b7c` (`5f2f8f0`)
- **Certification date:** 2026-10-11
- **Supabase project (shared):** VideoRemix Product — `bzxohkrxcwodllketcpz` (us-east-1) — **NOT touched**

---

## 1. Staging environment identifier

**NONE PROVISIONED — BLOCKED BY CONFIGURATION.**

This environment has no `supabase` CLI, no `deno`, no `psql`, no `SUPABASE_ACCESS_TOKEN`, and no
database password for the shared project (`bzxohkrxcwodllketcpz`). The only `pooler-url` present
(`supabase/.temp/pooler-url`) references a different, local-development project
(`gadedbrnqzpfqtsdfzcg`), and nothing is listening on the local Supabase ports. Creating a paid
Supabase project or branch was explicitly out of scope and was **not** done.

**Required to provision an isolated staging target** (Supabase dev branch of the shared project, or a
separate free/staging project):

1. `SUPABASE_ACCESS_TOKEN` (Supabase CLI login) and DB password for the staging target only.
2. `supabase link --project-ref <staging-ref>` then `supabase db push` (staging only — **never** the
   shared production project without approval).
3. Secrets on the staging functions: `OPENAI_API_KEY`, `MUAPI_API_KEY` (+ optional model overrides).
4. `supabase functions deploy` for the functions under `supabase/functions/`.

## 2. Shared-database compatibility findings

Full audit: **`docs/SHARED_SUPABASE_COMPATIBILITY_AUDIT.md`** (static; live verification blocked —
no credentials/tooling). Summary:

- The shared `rate_limits` table has **two possible deployed shapes** (from migrations
  `20251219164908` and `20260222134334`); `user_credits`, `credit_transactions`,
  `generated_videos`, and storage buckets are also shared with other VideoRemix apps.
- **Two cross-app hazards were found in migration `20261011120500` and FIXED on this branch**
  (commit `5f2f8f0`): an unconditional `DELETE FROM rate_limits` de-duplication (destroyed live
  rate-limit windows for every app) and a `UNIQUE(identifier, is_authenticated)` index that would
  make the shared `check_rate_limit()` RPC fail with `unique_violation` (it inserts one row per
  `(identifier, endpoint, window_start)`). Both statements were removed; `SET lock_timeout = '2s'`
  was added; the `credit_transactions` CHECK swap now uses `NOT VALID` + `VALIDATE CONSTRAINT`.
  `checkRateLimit()` in `supabase/functions/_shared/cors.ts` now namespaces its rows
  (`edge:<identifier>`) and uses `Prefer: resolution=ignore-duplicates` (`ON CONFLICT DO NOTHING`),
  which requires no unique index and works on both deployed shapes.
- `check_and_deduct_credit_service` is `SECURITY DEFINER` with `SET search_path = public`, is
  `REVOKE`d from `PUBLIC` and `authenticated`, and `GRANT`ed to `service_role` only; the original
  caller-validated `check_and_deduct_credit` remains in force for direct frontend RPC calls.
- No statement in the final migration mutates or deletes existing data; all schema changes are
  `ADD COLUMN IF NOT EXISTS` / guarded / idempotent.
- **Verdict after fix: SAFE (static analysis).** Nothing was applied to any database.

## 3. Migration validation results

- `supabase/migrations/20261011120500_fix_edge_function_db_contracts.sql` reviewed line-by-line
  against the full migration history: 10 conflict classes checked — 8 PASS, and the 2 former
  CONCERNs (unique-index conflict, cross-app data impact) eliminated by the fix in §2.
- **Applied staging migrations: NONE.** No `db push` was executed anywhere (no CLI/token). The
  migration remains unreleased and must be applied to an isolated staging branch first.
- Regression coverage: `qa/rate-limit.test.mjs` (13 tests) asserts the migration contains no
  `DELETE`/`TRUNCATE` and no unique index on `rate_limits`, and pins the cors.ts upsert contract.

## 4. Edge Function deployment status

**NOT DEPLOYED — BLOCKED BY CONFIGURATION** (no Supabase CLI/access token in this environment).
All functions statically verified: server-side secrets via `Deno.env.get` only; auth
(`authenticateUser` → 401), rate limits, and credit checks in place; providers: OpenAI Responses
API (`assistant-stream`, `freepik-improve-prompt`, `prompt-recommendations`, `image-description`),
GPT Image 2.5 (`image-generation`, `image-editing`, generators, and the six former-Freepik AI
functions), MuAPI (`image-to-video`, `video-status`, `video-result`), Gemini Nano Banana
(secondary image provider in the generators).

## 5. Live provider testing results

| Provider | Status | Evidence |
|---|---|---|
| OpenAI Responses API / GPT Image 2.5 | **BLOCKED — no `OPENAI_API_KEY`** | `env` has no `OPENAI_API_KEY`; no `.env`/`.env.local`; `https://api.openai.com/v1/models` returns 401 (reachable, unauthenticated). Zero generation calls were made; no mocked result is presented as live evidence. |
| MuAPI | **BLOCKED — no `MUAPI_API_KEY`** | Same checks; zero submissions. |

Contract-level (mocked, **not** live) evidence: 95/95 tests pass —
`qa/edge-functions.test.mjs` 50, `qa/openai-functions.test.mjs` 10, `qa/video-functions.test.mjs`
22, `qa/rate-limit.test.mjs` 13. Build: `npm run build` passes. `tsc`: 0 errors outside the two
pre-existing broken files (`src/components/ui/compound-components.ts`, `src/data/promptLibrary.ts`).

## 6. Authentication and RLS testing

**BLOCKED — no database access.** Static findings: `authenticateUser()` validates the caller's JWT
against `/auth/v1/user` (401 on failure); credit-gated functions call the service-role RPC only
after authentication; `rate_limits` SELECT/INSERT are service-role and identifier-namespaced;
tables referenced by the app have RLS enabled in the migration history. Live user-isolation
verification (user A cannot read user B's assets) was **not** performed.

## 7. Credit and rate-limit verification

- Contracts verified by tests: 401 without auth, 429 on rate limit, credit deduction ordering,
  `check_and_deduct_credit_service` atomicity (including `race_condition_prevented` path).
- Rate-limit hardening (shared-database safety) verified by the 13 regression tests in §3.
- **Live credit/rate-limit behavior on the shared database: BLOCKED** (no DB access).

## 8. Storage and download verification

- Static: images/videos are returned as `data:` URLs (GPT Image 2.5 always returns base64);
  `temp-uploads` bucket used to convert data URLs to provider-fetchable URLs for MuAPI;
  `landing-page-images` bucket ensured idempotently by the migration; cloud gallery reads the
  user's own rows.
- **Live upload/download and cross-user access tests: BLOCKED** (no DB/storage access).

## 9. Feature certification matrix

The full 30-row matrix (frontend component → backend route → provider → test performed → status)
is in the certification evidence appended below and in
`docs/MASTER_TASK_COMPLETION_AUDIT.md`. Statuses used: `CONTRACT-PASS (mocked)`,
`STATIC-REVIEW`, `BLOCKED — no credentials`. **No feature is reported as a live PASS**, because no
live provider calls were possible.

| Feature group | Status |
|---|---|
| Assistant/streaming, prompt improvement, recommendations, image description (Responses API) | CONTRACT-PASS (mocked) |
| Image generation, editing, all generators, background removal, upscale, relight, style transfer (GPT Image 2.5) | CONTRACT-PASS (mocked) |
| Image-to-video submit/poll/retrieve (MuAPI) | CONTRACT-PASS (mocked) |
| GIF editor, email image editors (client-side) | STATIC-REVIEW |
| Personalization, batch generation, cloud gallery, BYOK settings | STATIC-REVIEW (no live DB) |
| Stock image search (Freepik removed) | INTENTIONALLY EXCLUDED — honest 501 |
| All live flows (auth, RLS, credits, storage) | BLOCKED — no credentials |

## 10. Remaining blockers

1. `OPENAI_API_KEY` server-side secret (all OpenAI features untestable live).
2. `MUAPI_API_KEY` server-side secret (video untestable live).
3. Supabase CLI + access token + isolated staging target (functions deploy, `db push`, live
   auth/RLS/credit/storage tests).
4. Live confirmation of the deployed `rate_limits` shape before applying the migration to the
   shared project (static analysis covered both shapes; see compatibility audit §2/§6).
5. Cross-app sign-off for any change on the shared database.

## 11. Cost of authorized testing

**$0.00** — no provider API calls were made (no credentials), no paid environment created.

## 12. Final recommendation

# NO-GO — REMAINING BLOCKERS

All four blockers are **external configuration** (provider secrets and staging access), not code
defects: the codebase is contract-verified (95/95), builds cleanly, exposes no shared credentials
to the browser, and its migration is now demonstrably safe for the shared database. To convert
this to **GO FOR PRODUCTION REVIEW**: provision an isolated staging target, set the server-side
secrets, deploy functions + `db push` to staging only, and run one authenticated smoke test per
matrix row (limited budget), recording actual outputs.

**Do not merge to `main` and do not deploy to production without explicit approval.**
