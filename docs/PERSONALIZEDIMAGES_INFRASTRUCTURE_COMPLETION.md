# PersonalizedImages — Infrastructure Completion & Release Preparation

- **Branch:** `fix/openai-responses-image-2-5` · **PR:** #1 (updated, OPEN)
- **Commit:** `8f19f8c` · **Date:** 2026-10-12
- **Scope:** finish the remaining infrastructure preparation only. No redesign, no refactor, no BYOK/billing change.

---

## 1. Security checklist (Phase 1)

| Item | Status | Evidence |
|---|---|---|
| Exposed service-role key still valid? | **YES — rotation has NOT happened** | Read-only probe of `/rest/v1/rate_limits` with the old key → **HTTP 200** |
| Exposed secret key / DB password | Same — both were supplied in chat and are compromised | — |
| Credentials stored or committed? | **No.** `.env` is gitignored; the temporary credentials file was created in `/tmp`, outside the repo, and deleted. No secret appears in any commit, log, error response or bundle. | `git log -p` contains none |
| Production deployment gate | **BLOCKED — rotate first** | Until an authorized operator rotates the service-role key, secret key and DB password (with a dependency/rollback plan for the other VideoRemix apps), no production deploy may proceed |

**Action required by an authorized operator:** rotate all three credentials in Supabase Dashboard → Settings → API and Settings → Database, then confirm the old keys return 401.

---

## 2. Minimal database migration (Phase 2)

`supabase/migrations/20261012120000_personalizedimages_minimal_tables.sql`

### Live facts it is built on (verified read-only)
- `generated_videos` — **not deployed** (`PGRST205`)
- `user_images` — **not deployed** (`PGRST205`)
- `generated_images` — deployed (`id, url, prompt, user_id, model, …`)
- `rate_limits` — deployed (`id, scope, key, window_start, count, …`)
- `generated-images` storage bucket — deployed (public, 10 MB, `image/*`)
- The Cloud Gallery service actually touches **six** tables: `user_images`, `folders`, `prompt_history`, `token_profiles`, `generation_queue`, `analytics_events` — **none deployed**. This migration covers the core table (`pi_user_images`); the remaining five are a separate, optional step (see §6).

### Design
| Property | Implementation |
|---|---|
| Naming | `pi_generated_videos`, `pi_user_images` — the `pi_` prefix follows this repo's app-owned naming precedent (`bba_`, `brander_`, `frame_`, `voice_`). Verified: **no** table, index, policy or constraint with these names exists in the live public schema |
| Additive only | Two `CREATE TABLE IF NOT EXISTS`. Nothing is dropped, altered, truncated or deleted. **No shared table, policy, function, trigger or bucket is referenced** |
| Credit/Stripe safety | No reference to `user_credits`, `credit_transactions`, `subscriptions`, `billing_cycles` or `stripe_entitlements` — PersonalizedImages is 100% BYOK |
| Integrity | `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`; `image_id uuid REFERENCES public.generated_images(id) ON DELETE SET NULL` (nullable) |
| RLS | Enabled on both tables; owner-scoped policies (`auth.uid() = user_id`) for SELECT/INSERT/UPDATE, plus DELETE on `pi_user_images`. `WITH CHECK` prevents inserting as another user |
| Indexes | `(user_id, created_at DESC)` on both; partial `status` index on videos; GIN on `tags`; partial favorite index. All names are `pi_`-prefixed and verified unique |
| Idempotency | `IF NOT EXISTS` + `DROP POLICY IF EXISTS` — safe to re-run after a partial failure |
| Grants | None required: live `pg_default_acl` shows new `public` tables automatically grant `anon`/`authenticated`/`service_role` (roles 16484/16485/16486) |

