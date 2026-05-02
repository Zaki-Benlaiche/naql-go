"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/context/LanguageContext";
import { NativeBridge } from "@/components/NativeBridge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Patch fetch so that all relative /api calls go to the absolute API host
// (used by Capacitor APK builds where the frontend is bundled locally
//  but the API lives on Vercel).
function installFetchProxy() {
  if (typeof window === "undefined") return;
  if (!API_URL) return;
  if ((window as unknown as { __naqlgoFetchPatched?: boolean }).__naqlgoFetchPatched) return;

  const origFetch = window.fetch.bind(window);

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

    if (url.startsWith("/")) {
      const absolute = API_URL + url;
      const merged: RequestInit = { credentials: "include", ...init };
      if (request) {
        return origFetch(new Request(absolute, request), merged);
      }
      return origFetch(absolute, merged);
    }
    return origFetch(input as RequestInfo, init);
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
