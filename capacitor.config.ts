import { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.naqlgo.app",
  appName: "NaqlGo",
  webDir: "out",

  // ── Self-contained APK ──
  // Frontend is bundled inside the APK (from `out/`).
  // API calls are routed to the Vercel backend via NEXT_PUBLIC_API_URL.
  server: {
    androidScheme: "https",
    hostname: "localhost",
    cleartext: false,
    allowNavigation: [
      "naql-go.vercel.app",
      "naqlgo.vercel.app",
      "*.vercel.app",
      "*.openstreetmap.org",
      "tile.openstreetmap.org",
      "unpkg.com",
      "nominatim.openstreetmap.org",
    ],
  },

  android: {
    backgroundColor: "#0A1628",
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
    captureInput: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#FF6B00",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#E05000",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
