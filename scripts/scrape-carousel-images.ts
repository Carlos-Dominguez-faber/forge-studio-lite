#!/usr/bin/env tsx
/**
 * scrape-carousel-images.ts — /carrusel variant (c): source royalty-free,
 * publish-grade illustrative images for slides. Two sources via the `source` field:
 *   • "pexels"  (default) — Pexels License, free for commercial use. Needs PEXELS_API_KEY.
 *   • "unsplash"          — Unsplash License, free to use.          Needs UNSPLASH_ACCESS_KEY.
 *
 * Free keys: pexels.com/api  ·  unsplash.com/developers
 *
 * Usage:
 *   npm run scrape-images -- <project-dir>
 *   # or: npx tsx --env-file=.env scripts/scrape-carousel-images.ts <project-dir>
 *
 * Reads <project-dir>/stock-queries.json:
 *   {
 *     "source": "pexels",        // "pexels" | "unsplash" (default "pexels")
 *     "queries": ["minimalist workspace desk", "soft morning light office"],
 *     "count": 6,                // how many images to download total (default 6)
 *     "max_per_query": 15,       // results per query (default 15)
 *     "prefix": "stock",         // slide-source filename prefix (default "stock")
 *     "orientation": "square"    // landscape | portrait | square (optional bias)
 *   }
 *
 * Downloads into <project>/slides/source/<prefix>-NN.jpg (slides reference them by
 * bare filename, same convention as bank photos) + writes
 * slides/source/<prefix>-manifest.json with attribution + license per image.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { searchStock, downloadStockImages, type StockImage, type StockProvider } from "../src/lib/stock.js";

async function main(): Promise<void> {
  const projectArg = process.argv[2];
  if (!projectArg) {
    console.error("Usage: npm run scrape-images -- <project-dir>");
    process.exit(1);
  }
  const root = resolve(projectArg);
  const cfgPath = join(root, "stock-queries.json");
  if (!existsSync(cfgPath)) {
    console.error(`Not found: ${cfgPath} (expected { source?, queries: [...], count?, max_per_query?, prefix?, orientation? })`);
    process.exit(1);
  }
  const cfg = JSON.parse(await readFile(cfgPath, "utf8")) as {
    queries?: string[];
    source?: "pexels" | "unsplash"; // default "pexels"
    count?: number;
    max_per_query?: number;
    prefix?: string;
    orientation?: "landscape" | "portrait" | "square";
  };
  const queries = (cfg.queries ?? []).filter(Boolean);
  if (queries.length === 0) {
    console.error("stock-queries.json has no queries[]");
    process.exit(1);
  }

  const source = cfg.source ?? "pexels";
  const prefix = cfg.prefix ?? "stock";

  // pexels | unsplash — royalty-free, publish-grade, license-clear.
  console.log(`▸ Searching ${queries.length} query(ies) via ${source} (royalty-free)…`);
  const all: StockImage[] = [];
  for (const q of queries) {
    const items = await searchStock(q, {
      provider: source as StockProvider,
      perPage: cfg.max_per_query ?? 15,
      ...(cfg.orientation ? { orientation: cfg.orientation } : {}),
    });
    all.push(...items);
  }
  console.log(`  ${all.length} results`);
  const downloaded = await downloadStockImages(all, root, { count: cfg.count ?? 6, prefix });
  console.log(`✓ ${downloaded.length} image(s) → slides/source/ (license-clear)`);
  console.log(`  attribution + license: slides/source/${prefix}-manifest.json`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
