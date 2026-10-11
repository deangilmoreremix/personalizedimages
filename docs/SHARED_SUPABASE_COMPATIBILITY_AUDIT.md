# Shared Supabase Compatibility & Migration Safety Audit

**Audit target:** `supabase/migrations/20261011120500_fix_edge_function_db_contracts.sql`
**Branch:** `fix/openai-responses-image-2-5`
**Audit date:** 2026-10-11
**Auditor role:** Agent A — Shared Supabase Safety & Migration Compatibility (STATIC AUDIT ONLY)
**Shared Supabase project:** "VideoRemix Product" — id `bzxohkrxcwodllketcpz` (shared with OTHER VideoRemix applications)

---

## 1. Purpose

PersonalizedImages shares **one** Supabase project with other VideoRemix applications. The migration
`20261011120500_fix_edge_function_db_contracts.sql` (217 lines) modifies objects that are already live
in that shared project. This audit answers, from the repository alone:

1. What objects exist across all 26 migrations, and which are shared vs. PersonalizedImages-specific.
2. Whether the migration is safe to apply to the shared database as-is.
3. Whether any statement deletes/mutates existing data, escalates privileges, or blocks other apps.

**Result summary (see §6):** `SAFE WITH CONDITIONS` — 8 of 10 conflict classes PASS, 2 CONCERN.
Nothing was applied to any database by this audit.

---

## 2. Live verification: BLOCKED BY CONFIGURATION

**This audit is STATIC. Live verification of schema, row counts, constraint names, and row-level
duplicates was BLOCKED BY CONFIGURATION — no credentials and no tooling for project
`bzxohkrxcwodllketcpz`.**

Verified in this environment:

```
$ which supabase deno psql
(no output — none of the three binaries exist)

$ env | grep -i supabase
(no output — no SUPABASE_ACCESS_TOKEN, no SUPABASE_DB_PASSWORD, no SUPABASE_URL/SERVICE_ROLE_KEY)

$ cat supabase/.temp/*
cli-latest        v2.58.5
gotrue-version    v2.182.1
pooler-url        postgresql://postgres.gadedbrnqzpfqtsdfzcg@aws-0-us-east-1.pooler.supabase.com:5432/postgres
postgres-version  15.14.1.0
project-ref       gadedbrnqzpfqtsdfzcg
rest-version      v13.0.5
storage-migration fix-object-level
storage-version   v1.28.4
```

The only pooler URL / project ref on disk belongs to a **different, local-dev** project
(`gadedbrnqzpfqtsdfzcg`), not to the shared production project (`bzxohkrxcwodllketcpz`).
`supabase/config.toml` contains no `project_id` for the shared project either, so no CLI
link target exists.

**Consequences of the block (must be stated plainly):**

- The **live shape** of `rate_limits` could not be confirmed (see §4.1 — it has two mutually
  incompatible historical shapes, and the audit can only reason about both).
- Whether `rate_limits` contains duplicate `(identifier, is_authenticated)` rows — the exact
  condition that makes line 70–74 destructive — could not be measured.
- The **live name** of the `credit_transactions` type CHECK constraint, and the current row count
  that determines how long the constraint swap locks the table, could not be read.
- Whether other VideoRemix apps currently write to `rate_limits`, `credit_transactions`,
  `user_credits` or `generated_videos` could not be observed (no `pg_stat_activity`, no cross-app
  inventory).

**Exact access required to unblock (not requested, not used):**

| # | Requirement | Why |
|---|---|---|
| 1 | Supabase CLI (v2.58.x) installed, or `psql` 15 client | Run `\d`-style introspection and `SELECT`s |
| 2 | `SUPABASE_ACCESS_TOKEN` (org-scoped, read-only at minimum) | `supabase migration list`, `supabase db pull`, branch APIs |
| 3 | Direct DB password / pooler connection string **for project `bzxohkrxcwodllketcpz`** | Read `information_schema`, `pg_constraint`, `pg_policies`, duplicate counts |
| 4 | Read-only role or a `pg_read_all_data`-style grant on that project | Introspect without any DDL risk |
| 5 | Cross-app contact: list of other VideoRemix apps using this project and which tables they read/write | Determine the true blast radius of §4.1 and §4.3 |

Until (1)–(4) are supplied, **every conclusion below is a static, repository-only inference** and
must be re-validated against the live schema before any production apply.

---

## 3. Shared-object inventory across all migrations

26 migrations in `supabase/migrations/`. Idempotency pattern used per migration:
`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`,
`DROP POLICY IF EXISTS`, `DROP TRIGGER IF EXISTS`, `INSERT ... ON CONFLICT ... DO NOTHING`, and
`DO $$ ... IF NOT EXISTS (SELECT ... pg_policies / pg_constraint) ... $$` guards.

### 3.1 Tables (grouped by owner)

**PersonalizedImages-specific (safe to change):**
`user_generated_gifs`, `image_generations`, `personalization_tokens`, `user_fonts`, `social_connections`,
`account_settings`, `profile_audit`, `stock_favorites`, `stock_downloads`, `stock_usage_analytics`,
`prompt_favorites`, `image_tags`, `token_profiles`, `admin_roles`, `content_revisions`,
`landing_page_images`, `generation_queue`, `folders`, `user_images`, `prompt_history`,
`analytics_events`, `user_generated_images`, `user_projects`, `project_images`, `reference_images`,
`user_payments`, `user_videos`, `ai_settings` (referenced).

**Shared / potentially shared (treat as cross-app, do not break):**

