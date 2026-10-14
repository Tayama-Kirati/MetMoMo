# MetMoMo

Food-ordering platform for the Kathmandu Valley: customers order from local restaurants, owners manage menus and orders, riders deliver, and admins run the platform.

- **Frontend:** React 19 + Vite + Tailwind (`frontend/`)
- **Backend:** Express 5 + MongoDB/Mongoose + Socket.io (`backend/`)
- **Payments:** Cash on delivery, Khalti, eSewa
- **AI (optional):** Claude, for delivery-distance estimates, the "MoMo Buddy" food assistant, review summaries and menu descriptions

## Features

| Who | What they can do |
|---|---|
| Customers | Search with filters (veg, spice, price, sort), personalised picks, AI assistant, cart with quantities, saved addresses with a map pin, coupons, schedule for later, pay by COD/Khalti/eSewa, live order tracking with rider location, delivery code, reorder, reviews, loyalty points, Nepali/English, dark mode, installable app |
| Restaurant owners | Restaurant profile (needs admin approval), weekly opening hours, pause new orders, menu items with AI-written descriptions, live new-order alerts (sound + notification), accept/reject and status updates, replies to reviews, revenue, best sellers and busiest hours |
| Riders | Sign up (needs admin approval), see and accept or skip available orders, pick-up, live location sharing, confirm delivery with the customer's 4-digit code, earnings history |
| Admins | Platform stats, approvals for restaurants and riders, users (block, approve, delete), orders (any status, refunds, CSV export), coupons, commission and payout report, reported-review moderation |

## Running locally

Requirements: Node 20+ and MongoDB (local or Atlas).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI and SECRET_KEY at minimum
npm run seed                # optional: sample restaurants, users, coupons (wipes the database!)
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Vite proxies `/api`, `/uploads` and `/socket.io` to the backend, so no frontend `.env` is needed in development.

The first admin account is created at startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when no admin exists yet. The seeder creates sample logins with the password `password123` (customers such as `aarav@test.com` and a rider `rider@test.com`).

### With Docker

```bash
cp backend/.env.example backend/.env    # set SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build               # http://localhost:8080
```

## Configuration

All backend settings are environment variables; see [`backend/.env.example`](backend/.env.example) for the full list. Highlights:

- `SECRET_KEY`: JWT signing secret. **Required.**
- `ANTHROPIC_API_KEY`: turns on the AI features. Without it they fall back gracefully (flat delivery estimate, no assistant).
- `KHALTI_SECRET_KEY`, `ESEWA_*`: payment credentials. eSewa defaults to its public sandbox.
- `CLOUDINARY_URL`: store uploaded images on Cloudinary instead of the local `uploads/` folder. Recommended in production.
- `EMAIL_USER`, `EMAIL_PASSWORD`: Gmail app password for password-reset OTPs. In development, OTPs are printed to the server log when email isn't configured.

## Order flow

```
pending ──owner accepts──▶ confirmed ──owner──▶ preparation ──rider picks up──▶ ontheway ──rider enters code──▶ delivered
   └──── customer/owner can cancel while pending or confirmed (paid orders become refund_pending)
```

Riders see orders once they're confirmed and claim them atomically, so only one rider gets each order. All prices, delivery fees and discounts are calculated on the server. The client only sends product ids and quantities.

## Tests and CI

```bash
cd backend && npm test      # Jest + Supertest against an in-memory MongoDB
cd frontend && npm run lint && npm run build
```

GitHub Actions runs both on every push and pull request (`.github/workflows/ci.yml`).

## Deploying

- **Backend:** any Node host (Render, Railway, a VPS). Set the env vars, `TRUST_PROXY=1` behind a proxy, and `CLOUDINARY_URL` so images survive redeploys.
- **Frontend:** `npm run build` and serve `dist/` (Vercel, Netlify, or the included nginx image). If the API is on another origin, build with `VITE_API_URL=https://your-api` and add the frontend origin to the backend's `CORS_ORIGINS`.
