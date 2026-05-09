"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";

/**
 * Singleton socket — one connection per browser tab, regardless of how many
 * components mount this hook. Built on top of the short-lived JWT minted
 * by /api/socket-token.
 *
 * Reconnect strategy: socket.io-client's exponential backoff (1s → 30s).
 * On token expiry (1h) we refresh by re-fetching /api/socket-token.
 *
 * Falls back gracefully: if NEXT_PUBLIC_SOCKET_URL is not set, the hook
 * returns null and the rest of the app continues to work via the existing
 * HTTP polling / polling will be removed in a later step.
 */

let _socket: Socket | null = null;
let _connecting = false;
const _connectedListeners = new Set<(s: Socket) => void>();

async function fetchToken(): Promise<{ token: string; url: string } | null> {
  try {
    const res = await fetch("/api/socket-token", { cache: "no-store", credentials: "include" });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j?.token || !j?.url) return null;
    return { token: j.token as string, url: j.url as string };
  } catch { return null; }
}

async function ensureConnected(): Promise<Socket | null> {
  if (_socket?.connected) return _socket;
  if (_connecting)        return new Promise(res => _connectedListeners.add(res as (s: Socket) => void));

  _connecting = true;
  try {
    const auth = await fetchToken();
    if (!auth) { _connecting = false; return null; }

    if (_socket) _socket.removeAllListeners();
    _socket = io(auth.url, {
      auth: { token: auth.token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: Infinity,
      timeout: 10_000,
    });

    _socket.on("connect_error", (e) => {
      // 'invalid token' from the server → refresh and retry once.
      if (e?.message?.includes("token") && _socket) {
        fetchToken().then(a => { if (a && _socket) _socket.auth = { token: a.token }; });
      }
    });

    return await new Promise<Socket | null>((resolve) => {
      const onConnect = () => {
        _connecting = false;
        for (const l of _connectedListeners) l(_socket!);
        _connectedListeners.clear();
        resolve(_socket);
      };
      _socket!.once("connect", onConnect);
      // Don't hang forever — give up after 15s and let the caller retry.
      setTimeout(() => {
        if (_connecting) { _connecting = false; resolve(_socket); }
      }, 15_000);
    });
  } catch {
    _connecting = false;
    return null;
  }
}

/** Returns the live socket (or null while connecting / unconfigured). */
export function useSocket(): Socket | null {
  const { status } = useSession();
  const [sock, setSock] = useState<Socket | null>(_socket);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    ensureConnected().then(s => { if (!cancelled) setSock(s); });
    return () => { cancelled = true; };
  }, [status]);

  return sock;
}

/**
 * Subscribe to a server-pushed event for the lifetime of the component.
 *
 *   useRealtimeEvent<Notification>("notification:new", (n) => { … });
 *
 * Uses a ref for the handler so closures stay fresh without re-binding
 * the listener on every render.
 */
export function useRealtimeEvent<T = unknown>(event: string, handler: (data: T) => void) {
  const ref = useRef(handler);
  // Update the ref after render — keeps the listener stable while always
  // calling the latest handler. Lint-safe under React 19's stricter ref rules.
  useEffect(() => { ref.current = handler; });
  const sock = useSocket();

  useEffect(() => {
    if (!sock) return;
    const fn = (d: T) => ref.current(d);
    sock.on(event, fn);
    return () => { sock.off(event, fn); };
  }, [event, sock]);
}

/**
 * Join/leave a request room (chat + GPS + status broadcasts).
 * Pass null/undefined to leave.
 */
export function useRealtimeRoom(requestId: string | null | undefined) {
  const sock = useSocket();
  useEffect(() => {
    if (!sock || !requestId) return;
    sock.emit("track:join", requestId);
    return () => { sock.emit("track:leave", requestId); };
  }, [sock, requestId]);
}
