/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seeds Firestore with products using Firebase Admin SDK.
 *
 * Prereqs:
 * - Create a service account key JSON in Firebase Console:
 *   Project settings → Service accounts → Generate new private key
 * - Set env var:
 *   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccountKey.json
 *
 * Usage:
 *   node scripts/seed-products.cjs --count 100
 */

const admin = require("firebase-admin");

function argValue(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  return v ?? fallback;
}

function toInt(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function rand(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function makeProduct(i) {
  const categories = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Books"];
  const adjectives = [
    "Premium",
    "Compact",
    "Smart",
    "Essential",
    "Modern",
    "Ultra",
    "Classic",
    "Pro",
    "Eco",
    "Minimal",
  ];
  const nounsByCategory = {
    Electronics: ["Headphones", "Smartwatch", "Bluetooth Speaker", "Webcam", "Keyboard", "Power Bank"],
    Fashion: ["Sneakers", "Hoodie", "Backpack", "Jacket", "Sunglasses", "Watch Strap"],
    Home: ["Lamp", "Throw Pillow", "Coffee Grinder", "Storage Box", "Desk Organizer", "Air Purifier"],
    Beauty: ["Skincare Set", "Hair Dryer", "Face Serum", "Trimmer", "Body Lotion", "Makeup Brush Set"],
    Sports: ["Yoga Mat", "Dumbbells", "Water Bottle", "Running Belt", "Resistance Bands", "Gym Gloves"],
    Books: ["Notebook", "Planner", "Reading Light", "Book Stand", "Marker Set", "Journal"],
  };

  const category = pick(categories, i);
  const adjective = pick(adjectives, i * 7);
  const noun = pick(nounsByCategory[category], i * 11);
  const title = `${adjective} ${noun} ${String(i + 1).padStart(3, "0")}`;
  const titleLower = title.toLowerCase();

  const priceBase = category === "Electronics" ? rand(19, 199) : rand(5, 89);
  const stock = Math.max(0, Math.floor(rand(0, 200)));
  const ratingAvg = Math.max(3, Math.min(5, rand(3.4, 4.9)));

  const description =
    `Meet the ${title}. Designed for everyday use with a focus on comfort, durability, and clean aesthetics. ` +
    `Ships fast and works great as a gift or a personal upgrade.`;

  const highlights = [
    "Quality materials and solid finish",
    "Comfortable for daily use",
    "Great value for the price",
    "Simple setup and easy care",
    "Responsive support and warranty",
  ].slice(0, 3 + (i % 3));

  // Stable placeholder images (no API key needed).
  const images = [
    `https://picsum.photos/seed/Hudai-${i}-a/1200/900`,
    `https://picsum.photos/seed/Hudai-${i}-b/1200/900`,
    `https://picsum.photos/seed/Hudai-${i}-c/1200/900`,
  ];

  return {
    title,
    titleLower,
    description,
    highlights,
    price: priceBase,
    images,
    category,
    stock,
    ratingAvg,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function main() {
  const count = toInt(argValue("--count", "100"), 100);

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("Missing GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON).");
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }

  const db = admin.firestore();
  const col = db.collection("products");

  console.log(`Seeding ${count} products...`);

  const batchSize = 400;
  for (let offset = 0; offset < count; offset += batchSize) {
    const batch = db.batch();
    const end = Math.min(count, offset + batchSize);
    for (let i = offset; i < end; i++) {
      const id = `seed-${String(i + 1).padStart(4, "0")}`;
      batch.set(col.doc(id), makeProduct(i), { merge: true });
    }
    await batch.commit();
    console.log(`Committed ${end}/${count}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
