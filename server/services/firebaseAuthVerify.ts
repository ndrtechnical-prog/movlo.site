import crypto from "crypto";
import fs from "fs";
import path from "path";

interface FirebaseConfig {
  projectId: string;
  firestoreDatabaseId: string;
}

function loadFirebaseConfig(): FirebaseConfig {
  const cfgPath = path.join(process.cwd(), "firebase-applet-config.json");
  const raw = fs.readFileSync(cfgPath, "utf-8");
  const parsed = JSON.parse(raw);
  return {
    projectId: String(parsed.projectId || ""),
    firestoreDatabaseId: String(parsed.firestoreDatabaseId || "(default)")
  };
}

let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }

  const resp = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  );
  if (!resp.ok) {
    throw new Error(`Unable to fetch Firebase verification certificates (${resp.status})`);
  }

  const cacheControl = resp.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600 * 1000;

  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeMs;
  return cachedCerts;
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLen), "base64");
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

const BOOTSTRAPPED_ADMIN_EMAIL = "ndrtechnical@gmail.com";

export async function verifyFirebaseAdminBearer(authHeader?: string): Promise<VerifiedFirebaseUser> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization Bearer token.");
  }

  const idToken = authHeader.slice(7).trim();
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token structure.");
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const header = JSON.parse(base64UrlDecode(headerB64).toString("utf-8")) as {
    alg?: string;
    kid?: string;
  };
  const payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf-8")) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported token signature algorithm.");
  }

  const certs = await getGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error("Token signing certificate not recognized.");
  }

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const signature = base64UrlDecode(sigB64);
  if (!verifier.verify(certPem, signature)) {
    throw new Error("Invalid Firebase token signature.");
  }

  const cfg = loadFirebaseConfig();
  const nowSec = Math.floor(Date.now() / 1000);

  if (payload.aud !== cfg.projectId) {
    throw new Error("Token audience mismatch.");
  }
  if (payload.iss !== `https://securetoken.google.com/${cfg.projectId}`) {
    throw new Error("Token issuer mismatch.");
  }
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length > 128) {
    throw new Error("Missing token subject.");
  }
  if (typeof payload.exp !== "number" || payload.exp <= nowSec) {
    throw new Error("Token expired. Please sign in again.");
  }
  if (typeof payload.iat !== "number" || payload.iat > nowSec + 300) {
    throw new Error("Invalid token issue timestamp.");
  }
  if (payload.email_verified !== true || !payload.email) {
    throw new Error("Verified email account required for admin operations.");
  }

  const emailLower = payload.email.toLowerCase();
  if (emailLower !== BOOTSTRAPPED_ADMIN_EMAIL) {
    // Verify secondary admin membership via Firestore REST using the caller's verified ID token
    const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      cfg.projectId
    )}/databases/${encodeURIComponent(cfg.firestoreDatabaseId)}/documents/admins/${encodeURIComponent(
      payload.sub
    )}`;

    const adminResp = await fetch(adminDocUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    if (!adminResp.ok) {
      throw new Error("Access denied: account is not authorized as an editorial administrator.");
    }
  }

  return {
    uid: payload.sub,
    email: emailLower,
    emailVerified: true,
    name: payload.name
  };
}
