import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Rate limiter para API pública — 30 requests por minuto por IP
const apiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "mgm:api",
});

// Rate limiter para login — 10 intentos por 15 minutos por IP
const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "mgm:auth",
});

// Rate limiter para tracking público — 60 requests por minuto
const trackingLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "mgm:tracking",
});

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
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.log("[RateLimit] Sin Redis configurado, saltando.");
    return null;
  }

  const limiter = type === "api" ? apiLimiter : type === "auth" ? authLimiter : trackingLimiter;
  const ip = getIP(req);
  
  
  
  try {
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    // console.log("[RateLimit] success:", success, "remaining:", remaining, "limit:", limit);
    
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