# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all confirmed security vulnerabilities from the TravelReady audit report.

**Architecture:** Fixes are organized by priority -- CRIT first, then HIGH, then MED/LOW. Each task is independent and can be implemented in isolation. Database changes go through Supabase migrations.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL + RLS), Node.js crypto

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/033_atomic_ai_usage.sql` | Create | Atomic increment SQL function |
| `src/lib/ai/usage.ts` | Modify | Replace TOCTOU with atomic RPC call |
| `src/app/api/ai/plan/route.ts` | Modify | Use new atomic usage function |
| `src/app/api/ai/cheap-dates/route.ts` | Modify | Use new atomic usage function |
| `src/app/api/visa/ai-answer/route.ts` | Modify | Use new atomic usage function |
| `src/app/api/visa/scraper/route.ts` | Modify | timingSafeEqual + empty secret guard |
| `src/components/map/hotel-map.tsx` | Modify | innerHTML -> textContent |
| `next.config.ts` | Modify | Add security headers + fix wildcard supabase.co |
| `src/app/api/images/search/route.ts` | Modify | Add admin role check |
| `src/app/api/visa/check/route.ts` | Modify | Remove hardcoded fallback URL |
| `src/app/api/news/route.ts` | Modify | Add pagination |
| `.github/workflows/visa-scraper.yml` | Modify | Sequential batch jobs |

---

### Task 1: Atomic AI Usage (CRIT-01)

**Files:**
- Create: `supabase/migrations/033_atomic_ai_usage.sql`
- Modify: `src/lib/ai/usage.ts`
- Modify: `src/app/api/ai/plan/route.ts`
- Modify: `src/app/api/ai/cheap-dates/route.ts`
- Modify: `src/app/api/visa/ai-answer/route.ts`

- [ ] **Step 1: Create migration with atomic SQL function**

Create `supabase/migrations/033_atomic_ai_usage.sql`:

```sql
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_usage_date DATE,
  p_limit INT
) RETURNS TABLE(allowed BOOLEAN, current_count INT) AS `$`$`
DECLARE
  v_count INT;
BEGIN
  INSERT INTO ai_daily_usage (user_id, feature, usage_date, request_count)
  VALUES (p_user_id, p_feature, p_usage_date, 1)
  ON CONFLICT (user_id, usage_date, feature)
  DO UPDATE SET
    request_count = ai_daily_usage.request_count + 1,
    updated_at = NOW()
  WHERE ai_daily_usage.request_count < p_limit
  RETURNING request_count INTO v_count;

  IF v_count IS NULL THEN
    SELECT request_count INTO v_count
    FROM ai_daily_usage
    WHERE user_id = p_user_id AND feature = p_feature AND usage_date = p_usage_date;

    RETURN QUERY SELECT FALSE, COALESCE(v_count, 0);
  ELSE
    RETURN QUERY SELECT TRUE, v_count;
  END IF;
END;
`$`$` LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Rewrite `src/lib/ai/usage.ts`**

Replace entire file. Keep `getAiUsage` for read-only queries. Add `assertAndIncrementAiLimit` that calls the atomic RPC. Remove `assertAiLimit` and `incrementAiUsage` (replaced by single atomic call).

Key function:

```typescript
export async function assertAndIncrementAiLimit(userId: string, feature: AiFeature) {
  const supabase = createAdminClient();
  const limit = AI_DAILY_LIMITS[feature];
  const usageDate = getBakuDate();

  const { data, error } = await supabase.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_feature: feature,
    p_usage_date: usageDate,
    p_limit: limit,
  });

  if (error) {
    console.error('AI usage atomic error:', { feature, code: error.code });
    return { allowed: false as const, limit, remaining: 0, count: limit };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = Boolean(row?.allowed);
  const count = Number(row?.current_count ?? 0);

  return { allowed, limit, remaining: allowed ? Math.max(limit - count, 0) : 0, count };
}
```

- [ ] **Step 3: Update all 3 AI routes (plan, cheap-dates, ai-answer)**

