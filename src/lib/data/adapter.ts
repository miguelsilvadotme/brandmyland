import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type AppStore,
  createEmptyStore,
  seedDemoStore,
} from "@/lib/data/store";
import { buildDefaultSettings } from "@/lib/config";
import { createClient } from "@supabase/supabase-js";

const globalForStore = globalThis as unknown as { __bmlStore?: AppStore };

function dataFilePath() {
  return join(process.cwd(), ".data", "store.json");
}

function loadFromDisk(): AppStore | null {
  try {
    const raw = readFileSync(dataFilePath(), "utf8");
    return JSON.parse(raw) as AppStore;
  } catch {
    return null;
  }
}

function persist(store: AppStore) {
  try {
    const path = dataFilePath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(store));
  } catch {
    // Demo/dev persistence is best-effort (read-only deploys still run in memory).
  }
}

function initStore(): AppStore {
  const disk = loadFromDisk();
  if (disk?.settings) return disk;
  const empty = createEmptyStore(buildDefaultSettings());
  return seedDemoStore(empty);
}

export function getMemoryStore(): AppStore {
  if (!globalForStore.__bmlStore) {
    globalForStore.__bmlStore = initStore();
  }
  return globalForStore.__bmlStore;
}

export function saveMemoryStore() {
  persist(getMemoryStore());
}

export function resetMemoryStore(store?: AppStore) {
  globalForStore.__bmlStore = store ?? seedDemoStore(createEmptyStore());
  saveMemoryStore();
}

export function supabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdmin() {
  if (!supabaseConfigured()) return null;
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
