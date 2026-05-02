"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type CapacitorWindow = {
  Capacitor?: {
    isNativePlatform: () => boolean;
    getPlatform: () => string;
  };
};

export function NativeBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const w = window as unknown as CapacitorWindow;
    if (!w.Capacitor?.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const [
        { StatusBar, Style },
        { SplashScreen },
        { App },
        { Keyboard },
        { Network },
      ] = await Promise.all([
        import("@capacitor/status-bar"),
        import("@capacitor/splash-screen"),
        import("@capacitor/app"),
        import("@capacitor/keyboard"),
        import("@capacitor/network"),
      ]);

      // Status bar — match dark splash background, light icons
      StatusBar.setBackgroundColor({ color: "#0A1628" }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

      // Hide splash as soon as the UI is interactive (don't wait the full
      // launchShowDuration; first paint already happened before we got here).
      SplashScreen.hide().catch(() => {});

      // Hardware back button → router.back() or exit at root
      const backHandler = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack && window.history.length > 1) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      // Keyboard — adjust viewport so inputs aren't hidden
      const kbShow = await Keyboard.addListener("keyboardWillShow", (info) => {
        document.body.style.setProperty("--kb-height", `${info.keyboardHeight}px`);
      });
      const kbHide = await Keyboard.addListener("keyboardWillHide", () => {
        document.body.style.setProperty("--kb-height", "0px");
      });

      // Network state → expose to app via body class
      const updateNet = (connected: boolean) => {
        document.body.classList.toggle("offline", !connected);
      };
      const netStatus = await Network.getStatus();
      updateNet(netStatus.connected);
      const netHandler = await Network.addListener("networkStatusChange", (s) => {
        updateNet(s.connected);
      });

      cleanup = () => {
        backHandler.remove();
        kbShow.remove();
        kbHide.remove();
        netHandler.remove();
      };
    })().catch(() => {});

    return () => cleanup?.();
  }, [router, pathname]);

  return null;
}
