import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Both src/lib/ and src/pipelines/ live one directory below src/, so the
// "../.." resolution yields the repo root from either location.
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
