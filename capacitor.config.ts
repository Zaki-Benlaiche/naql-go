import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.naqlgo.app",
  appName: "NaqlGo",
  webDir: "out",

  // ⚠️ غيّر هذا الرابط إلى رابط النشر الفعلي على Vercel
  server: {
    url: "https://naql-go.vercel.app",
    cleartext: true,
    androidScheme: "https",
    allowNavigation: [
      "naql-go.vercel.app",
      "naqlgo.vercel.app",
      "*.vercel.app",
      "*.openstreetmap.org",
      "unpkg.com",
      "nominatim.openstreetmap.org",
    ],
  },

  android: {
    backgroundColor: "#0A1628",
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0A1628",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FF6B00",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
