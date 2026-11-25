import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TARGET_DIRS = ["public", "src"];
const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const SKIP_NAMES = new Set(["favicon.png", "apple-touch-icon.png"]);

async function walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (RASTER_EXTS.has(ext) && !SKIP_NAMES.has(entry.name.toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function run() {
  const allFiles = (await Promise.all(TARGET_DIRS.map(walk))).flat();
  if (allFiles.length === 0) {
    console.log("No raster images found in public/ or src/.");
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;

  for (const filePath of allFiles) {
    const parsed = path.parse(filePath);
    const avifPath = path.join(parsed.dir, `${parsed.name}.avif`);
    const beforeStat = await fs.stat(filePath);
    totalBefore += beforeStat.size;

    await sharp(filePath)
      .avif({ quality: 65, effort: 4 })
      .toFile(avifPath);

    const afterStat = await fs.stat(avifPath);
    totalAfter += afterStat.size;
    console.log(
      `✓ ${path.relative(process.cwd(), avifPath)} (${(beforeStat.size / 1024).toFixed(1)} KB → ${(afterStat.size / 1024).toFixed(1)} KB)`
    );
  }

  console.log(
    `\nConverted ${allFiles.length} images: ${(totalBefore / 1024).toFixed(1)} KB → ${(totalAfter / 1024).toFixed(1)} KB`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});