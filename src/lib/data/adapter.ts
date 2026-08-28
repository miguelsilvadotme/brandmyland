import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type AppStore,
  createEmptyStore,
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

function stripDemoBids(store: AppStore): AppStore {
  const demoBidderIds = new Set(
    store.bidders.filter((b) => b.id.startsWith("demo-")).map((b) => b.id),
  );
  const demoBrandIds = new Set(
    store.brands
      .filter((b) => b.isDemo || demoBidderIds.has(b.bidderId))
      .map((b) => b.id),
  );
  const demoBidIds = new Set(
    store.bids
      .filter(
        (b) => b.id.startsWith("demo-") || demoBrandIds.has(b.brandId),
      )
      .map((b) => b.id),
  );
  return {
    ...store,
    bidders: store.bidders.filter((b) => !demoBidderIds.has(b.id)),
    brands: store.brands.filter((b) => !demoBrandIds.has(b.id)),
    bids: store.bids.filter((b) => !demoBidIds.has(b.id)),
    payments: store.payments.filter((p) => !demoBidIds.has(p.bidId)),
  };
}

function initStore(): AppStore {
  const disk = loadFromDisk();
  if (!disk?.settings) {
    const fresh = createEmptyStore(buildDefaultSettings());
    persist(fresh);
    return fresh;
  }
  const cleaned = stripDemoBids(disk);
  if (cleaned.bids.length === 0) {
    const fresh = createEmptyStore(cleaned.settings);
    persist(fresh);
    return fresh;
  }
  persist(cleaned);
  return cleaned;
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
  globalForStore.__bmlStore = store ?? createEmptyStore();
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
