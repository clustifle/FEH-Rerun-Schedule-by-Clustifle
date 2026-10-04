# Waitlist ordering setup

Run `supabase/waitlist-order.sql` once in the project's Supabase SQL Editor. This adds an order value to the existing membership table and a restricted, atomic reorder function. It does not remove entries or change hero colors.

Head Administrator and Schedule Manager can open **Reorganize Waitlist**, select a weapon color, select a portrait row and move it up, down, first or last. Save or discard changes before switching color. Reordering always uses the complete color list, independent of the schedule's search and filters. Visitors see the saved order.

Existing entries keep their current relative order until edited. Newly added entries follow the saved entries. If membership changes during editing, saving is rejected; reopen the panel to get the current list.

Until the SQL update is installed, the existing waitlist remains usable and the panel reports that saving is unavailable. No order is stored only on the editor's device.
