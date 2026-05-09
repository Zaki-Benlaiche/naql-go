# NaqlGo Socket Server

Real-time gateway. Vercel publishes events to Upstash Redis; this server fans
them out to connected clients over WebSocket.

## Local dev
```bash
cd socket-server
npm install
cp .env.example .env  # fill in REDIS_URL + SOCKET_JWT_SECRET
npm run dev
curl http://localhost:3001/health
```

## Deploy (Render Free)
1. Render Dashboard → New → Web Service → connect the GitHub repo
2. **Root Directory:** `socket-server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. **Instance Type:** Free
6. **Environment:**
   - `SOCKET_JWT_SECRET` — same value as `NEXTAUTH_SECRET` on Vercel
   - `REDIS_URL` — Upstash TLS URL (`rediss://default:<TOKEN>@<host>:6379`)
   - `ALLOWED_ORIGINS` — comma-separated, must include your Vercel URL + `capacitor://localhost`
7. After first deploy, set the resulting URL as `NEXT_PUBLIC_SOCKET_URL` on
   Vercel and redeploy the Next.js app.

## Architecture
```
Vercel API route ──PUBLISH──► Upstash Redis ──SUB──► Socket.IO server ──emit──► Client
                  (channel: naqlgo:events)
```

Envelope shape (must match `src/lib/realtime.ts` on the Vercel side):
```ts
{ rooms: string[]; event: string; data: unknown }
```

Rooms used today:
- `user:<userId>` — every authenticated socket auto-joins this
- `req:<requestId>` — clients & the assigned transporter join via `track:join`
