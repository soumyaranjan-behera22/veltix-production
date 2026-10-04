# Veltix Desk (inside the main website)

The admin desk now ships with the main site. No separate Vercel project.

| URL | What |
|---|---|
| `veltix.in/desk` | Admin desk. Supabase login, then Deals dashboard |
| `veltix.in/pay?d=…` | Client payment page (no login) |
| Footer → 🔒 Admin | Link to `/desk/` |

## Files

| Path (inside `frontend/`) | Status | Purpose |
|---|---|---|
| `public/desk/` | new | The whole desk (copied to `dist/desk` on build) |
| `public/desk/config.js` | new | **Your Supabase URL + key + admin emails** |
| `middleware.js` | new | Blocks fake payment links on `/pay` |
| `vercel.json` | changed | `/desk` and `/pay` routes + security headers for them only |
| `vite.config.ts` | changed | Same `/desk` and `/pay` routes for `npm run dev` / `preview` |
| `src/components/sections/Footer.tsx` | changed | Admin link → `/desk/` |
| `desk-setup/supabase-setup.sql` | new | Database tables (run once) |

## One-time setup

1. **Key:** open `public/desk/config.js` and paste the **full** publishable key (Supabase → Project Settings → API Keys). It's one long line.
2. **Database:** if you haven't yet, run `desk-setup/supabase-setup.sql` in Supabase → SQL Editor.
3. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://veltix.in/desk/`
   - Redirect URLs: `https://veltix.in/desk/` and `http://localhost:5173/desk/`
4. **Vercel (main website project) → Settings → Environment Variables:** add `DESK_UPI` = your UPI ID.
5. Delete the old root-level `veltix-desk/` folder. Everything now lives in `frontend/public/desk/`.

## Test locally

From the repo root:
```
npm run dev --workspace frontend
```
- `http://localhost:5173/desk` → login
- footer → Admin → login
- Payment links built locally point to `/desk/pay.html` (sending is blocked on localhost on purpose; use **Preview**).

## Deploy
Push to the branch Vercel builds from. `npm run build` copies the desk into `dist/desk`.