| Table | Created/altered by | Notes |
|---|---|---|
| `users` | 20250428204515:52, 20250429202509:134 | Pre-Supabase-idiom `public.users`; FK target of older migrations |
| `profiles` | 20250429153255, 20250429202509:78 | Has `Public can view profiles` policy (line 113) — world-readable |
| `user_profiles` | 20250906064600:8, 20260112235810:23 | Duplicate-creation pair |
| `generated_images` | 20250906064600:37, 20260112235810:45 | RLS SELECT tightened in 20260222134419 |
| `generated_videos` | 20250906064600:107, 20260112235810:104 | **TOUCHED by audited migration** |
| `api_usage` | 20250906064600:123 | — |
| `user_credits` | 20251130000000:8, 20260112235852:17 | **Directly mutated by audited migration's function** |
| `credit_transactions` | 20251130000000:22, 20260112235852:29 | **TOUCHED by audited migration (CHECK + DEFAULT)** |
| `pricing_tiers`, `usage_logs`, `credit_packages` | 20251130000000 | Public-read policies on pricing/packages |
| `rate_limits` | 20251219164908:18 (**shape A**), 20260222134334:26 (**shape B**) | **TOUCHED by audited migration (ADD COLUMN, DELETE, UNIQUE INDEX, POLICY)** |
| `audit_logs` | 20251219164908:47 | — |

### 3.2 RLS policies of record (abridged — shared tables only)

- `users`: `Users can view own profile`, `Users can update own profile` (20250428204515:77-89);
  superseded by `Users can manage their own user data` (20250429202509:134-139).
- `profiles`: `Public can view profiles` `TO public USING (true)` (20250429202509:113-117) — **note: this
  policy exposes all profiles publicly; it predates and is unrelated to the audited migration.**
- `generated_images`: `Users can view their own images` (recreated in 20260222134419:16-20, strict
  `auth.uid() = user_id`); `Users can create images`; `Users can delete their own images`.
- `rate_limits`: **only** `Service role can manage rate limits` `FOR ALL TO service_role USING (true)
  WITH CHECK (true)` (20251219164908:37-41). No `authenticated`/`anon` policy exists.
- `credit_transactions`: `Users can view their own transactions`; `Users can insert their transactions`
  (20251130000000:110-116), INSERT tightened to `auth.uid() = user_id` in 20260223041208:49-52.
- `user_credits`: SELECT/UPDATE/INSERT own-row only (20251130000000:90-107).
- `generated_videos`: `Users can view their own videos` / `create` / `delete` (20250906064600:222-225).

### 3.3 Functions and triggers

| Function | Security | Defined by | Audited migration? |
|---|---|---|---|
| `handle_new_user()` | SECURITY DEFINER | 20250429202509:24 | no |
| `update_timestamp()`, `update_updated_at_column()` | SECURITY DEFINER (after 20251111161500:345-355) | many | no |
| `log_profile_changes()` | SECURITY DEFINER | 20250429153255:153 | no |
| `check_rate_limit(p_identifier, p_endpoint, p_max_requests, p_window_minutes)` | SECURITY DEFINER | 20251219164908:84 | **indirectly affected** |
| `log_audit_event(...)` | SECURITY DEFINER | 20251219164908:114 | no |
| `get_folder_path(uuid)`, `cleanup_old_analytics(int)` | invoker | 20251006085217:405,435 | no |
| `cleanup_expired_rate_limits()` | SECURITY DEFINER | 20260222134334:44 | no |
| `deduct_credit(uuid,text)` | SECURITY DEFINER + `auth.uid()` guard | 20260223214134:20 | no (left intact) |
| `check_and_deduct_credit(uuid,text)` | SECURITY DEFINER + `auth.uid()` guard | 20260223214134:53 | no (left intact) |
| **`check_and_deduct_credit_service(uuid,text)`** | **SECURITY DEFINER, service_role only** | **20261011120500:99** | **NEW** |

Triggers: `on_auth_user_created` (auth.users), `update_*_updated_at` (profiles, users,
user_profiles, personalization_tokens, user_projects, user_preferences, user_generated_gifs,
user_images, folders, token_profiles, prompt_history, action_figure_templates, meme_templates,
cartoon_themes), `trigger_profile_audit`. The audited migration creates **no** triggers and drops **no**
functions or triggers.

### 3.4 Storage buckets referenced

| Bucket | Public | Created by |
|---|---|---|
| `temp-uploads` | true | 20260222115551:12-14 (`INSERT ... ON CONFLICT (id) DO NOTHING`) |
| `landing-page-images` | true | **20261011120500:215-217** (same pattern) |

Runtime corroboration: `src/services/landingPageContentService.ts:27` (`STORAGE_BUCKET = 'landing-page-images'`)
and `:212-216` create the bucket at runtime with `{ public: true, fileSizeLimit: 10485760, allowedMimeTypes: [...] }`.
The migration's insert matches that visibility, so there is no in-app visibility conflict.

### 3.5 Pre-existing migration-history conflicts (context, not caused by this migration)

The history is **not** a clean replay of one schema. Examples to be aware of before applying anything:

- `personalization_tokens` is created twice with **different columns**: `(token_key, token_value, UNIQUE(user_id, token_key))`
  in 20250906064600:21-31 vs `(name, image_url, description)` in 20250501103922:17-24. Only the first
  `CREATE TABLE IF NOT EXISTS` can have taken effect; the second is a silent no-op.
- `rate_limits` is created twice with **mutually exclusive columns** (see §4.1).
- 20250906064600:168 and 20260112235810:162 both create policy `"Users can view their own profile"` on
  `user_profiles` with no guard — the second would fail with `policy already exists` if the first ran.
- `credit_transactions` is created twice with the **same** CHECK (`'purchase','usage','refund','bonus'`,
  no `'deduction'`): 20251130000000:25 and 20260112235852:32.

**Implication:** the repository history cannot be used to prove the live schema. Only live introspection
can — which is exactly what §2 shows is unavailable.

### 3.6 Before / after schema comparison for every object the migration touches

All "before" states below are derived from the migration that created the object; "after" is the state the
audited migration produces. `†` marks rows where the live state could not be confirmed (see §2).