### Local verification actually performed (isolated PostgreSQL 14, `default_transaction_read_only` semantics, Supabase roles + `auth.uid()` stub)
- Migration **applies cleanly** and **re-runs idempotently**.
- **RLS isolation proven with two users:**
  - User A sees only their own rows (1 of 2 videos, not user B's)
  - Cross-user UPDATE → **0 rows** changed
  - Cross-user DELETE → **0 rows** deleted
  - INSERT as another user → **rejected** (`new row violates row-level security policy`)
  - Owner can INSERT/UPDATE their own rows
  - `service_role` (the edge-function role) sees all rows — so the edge functions work unchanged

### Rollback / forward recovery
```
-- Rollback (both tables are new and owned exclusively by PersonalizedImages)
DROP TABLE IF EXISTS public.pi_user_images;
DROP TABLE IF EXISTS public.pi_generated_videos;

-- Forward recovery: the migration is fully idempotent; re-applying after a
-- partial failure produces the same end state.
```
No shared object is affected in either direction.

### Migration removed
`20261011120500_fix_edge_function_db_contracts.sql` was **deleted from the branch**. It was never applied anywhere, and its assumptions now contradict the live schema: it would have added a column to the **shared** `rate_limits` table, altered the **shared** `credit_transactions` CHECK constraint, and created an unused bucket. Keeping it would have modified shared objects for no benefit.

---

## 3. Edge Function deployment manifest (Phase 3)

Generated from the source. **25** functions have an `index.ts`; **24** should be deployed, **1 excluded**.

| Function | Frontend caller | Auth | Provider routing | BYOK key | DB | Storage |
|---|---|---|---|---|---|---|
| `image-generation` | `imageGenerationService`, debug page | 401 | OpenAI GPT Image 2.5 (direct) | `x-user-api-key` | — | — |
| `image-editing` | `utils/api.ts` | 401 | OpenAI GPT Image 2.5 edits | `x-user-api-key` | — | — |
| `assistant-stream` | `gptApi`, `streamingApi` | 401 | OpenAI Responses API | `x-user-api-key` | — | — |
| `prompt-recommendations` | `utils/api.ts` | 401 | OpenAI Responses API | `x-user-api-key` | — | — |
| `image-description` | `utils/api.ts` | 401 | OpenAI Responses API | `x-user-api-key` | — | — |
| `freepik-improve-prompt` | `freepikAiService` | 401 | OpenAI Responses API | `x-user-api-key` | — | — |
| `freepik-ai-image` | `freepikAiService` | 401 | GPT Image 2.5 via shared helper | `x-user-api-key` | — | — |
| `freepik-remove-bg` | `freepikAiService` | 401 | GPT Image 2.5 edits via helper | `x-user-api-key` | — | — |
| `freepik-upscale` | `freepikAiService` | 401 | GPT Image 2.5 edits via helper | `x-user-api-key` | — | — |
| `freepik-relight` | `freepikAiService` | 401 | GPT Image 2.5 edits via helper | `x-user-api-key` | — | — |
| `freepik-style-transfer` | `freepikAiService` | 401 | GPT Image 2.5 edits via helper | `x-user-api-key` | — | — |
| `action-figure` | `utils/api.ts` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `cartoon-style` | `CartoonImageGenerator`, `utils/api.ts` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `ghibli-image` | `GhibliImageGenerator`, `utils/api.ts` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `meme-generator` | `MemeGenerator` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `reference-image` | `utils/api.ts`, modern generators | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `image-variations` | `utils/api.ts` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `image-enhancement` | `utils/api.ts` | 401 | GPT Image 2.5 via helper | `x-user-api-key` | — | — |
| `image-generation-secure` | `utils/supabaseClient.ts` | 401 | GPT Image 2.5 (direct) | `x-user-api-key` | — | — |
| `image-to-video` | `ModernVideoConverter`, `videoApi` | 401 | MuAPI submit | `x-user-api-key` | `pi_generated_videos` | `generated-images` |
| `video-status` | `videoApi` | 401 | MuAPI poll | `x-user-api-key` | `pi_generated_videos` | — |
| `video-result` | `videoApi` | 401 | MuAPI poll | `x-user-api-key` | `pi_generated_videos` | — |
| `freepik-resources` | `stockImageService` | 401 | none — returns honest 501 | n/a | — | — |
| `health-check` | debug page | **none (by design)** | none | n/a | — | — |
| ~~`create-payment-intent`~~ | **none** | 401 | **Stripe** | — | — | — |

**Excluded from deployment: `create-payment-intent`.** It has no caller in the application (the BYOK conversion removed the only one) and PersonalizedImages must not expose a payment endpoint.

### Verified properties across the 24 deployable functions
- **BYOK only:** 22 functions read `x-user-api-key` via the shared `getUserApiKey()` helper and fail closed with HTTP 400 + `Add your key in Settings → API Keys.` **Zero** functions read `OPENAI_API_KEY` or `MUAPI_API_KEY` from the environment (static grep = 0).
- **Auth:** `authenticateUser()` runs first in every data-touching function → 401 without a valid Bearer token. `health-check` is intentionally unauthenticated and touches no user data.
- **CORS:** every function answers `OPTIONS` (directly or via `createEdgeFunction`) and derives `Access-Control-Allow-Origin` from the origin allow-list; the allow-list covers `x-user-api-key`, `x-request-id`, `x-debug-mode`. No function emits `*`.
- **No billing anywhere:** no function calls a credit RPC, Stripe, or any subscription table.
- **Key safety:** the key is only ever used in a provider auth header — never logged, interpolated into a URL, written to a DB row, or returned in a response.
- **Errors:** missing/invalid key → 400; missing auth → 401; bad input → 400; provider 429 → 429; other provider failures → 502; genuinely server-side → 503 (`health-check` only).

---

## 4. Safe test environment (Phase 4)

| Attempt | Result |
|---|---|
| Local Supabase CLI instance | **Not available** (no `supabase` CLI) |
| Local PostgreSQL for migration testing | ✅ **Done** — PostgreSQL 14 installed, booted on an isolated socket/port (`/tmp`, 5455), Supabase roles + `auth.uid()` stub created, migration applied and RLS-tested (§2). Instance stopped afterwards. |
| Supabase dev branch / staging project | **BLOCKED** — requires a paid branch or a new project, neither of which may be created without approval |
| Testing against the shared production project | **Not attempted** — production is not a test target |

**Outcome:** the migration and its RLS behaviour were verified on an isolated local instance; function deployment and end-to-end behaviour remain blocked on an approved staging target.

---

## 5. Live acceptance matrix (Phase 5)

| # | Test | Status | Notes |
|---|---|---|---|
| 1 | OpenAI API key setup | **BLOCKED** | requires a real user key in Settings → API Keys |
| 2 | MuAPI API key setup | **BLOCKED** | same |
| 3 | GPT Image 2.5 generation | **BLOCKED** | no deployed function + no user key |
| 4 | GPT Image 2.5 editing (source image) | **BLOCKED** | contract-verified only |
| 5 | OpenAI Responses API | **BLOCKED** | contract-verified only |
| 6 | MuAPI image-to-video | **BLOCKED** | contract-verified only |
| 7 | MuAPI status polling | **BLOCKED** | contract-verified only |
| 8 | Video storage + download | **BLOCKED** | `pi_generated_videos` must be migrated first |
| 9 | Gallery storage + retrieval | **BLOCKED** | `pi_user_images` must be migrated first |
| 10 | Authentication + RLS isolation | **PARTIAL — verified locally** | RLS isolation proven on the local instance (§2); live verification requires staging |
| 11 | Invalid API key errors | **BLOCKED (live)** | contract-verified: 400 + setup message, no provider call |
| 12 | Zero platform billing | **PASS (static)** | zero credit/Stripe/subscription calls in code and in every function |

**No mocked result is presented as a live pass anywhere in this report.**

---

## 6. Remaining blockers and required approvals

1. **Credential rotation (BLOCKING, approval required)** — rotate the service-role key, secret key and DB password. Until then no production deploy.
2. **Migration approval (BLOCKING for video + gallery)** — apply `20261012120000_personalizedimages_minimal_tables.sql` to an **approved staging target** first, then production. The SQL is proven additive and locally tested.
3. **Edge Function deployment** — deploy the 24 functions in §3 (explicitly **not** `create-payment-intent`) to staging, then production.
4. **Live acceptance** — one end-user OpenAI + MuAPI key pair, then the §5 matrix.
5. **Optional gallery completion** — `folders`, `prompt_history`, `token_profiles`, `generation_queue`, `analytics_events` are still undeployed; the gallery's image save/list/update/delete work with `pi_user_images` alone, but folders, prompt history and token profiles need a follow-up additive migration (same `pi_` pattern) if those features are to be enabled.

---

## 7. Exact production deployment steps (for approval)

```bash
# 0. Rotate credentials FIRST (Supabase Dashboard), then re-link with the new ones
supabase link --project-ref bzxohkrxcwodllketcpz

# 1. Verify the migration plan against production WITHOUT applying it
supabase db diff --schema public            # inspect; must show no shared-table changes
supabase migration list                     # confirm 20261012120000_personalizedimages_minimal_tables is pending

# 2. Apply the migration (staging first)
supabase db push

# 3. Deploy ONLY the PersonalizedImages functions
for fn in action-figure assistant-stream cartoon-style freepik-ai-image \
         freepik-improve-prompt freepik-relight freepik-remove-bg freepik-resources \
         freepik-style-transfer freepik-upscale ghibli-image health-check \
         image-description image-editing image-enhancement image-generation \
         image-generation-secure image-to-video image-variations meme-generator \
         prompt-recommendations reference-image video-result video-status ; do
  supabase functions deploy "$fn"
done
# NOTE: create-payment-intent is deliberately NOT deployed.

# 4. Confirm the BYOK posture and CORS
supabase secrets list                          # expect NO OPENAI_API_KEY / MUAPI_API_KEY
curl -i -X OPTIONS "$URL/functions/v1/image-generation" -H "Origin: https://<app>"
#   -> 200, Access-Control-Allow-Origin echoes the app origin,
#      Access-Control-Allow-Headers includes x-user-api-key

# 5. Live acceptance with one test user's own keys (Settings -> API Keys),
#    then record results against the section 5 matrix.
```

**Rollback:** `DROP TABLE IF EXISTS public.pi_user_images; DROP TABLE IF EXISTS public.pi_generated_videos;` (export user gallery rows first). Function rollback: redeploy the previous revision. Neither touches any shared object.

---

## 8. Verification evidence

```
npm run build                        ✓ 20.61s
npx vitest run                       122 passed / 122 (16 files)
node qa/edge-functions.test.mjs      48 pass / 0 fail
node qa/openai-functions.test.mjs    11 pass / 0 fail
node qa/video-functions.test.mjs     23 pass / 0 fail
node qa/rate-limit.test.mjs          13 pass / 0 fail
node qa/contracts-frontend.test.mjs  15 pass / 0 fail
node qa/edge-extra.test.mjs          16 pass / 0 fail
node qa/byok-isolation.test.mjs      15 pass / 0 fail
node qa/cors-restrictiveness.test.mjs 12 pass / 0 fail
node qa/release-hardening.test.mjs    6 pass / 0 fail
node qa/live-schema.test.mjs          8 pass / 0 fail
                                   TOTAL: 167 contract tests / 0 failures
npx tsc --noEmit                     212 errors — all pre-existing, confined to
                                     src/components/ui/compound-components.ts and
                                     src/data/promptLibrary.ts (unchanged files)
Local PostgreSQL migration test      applies, idempotent, RLS isolation proven
Live shared-DB inspection            read-only; no writes, no DDL, no deploy
```

---

## 9. Recommendation

**NOT READY FOR PRODUCTION — three approvals outstanding:** credential rotation, the minimal migration, and the Edge Function deployment. All three are now fully prepared, proven safe for the shared database (additive, locally RLS-tested, namespaced `pi_*`), and documented with exact commands. The application code is green on every automated check available without staging credentials. **No merge, no migration, no deploy and no production change were performed.**
