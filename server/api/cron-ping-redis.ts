import redis from "../utils/redis";

export default defineEventHandler(async (event) => {
  try {
    await redis.set("keepalive", Date.now().toString());
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});