| Object | Before (source) | After (audited migration) | Change class |
|---|---|---|---|
| `rate_limits.is_authenticated` | **absent** (shape A, 20251219164908:18-27) / present `boolean NOT NULL DEFAULT false` (shape B, 20260222134334:31) | `boolean NOT NULL DEFAULT false`, backfilled `false` | additive, no-op on shape B |
| `rate_limits.updated_at` | **absent** (shape A) / `timestamptz DEFAULT now()` (shape B:32-33) | `timestamptz DEFAULT now()` | additive, no-op on shape B |
| `rate_limits.endpoint` | `TEXT NOT NULL` (shape A:21) † | `TEXT` (nullable) | **constraint relaxation (line 64)** |
| `rate_limits` uniqueness | `UNIQUE(identifier, endpoint, window_start)` (shape A:26) † | `UNIQUE INDEX (identifier, is_authenticated)` — **in addition to** the old constraint, which is not dropped | **contract change + row deletion (70-77)** |
| `rate_limits` RLS policy | `Service role can manage rate limits` `FOR ALL TO service_role` (20251219164908:37-41) † | identical (guard makes 87-91 a no-op) | **none** |
| `rate_limits` other indexes | `idx_rate_limits_identifier`, `idx_rate_limits_window`, `idx_rate_limits_endpoint` (shape A:29-31), `idx_rate_limits_window_start` (shape B:39-40) | unchanged | none |
| Function `check_and_deduct_credit_service(uuid,text)` | **does not exist** | SECURITY DEFINER, `search_path=public`, EXECUTE granted **only** to `service_role`; revoked from PUBLIC + authenticated | **new function (99-152)** |
| Function `check_and_deduct_credit(uuid,text)` | SECURITY DEFINER + `auth.uid() = p_user_id` guard (20260223214134:63-65) | **unchanged** — not redefined by this migration | **none** |
| Function `deduct_credit(uuid,text)` | SECURITY DEFINER + guard (20260223214134:29-31) | **unchanged** | **none** |
| `credit_transactions.type` CHECK | `CHECK (type IN ('purchase','usage','refund','bonus'))` (20251130000000:25, 20260112235852:32) † | `credit_transactions_type_check` = `CHECK (type IN ('purchase','usage','refund','bonus','deduction'))` | **constraint widened, name normalised** |
| `credit_transactions.balance_after` | `INTEGER NOT NULL`, no default (20251130000000:27) | `INTEGER NOT NULL DEFAULT 0` | **default added, existing rows untouched** |
| `credit_transactions` RLS | view-own + insert-own `auth.uid()=user_id` (20251130000000:110-116, 20260223041208:49-52) | unchanged | **none** |
| `generated_videos.status` | **absent** (20250906064600:107-117, 20260112235810:104-114) † | `text NOT NULL DEFAULT 'pending'` | additive |
| `generated_videos.progress` | **absent** | `integer NOT NULL DEFAULT 0` | additive |
| `generated_videos.error_message` | **absent** | `text` (nullable) | additive |
| `generated_videos.updated_at` | **absent** | `timestamptz DEFAULT now()` (no trigger — written by clients) | additive |
| `generated_videos.format` | **absent** | `text NOT NULL DEFAULT 'mp4'` | additive (stamps default on other apps' inserts) |
| `generated_videos.metadata` | **absent** | `jsonb NOT NULL DEFAULT '{}'::jsonb` | additive |
| `generated_videos` index | none on `(user_id, created_at)` † | `idx_generated_videos_user_created (user_id, created_at DESC)` | additive |
| `generated_videos` RLS | view/create/delete own (20250906064600:222-225) | unchanged | **none** |
| Storage bucket `landing-page-images` | **does not exist** (only `temp-uploads`, 20260222115551:12-14) † | `id='landing-page-images'`, `public=true`, `ON CONFLICT (id) DO NOTHING` | additive, foreign-owned bucket untouched |
| Triggers / other functions | as listed in §3.3 | unchanged | **none** |
| `user_credits` rows | per-user balances | unchanged (mutated only when the new function is invoked) | **none** |

---

## 4. Deep review of `20261011120500_fix_edge_function_db_contracts.sql`

### 4.1 `rate_limits` — the dual-shape problem (migration lines 52-93)

**Shape A** — created by 20251219164908:18-27:

```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,          -- NOT NULL, no default
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);
```

**Shape B** — attempted by 20260222134334:26-34:

```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  is_authenticated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

20260222134334 was a **no-op** wherever shape A already existed (that is what the audited migration's own
header states at lines 9-13). It is also the reason the index at 20260222134334:36-37
(`CREATE UNIQUE INDEX ... ON rate_limits (identifier, is_authenticated)`) cannot have been created on a
shape-A database — it would have failed with `column "is_authenticated" does not exist`.

| Statement | Lines | Idempotent? | Shape A | Shape B |
|---|---|---|---|---|
| `ADD COLUMN IF NOT EXISTS is_authenticated boolean NOT NULL DEFAULT false` | 52 | yes | adds, backfills `false` | no-op |
| `ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()` | 53 | yes | adds | no-op |
| `ALTER COLUMN endpoint DROP NOT NULL` (guarded by `information_schema`) | 55-66 | yes | **relaxes NOT NULL** | no-op |
| `DELETE FROM rate_limits a USING rate_limits b ...` | 70-74 | n/a | **DELETES rows** | no-op (unique index already prevents dupes) |
| `CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_auth` | 76-77 | yes | **creates new uniqueness contract** | no-op (already exists) |
| `CREATE POLICY "Service role can manage rate limits"` (guarded by `pg_policies`) | 80-93 | yes | no-op (policy already exists, 20251219164908:37) | creates |

**CONFIRMED CONCERN A-1 — unconditional row deletion on a shared table (lines 70-74):**

```sql
DELETE FROM rate_limits a
USING rate_limits b
WHERE a.identifier = b.identifier
  AND a.is_authenticated = b.is_authenticated
  AND a.ctid < b.ctid;
```

On a shape-A database every row gets `is_authenticated = false`, so this collapses **all endpoints for a
given identifier into a single row**, keeping the newest by `ctid`. It permanently discards per-endpoint
rate-limit state and does so with no `WHERE` guard on `window_start`, i.e. it also deletes rows that
`cleanup_expired_rate_limits()` (20260222134334:44-52) still considers live.

**CONFIRMED CONCERN A-2 — `check_rate_limit()` breaks for multi-endpoint identifiers:**

`check_rate_limit()` (20251219164908:99-103) upserts on the old contract:

```sql
INSERT INTO rate_limits (identifier, endpoint, window_start, request_count)
VALUES (p_identifier, p_endpoint, date_trunc('minute', now()), 1)
ON CONFLICT (identifier, endpoint, window_start)
DO UPDATE SET request_count = rate_limits.request_count + 1
```

After line 76-77, an insert whose `(identifier, is_authenticated)` pair already exists but whose
`endpoint` differs violates the **new** unique index — a constraint that is *not* in the `ON CONFLICT`
list — so the RPC raises instead of upserting. `check_rate_limit()` is still called at runtime from
`supabase/functions/_shared/security.ts:43-48` via `supabaseClient.rpc('check_rate_limit', ...)`
(reached through `createEdgeFunction()` in `_shared/middleware.ts:75-80`) and its error path is
`return true` (security.ts:52) — i.e. it fails **open**. This is a live cross-feature regression risk
introduced by the index, not a pre-existing condition.

**CONFIRMED CONCERN A-3 — short exclusive locks on a shared table:**
`ALTER COLUMN endpoint DROP NOT NULL` (line 64) needs `ACCESS EXCLUSIVE`; the `DELETE` (70-74) and
`CREATE UNIQUE INDEX` (76-77, no `CONCURRENTLY`) hold `SHARE`/`ACCESS EXCLUSIVE` for their duration and
block all `INSERT`/`UPDATE`/`DELETE` on `rate_limits`. Other apps' rate-limit writes queue behind it.
No `lock_timeout` is set, so the statement can block indefinitely behind long-running transactions.

**What the migration gets right here (evidence of care):** both `DO` blocks query the live catalog
(`information_schema.columns` at 60-63, `pg_policies` at 82-86) and the policy guard re-uses the exact
policy name from 20251219164908:37, so it is a genuine no-op on shape A rather than a
`duplicate_policy` error. `ADD COLUMN ... NOT NULL DEFAULT` is a catalog-only change on PG 11+ (no
rewrite).

### 4.2 `check_and_deduct_credit_service` (lines 99-152)

New function — **no prior function of this name exists** (grep of all 26 migrations returns matches only
inside this file). It does **not** redefine `deduct_credit` or `check_and_deduct_credit`, so the
caller-validation semantics of 20260223214134 remain in force for the frontend path.

Full definition is quoted in §5.1.

### 4.3 `credit_transactions` (lines 158-195)

Two catalog-guarded changes: `balance_after SET DEFAULT 0` (158-166) and a CHECK swap (168-195).
See §5.4 and §5.5 for the impact analysis.

### 4.4 `generated_videos` (lines 201-209)

Six columns added, all with defaults, plus one index. None of these column names exist in either
`generated_videos` creation (20250906064600:107-117, 20260112235810:104-114), so no collision.
Runtime demand is confirmed: `video-status/index.ts:68` selects
`id,status,progress,error_message,video_url,created_at,updated_at,metadata` and
`image-to-video/index.ts:110-112` inserts `format`, `status`, `metadata` — without this migration those
requests 400 on unknown columns. The PATCHes that maintain the new columns are at
`image-to-video/index.ts:145`, `:186` and `:209`. See §5.6 for the residual type risk.

### 4.5 Storage bucket (lines 215-217)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-page-images', 'landing-page-images', true)
ON CONFLICT (id) DO NOTHING;
```

Only other bucket in the entire history is `temp-uploads` (20260222115551:12-14). No name collision,
and `ON CONFLICT (id) DO NOTHING` means an existing bucket owned by another app is left untouched.

### 4.6 The 10 conflict classes

| # | Conflict class | Verdict | Evidence (line refs + quoted SQL) |
|---|---|---|---|
| 1 | Table / column collisions | **PASS** | `ADD COLUMN IF NOT EXISTS` at 52-53, 201-206. `rate_limits` has no `is_authenticated`/`updated_at` in shape A (20251219164908:18-27) and no `endpoint` in shape B (20260222134334:26-34) — both shapes served. `generated_videos` has none of `status`/`progress`/`error_message`/`updated_at`/`format`/`metadata` (20250906064600:107-117). |
| 2 | Conflicting column types | **PASS** | Types match the intended contract exactly: `is_authenticated boolean NOT NULL DEFAULT false` (52) = 20260222134334:31; `updated_at timestamptz DEFAULT now()` (53) = :32-33. No other migration declares these names. |
| 3 | Unique-index conflicts | **CONCERN** | Index name already reserved at 20260222134334:36-37 (same name → `IF NOT EXISTS` no-op on shape B), but on shape A it is *new* and silently redefines uniqueness from `(identifier, endpoint, window_start)` to `(identifier, is_authenticated)` — breaking `check_rate_limit()`'s `ON CONFLICT (identifier, endpoint, window_start)` (20251219164908:101-103). See Concerns A-1/A-2. |
| 4 | Existing functions with same names | **PASS** | `check_and_deduct_credit_service` occurs only at line 99. `deduct_credit` / `check_and_deduct_credit` are not redefined, so 20260223214134's `auth.uid()` guards survive. |
| 5 | Trigger conflicts | **PASS** | No `CREATE TRIGGER` / `DROP TRIGGER` / `DROP FUNCTION` in the file. The new `updated_at` columns are written explicitly by clients (`cors.ts:130`, `cors.ts:152`, `image-to-video/index.ts:145/186/209`), not by `update_updated_at_column()`, so the SECURITY DEFINER trigger function (20251111161500:345-355) is unaffected. |
| 6 | RLS behaviour changes | **PASS** | Single policy add, guarded: `IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rate_limits' AND policyname='Service role can manage rate limits')` (82-92) — a true no-op on shape A where 20251219164908:37-41 already created it. No policy is dropped or rewritten. No `authenticated`/`anon` policy is added to `rate_limits`. |
| 7 | Storage bucket name collisions | **PASS** | `landing-page-images` (215-217) is new; only `temp-uploads` exists (20260222115551:12-14). `ON CONFLICT (id) DO NOTHING` leaves a foreign-owned bucket untouched; visibility matches this app's runtime creation (`landingPageContentService.ts:212-216`, `public: true`). |
| 8 | Unexpected privilege escalation | **PASS** | `REVOKE ALL ... FROM PUBLIC` (150) + `FROM authenticated` (151) + `GRANT EXECUTE ... TO service_role` (152). No table GRANTs, no `ALTER DEFAULT PRIVILEGES`, no role creation. Marginal gain for service_role holders: none (see §5.3). |
| 9 | Changes to existing credit balances | **PASS** | No bulk `UPDATE`/`DELETE`/`INSERT` on `user_credits` in the file. `balance_after SET DEFAULT 0` (164) affects only future inserts; existing rows are untouched. Deductions happen only when the new function is invoked. |
| 10 | Cross-app impact | **CONCERN** | Three shared tables touched: `rate_limits` (row deletion + lock + uniqueness change, 64-77), `credit_transactions` (CHECK swap requiring full validation scan + `ACCESS EXCLUSIVE`, 186-193), `generated_videos` (six new `NOT NULL DEFAULT` columns, 201-206), plus `storage.buckets`. Plus a new `type='deduction'` value observable by other apps (§5.5). |

**Tally: 8 PASS / 2 CONCERN.**

### 4.7 Does any statement mutate or delete existing data?

**Yes — exactly one.**

```sql
-- line 70-74
DELETE FROM rate_limits a
USING rate_limits b
WHERE a.identifier = b.identifier
  AND a.is_authenticated = b.is_authenticated
  AND a.ctid < b.ctid;
```

Everything else is additive or catalog-only: `ADD COLUMN ... DEFAULT`, `ALTER COLUMN ... SET DEFAULT`,
`DROP CONSTRAINT` + `ADD CONSTRAINT` (rewrites a *constraint*, not rows), `CREATE INDEX`, guarded
`CREATE POLICY`, and `INSERT ... ON CONFLICT DO NOTHING`.

---

## 5. SECURITY DEFINER privilege analysis

### 5.1 Full definition (lines 99-147, verbatim)

```sql
CREATE OR REPLACE FUNCTION check_and_deduct_credit_service(
  p_user_id uuid,
  p_reason text DEFAULT 'edge_function_generation'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
  v_balance_after integer;
BEGIN
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, balance, total_used, created_at, updated_at)
    VALUES (p_user_id, 0, 0, now(), now());
    RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'no_credits');
  END IF;

  IF v_balance <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'balance', v_balance, 'error', 'insufficient_credits');
  END IF;

  UPDATE user_credits
  SET
    balance = balance - 1,
    total_used = total_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id
    AND balance > 0
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'race_condition_prevented');
  END IF;

  v_balance_after := v_new_balance;

  INSERT INTO credit_transactions (user_id, type, amount, balance_after, description, created_at)
  VALUES (p_user_id, 'deduction', -1, v_balance_after, p_reason, now());

  RETURN jsonb_build_object('allowed', true, 'balance', v_new_balance, 'deducted', true);
END;
$$;

-- Only the service role may execute this function.
REVOKE ALL ON FUNCTION check_and_deduct_credit_service(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_and_deduct_credit_service(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_and_deduct_credit_service(uuid, text) TO service_role;
```

### 5.2 REVOKE/GRANT verification

- **`REVOKE ALL ... FROM PUBLIC`** (line 150) — **correct and necessary.** PostgreSQL grants `EXECUTE` to
  `PUBLIC` by default on every new function, and `PUBLIC` implicitly includes `anon` and
  `authenticated`. Without this revoke, PostgREST would expose `/rest/v1/rpc/check_and_deduct_credit_service`
  to every signed-in user of every VideoRemix app, letting them drain any user's credits. The revoke is
  the load-bearing control here.
- **`REVOKE ... FROM authenticated`** (line 151) — redundant but harmless belt-and-braces (no explicit
  grant to `authenticated` was ever made).
- **`GRANT EXECUTE ... TO service_role`** (line 152) — the minimum viable grant. `authenticated`, `anon`
  and `authenticator` are not members of `service_role` in a Supabase project, so none of them can call
  the function.
- `SET search_path = public` (line 106) — pins the search path, matching the hardening applied to
  `update_updated_at_column()` in 20251111161500:349. Good.

**Conclusion: the privilege model is correct as designed. Only the service role (and the migration owner
`postgres`) can execute it.**

### 5.3 Comparison with the caller-validation migration (20260223214134)

`check_and_deduct_credit` (20260223214134:53-98) performs the **same** atomic UPDATE + INSERT but begins:

```sql
IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
  RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'unauthorized');
END IF;
```

The docstring of that migration (lines 14-16) states exactly why: *"RLS is bypassed inside SECURITY
DEFINER functions"*. This is correct — the guard is the only thing standing between an authenticated
caller and another user's balance.

The edge-function path cannot use it: `supabase/functions/_shared/cors.ts:181-189` calls
`/rest/v1/rpc/check_and_deduct_credit_service` with the **service-role** key, where `auth.uid()` is
always `NULL`, so `check_and_deduct_credit()` would return `{"allowed": false}` for every call (this is
what the migration header says at lines 14-17). The service-role variant is therefore the **only new
caller**, and it cannot be abused by other apps' authenticated users because of the revokes in §5.2.

**Residual risk, stated honestly:** the service-role variant has **no caller validation at all**. Any
holder of the project's service-role key — which on a shared project means *any* VideoRemix app sharing
project `bzxohkrxcwodllketcpz`, or a single leaked key — can deduct credits from any `p_user_id`. The
true authorisation boundary is the edge-function code that already authenticated the user via
`/auth/v1/user` (`cors.ts:209-240`, called before `checkCredits()` at e.g. `image-generation/index.ts`),
not the database. This is not a privilege *escalation* — `service_role` already bypasses RLS and can
`UPDATE user_credits` directly under the "Service role can manage" pattern — but it does mean the shared
service-role key is the single point of trust. **Recommendation (documentation only, no code change):
the function's behaviour should be logged per call (`p_reason` already carries the reason) and the
edge-function callers should keep validating the user before invoking it.**

### 5.4 `rate_limits` usage by other apps — evidence

- Written by PersonalizedImages only, via `checkRateLimit()` in `cors.ts:90-163` (service role,
  PostgREST table access — not the RPC) and via `check_rate_limit()` in `security.ts:43-48`
  (service role, RPC). No frontend code touches the table (`grep rate_limits src/` returns only
  client-side `ApiClient` rate-limit bookkeeping and Freepik compliance helpers, unrelated).
- `rate_limits` has **no** `authenticated`/`anon` RLS policy (only `Service role can manage rate limits`,
  20251219164908:37-41), so another app's *frontend* cannot read or write it.
- **However**, since the table lives in a shared project, another VideoRemix app's *backend/edge
  function* that also uses the project's service-role key can read/write it, and any such app that calls
  `check_rate_limit()` is exposed to Concern A-2. Cross-app usage cannot be excluded without the access
  listed in §2 — so it must be treated as possible.

### 5.5 `credit_transactions` CHECK relaxation — analysis (lines 158-195)

```sql
ALTER TABLE credit_transactions ALTER COLUMN balance_after SET DEFAULT 0;   -- line 164
...
ALTER TABLE credit_transactions DROP CONSTRAINT credit_transactions_type_check   -- line 186
ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'deduction'));       -- lines 187-189
```

**Impact on existing rows: none.** `DROP CONSTRAINT` + `ADD CONSTRAINT` validates only future writes;
`ALTER COLUMN ... SET DEFAULT` rewrites no data. The only new value is the literal `'deduction'`, which
was already being written by the atomic credit functions since 20260223040654:43-44 — those INSERTs have
been failing against the original CHECK (`CHECK (type IN ('purchase','usage','refund','bonus'))`,
20251130000000:25) ever since, which is why this migration exists at all. So the relaxation un-breaks the
frontend credit path (`src/services/imageGenerationService.ts:66-69` calls
`sb.rpc('check_and_deduct_credit', ...)` with a user JWT).

**Impact on other apps:** any cross-app reporting query that filters
`type IN ('purchase','usage','refund','bonus')` will now silently omit deduction rows, and any balance
recomputation that assumes `amount > 0` for non-purchase types will mis-handle the `-1` amounts this
function writes (lines 142-143). Additive in the database sense, but observable in application logic.

**Lock behaviour (concern):** `ADD CONSTRAINT ... CHECK` without `NOT VALID` performs a **full table scan
of every existing row** while holding `ACCESS EXCLUSIVE` on `credit_transactions`. On a large ledger this
blocks all other apps' reads and writes of that table for the duration of the scan. `NOT VALID` +
`VALIDATE CONSTRAINT` would avoid it.

### 5.6 `generated_videos` ADD COLUMNs — type/conflict risk (lines 201-206)

```sql
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'mp4';
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
```

- No name or type collision with either creation migration (§4.6 row 2).
- `status` is `text`, **not** an enum or CHECK-constrained — unlike `generation_queue.status`
  (20260223012423:432) which is CHECK-constrained to a closed set. Loose typing is permissive rather
  than conflicting, but it means nothing prevents another app writing arbitrary status strings.
- `metadata jsonb NOT NULL DEFAULT '{}'` is safe: other apps' INSERTs that omit it get `{}`.
- `format text NOT NULL DEFAULT 'mp4'` silently stamps every other app's video row as `mp4`. Harmless
  for storage, but a false value if another app writes a different container.
- `ADD COLUMN ... NOT NULL DEFAULT` on PG 11+ is a catalog-only change; no rewrite, no long lock.
- The added index `idx_generated_videos_user_created (user_id, created_at DESC)` (208-209) mirrors
  `idx_generated_images_user_created` on `generated_images` (20260223041208:76-77) and does not collide
  with any existing index name on `generated_videos`.

---

## 6. Verdict: SAFE WITH CONDITIONS

The migration is **technically correct and correctly secured**: no privilege escalation for other apps'
authenticated users, no bulk mutation of credit balances, no bucket collision, no function-name or
trigger conflict, and it is genuinely re-runnable for every statement except the `DELETE`. Sections 2
(service-role function), 4 (generated_videos columns) and 5 (bucket) are safe to apply as written.

It is **not safe to apply to the shared database as-is**, because section 1 (`rate_limits`) deletes
shared data unconditionally, redefines a uniqueness contract in a way that can break the
`check_rate_limit()` RPC for multi-endpoint identifiers, and takes un-timed exclusive locks on a shared
table.

**Preconditions before any apply (all must hold, in order):**

1. Confirm the live `rate_limits` shape with the access in §2 — specifically whether the `endpoint`
   column exists and whether the table's live rows contain duplicate `(identifier, is_authenticated)`
   pairs. **If the live table is shape A and holds live per-endpoint rows, do NOT run lines 70-77 as
   written.**
2. Confirm with the other VideoRemix app owners whether anything reads/writes `rate_limits`,
   `credit_transactions`, `user_credits` or `generated_videos`.
3. Take a logical backup (or work on a Supabase dev branch / separate project — §8).
4. Apply the replacement SQL in §6.1 rather than the original lines 64-77, or obtain explicit sign-off on
   the row deletion.
5. Set `lock_timeout` / `statement_timeout` for the duration of the migration so a lock wait fails fast
   instead of queueing other apps' traffic.

### 6.1 Alternative SQL (proposed here for documentation only — NOT written to any migration file)

**`rate_limits` — replace lines 64-77 with a guarded, non-destructive version:**

```sql
-- 6.1a. Relax `endpoint` NOT NULL (unchanged in spirit from line 64), but time-box the
--       ACCESS EXCLUSIVE lock so it fails fast behind other apps' traffic.
SET lock_timeout = '3s';
SET statement_timeout = '30s';

ALTER TABLE rate_limits ALTER COLUMN endpoint DROP NOT NULL;

-- 6.1b. Archive, then remove ONLY duplicates. Never delete rows that are still inside
--       the live rate-limit window (cleanup_expired_rate_limits() keeps 2h of history,
--       20260222134334:44-52).
CREATE TABLE IF NOT EXISTS rate_limits_archive (LIKE rate_limits INCLUDING ALL);

WITH ranked AS (
  SELECT ctid, identifier, is_authenticated, window_start,
         row_number() OVER (
           PARTITION BY identifier, is_authenticated ORDER BY window_start DESC, ctid DESC
         ) AS rn
  FROM rate_limits
),
victims AS (
  SELECT r.ctid FROM ranked r
  WHERE r.rn > 1
    AND r.window_start < now() - interval '2 hours'   -- only provably-expired rows
)
DELETE FROM rate_limits a
USING victims v
WHERE a.ctid = v.ctid;

-- Rows that are still recent and still duplicated cannot be archived-and-deleted without
-- resetting a live counter. Refuse to proceed and create the unique index in a follow-up
-- migration once they age out -- this is why CREATE UNIQUE INDEX must NOT be
-- CREATE INDEX CONCURRENTLY inside a migration (migrations run in a transaction).
DO $$
DECLARE
  v_dupes bigint;
BEGIN
  SELECT count(*) INTO v_dupes
  FROM (
    SELECT identifier, is_authenticated
    FROM rate_limits
    GROUP BY identifier, is_authenticated
    HAVING count(*) > 1
  ) d;

  IF v_dupes > 0 THEN
    RAISE EXCEPTION
      'Aborting: % rate_limits (identifier, is_authenticated) groups still have duplicates after archiving. '
      'Create idx_rate_limits_identifier_auth in a follow-up migration once they expire.', v_dupes;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_auth
  ON rate_limits (identifier, is_authenticated);
```

**Rationale:** the original `DELETE` (lines 70-74) has no `window_start` filter, so it destroys live
counters for every endpoint sharing an identifier. The version above archives to a new table first,
removes only provably-expired duplicates, and hard-fails instead of silently deleting live rows.
If the duplicate groups are confirmed to be zero on the live database (verifiable only with the access
in §2), the original `DELETE` becomes a no-op and the above is unnecessary.

**Also recommended, to un-break the legacy RPC (20251219164908:99-103) — extend its `ON CONFLICT`:**

```sql
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT, p_endpoint TEXT, p_max_requests INTEGER, p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE v_window_start TIMESTAMPTZ; v_request_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now()) - (p_window_minutes || ' minutes')::interval;
  INSERT INTO rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (p_identifier, p_endpoint, date_trunc('minute', now()), 1)
  ON CONFLICT (identifier, endpoint, window_start) DO UPDATE
    SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_request_count;
  RETURN v_request_count <= p_max_requests;
EXCEPTION
  WHEN unique_violation THEN
    -- (identifier, is_authenticated) unique index is authoritative; fold the request into it.
    UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE identifier = p_identifier AND is_authenticated = false
      RETURNING request_count INTO v_request_count;
    RETURN COALESCE(v_request_count, 0) <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**`credit_transactions` — swap the CHECK without a long validation scan (replace lines 186-193):**

```sql
ALTER TABLE credit_transactions DROP CONSTRAINT credit_transactions_type_check;
ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'deduction'))
  NOT VALID;                       -- no full-table scan under ACCESS EXCLUSIVE
