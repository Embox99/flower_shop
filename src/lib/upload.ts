/**
 * S3-compatible storage helpers.
 * Works with AWS S3, Cloudflare R2, MinIO, etc. Configured via env vars.
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

let _client: S3Client | null = null;

function client() {
  if (_client) return _client;
  _client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: !!process.env.S3_ENDPOINT, // needed by MinIO
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "",
      secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
  });
  return _client;
}

const BUCKET = process.env.S3_BUCKET || "flower-shop";
const PUBLIC = process.env.S3_PUBLIC_URL || "";

/**
 * Generate a signed PUT URL the browser can upload directly to.
 * Returns the upload URL + the public-facing URL the image will live at.
 */
export async function createSignedUploadUrl(opts: {
  contentType: string;
  prefix?: string;
}) {
  const ext = (opts.contentType.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "");
  const key = `${opts.prefix || "uploads"}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(client(), cmd, { expiresIn: 60 * 5 });
  const publicUrl = PUBLIC ? `${PUBLIC}/${key}` : key;
  return { uploadUrl, publicUrl, key };
}