In each route:
- Import `assertAndIncrementAiLimit` instead of `assertAiLimit` + `incrementAiUsage`
- Call `assertAndIncrementAiLimit` BEFORE AI generation (atomic check+increment)
- Remove separate `incrementAiUsage` call after generation
- Update `remaining` in response to use `usageCheck.remaining`

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/033_atomic_ai_usage.sql src/lib/ai/usage.ts src/app/api/ai/plan/route.ts src/app/api/ai/cheap-dates/route.ts src/app/api/visa/ai-answer/route.ts
git commit -m "fix(security): atomic AI usage rate limiting (CRIT-01)"
```

---

### Task 2: CRON_SECRET Timing-Safe Verification (CRIT-02)

**Files:**
- Modify: `src/app/api/visa/scraper/route.ts`

- [ ] **Step 1: Add timing-safe secret verification**

Add `import { timingSafeEqual } from 'crypto';` at top.

Replace lines 109-112 with:
- Guard against missing/short CRON_SECRET (< 16 chars = config error, return 500)
- Guard against missing header (return 401)
- Use `timingSafeEqual` with Buffer comparison, equal-length check

- [ ] **Step 2: Commit**

```bash
git add src/app/api/visa/scraper/route.ts
git commit -m "fix(security): timing-safe CRON_SECRET verification (CRIT-02)"
```

---

### Task 3: Hotel Map XSS Fix (CRIT-03)

**Files:**
- Modify: `src/components/map/hotel-map.tsx`

- [ ] **Step 1: Replace innerHTML with safe DOM API**

Replace lines 68-71. Instead of `el.innerHTML`, use:
- `document.createElement('span')` with `textContent`
- Validate `marker.price` as number: `isFinite(Number(marker.price))`

- [ ] **Step 2: Commit**

```bash
git add src/components/map/hotel-map.tsx
git commit -m "fix(security): replace innerHTML with textContent in hotel map (CRIT-03)"
```

---

### Task 4: Security Headers + Supabase Wildcard (HIGH-04 + MED-04)

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add headers() and restrict supabase path**

- Restrict `*.supabase.co` to `/storage/v1/object/public/**` path
- Add `headers()` function with: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, CSP (appropriate directives for Next.js), HSTS

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "fix(security): CSP headers + restrict supabase image path (HIGH-04, MED-04)"
```

---

### Task 5: Image Search Admin Check (HIGH-02)

**Files:**
- Modify: `src/app/api/images/search/route.ts`

- [ ] **Step 1: Add admin role check**

After user check, query `profiles` table for role, reject non-admin with 403.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/images/search/route.ts
git commit -m "fix(security): restrict image search to admin only (HIGH-02)"
```

---

### Task 6: Remove Hardcoded VISA API URL (HIGH-03)

**Files:**
- Modify: `src/app/api/visa/check/route.ts`

- [ ] **Step 1: Remove fallback, require env var**

Remove `|| 'https://rough-sun-2523.fly.dev'`. Add 503 check if env var missing.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/visa/check/route.ts
git commit -m "fix(security): remove hardcoded VISA API fallback URL (HIGH-03)"
```

---

### Task 7: News API Pagination (MED-02)

**Files:**
- Modify: `src/app/api/news/route.ts`

- [ ] **Step 1: Add pagination**

Add `page`, `limit` query params. Use `.range(offset, offset + limit - 1)`. Return `{ data, page, limit, total, totalPages }`.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/news/route.ts
git commit -m "fix(security): add pagination to news API (MED-02)"
```

---

### Task 8: GitHub Actions Sequential Batches (MED-05)

**Files:**
- Modify: `.github/workflows/visa-scraper.yml`

- [ ] **Step 1: Add needs: dependencies**

Add `needs: scrape-batch-N` to each subsequent job. Add `sleep 30` step before each curl.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/visa-scraper.yml
git commit -m "fix(security): sequentialize scraper batches (MED-05)"
```

---

### Task 9: Structured Logging (LOW-04)

**Files:**
- Modify: `src/app/api/ai/plan/route.ts`
- Modify: `src/app/api/ai/cheap-dates/route.ts`
- Modify: `src/app/api/visa/ai-answer/route.ts`

- [ ] **Step 1: Replace `console.error('...', error)` with structured logging**

In catch blocks, replace full `error` object with `{ msg: error instanceof Error ? error.message : 'unknown' }`.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/ai/plan/route.ts src/app/api/ai/cheap-dates/route.ts src/app/api/visa/ai-answer/route.ts
git commit -m "fix(security): structured logging (LOW-04)"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run `npx tsc --noEmit`** -- Expected: 0 errors
- [ ] **Step 2: Run `npm run lint`** -- Expected: 0 errors
- [ ] **Step 3: Run `npm run build`** -- Expected: Successful build