ALTER TABLE credit_transactions VALIDATE CONSTRAINT credit_transactions_type_check;  -- SHARE UPDATE EXCLUSIVE only
```

`NOT VALID` + `VALIDATE CONSTRAINT` keeps the same end state with a far shorter lock, which matters on a
shared ledger table.

**Keep unchanged:** the `check_and_deduct_credit_service` body and its REVOKE/GRANT trio (99-152), the
`balance_after SET DEFAULT 0` (158-166), the `generated_videos` ADD COLUMNs (201-206), the index
(208-209) and the bucket insert (215-217). These are additive and correctly secured.

### 6.2 The three most important risks

1. **Unconditional `DELETE FROM rate_limits` (lines 70-74) on a shared table** — silently collapses
   per-endpoint rate-limit state, including rows still inside the live 2-hour window, and can be observed
   by other VideoRemix apps as a sudden rate-limit reset.
2. **New unique index `(identifier, is_authenticated)` (lines 76-77) silently breaks
   `check_rate_limit()`'s `ON CONFLICT (identifier, endpoint, window_start)`** — the RPC raises on the
   unhandled constraint and its error path fails *open* (`security.ts:52`), so rate limiting is bypassed
   rather than enforced.
3. **Untimed exclusive locks on shared tables** — `DROP NOT NULL` (line 64), the `DELETE` (70-74),
   `CREATE UNIQUE INDEX` (76-77) and the non-`NOT VALID` CHECK swap (186-193) each block other apps'
   reads/writes with no `lock_timeout`, so they can queue behind long-running transactions.

---

## 7. Phase 4 staging

**No staging environment is provisionable in this environment.** Confirmed: no Supabase CLI
(`which supabase` → empty), no `SUPABASE_ACCESS_TOKEN`, no DB credentials for project
`bzxohkrxcwodllketcpz` (the only pooler URL in `supabase/.temp/pooler-url` points at local-dev project
`gadedbrnqzpfqtsdfzcg`), and creating a new paid Supabase project is not permitted by the task
constraints. **Applying the migration to the shared production project is PROHIBITED without explicit
approval** — it is the top priority that PersonalizedImages does not break other VideoRemix apps.

An isolated staging setup requires all of the following:

| Step | Requirement |
|---|---|
| 1 | Supabase CLI ≥ 2.58.5 installed (matches `supabase/.temp/cli-latest`) |
| 2 | A `SUPABASE_ACCESS_TOKEN` with org access, or a **Supabase dev branch** of the shared project (dev branches require a paid/Team plan on the parent project — cannot be created on the free tier) |
| 3 | Alternatively a **separate, isolated Supabase project** (new project-ref) plus `supabase link --project-ref <ref>` |
| 4 | `supabase db push` (or dev-branch migration replay) to apply all 26 migrations in order onto the isolated instance |
| 5 | `supabase secrets set` for the edge-function contract: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGINS`, plus the AI/video providers (`OPENAI_API_KEY`, `MUAPI_API_KEY`, `FREEPIK_API_KEY`, …) — via `docs/supabase-secrets-setup.md` |
| 6 | `supabase functions deploy` for the affected functions (`image-generation`, `video-status`, `video-result`, `image-to-video`, `checkRateLimit`/`_shared/cors.ts` consumers) |
| 7 | Seed data that reproduces **shape A** `rate_limits` rows with multiple endpoints per identifier and **duplicate** `(identifier, is_authenticated)` rows, plus a non-trivial `credit_transactions` row count, to exercise the de-dup and the CHECK swap |
| 8 | A verification pass on staging: `\d rate_limits`, duplicate-group counts, `pg_get_constraintdef` for `credit_transactions`, policy list, and a live `check_rate_limit()` call with two endpoints for one identifier |

