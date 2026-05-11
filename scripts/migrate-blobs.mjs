// Migrate legacy base64 attachments out of PostgreSQL into Vercel Blob.
//
// What this touches:
//   - documents.fileData          (transporter KYC: license, insurance, …)
//   - transport_requests.proofOfDelivery
//
// Strategy:
//   For each row whose column starts with "data:" (base64 data URL), or is
//   long enough to plausibly be raw base64 (>500 chars) and not already a
//   Vercel Blob URL, upload the content to Blob and replace the column with
//   the public URL.
//
// Safety:
//   - Dry-run by default. Pass `--apply` to actually mutate the DB.
//   - Each upload is independent — if one row fails, the others continue.
//   - Idempotent: rows whose column is already a https://… URL are skipped.
//
// Usage (PowerShell):
//   $env:DATABASE_URL = "postgres://..."
//   $env:BLOB_READ_WRITE_TOKEN = "vercel_blob_..."
//   node scripts/migrate-blobs.mjs            # dry-run report
//   node scripts/migrate-blobs.mjs --apply    # actually migrate

import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { put } from "@vercel/blob";

const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set.");
  process.exit(1);
}
if (APPLY && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("❌ BLOB_READ_WRITE_TOKEN not set — required for --apply.");
  process.exit(1);
}

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

// True when the column still holds raw bytes vs. an already-uploaded URL.
function looksLikeBase64(value) {
  if (typeof value !== "string") return false;
  if (value.startsWith("https://")) return false;
  if (value.startsWith("data:")) return true;
  // Raw base64 (no data: prefix) — anything over a few hundred chars that's
  // clearly not a URL or short path.
  return value.length > 500 && !/^\/|^http/.test(value);
}

function parseDataUrl(value) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(value);
  if (m) return { buffer: Buffer.from(m[2], "base64"), contentType: m[1] };
  // Raw base64 — assume JPEG (the app always compresses to JPEG client-side).
  return { buffer: Buffer.from(value, "base64"), contentType: "image/jpeg" };
}

async function uploadOne(pathname, value) {
  const { buffer, contentType } = parseDataUrl(value);
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return { url: blob.url, bytes: buffer.length };
}

async function migrateDocuments() {
  console.log("\n── documents.fileData ──");
  const rows = await prisma.document.findMany({
    select: { id: true, transporterId: true, type: true, fileData: true },
  });
  const candidates = rows.filter(r => looksLikeBase64(r.fileData));
  console.log(`Total: ${rows.length}  |  Already on Blob: ${rows.length - candidates.length}  |  To migrate: ${candidates.length}`);

  if (!APPLY) return { total: rows.length, candidates: candidates.length, migrated: 0, bytes: 0 };

  let migrated = 0, bytes = 0;
  for (const r of candidates) {
    try {
      const { url, bytes: b } = await uploadOne(`documents/${r.transporterId}/${r.type}.jpg`, r.fileData);
      await prisma.document.update({ where: { id: r.id }, data: { fileData: url } });
      migrated++; bytes += b;
      console.log(`  ✓ ${r.type.padEnd(12)} ${r.id} → ${(b / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.error(`  ✗ ${r.id}: ${e.message}`);
    }
  }
  return { total: rows.length, candidates: candidates.length, migrated, bytes };
}

async function migrateProofs() {
  console.log("\n── transport_requests.proofOfDelivery ──");
  const rows = await prisma.transportRequest.findMany({
    where: { proofOfDelivery: { not: null } },
    select: { id: true, proofOfDelivery: true },
  });
  const candidates = rows.filter(r => looksLikeBase64(r.proofOfDelivery));
  console.log(`Total: ${rows.length}  |  Already on Blob: ${rows.length - candidates.length}  |  To migrate: ${candidates.length}`);

  if (!APPLY) return { total: rows.length, candidates: candidates.length, migrated: 0, bytes: 0 };

  let migrated = 0, bytes = 0;
  for (const r of candidates) {
    try {
      const { url, bytes: b } = await uploadOne(`proofs/${r.id}.jpg`, r.proofOfDelivery);
      await prisma.transportRequest.update({ where: { id: r.id }, data: { proofOfDelivery: url } });
      migrated++; bytes += b;
      console.log(`  ✓ proof ${r.id} → ${(b / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.error(`  ✗ ${r.id}: ${e.message}`);
    }
  }
  return { total: rows.length, candidates: candidates.length, migrated, bytes };
}

async function main() {
  console.log(APPLY ? "🚀 APPLY mode — DB will be modified." : "🔍 DRY-RUN — pass --apply to mutate the DB.");

  const docs   = await migrateDocuments();
  const proofs = await migrateProofs();

  const totalCandidates = docs.candidates + proofs.candidates;
  const totalMigrated   = docs.migrated   + proofs.migrated;
  const totalBytes      = docs.bytes      + proofs.bytes;

  console.log("\n──── Summary ────");
  console.log(`Candidates: ${totalCandidates}`);
  if (APPLY) {
    console.log(`Migrated:   ${totalMigrated}`);
    console.log(`Freed:      ~${(totalBytes / 1024 / 1024).toFixed(2)} MB from PostgreSQL`);
  } else {
    console.log("Run again with --apply to perform the migration.");
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
