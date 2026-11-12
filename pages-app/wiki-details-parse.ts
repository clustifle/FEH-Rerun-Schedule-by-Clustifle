// Phase 2 patch for wiki-hero-import.ts
// Add these two lines at the top of wiki-hero-import.ts (after the existing imports):
//   import type {WikiDetails,WikiStats} from './wiki-details-types';
//
// Change the WikiHero type to add wikiDetails:
//   export type WikiHero={title:string;version:string|null;releaseDate:string|null;skills:WikiSkill[];url:string;wikiDetails?:WikiDetails|null;identity?:{...}};
//
// Add this function anywhere before parseWikiHero:

import type {WikiDetails, WikiStats} from './wiki-details-types';

/** Parse a stat row from the wiki identity table (e.g. "HP / ATK / SPD / DEF / RES" cells). */
function parseWikiStats(doc: Document, label: RegExp): WikiStats | null {
  for (const tr of doc.querySelectorAll('tr')) {
    const cells = Array.from(tr.children);
    const headerText = cells[0]?.textContent?.trim() || '';
    if (!label.test(headerText)) continue;
    // Some wiki pages put stats in a single cell as "X / Y / Z / W / V"
    const allText = Array.from(cells.slice(1)).map(c => c.textContent?.trim() || '').join(' ');
    const nums = [...allText.matchAll(/\d+/g)].map(m => Number(m[0]));
    if (nums.length >= 5) return {hp: nums[0], atk: nums[1], spd: nums[2], def: nums[3], res: nums[4]};
  }
  return null;
}

/** Parse all Phase 2 extra wiki details from the parsed HTML document. */
export function parseWikiDetails(doc: Document, url: string): WikiDetails {
  const infoText = (label: string | RegExp): string => {
    for (const tr of doc.querySelectorAll('tr')) {
      const cells = Array.from(tr.children);
      const key = cells[0]?.textContent?.normalize('NFC').replace(/\s+/g, ' ').trim() || '';
      const matches = typeof label === 'string' ? key.toLowerCase() === label.toLowerCase() : label.test(key);
      if (matches && cells[1]) return cells[1].textContent?.normalize('NFC').replace(/\s+/g, ' ').trim() || '';
    }
    return '';
  };

  // Description: usually a blockquote or the first paragraph inside the page content
  let description: string | null = null;
  const quote = doc.querySelector('.quote, blockquote, .hero-quote');
  if (quote) {
    description = quote.textContent?.normalize('NFC').replace(/\s+/g, ' ').trim() || null;
  } else {
    // Try the flavor text row in the identity table
    const flavorRow = infoText(/^(Description|Lore|Flavor text)$/i);
    if (flavorRow) description = flavorRow;
  }

  // Stats: wiki uses "HP/Atk/Spd/Def/Res" labels for base and level-40
  const stats_base = parseWikiStats(doc, /^(Base Stats|Lv\.?\s*1 Stats|Level 1)/i);
  const stats_lv40 = parseWikiStats(doc, /^(Max Stats|Lv\.?\s*40 Stats|Level 40)/i);

  // Voice actors
  const voice_en = infoText(/^(English VA|VA \(EN\)|Voice \(EN\)|English Voice)/i) || null;
  const voice_ja = infoText(/^(Japanese VA|VA \(JP\)|Voice \(JP\)|Japanese Voice)/i) || null;

  // Artist / illustrator
  const artist = infoText(/^(Illustrator|Artist|Character Art)/i) || null;

  return {description, stats_base, stats_lv40, voice_en, voice_ja, artist, source_url: url};
}