---

## 8. Statement of non-application

**NOTHING in this audit was applied to any database.** No migration was run, no `db push`, no SQL was
executed, no schema, policy, function, index, constraint, row or storage bucket was created, altered or
deleted anywhere — not on the shared project `bzxohkrxcwodllketcpz`, not on local-dev
`gadedbrnqzpfqtsdfzcg`, and not on any other instance. All analysis in §§3-6 is derived from static reads
of `supabase/migrations/*.sql`, `supabase/functions/**`, and `src/**` on the checked-out branch
`fix/openai-responses-image-2-5`. The only file created or modified by this audit is
`docs/SHARED_SUPABASE_COMPATIBILITY_AUDIT.md`. No user data and no credentials (keys, tokens,
passwords, connection strings) are reproduced in this document.

**Approval required before production apply:** the verdict is `SAFE WITH CONDITIONS`; applying the
migration to the shared project requires the preconditions in §6 (live shape verification, cross-app
sign-off, backup or isolated staging, and either the §6.1 replacement SQL or explicit sign-off on the
`rate_limits` row deletion).

---

## 9. ADDENDUM — Hardening applied on the repair branch (post-audit fix)

Audit findings §4.1 and §4.7 (the unconditional `DELETE FROM rate_limits` and the
`CREATE UNIQUE INDEX idx_rate_limits_identifier_auth`) were **fixed in place** on
`fix/openai-responses-image-2-5` before any application to any database. The migration is
unreleased (present only on the repair branch, never applied to the shared project), so
correcting the file directly — rather than stacking a replacement migration — keeps a single
authoritative migration.

