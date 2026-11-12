import {type WikiDetails} from './wiki-details-types';
import {supabase} from './static-data';
import type {BetaHero} from './V2Workspace';

/**
 * Phase 2: Save pre-parsed wiki_details directly to the heroes Supabase row.
 * Called from WikiHeroImport.tsx after a successful wiki merge.
 */
export async function saveWikiDetails(hero: BetaHero, details: WikiDetails): Promise<void> {
  const hasContent = details.description || details.stats_base || details.stats_lv40
    || details.voice_en || details.voice_ja || details.artist;
  if (!hasContent) return;
  const {error} = await supabase
    .from('heroes')
    .update({wiki_details: details})
    .eq('id', hero.id);
  if (error) console.error('[wiki_details] save error:', error.message);
}

/**
 * Phase 2: Fetch the current wiki_details for a hero from Supabase.
 * Returns null if none saved yet.
 */
export async function loadWikiDetails(heroId: string): Promise<WikiDetails | null> {
  const {data, error} = await supabase
    .from('heroes')
    .select('wiki_details')
    .eq('id', heroId)
    .single();
  if (error || !data?.wiki_details) return null;
  try {
    const raw = data.wiki_details;
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as WikiDetails;
  } catch {
    return null;
  }
}
