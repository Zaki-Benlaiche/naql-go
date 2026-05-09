import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import Redis from "ioredis";

// ── Config ────────────────────────────────────────────────────────────────
const PORT             = Number(process.env.PORT ?? 3001);
const SOCKET_JWT_SECRET = required("SOCKET_JWT_SECRET");
const REDIS_URL        = required("REDIS_URL");
const ALLOWED_ORIGINS  = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",").map(s => s.trim()).filter(Boolean);

function required(name: string): string {
  const v = process.env[name];
  if (!v) { console.error(`[fatal] missing env: ${name}`); process.exit(1); }
  return v;
}

// ── HTTP + Socket.IO ──────────────────────────────────────────────────────
// Health check used by Render & by the Vercel Cron keepalive. Plain HTTP so
// we don't need to spin up Express for one route.
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, t: Date.now() }));
    return;
  }
  res.writeHead(404); res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      // No-origin requests (curl, server-to-server) are allowed for health.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      // Wildcard tail match for *.vercel.app preview URLs.
      if (origin.endsWith(".vercel.app")) return cb(null, true);
      return cb(new Error(`origin not allowed: ${origin}`));
    },
    credentials: true,
  },
  transports: ["websocket"], // skip long-polling — saves bandwidth & latency
  // Drop dead connections fast, since mobile networks vanish silently.
  pingInterval: 25_000,
  pingTimeout:  20_000,
});

// ── Auth middleware: verify the short-lived JWT minted by Vercel ──────────
type AuthPayload = { id: string; role: "CLIENT" | "TRANSPORTER" | "ADMIN"; iat: number; exp: number };

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string") return next(new Error("no token"));
  try {
    const payload = jwt.verify(token, SOCKET_JWT_SECRET) as AuthPayload;
    socket.data.userId = payload.id;
    socket.data.role   = payload.role;
    return next();
  } catch (e) {
    console.warn("[auth] bad token:", (e as Error).message);
    return next(new Error("invalid token"));
  }
});

// ── Connection handling ───────────────────────────────────────────────────
io.on("connection", (socket: Socket) => {
  const { userId, role } = socket.data as { userId: string; role: string };

  // Every connection lives in its private user room — used by Vercel to push
  // notifications, bid updates, request status changes, etc.
  socket.join(`user:${userId}`);

  // Allow the client to subscribe to a request room (chat + GPS + status).
  // Auth on the room is enforced by the publisher: Vercel only ever sends
  // events to rooms the user is allowed to read.
  socket.on("track:join", (requestId: string) => {
    if (typeof requestId === "string" && requestId.length < 64) {
      socket.join(`req:${requestId}`);
    }
  });
  socket.on("track:leave", (requestId: string) => {
    if (typeof requestId === "string") socket.leave(`req:${requestId}`);
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[+] ${role} ${userId} connected (${io.engine.clientsCount} total)`);
  }

  socket.on("disconnect", (reason) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[-] ${role} ${userId} disconnected: ${reason}`);
    }
  });
});

// ── Redis pub/sub bridge ──────────────────────────────────────────────────
// Vercel API routes call PUBLISH on Upstash whenever something happens that
// connected clients should hear about. We translate those messages into
// targeted Socket.IO emits.
//
// Channel: "naqlgo:events"
// Payload: { rooms: string[], event: string, data: unknown }
type EnvelopeRoom = { rooms: string[]; event: string; data: unknown };

const sub = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,        // ioredis: never give up on the subscriber
  enableReadyCheck: true,
  lazyConnect: false,
});

sub.on("connect",      () => console.log("[redis] connected"));
sub.on("ready",        () => console.log("[redis] ready"));
sub.on("error",  (e)   => console.error("[redis] error:", e.message));
sub.on("reconnecting", () => console.warn("[redis] reconnecting…"));

const CHANNEL = "naqlgo:events";

sub.subscribe(CHANNEL, (err, count) => {
  if (err) { console.error("[redis] subscribe failed:", err); process.exit(1); }
  console.log(`[redis] subscribed to ${CHANNEL} (${count} channel${count === 1 ? "" : "s"})`);
});

sub.on("message", (channel, raw) => {
  if (channel !== CHANNEL) return;
  let env: EnvelopeRoom;
  try { env = JSON.parse(raw) as EnvelopeRoom; }
  catch { console.warn("[bus] bad envelope"); return; }

  if (!env || !Array.isArray(env.rooms) || typeof env.event !== "string") return;

  for (const room of env.rooms) {
    io.to(room).emit(env.event, env.data);
  }
});

// ── Lifecycle ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[boot] socket-server listening on :${PORT}`);
  console.log(`[boot] cors origins: ${ALLOWED_ORIGINS.join(", ") || "(none)"}`);
});

function shutdown(sig: string) {
  console.log(`[shutdown] ${sig} — closing connections`);
  io.close(() => {
    sub.quit().finally(() => httpServer.close(() => process.exit(0)));
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // hard kill if hung
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
