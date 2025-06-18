import { setWithExpiry } from "../utils/redis";

export default defineEventHandler(async () => {
  try {
    await setWithExpiry("keepalive", Date.now().toString(), 3600); // 1 hour expiry
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
});