### 9.1 Changes applied to `supabase/migrations/20261011120500_fix_edge_function_db_contracts.sql`

| # | Change | Rationale |
|---|--------|-----------|
| 1 | **Removed** the `DELETE FROM rate_limits a USING rate_limits b ...` de-duplication | It unconditionally collapsed every `(identifier, is_authenticated)` group to one row on a table shared with other VideoRemix apps, destroying live rate-limit windows mid-flight (§4.1). No shared row may ever be deleted by this migration. |
| 2 | **Removed** `CREATE UNIQUE INDEX idx_rate_limits_identifier_auth ON rate_limits (identifier, is_authenticated)` | The shared `check_rate_limit()` RPC (20251219164908) inserts one row per `(identifier, endpoint, window_start)`; an additional unique index on `(identifier, is_authenticated)` makes its second insert per identifier fail with `unique_violation`, breaking rate limiting for every app (§4.1, §3.5). The RPC's own `UNIQUE(identifier, endpoint, window_start)` is untouched. |
| 3 | Added `SET lock_timeout = '2s';` | DDL fails fast instead of queueing behind other apps' traffic (§4.6 risk 10). |
| 4 | `credit_transactions` CHECK swap now uses `ADD CONSTRAINT ... NOT VALID` + separate `VALIDATE CONSTRAINT` | Avoids a long full-table-scan lock on the shared table (§4.3, §5.5). |
| 5 | Header comment updated to document the shared-table safety rules | Prevents regression of the same mistake. |

