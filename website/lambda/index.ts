import { readFileSync, statSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";

const STATIC_ROOT = join(
  process.env.LAMBDA_TASK_ROOT ?? process.cwd(),
  "static"
);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const BASE_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
};

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".mp4",
  ".webm",
  ".woff",
  ".woff2",
]);

interface ApiGatewayV2Event {
  rawPath?: string;
  headers?: Record<string, string>;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
}

function resolvePath(rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath.split("?")[0]);
  let p = decoded;
  if (p.endsWith("/")) p += "index.html";
  p = normalize(p).replace(/^([/\\])+/, "");
  if (!p) p = "index.html";
  const full = join(STATIC_ROOT, p);
  if (!full.startsWith(STATIC_ROOT)) return null;
  return full;
}

function cacheControlFor(filePath: string): string {
  if (filePath.endsWith(".html")) return "no-cache";
  const base = filePath.split(/[\\/]/).pop() ?? "";
  // Vite emits hashed asset names like index-abc123.js
  if (/-\w{8,}\.(js|css|webp|png|jpg|svg)$/.test(base)) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=86400";
}

export async function handler(event: ApiGatewayV2Event) {
  const method = event.requestContext?.http?.method ?? "GET";
  const rawPath = event.rawPath ?? "/";
  const filePath = resolvePath(rawPath);

  if (!filePath) {
    return {
      statusCode: 404,
      headers: { "content-type": "text/plain; charset=utf-8", ...BASE_HEADERS },
      body: "Not Found",
    };
  }

  const isHtmlRequest = filePath.endsWith(".html");

  // SPA fallback: unknown extensionless paths serve the app shell
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    const base = filePath.split(/[\\/]/).pop() ?? "";
    const hasExtension = /\.[^./\\]{1,8}$/.test(base);
    if (isHtmlRequest || !hasExtension) {
      const indexHtml = join(STATIC_ROOT, "index.html");
      const body = readFileSync(indexHtml);
      return {
        statusCode: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
          ...BASE_HEADERS,
        },
        body: body.toString("utf8"),
      };
    }
    return {
      statusCode: 404,
      headers: { "content-type": "text/plain; charset=utf-8", ...BASE_HEADERS },
      body: "Not Found",
    };
  }

  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const isBinary = BINARY_EXTENSIONS.has(ext);
  const stat = statSync(filePath);
  const rangeHeader = event.headers?.["range"] ?? event.headers?.["Range"];

  let statusCode = 200;
  let extraHeaders: Record<string, string> = {};
  let payload: Buffer;

  if (rangeHeader && !isHtmlRequest) {
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (match && (match[1] || match[2])) {
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
      if (Number.isNaN(start) || Number.isNaN(end)) {
        start = 0;
        end = stat.size - 1;
      }
      end = Math.min(end, stat.size - 1);
      if (start > end) {
        return {
          statusCode: 416,
          headers: { "content-range": `bytes */${stat.size}`, ...BASE_HEADERS },
          body: "",
        };
      }
      const buf = readFileSync(filePath);
      payload = buf.subarray(start, end + 1);
      statusCode = 206;
      extraHeaders = {
        "content-range": `bytes ${start}-${end}/${stat.size}`,
        "content-length": String(payload.length),
        "accept-ranges": "bytes",
      };
    } else {
      payload = readFileSync(filePath);
    }
  } else {
    payload = readFileSync(filePath);
  }

  if (method === "HEAD") {
    return {
      statusCode,
      headers: {
        "content-type": contentType,
        "content-length": String(payload.length),
        "cache-control": cacheControlFor(filePath),
        "accept-ranges": isBinary ? "bytes" : "none",
        ...extraHeaders,
        ...BASE_HEADERS,
      },
      body: "",
    };
  }

  if (isBinary) {
    return {
      statusCode,
      headers: {
        "content-type": contentType,
        "content-length": String(payload.length),
        "cache-control": cacheControlFor(filePath),
        "accept-ranges": "bytes",
        ...extraHeaders,
        ...BASE_HEADERS,
      },
      body: payload.toString("base64"),
      isBase64Encoded: true,
    };
  }

  return {
    statusCode,
    headers: {
      "content-type": contentType,
      "content-length": String(payload.length),
      "cache-control": cacheControlFor(filePath),
      ...extraHeaders,
      ...BASE_HEADERS,
    },
    body: payload.toString("utf8"),
  };
}
