# Review Moderation — Design Spec

**Date:** 2026-05-05
**Status:** Approved
**Scope:** Add review moderation workflow for place reviews — pending status on submit, admin approve/reject, content flagging.

## Background

TravelAZ `place_reviews` table has a `status` column with check constraint: `pending | published | rejected | hidden`. Currently, the review form (`place-review-form.tsx`) submits reviews with `status: 'published'` directly. No moderation exists. This design adds a lightweight moderation layer.

## Requirements

1. New reviews submit as `pending` instead of `published`
2. Admin users can approve/reject/delete reviews via API
3. Profile page shows moderation panel for admin users
4. Simple server-side content flagging (bad words)
5. Users can see their own pending reviews; public sees only `published`

## Database Changes

### Migration 025: Add `role` column to profiles

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));
```

No other schema changes needed — `place_reviews.status` already supports the workflow.

## API Changes

### New route: `src/app/api/reviews/moderate/route.ts`

**PATCH** — Admin changes review status
- Input: `{ reviewId: string, status: 'published' | 'rejected' | 'hidden' }`
- Auth: Must be logged in + `profiles.role = 'admin'`
- Action: Updates `place_reviews.status` for the given review
- Returns: `{ success: true }` or error

**GET** — Admin lists pending reviews
- Query params: `?status=pending&page=1&limit=20`
- Auth: Must be admin
- Returns: `{ reviews: PlaceReviewWithAuthorRow[], count: number }`

**DELETE** — Admin deletes review
- Input: `{ reviewId: string }`
- Auth: Must be admin
- Action: Deletes the review (cascade handles helpful votes)

### Content flagging

A simple bad words check in the PATCH/list flow. Reviews containing flagged words get a `flagged` boolean in the API response metadata (not stored in DB — computed at query time). Admin sees the flag in the UI.

Implementation: `src/lib/content-filter.ts` with a basic word list. Returns `true` if content contains flagged words.

## Frontend Changes

### 1. `src/components/place/place-review-form.tsx`
- Change `status: 'published'` → `status: 'pending'` (line 55)
- Update success toast message to indicate pending approval
- Add i18n key: `places.reviewPending`

### 2. New: `src/components/place/review-moderation-panel.tsx`
- Client component for admin moderation
- Shows pending reviews with author info, rating, content
- Approve (green) / Reject (red) buttons per review
- Uses `/api/reviews/moderate` endpoint
- Pagination support

### 3. `src/app/[locale]/profile/page.tsx`
- Add moderation tab/section visible only to admin users
- Renders `ReviewModerationPanel` component

### 4. i18n keys added to `messages/az.json`, `en.json`, `ru.json`
- `places.reviewPending` — "Rəyiniz təsdiq gözləyir"
- `places.moderation` — "Rəy Moderasiyası"
- `places.pendingReviews` — "Gözləyən rəylər"
- `places.approve` — "Təsdiqlə"
- `places.reject` — "Rədd et"
- `places.noPendingReviews` — "Gözləyən rəy yoxdur"
- `places.flaggedContent` — "Qeyri-münasib məzmun ehtimalı"
- `places.reviewApproved` — "Rəy təsdiqləndi"
- `places.reviewRejected` — "Rəy rədd edildi"

## RLS Policies

Existing policies already support the workflow:
- `SELECT`: `status = 'published' or auth.uid() = user_id` — users see their own pending reviews
- `INSERT`: `auth.uid() = user_id` — users can only create own reviews
- `UPDATE`: `auth.uid() = user_id` — users can only update own reviews

New policy needed: Admin can update any review's status.

```sql
CREATE POLICY "Admins can update any review status" ON place_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

New policy: Admin can delete any review.

```sql
CREATE POLICY "Admins can delete any review" ON place_reviews
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

New policy: Admin can select all reviews (including pending from other users).

```sql
CREATE POLICY "Admins can view all reviews" ON place_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/025_profiles_role.sql` | New: add role column + admin policies |
| `src/app/api/reviews/moderate/route.ts` | New: moderation API route |
| `src/lib/content-filter.ts` | New: bad words checker |
| `src/components/place/place-review-form.tsx` | Modify: status → pending, update toast |
| `src/components/place/review-moderation-panel.tsx` | New: admin moderation UI |
| `src/app/[locale]/profile/page.tsx` | Modify: add moderation section for admins |
| `src/messages/az.json` | Add moderation i18n keys |
| `src/messages/en.json` | Add moderation i18n keys |
| `src/messages/ru.json` | Add moderation i18n keys |
