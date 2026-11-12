// Phase 2: wiki_details type — stored as JSONB in the heroes Supabase table.
// Fields are all optional so existing heroes without wiki details degrade gracefully.

export interface WikiStats {
  hp: number | null;
  atk: number | null;
  spd: number | null;
  def: number | null;
  res: number | null;
}

export interface WikiDetails {
  description?: string | null;
  stats_base?: WikiStats | null;
  stats_lv40?: WikiStats | null;
  voice_en?: string | null;
  voice_ja?: string | null;
  artist?: string | null;
  source_url?: string | null;
}

export const emptyWikiDetails = (): WikiDetails => ({
  description: null,
  stats_base: null,
  stats_lv40: null,
  voice_en: null,
  voice_ja: null,
  artist: null,
  source_url: null,
});

/** Safely parse a raw wiki_details value from Supabase (may be a string, object, or null). */
export function parseWikiDetails(raw: unknown): WikiDetails | null {
  if (!raw) return null;
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof obj !== 'object' || Array.isArray(obj)) return null;
    return obj as WikiDetails;
  } catch {
    return null;
  }
}
