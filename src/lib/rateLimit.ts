import { NextRequest, NextResponse } from "next/server";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function checkRateLimit(
  req: NextRequest,
  type: "api" | "auth" | "tracking"
): Promise<NextResponse | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = Redis.fromEnv();

    const limits = {
      api:      { requests: 30, window: "1 m" },
      auth:     { requests: 10, window: "15 m" },
      tracking: { requests: 60, window: "1 m" },
    };

    const { requests, window } = limits[type];

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window as any),
      prefix: `mgm:${type}`,
    });

    const ip = getIP(req);
    const { success, reset } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Intenta en unos minutos.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("[RateLimit] Error:", err);
    return null;
  }

  return null;
}