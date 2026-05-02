"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/context/LanguageContext";
import { NativeBridge } from "@/components/NativeBridge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Patch fetch for Capacitor APK builds: the frontend is bundled locally
// but the API lives on Vercel, so:
//  1. Rewrite relative /api/* URLs → absolute API host.
//  2. Always send `credentials: "include"` for *any* request to the API
//     host (relative or absolute) so the auth cookie travels cross-origin.
//     next-auth uses absolute URLs (basePath) and would otherwise default
//     to "same-origin" which drops the session cookie inside the WebView.
function installFetchProxy() {
  if (typeof window === "undefined") return;
  if (!API_URL) return;
  if ((window as unknown as { __naqlgoFetchPatched?: boolean }).__naqlgoFetchPatched) return;

  const origFetch = window.fetch.bind(window);

  const isApiUrl = (u: string) => u.startsWith("/") || u.startsWith(API_URL);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    let url: string;
    let request: Request | null = null;

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      request = input;
      url = input.url;
    }

    if (!isApiUrl(url)) {
      return origFetch(input as RequestInfo, init);
    }

    const absolute = url.startsWith("/") ? API_URL + url : url;
    const merged: RequestInit = { ...init, credentials: "include" };
    if (request) {
      return origFetch(new Request(absolute, request), merged);
    }
    return origFetch(absolute, merged);
  }) as typeof fetch;

  (window as unknown as { __naqlgoFetchPatched: boolean }).__naqlgoFetchPatched = true;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installFetchProxy();
  }, []);

  // Tell next-auth where its endpoints live (relative on web, absolute in APK)
  const basePath = API_URL ? `${API_URL}/api/auth` : "/api/auth";

  return (
    <SessionProvider basePath={basePath}>
      <LanguageProvider>
        <NativeBridge />
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}
