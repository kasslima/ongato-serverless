import { Env } from "./type";

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
  allowCredentials: boolean;
}

const DEFAULT_CONFIG: CorsConfig = {
  allowedOrigins: ["http://127.0.0.1:8787", "http://localhost:5173", "http://localhost:8000"],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
  allowCredentials: false,
};

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((allowed) => {
    if (allowed === "*") return true;

    if (allowed === origin) return true;

    const pattern = allowed.replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(origin);
  });
}

function getCorsConfig(env: Env): CorsConfig {
  const isDevelopment = !env.ENVIRONMENT || env.ENVIRONMENT === "development";

  if (isDevelopment) {
    return DEFAULT_CONFIG;
  }

  return {
    allowedOrigins: (env.CORS_ALLOWED_ORIGINS || "").split(",").filter(Boolean),
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    allowCredentials: false,
  };
}


export function getCorsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const config = getCorsConfig(env);

  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": config.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": config.allowedHeaders.join(", "),
    "Access-Control-Max-Age": config.maxAge.toString(),
  };

  if (isOriginAllowed(origin, config.allowedOrigins)) {
    headers["Access-Control-Allow-Origin"] = origin;
    if (config.allowCredentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  }

  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["X-XSS-Protection"] = "1; mode=block";

  return headers;
}


export function addCorsHeaders(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(request, env);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function handleCorsPreFlight(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env),
  });
}
