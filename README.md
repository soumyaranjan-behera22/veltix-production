# VELTIX

A premium dark-themed marketing/agency website — "We Build Websites That Win." Includes animated sections (hero, services, pricing, portfolio, testimonials, process, FAQ) and a working contact form that emails both the visitor and the admin inbox.

## Project structure

```
veltix/
├── frontend/          # React 19 + Vite + Tailwind CSS v4 site
│   ├── src/
│   │   ├── components/    # Navbar, Cursor, section components, shadcn/ui primitives
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── .env.example
├── backend/           # Express API (contact form email sending)
│   ├── src/
│   │   ├── routes/        # contact.ts, health.ts
│   │   ├── lib/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── build.mjs           # esbuild production bundler
│   ├── package.json
│   └── .env.example
├── package.json        # npm workspaces root — convenience scripts to run both together
├── README.md
└── DEPLOYMENT.md
```

## Stack

- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS v4, Framer Motion, GSAP/ScrollTrigger, Lenis smooth scroll, wouter (routing), shadcn/ui + Radix primitives
- **Backend**: Express 5, Resend (transactional email)

## Local setup

Requires Node.js 20+ and npm.

```bash
npm install       # installs both frontend and backend workspaces
```

Copy the environment templates and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env   # optional for local dev, see note below
```

At minimum, set `RESEND_API_KEY` in `backend/.env` (get one at https://resend.com) so the contact form can send email.

### Run in development

```bash
npm run dev
```

This starts the backend on `http://localhost:8080` and the frontend on `http://localhost:5173` together. The frontend talks to the backend at `http://localhost:8080` by default — no `frontend/.env` is required for local dev.

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

- `backend/dist/index.mjs` — bundled Node server
- `frontend/dist/` — static site ready to deploy

### Type-check

```bash
npm run typecheck
```

## VS Code

Just open the `veltix/` folder in VS Code — no extra configuration or extensions are required. TypeScript, ESLint-free formatting, and Tailwind class IntelliSense (if you install the Tailwind CSS IntelliSense extension) work out of the box against `frontend/tsconfig.json` and `backend/tsconfig.json`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions to deploy the frontend to Vercel and the backend to Railway.

## Contact form flow

1. Visitor submits the form on the site.
2. The frontend `POST`s to `${VITE_API_URL}/api/contact` on the backend.
3. The backend validates the payload, then sends two emails via Resend:
   - An admin notification to the business inbox with full submission details.
   - An automatic confirmation email back to the visitor.
