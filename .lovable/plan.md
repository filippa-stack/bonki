

## Problem

The database contains a stored **procedure** (`advance_tillbaka_cards`) whose return type is NULL. Lovable's internal schema diffing tool (`GetProcs`) tries to scan the return type as a string and crashes on NULL — blocking every publish attempt.

## Fix

Create a migration that:
1. Drops the existing `advance_tillbaka_cards` procedure
2. Recreates it as a **function** returning `void` (which the schema differ can handle), preserving the exact same logic

This is a safe change — the procedure body and behavior remain identical. The only difference is `CREATE OR REPLACE FUNCTION ... RETURNS void` instead of `CREATE OR REPLACE PROCEDURE`.

## Steps

1. **Run a migration** with:
   - `DROP PROCEDURE IF EXISTS public.advance_tillbaka_cards();`
   - `CREATE OR REPLACE FUNCTION public.advance_tillbaka_cards() RETURNS void ...` (same body)
2. **Publish** — the schema diff should now succeed

## Risk

- Low risk. No data is changed. The function body is identical.
- Any cron job or caller invoking `CALL advance_tillbaka_cards()` would need to switch to `SELECT advance_tillbaka_cards()` instead, but since edge functions typically use `supabase.rpc()` this should work transparently.

