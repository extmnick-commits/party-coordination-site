/**
 * One-time upload: public/recent-event/* → Firebase Storage + Firestore URLs.
 *
 * Requires Application Default Credentials or a service account:
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
 *   node scripts/upload-recent-event.cjs
 */
const { readFileSync, readdirSync } = require("node:fs");
const { join } = require("node:path");
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore } = require("firebase-admin/firestore");

const projectRoot = join(__dirname, "..");
const mediaDir = join(projectRoot, "public", "recent-event");

const projectId = "elegant-events-21396";
const storageBucket = "elegant-events-21396.firebasestorage.app";

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId,
    storageBucket,
  });
} else {
  admin.initializeApp({
    credential: admin.applicationDefault(),
    projectId,
    storageBucket,
  });
}

const bucket = getStorage().bucket();
const db = getFirestore();

function publicUrl(objectPath) {
  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encoded}?alt=media`;
}

async function uploadFile(localName, storagePath) {
  const localPath = join(mediaDir, localName);
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { cacheControl: "public, max-age=31536000" },
  });
  return publicUrl(storagePath);
}

async function main() {
  const videoUrl = await uploadFile("event-video.mp4", "recent-event/event-video.mp4");
  console.log("Uploaded event-video.mp4");

  const photoFiles = readdirSync(mediaDir)
    .filter((name) => /^photo-\d+\.jpg$/i.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
      const nb = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
      return na - nb;
    });

  const photoUrls = [];
  for (const file of photoFiles) {
    const url = await uploadFile(file, `recent-event/${file}`);
    photoUrls.push(url);
    console.log(`Uploaded ${file}`);
  }

  await db.doc("content/home").set(
    { recentEventVideo: videoUrl, recentEventPhotos: photoUrls },
    { merge: true }
  );

  console.log(`\nDone. Video + ${photoUrls.length} photos saved to content/home.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
