# Deployment guide

VELTIX ships as two independently deployable pieces:

- **`frontend/`** → Vercel (static Vite build)
- **`backend/`** → Railway (Express API, sends contact-form emails via Resend)

Deploy the backend first so you have its URL to give to the frontend.

---

## 1. Deploy the backend to Railway

1. Push this project to a GitHub repository (see "Connect GitHub" below if you haven't already).
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select your repo.
3. When Railway asks for the root directory / service settings, set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build` (auto-detected from `backend/railway.json`)
   - **Start Command**: `npm run start`
4. Deploy. Railway builds and starts the service.

## 2. Add Railway environment variables

In the Railway service → **Variables**, add:

| Variable           | Value                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Your API key from[resend.com](https://resend.com)                                                           |
| `CORS_ORIGIN`    | Your Vercel frontend URL, e.g.`https://veltix.vercel.app` (leave unset if you want to allow all origins) |

Railway sets `PORT` automatically — you don't need to add it.

Once deployed, note the public URL Railway gives the service (e.g. `https://veltix-backend-production.up.railway.app`). Verify it works:

```bash
curl https://your-backend.up.railway.app/api/healthz
# → {"status":"ok"}
```

## 3. Connect GitHub

If the project isn't in GitHub yet:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then connect that repo in both Railway (step 1) and Vercel (step 4).

## 4. Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import your GitHub repo.
2. In the project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. Deploy.

## 5. Add Vercel environment variables

In the Vercel project → **Settings → Environment Variables**, add:

| Variable         | Value                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_URL` | Your Railway backend URL from step 2, e.g.`https://veltix-backend-production.up.railway.app` (no trailing slash) |

Redeploy after adding the variable (Vercel → Deployments → ⋯ → Redeploy) so the build picks it up — Vite inlines env vars at build time.

## 6. Connect the Railway backend URL

This is done by setting `VITE_API_URL` in step 5. Double-check it exactly matches the Railway service's public domain, including `https://` and no trailing slash.

If you update the Railway URL later (e.g. after adding a custom domain), update `VITE_API_URL` in Vercel and redeploy the frontend.

## 7. Add a custom domain

- **Vercel (frontend)**: Project → **Settings → Domains** → add your domain and follow the DNS instructions (usually a `CNAME` to `cname.vercel-dns.com` or an `A` record Vercel provides).
- **Railway (backend)**: Service → **Settings → Networking → Custom Domain** → add a subdomain (e.g. `api.yourdomain.com`) and follow the DNS `CNAME` instructions. Then update `VITE_API_URL` in Vercel to the new custom domain and redeploy.

## 8. Final production checklist

- [ ] `curl https://<backend-domain>/api/healthz` returns `{"status":"ok"}`
- [ ] Contact form on the live frontend submits successfully
- [ ] Admin inbox receives the notification email
- [ ] Visitor receives the auto-reply confirmation email
- [ ] `CORS_ORIGIN` on Railway matches the live frontend domain (prevents cross-origin issues once you lock it down)
- [ ] `VITE_API_URL` on Vercel points at the live backend domain (no trailing slash)
- [ ] No `localhost` URLs anywhere in the deployed frontend network requests
- [ ] All animations, scroll effects, and responsive layouts work on the production URL (test mobile, tablet, desktop)
- [ ] Custom domains (if any) resolve correctly over HTTPS

## Notes

- The `RESEND_API_KEY` sender address defaults to `onboarding@resend.dev` (Resend's shared testing domain), which works immediately without extra setup but is rate-limited and not branded. For production, verify your own domain in Resend and update the `FROM` constant in `backend/src/routes/contact.ts` to an address on that domain.
- The admin notification email currently goes to a fixed address hardcoded in `backend/src/routes/contact.ts` (`ADMIN` constant) — update it to your business inbox before going live.
