import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.naqlgo.app",
  appName: "NaqlGo",
  webDir: "out",
  server: {
    // Your deployed Vercel URL — change this to your actual domain
    url: "https://naqlgo.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#0A1628",
  },
};

export default config;
