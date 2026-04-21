import { headers } from "next/headers";

export async function getRequestOrigin() {
  try {
    const headerStore = await headers();
    const forwardedHost = headerStore.get("x-forwarded-host");
    const host = forwardedHost ?? headerStore.get("host");
    const forwardedProto = headerStore.get("x-forwarded-proto");
    const protocol = forwardedProto ?? (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");

    if (!host) {
      return "http://127.0.0.1:3000";
    }

    return `${protocol}://${host}`;
  } catch {
    return "http://127.0.0.1:3000";
  }
}
