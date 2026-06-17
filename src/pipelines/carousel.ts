#!/usr/bin/env tsx
/**
 * /carousel — render Instagram carousel slides (1080×1080 PNGs)
 *
 * Usage:
 *   tsx src/pipelines/carousel.ts <project-dir>
 *
 * Expects:
 *   <project-dir>/slides/source/slide-NN.html   (NN = 01, 02, ...)
 *
 * Produces:
 *   <project-dir>/slides/slide-NN.png
 */

import { chromium } from "playwright";
import { readdir, mkdir, readFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { REPO_ROOT } from "../lib/paths.js";

const SLIDE_SIZE = 1080;
const SLIDE_PATTERN = /^slide-\d+\.html$/;
const IMG_EXT = /\.(png|jpe?g|webp)$/i;

// Photo bank lives at <repo>/brand/photos/ (per-brand, gitignored). Carousel
// projects live on the external volume, so repo-relative paths don't resolve;
// instead a slide references a bank photo by BARE FILENAME (no slash) and this
// pass copies it next to the slide HTML so `file://` resolves it as a sibling.
// Idempotent (copy-if-missing). Supports <img src="…"> and CSS url("…").
async function resolveBankPhotos(sourceDir: string, slideFiles: string[]): Promise<void> {
  const photosDir = join(REPO_ROOT, "brand", "photos");
  if (!existsSync(photosDir)) return;
  // <img … src="…"> and CSS url("…") / url(…) — both bounded by the closing
  // quote or paren so the capture can't collapse to a single char.
  const imgRe = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;
  const urlRe = /url\(\s*["']?([^"')]+?)["']?\s*\)/gi;
  const wanted = new Set<string>();
  for (const slide of slideFiles) {
    const html = await readFile(join(sourceDir, slide), "utf8");
    for (const re of [imgRe, urlRe]) {
      for (const m of html.matchAll(re)) {
        const ref = m[1]!.trim();
        if (ref.includes("/") || ref.includes(":")) continue; // skip urls/paths/data
        if (IMG_EXT.test(ref)) wanted.add(ref);
      }
    }
  }
  for (const name of wanted) {
    const dest = join(sourceDir, name);
    if (existsSync(dest)) continue;
    const src = join(photosDir, name);
    if (!existsSync(src)) continue; // not a bank photo — leave the ref untouched
    await copyFile(src, dest);
    console.log(`  ⤷ photo ${name} (from brand/photos)`);
  }
}

async function main(): Promise<void> {
  const projectArg = process.argv[2];
  if (!projectArg) {
    console.error("Usage: tsx src/pipelines/carousel.ts <project-dir>");
    process.exit(1);
  }

  const root = resolve(projectArg);
  const sourceDir = join(root, "slides", "source");
  const outputDir = join(root, "slides");

  if (!existsSync(sourceDir)) {
    console.error(`Source dir not found: ${sourceDir}`);
    process.exit(1);
  }

  const slides = (await readdir(sourceDir))
    .filter((f) => SLIDE_PATTERN.test(f))
    .sort();

  if (slides.length === 0) {
    console.error(`No slide-NN.html files found in ${sourceDir}`);
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  // Provision any bank photos referenced by bare filename before rendering.
  await resolveBankPhotos(sourceDir, slides);

  console.log(`▸ Rendering ${slides.length} slide(s) at ${SLIDE_SIZE}×${SLIDE_SIZE}`);
  const start = Date.now();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: SLIDE_SIZE, height: SLIDE_SIZE },
    deviceScaleFactor: 1,
  });

  for (const slide of slides) {
    const sourceFile = join(sourceDir, slide);
    const outFile = join(outputDir, slide.replace(/\.html$/, ".png"));
    const page = await context.newPage();
    await page.goto(`file://${sourceFile}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: outFile,
      clip: { x: 0, y: 0, width: SLIDE_SIZE, height: SLIDE_SIZE },
    });
    await page.close();
    console.log(`  ✓ ${slide.replace(/\.html$/, ".png")}`);
  }

  await context.close();
  await browser.close();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✓ ${slides.length} slides → ${outputDir} in ${elapsed}s`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
