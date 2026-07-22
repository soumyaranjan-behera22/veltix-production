
# VELTIX - Development Issues & Local Setup Guide

This document contains all major issues faced while deploying and developing the VELTIX website, how they were resolved, and how to run the project locally on any machine in the future.

---

# Project Stack

Frontend

- React
- Vite
- TypeScript
- TailwindCSS

Backend

- Express
- TypeScript
- Resend Email API

Hosting

- Frontend → Vercel
- Backend → Render

Domain

- https://veltix.in

---

# Issue 1 - Contact Form "Failed to Fetch"

## Problem

Whenever the contact form was submitted locally, the browser showed

```
Failed to fetch
```

No request reached the backend.

---

## Cause

The frontend and backend were running on different origins.

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8080
```

The backend CORS configuration only allowed the production frontend.

---

## Solution

Added both development and production origins.

Example

```env
CORS_ORIGIN=http://localhost:5173,https://veltix-production-frontend.vercel.app
```

---

# Issue 2 - CORS Error on Render

## Error

```
Not allowed by CORS
```

Render logs showed

```
OPTIONS /api/contact
500
```

---

## Cause

The production frontend URL was missing or incorrect.

---

## Solution

Render Environment Variable

```
CORS_ORIGIN=https://veltix-production-frontend.vercel.app
```

Later updated to

```
CORS_ORIGIN=http://localhost:5173,http://10.x.x.x:5175,https://veltix-production-frontend.vercel.app
```

---

# Issue 3 - Render Deployment Successful but Local Failed

Production worked.

Local development still failed.

---

## Cause

Backend environment variables were different from Render.

---

## Solution

Created backend/.env

```env
PORT=8080

RESEND_API_KEY=YOUR_KEY

CORS_ORIGIN=http://localhost:5173,http://10.x.x.x:5175,https://veltix-production-frontend.vercel.app
```

---

# Issue 4 - Port Already in Use

## Error

```
EADDRINUSE
```

---

## Cause

Another backend process was already using port 8080.

---

## Solution

Find process

Windows

```
netstat -ano | findstr 8080
```

Kill process

```
taskkill /PID <PID> /F
```

Restart backend.

---

# Issue 5 - Browser Couldn't Reach Backend

---

## Test

Visit

```
http://localhost:8080
```

Expected

```
Cannot GET /
```

This means the backend is running.

---

# Issue 6 - Browser Couldn't Reach API

Visit

```
http://localhost:8080/api/contact
```

Expected

```
Cannot GET /api/contact
```

This is correct because the route only accepts POST requests.

---

# Issue 7 - OPTIONS Route Crash

## Error

```
PathError
Missing parameter name at index 1
```

---

## Cause

Using

```ts
app.options("*", ...)
```

Express version was incompatible.

---

## Solution

Removed

```ts
app.options("*", ...)
```

Only used

```ts
app.use(cors(...))
```

---

# Issue 8 - Backend Running But Request Never Arrived

---

## Cause

Frontend wasn't pointing to the correct backend URL.

---

## Production

```
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com
```

---

## Local

Fallback

```ts
const API_BASE_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8080";
```

---

# Issue 9 - Resend Email

Problem

Emails weren't sending.

---

## Solution

Verified

- Domain
- DNS
- Sender Email

Using

```
team@veltix.in
```

---

# Issue 10 - Render Deployment

Backend successfully deployed after

- Environment variables
- CORS
- Resend
- Domain verification

Everything worked.

---

# Local Development Guide

## Clone Repository

```
git clone <repo-url>
```

```
cd veltix-production
```

---

## Install

Root

```
npm install
```

Frontend

```
cd frontend
npm install
```

Backend

```
cd backend
npm install
```

---

# Backend Environment

Create

```
backend/.env
```

Example

```env
PORT=8080

RESEND_API_KEY=YOUR_RESEND_KEY

CORS_ORIGIN=http://localhost:5173,http://10.x.x.x:5175,https://veltix-production-frontend.vercel.app
```

---

# Frontend Environment

Create

```
frontend/.env.local
```

Development

```env
VITE_API_URL=http://localhost:8080
```

Production

```env
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com
```

---

# Run Backend

```
cd backend

npm run dev
```

Expected

```
Server listening
port: 8080
```

---

# Run Frontend

```
cd frontend

npm run dev
```

Expected

```
http://localhost:5173
```

---

# Verify Backend

Browser

```
http://localhost:8080
```

Should show

```
Cannot GET /
```

Browser

```
http://localhost:8080/api/contact
```

Should show

```
Cannot GET /api/contact
```

This is expected.

---

# Test Contact Form

Open

```
http://localhost:5173
```

Fill the contact form.

Expected

- Success Toast
- Admin Email
- Auto Reply Email

---

# Production Environment Variables

Render

```env
PORT=8080

RESEND_API_KEY=...

CORS_ORIGIN=https://veltix-production-frontend.vercel.app
```

Vercel

```env
VITE_API_URL=https://YOUR_RENDER_BACKEND.onrender.com
```

---

# Current Status

✅ Frontend deployed

✅ Backend deployed

✅ Domain connected

✅ Contact form working

✅ Resend email working

✅ Auto reply working

✅ Admin notification working

✅ Local development working

---

# Future Improvements

- Authentication
- Admin Dashboard
- Client Dashboard
- Stripe/Razorpay Payment
- Login & Signup
- Google OAuth
- CMS for Portfolio
- Project Management Dashboard
- Analytics
- Blog System
- Testimonials CMS
- Newsletter
- Booking Calendar
- AI Quote Generator
- Invoice Generator
- Client File Upload
- Dark/Light Theme Toggle
- SEO Dashboard
- Website Performance Monitoring

---

Maintained by

**Soumya (Founder - VELTIX)**

https://veltix.in
