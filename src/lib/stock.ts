// stock.ts — royalty-free stock image search for /carrusel variant (c),
// publish-grade. These providers return license-clear images for commercial use,
// with attribution metadata:
//   • Pexels  (default) — Pexels License, free for commercial use, no attribution
//                         required (appreciated). Key: PEXELS_API_KEY.
//   • Unsplash          — Unsplash License, free to use; attribution appreciated.
//                         Key: UNSPLASH_ACCESS_KEY (a "Client-ID").
//
// Get a free key: pexels.com/api  /  unsplash.com/developers

import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { downloadFile } from "./download.js";

export type StockProvider = "pexels" | "unsplash";

export interface StockImage {
  url: string;          // downloadable, license-clear image URL
  width: number;
  height: number;
  photographer: string; // attribution name
  sourceUrl: string;    // page on the provider (for attribution / review)
  alt: string;
  provider: StockProvider;
}

export interface StockSearchOpts {
  provider?: StockProvider;
  perPage?: number;                                  // results per query (default 15)
  orientation?: "landscape" | "portrait" | "square"; // optional bias
}

function pexelsKey(): string {
  const k = process.env["PEXELS_API_KEY"];
  if (!k) throw new Error("PEXELS_API_KEY not set in .env (get one free at pexels.com/api)");
  return k;
}
function unsplashKey(): string {
  const k = process.env["UNSPLASH_ACCESS_KEY"];
  if (!k) throw new Error("UNSPLASH_ACCESS_KEY not set in .env (get one free at unsplash.com/developers)");
  return k;
}

export async function searchStock(query: string, opts: StockSearchOpts = {}): Promise<StockImage[]> {
  const provider = opts.provider ?? "pexels";
  const perPage = opts.perPage ?? 15;
  if (provider === "pexels") {
    const u = new URL("https://api.pexels.com/v1/search");
    u.searchParams.set("query", query);
    u.searchParams.set("per_page", String(perPage));
    if (opts.orientation) u.searchParams.set("orientation", opts.orientation);
    const res = await fetch(u, { headers: { Authorization: pexelsKey() } });
    if (!res.ok) throw new Error(`Pexels search failed: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { photos?: Array<Record<string, any>> };
    return (data.photos ?? []).map((p) => ({
      url: p["src"]?.["large2x"] ?? p["src"]?.["original"] ?? p["src"]?.["large"],
      width: p["width"] ?? 0,
      height: p["height"] ?? 0,
      photographer: p["photographer"] ?? "",
      sourceUrl: p["url"] ?? "",
      alt: p["alt"] ?? "",
      provider: "pexels" as const,
    })).filter((x) => x.url);
  }
  // unsplash
  const u = new URL("https://api.unsplash.com/search/photos");
  u.searchParams.set("query", query);
  u.searchParams.set("per_page", String(perPage));
  if (opts.orientation) u.searchParams.set("orientation", opts.orientation);
  const res = await fetch(u, { headers: { Authorization: `Client-ID ${unsplashKey()}` } });
  if (!res.ok) throw new Error(`Unsplash search failed: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { results?: Array<Record<string, any>> };
  return (data.results ?? []).map((r) => ({
    url: r["urls"]?.["regular"] ?? r["urls"]?.["full"],
    width: r["width"] ?? 0,
    height: r["height"] ?? 0,
    photographer: r["user"]?.["name"] ?? "",
    sourceUrl: r["links"]?.["html"] ?? "",
    alt: r["alt_description"] ?? "",
    provider: "unsplash" as const,
  })).filter((x) => x.url);
}

export interface StockDownloadOpts {
  count?: number;    // total images to download (default 6)
  prefix?: string;   // filename prefix (default "stock")
  destRel?: string;  // dir relative to projectRoot (default "slides/source")
}

export interface DownloadedStock {
  local: string;
  url: string;
  photographer: string;
  sourceUrl: string;
  alt: string;
  provider: StockProvider;
  width: number;
  height: number;
}

// Download top N (deduped) into the project + write a manifest with attribution.
export async function downloadStockImages(
  items: StockImage[],
  projectRoot: string,
  opts: StockDownloadOpts = {},
): Promise<DownloadedStock[]> {
  const count = opts.count ?? 6;
  const prefix = opts.prefix ?? "stock";
  const destRel = opts.destRel ?? "slides/source";

  const seen = new Set<string>();
  const picked = items.filter((it) => (it.url && !seen.has(it.url) && (seen.add(it.url), true))).slice(0, count);

  const out: DownloadedStock[] = [];
  let i = 0;
  for (const it of picked) {
    i++;
    const name = `${prefix}-${String(i).padStart(2, "0")}.jpg`;
    const rel = `${destRel}/${name}`;
    const abs = join(projectRoot, rel);
    if (!existsSync(abs)) await downloadFile(it.url, abs);
    out.push({
      local: rel, url: it.url, photographer: it.photographer, sourceUrl: it.sourceUrl,
      alt: it.alt, provider: it.provider, width: it.width, height: it.height,
    });
    process.stdout.write(`  ${name} ← ${it.provider}: ${it.photographer}\n`);
  }

  const license = picked[0]?.provider === "unsplash"
    ? "Unsplash License — free to use; attribution appreciated (photographer + unsplash.com)."
    : "Pexels License — free for commercial use, no attribution required (appreciated).";
  await writeFile(
    join(projectRoot, destRel, `${prefix}-manifest.json`),
    JSON.stringify({ _license: license, generatedFor: "carousel variant (c) — royalty-free", images: out }, null, 2),
  );
  return out;
}
