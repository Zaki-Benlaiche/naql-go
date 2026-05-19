"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { playNotificationSound } from "@/lib/notificationSound";

// Registers this device with FCM, ships the token to the backend, and routes
// the user to the right page when a push is tapped.
//
// Mounted globally (from Providers) but only does real work when:
//   1. running inside Capacitor (native shell), AND
//   2. the user is authenticated.
// On web it no-ops — push for the browser would use the Push API, not FCM,
// and we don't need it for the pilot.

type CapacitorWindow = {
  Capacitor?: { isNativePlatform: () => boolean };
};

type ActionPerformedPayload = {
  notification?: { data?: Record<string, string> };
};

export function PushBridge() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const w = window as unknown as CapacitorWindow;
    if (!w.Capacitor?.isNativePlatform()) return;
    if (status !== "authenticated" || !session?.user?.id) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      // Step 1 — ask permission. On Android 13+ this triggers the OS dialog.
      // On older Android, permission is granted at install time.
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") {
        console.warn("[push] permission not granted:", perm.receive);
        return;
      }
      if (cancelled) return;

      // Step 2 — register with FCM. The native side fires "registration" with
      // the FCM token once Google's servers respond.
      await PushNotifications.register();

      const onRegister = await PushNotifications.addListener(
        "registration",
        async ({ value: token }) => {
          if (!token) return;
          try {
            await fetch("/api/devices/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, platform: "android" }),
              credentials: "include",
            });
          } catch (e) {
            console.error("[push] register API failed", e);
          }
        },
      );

      const onRegisterError = await PushNotifications.addListener(
        "registrationError",
        (e) => console.warn("[push] registration error", e),
      );

      // Step 3 — foreground notifications. Without a custom UI Android won't
      // show a banner when the app is open. We play the in-app chime + buzz
      // so the user notices immediately; the notification list is already
      // kept fresh by polling.
      const onReceived = await PushNotifications.addListener(
        "pushNotificationReceived",
        (n) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("[push] received", n.title, n.data);
          }
          playNotificationSound();
        },
      );

      // Step 4 — user tapped the notification. Route them to the right place.
      const onAction = await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        ({ notification }: ActionPerformedPayload) => {
          const data = notification?.data ?? {};
          const requestId = data.requestId;
          const type = data.type;

          if (!requestId) {
            router.push("/dashboard");
            return;
          }
          // Drivers go to their orders view, clients go to theirs. The session
          // role tells us which side this is.
          const role = (session.user as unknown as { role: string }).role;
          if (role === "TRANSPORTER") {
            router.push("/transporter/orders");
          } else if (type === "new_bid") {
            router.push(`/client/requests/${requestId}`);
          } else {
            router.push("/client/requests");
          }
        },
      );

      cleanup = () => {
        onRegister.remove();
        onRegisterError.remove();
        onReceived.remove();
        onAction.remove();
      };
    })().catch((e) => console.error("[push] init", e));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [status, session?.user?.id, router, session?.user]);

  return null;
}
