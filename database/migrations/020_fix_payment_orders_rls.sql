-- Phase 25: Fix Payment Orders RLS
-- Fixes "Failed to place order" for Manual/Offline payments
-- Previous migration 008 enabled RLS but didn't allow INSERTs for users

-- 1. Create Policy for INSERT
-- Users should be able to create their own orders
DROP POLICY IF EXISTS "Users can create orders" ON payment_orders;

CREATE POLICY "Users can create orders" 
ON public.payment_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Ensure Update Policy exists (for callbacks/verification)
-- Typically updates happen via Service Role (Safe), but if we want users to update metadata:
-- Check if we need an UPDATE policy. 
-- For now, users don't update orders directly (actions do it via service role OR user context).
-- Manual route uses `supabase.auth.getUser()` and then `supabase.from(...).insert()`.
-- This uses the USER'S context. So INSERT policy is required.

-- 3. Just in case, grant SELECT to authenticated (already done in 008, but good to double check implicit behavior)
-- 008: CREATE POLICY "Users can view own orders" ON payment_orders FOR SELECT USING (auth.uid() = user_id);
-- That is sufficient for reading the created order back (select().single() in route.ts).
