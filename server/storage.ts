// Preconfigured storage helpers for web templates
// Uploads via presigned URL to S3 (PUT direct).
// Downloads return /storage/{key} paths served via 307 redirect.
// Fallback writes files locally under uploads/ directory if Forge is unavailable or if using local/Groq storage.

import { ENV } from "./_core/env";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  
  // Use local storage fallback if using Groq or if Forge isn't configured
  const isLocal = !ENV.forgeApiUrl || ENV.forgeApiUrl.includes("groq") || !ENV.forgeApiUrl.includes("manus");
  
  if (isLocal) {
    const fullPath = path.join(UPLOADS_DIR, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, data);
    return { key, url: `/storage/${key}` };
  }

  try {
    const { forgeUrl, forgeKey } = getForgeConfig();

    // 1. Get presigned PUT URL from Forge
    const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
    presignUrl.searchParams.set("path", key);

    const presignResp = await fetch(presignUrl, {
      headers: { Authorization: `Bearer ${forgeKey}` },
    });

    if (!presignResp.ok) {
      const msg = await presignResp.text().catch(() => presignResp.statusText);
      throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
    }

    const { url: s3Url } = (await presignResp.json()) as { url: string };
    if (!s3Url) throw new Error("Forge returned empty presign URL");

    // 2. PUT file directly to S3
    const blob =
      typeof data === "string"
        ? new Blob([data], { type: contentType })
        : new Blob([data as any], { type: contentType });

    const uploadResp = await fetch(s3Url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });

    if (!uploadResp.ok) {
      throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
    }

    return { key, url: `/storage/${key}` };
  } catch (error) {
    console.warn("[Storage] Forge upload failed, falling back to local file storage:", error);
    const fullPath = path.join(UPLOADS_DIR, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, data);
    return { key, url: `/storage/${key}` };
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  
  const isLocal = !ENV.forgeApiUrl || ENV.forgeApiUrl.includes("groq") || !ENV.forgeApiUrl.includes("manus");
  if (isLocal) {
    return `/storage/${key}`;
  }

  try {
    const { forgeUrl, forgeKey } = getForgeConfig();

    const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
    getUrl.searchParams.set("path", key);

    const resp = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${forgeKey}` },
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => resp.statusText);
      throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
    }

    const { url } = (await resp.json()) as { url: string };
    return url;
  } catch (error) {
    console.warn("[Storage] Forge signed URL failed, falling back to local storage path:", error);
    return `/storage/${key}`;
  }
}
