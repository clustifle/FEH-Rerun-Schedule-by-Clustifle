import {useEffect, useState} from 'react';
import {ExternalLink, Mic, Palette, BookOpen} from 'lucide-react';
import type {WikiDetails} from './wiki-details-types';
import {loadWikiDetails} from './wiki-details-save';
import './HeroWikiDetails.css';

type StatKey = 'hp' | 'atk' | 'spd' | 'def' | 'res';
const STAT_LABELS: {key: StatKey; label: string}[] = [
  {key: 'hp',  label: 'HP'},
  {key: 'atk', label: 'Atk'},
  {key: 'spd', label: 'Spd'},
  {key: 'def', label: 'Def'},
  {key: 'res', label: 'Res'},
];

function StatRow({label, base, lv40}: {label: string; base: number | null; lv40: number | null}) {
  if (base == null && lv40 == null) return null;
  const diff = base != null && lv40 != null ? lv40 - base : null;
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{base ?? '—'}</td>
      <td className="wiki-stat-lv40">{lv40 ?? '—'}</td>
      {diff != null && <td className="wiki-stat-diff">+{diff}</td>}
    </tr>
  );
}

export default function HeroWikiDetails({heroId}: {heroId: string}) {
  const [details, setDetails] = useState<WikiDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setDetails(null);
    loadWikiDetails(heroId).then(d => {
      if (alive) {setDetails(d); setLoading(false);}
    }).catch(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [heroId]);

  if (loading) return <p className="wiki-details-loading" role="status">Loading wiki details…</p>;
  if (!details) return null;

  const hasStats = details.stats_base || details.stats_lv40;
  const hasCredits = details.voice_en || details.voice_ja || details.artist;

  return (
    <section className="hero-wiki-details" aria-label="Wiki details">
      {details.description && (
        <div className="wiki-details-description">
          <BookOpen size={15} aria-hidden="true" />
          <p>&ldquo;{details.description}&rdquo;</p>
        </div>
      )}

      {hasStats && (
        <div className="wiki-details-stats">
          <h3>Base Stats</h3>
          <table className="wiki-stat-table" aria-label="Hero base and level-40 stats">
            <thead>
              <tr>
                <th scope="col">Stat</th>
                <th scope="col">Base</th>
                <th scope="col">Lv. 40</th>
                {details.stats_base && details.stats_lv40 && <th scope="col">Gain</th>}
              </tr>
            </thead>
            <tbody>
              {STAT_LABELS.map(({key, label}) => (
                <StatRow
                  key={key}
                  label={label}
                  base={details.stats_base?.[key] ?? null}
                  lv40={details.stats_lv40?.[key] ?? null}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasCredits && (
        <dl className="wiki-details-credits">
          {details.artist && (
            <div>
              <dt><Palette size={13} aria-hidden="true" /> Illustrator</dt>
              <dd>{details.artist}</dd>
            </div>
          )}
          {details.voice_en && (
            <div>
              <dt><Mic size={13} aria-hidden="true" /> English VA</dt>
              <dd>{details.voice_en}</dd>
            </div>
          )}
          {details.voice_ja && (
            <div>
              <dt><Mic size={13} aria-hidden="true" /> Japanese VA</dt>
              <dd>{details.voice_ja}</dd>
            </div>
          )}
        </dl>
      )}

      {details.source_url && (
        <a
          className="wiki-details-source"
          href={details.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} aria-hidden="true" />
          View on FEH Wiki
        </a>
      )}
    </section>
  );
}
