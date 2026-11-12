import {useState} from 'react';
import {supabase} from './static-data';
import type {WikiDetails, WikiStats} from './wiki-details-types';
import {emptyWikiDetails} from './wiki-details-types';
import type {BetaHero} from './V2Workspace';

type StatField = keyof WikiStats;
const STAT_KEYS: StatField[] = ['hp', 'atk', 'spd', 'def', 'res'];
const STAT_LABELS: Record<StatField, string> = {hp: 'HP', atk: 'Atk', spd: 'Spd', def: 'Def', res: 'Res'};

function statVal(stats: WikiStats | null | undefined, key: StatField): string {
  const v = stats?.[key];
  return v != null ? String(v) : '';
}

function applyStatField(
  stats: WikiStats | null | undefined,
  key: StatField,
  value: string,
): WikiStats {
  const base: WikiStats = {hp: null, atk: null, spd: null, def: null, res: null, ...stats};
  const num = value === '' ? null : Number(value);
  return {...base, [key]: Number.isFinite(num) ? num : null};
}

interface Props {
  hero: BetaHero;
  initial: WikiDetails | null;
  onSaved: (next: WikiDetails) => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function WikiDetailsEditor({hero, initial, onSaved, onBusyChange}: Props) {
  const [form, setForm] = useState<WikiDetails>(initial ?? emptyWikiDetails());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function set<K extends keyof WikiDetails>(key: K, value: WikiDetails[K]) {
    setForm(f => ({...f, [key]: value}));
    setError(''); setNotice('');
  }

  function setStatBase(key: StatField, value: string) {
    setForm(f => ({...f, stats_base: applyStatField(f.stats_base, key, value)}));
    setError(''); setNotice('');
  }

  function setStatLv40(key: StatField, value: string) {
    setForm(f => ({...f, stats_lv40: applyStatField(f.stats_lv40, key, value)}));
    setError(''); setNotice('');
  }

  async function save() {
    setBusy(true); onBusyChange?.(true); setError(''); setNotice('');
    try {
      const payload: WikiDetails = {
        ...form,
        description: form.description?.trim() || null,
        voice_en: form.voice_en?.trim() || null,
        voice_ja: form.voice_ja?.trim() || null,
        artist: form.artist?.trim() || null,
        source_url: form.source_url?.trim() || null,
      };
      const {error: dbErr} = await supabase
        .from('heroes')
        .update({wiki_details: payload})
        .eq('id', hero.id);
      if (dbErr) throw dbErr;
      setNotice('Wiki details saved.');
      onSaved(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save wiki details.');
    } finally {
      setBusy(false); onBusyChange?.(false);
    }
  }

  return (
    <div className="wiki-details-editor editor-section">
      <h3>Wiki Details</h3>
      <p>These fields are sourced from the FEH Wiki and shown on the hero profile.</p>

      <label>
        Description / Lore
        <textarea
          rows={3}
          maxLength={1000}
          disabled={busy}
          placeholder="Hero's in-game description or flavor quote"
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value || null)}
        />
      </label>

      <div className="wiki-stats-editor-grid">
        <fieldset>
          <legend>Base Stats (Lv. 1)</legend>
          {STAT_KEYS.map(k => (
            <label key={k}>
              {STAT_LABELS[k]}
              <input
                type="number"
                min={0}
                max={99}
                disabled={busy}
                value={statVal(form.stats_base, k)}
                onChange={e => setStatBase(k, e.target.value)}
              />
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Max Stats (Lv. 40)</legend>
          {STAT_KEYS.map(k => (
            <label key={k}>
              {STAT_LABELS[k]}
              <input
                type="number"
                min={0}
                max={99}
                disabled={busy}
                value={statVal(form.stats_lv40, k)}
                onChange={e => setStatLv40(k, e.target.value)}
              />
            </label>
          ))}
        </fieldset>
      </div>

      <label>
        Illustrator / Artist
        <input
          type="text"
          maxLength={100}
          disabled={busy}
          placeholder="e.g. Yusuke Kozaki"
          value={form.artist ?? ''}
          onChange={e => set('artist', e.target.value || null)}
        />
      </label>

      <label>
        English Voice Actor
        <input
          type="text"
          maxLength={100}
          disabled={busy}
          placeholder="e.g. David Stanbra"
          value={form.voice_en ?? ''}
          onChange={e => set('voice_en', e.target.value || null)}
        />
      </label>

      <label>
        Japanese Voice Actor
        <input
          type="text"
          maxLength={100}
          disabled={busy}
          placeholder="e.g. 小西克幸"
          value={form.voice_ja ?? ''}
          onChange={e => set('voice_ja', e.target.value || null)}
        />
      </label>

      <label>
        FEH Wiki Source URL
        <input
          type="url"
          maxLength={500}
          disabled={busy}
          placeholder="https://feheroes.fandom.com/wiki/..."
          value={form.source_url ?? ''}
          onChange={e => set('source_url', e.target.value || null)}
        />
      </label>

      {error && <p role="alert" className="error">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      <div className="v2-actions">
        <button className="primary" disabled={busy} onClick={() => void save()}>
          {busy ? 'Saving…' : 'Save wiki details'}
        </button>
      </div>
    </div>
  );
}