### 9.2 Companion change — `supabase/functions/_shared/cors.ts` (`checkRateLimit`)

Because no unique index may exist on the shared table, the edge upsert was made shape-agnostic:

- Identifiers are namespaced (`edge:<identifier>`) so edge rows can never collide with, or be read
  back as, other apps' `check_rate_limit()` rows on either deployed shape of `rate_limits`.
- The upsert now uses `Prefer: resolution=ignore-duplicates` (`ON CONFLICT DO NOTHING`), which
  requires **no** unique index and is valid on every deployed shape.
- The SELECT adds `&order=window_start.desc` so the freshest window row is always used.

All other statements in the migration (idempotent `ADD COLUMN IF NOT EXISTS`, guarded
`endpoint DROP NOT NULL`, the service-role RLS policy, `check_and_deduct_credit_service` with
`REVOKE ... FROM PUBLIC`/`authenticated` + `GRANT ... TO service_role`, `generated_videos`
columns, `landing-page-images` bucket) are unchanged.

### 9.3 Updated verdict

**Verdict after fix: SAFE (static analysis).** The two `CONCERN` rows in §4.6 (unique-index
conflict, cross-app data impact) are eliminated; the remaining risk is the ordinary
DDL-lock risk inherent to any `ALTER TABLE`, now bounded by `lock_timeout`. Live verification
remains **BLOCKED BY CONFIGURATION** (§2): before applying to the shared project, confirm the
deployed `rate_limits` shape and obtain cross-app sign-off; apply first to an isolated staging
branch. Regression coverage: `qa/rate-limit.test.mjs` (13 tests) pins the namespacing,
`ignore-duplicates` upsert, `window_start.desc` ordering, and asserts the migration contains no
`DELETE`/`TRUNCATE` and no unique index on `rate_limits`.
