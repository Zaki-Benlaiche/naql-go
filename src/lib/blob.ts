import { put, del } from "@vercel/blob";

// Parses a "data:image/jpeg;base64,..." string into raw bytes + mime.
function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return { buffer: Buffer.from(dataUrl, "base64"), contentType: "image/jpeg" };
  }
  return { buffer: Buffer.from(match[2], "base64"), contentType: match[1] };
}

// Uploads a base64 / data-URL string to Vercel Blob and returns the public URL.
// Falls back to returning the original data URL if BLOB_READ_WRITE_TOKEN is missing
// (so local dev keeps working without a token).
export async function uploadBase64(
  pathname: string,
  data: string
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return data;
  }

  const { buffer, contentType } = parseDataUrl(data);
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

// Best-effort delete; ignores failures (file may already be gone).
export async function deleteBlobUrl(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return;
  if (!url.startsWith("https://") || !url.includes(".public.blob.vercel-storage.com")) return;
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {}
}
