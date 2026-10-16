/*
 * Generate local WebP delivery assets without changing or deleting sources.
 * Run: node scripts/prepare-media.cjs
 * Requires the sharp package, either available to Node or beside its runtime.
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = require(path.join(path.dirname(process.execPath), 'node_modules', 'sharp'));
}

const projectRoot = path.resolve(__dirname, '..');
const imageRoot = 'assets/images';
const domeSources = 'ملف الصور/صور القبة الشفافة';
const jobs = [];

function add(source, destination, options = {}) {
  jobs.push({
    source,
    destination: `${imageRoot}/${destination}`,
    maxWidth: 1200,
    quality: 85,
    ...options,
  });
}

const heroSources = [
  `${domeSources}/قبة شفافة بستة كراسٍ على سطح سعودي.png`,
  `${domeSources}/جلسة قهوة عربية داخل قبة شفافة-5.png`,
  `${imageRoot}/domes/dome-night-01.jpg`,
];

heroSources.forEach((source, index) => {
  const number = String(index + 1).padStart(2, '0');
  add(source, `domes/hero/dome-hero-${number}.webp`, {
    maxWidth: 1440,
    maxHeight: 1440,
    quality: 87,
  });
  add(source, `domes/hero/dome-hero-${number}-640.webp`, {
    maxWidth: 640,
    quality: 85,
  });
});

[
  ['dome-project-01.jpg', 'dome-gallery-01.webp'],
  ['dome-day-01.jpg', 'dome-day-01.webp'],
  ['dome-night-01.jpg', 'dome-night-01.webp'],
  ['dome-rain-01.jpg', 'dome-rain-01.webp'],
  ['dome-studio-01.jpg', 'dome-interior-01.webp'],
  ['dome-studio-02.jpg', 'dome-interior-02.webp'],
].forEach(([source, output]) => {
  add(`${imageRoot}/domes/${source}`, `domes/gallery/${output}`);
});

add(
  `${domeSources}/٢٠٢٦_٠٣_٢١_٠٩_٣٩_IMG_7458.00_00_04_09.Still001.png`,
  'domes/gallery/dome-workshop-01.webp',
);
add(
  `${domeSources}/٢٠٢٦_٠٣_٢١_١٢_٠١_IMG_7459.00_00_00_00.Still001.png`,
  'domes/gallery/dome-interior-03.webp',
);
add(`${domeSources}/مواصفات قبة 3.9متر.png`, 'domes/gallery/dome-specifications-01.webp', {
  quality: 94,
});

for (const number of ['01', '02']) {
  add(`${imageRoot}/machines/bending-machine-${number}.png`, `machines/machine-bending-${number}.webp`);
  add(`${imageRoot}/trailers/trailer-${number}.jpg`, `trailers/trailer-${number}.webp`);
  add(`${imageRoot}/greenhouses/greenhouse-${number}.jpg`, `greenhouses/greenhouse-${number}.webp`);
}
for (const number of ['01', '02', '03', '04']) {
  add(`${imageRoot}/car-shades/car-shade-${number}.jpg`, `car-shades/car-shade-${number}.webp`);
}
add(`${imageRoot}/brand/polar-bear-logo-yellow.png`, 'brand/brand-logo-01.webp', {
  maxWidth: 640,
  lossless: true,
});

async function main() {
  // Fail before generating anything when an expected source is unavailable.
  await Promise.all(jobs.map(job => fs.access(path.join(projectRoot, job.source))));
  const files = [];

  for (const job of jobs) {
    const sourcePath = path.join(projectRoot, job.source);
    const destinationPath = path.join(projectRoot, job.destination);
    const sourceMetadata = await sharp(sourcePath).metadata();
    const sourceStat = await fs.stat(sourcePath);

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    const output = await sharp(sourcePath)
      .rotate()
      .resize({
        width: job.maxWidth,
        height: job.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: job.quality,
        alphaQuality: 100,
        effort: 6,
        lossless: Boolean(job.lossless),
      })
      .toFile(destinationPath);
    const outputMetadata = await sharp(destinationPath).metadata();

    files.push({
      source: job.source,
      output: job.destination,
      original: {
        format: sourceMetadata.format,
        width: sourceMetadata.width,
        height: sourceMetadata.height,
        bytes: sourceStat.size,
        hasAlpha: sourceMetadata.hasAlpha,
      },
      generated: {
        format: output.format,
        width: output.width,
        height: output.height,
        bytes: output.size,
        hasAlpha: outputMetadata.hasAlpha,
      },
      settings: {
        maxWidth: job.maxWidth,
        ...(job.maxHeight ? { maxHeight: job.maxHeight } : {}),
        quality: job.quality,
        lossless: Boolean(job.lossless),
        withoutEnlargement: true,
        cropped: false,
      },
    });
  }

  const uniqueSources = new Map(files.map(file => [file.source, file.original.bytes]));
  const manifest = {
    generatedAt: new Date().toISOString(),
    generator: 'scripts/prepare-media.cjs',
    note: 'Local WebP derivatives only. Original files are preserved. Images are resized proportionally, never cropped or enlarged. The logo uses lossless WebP; alpha is preserved where present.',
    totals: {
      outputFiles: files.length,
      originalUniqueFiles: uniqueSources.size,
      originalUniqueBytes: [...uniqueSources.values()].reduce((sum, size) => sum + size, 0),
      generatedBytes: files.reduce((sum, file) => sum + file.generated.bytes, 0),
    },
    files,
  };

  await fs.writeFile(path.join(projectRoot, imageRoot, 'media-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const videosDirectory = path.join(projectRoot, 'assets/videos');
  await fs.mkdir(videosDirectory, { recursive: true });
  // Never truncate an existing placeholder, if one has been annotated later.
  await fs.writeFile(path.join(videosDirectory, '.gitkeep'), '', { flag: 'a' });

  console.log(JSON.stringify(manifest.totals, null, 2));
  for (const file of files) {
    const { width, height, bytes } = file.generated;
    console.log(`${file.output} | ${width}x${height} | ${bytes} bytes`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
