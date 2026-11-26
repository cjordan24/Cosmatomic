import { useEffect, useState } from 'react';
import { RATE_PRESETS, dateFromJd, formatJdUtc, jdFromDate } from '@/core/simulation/clock';
import { useVoyager } from '@/shared/store';
import { RANGE, live } from './liveClock';

const describeRate = (r: number) => RATE_PRESETS.find((p) => p.rate === r)?.label ?? `${r} s/s`;

export function Timeline() {
  const clock = useVoyager((s) => s.clock);
  const setClock = useVoyager((s) => s.setClock);
  const bookmarks = useVoyager((s) => s.bookmarks);
  const addBookmark = useVoyager((s) => s.addBookmark);
  const removeBookmark = useVoyager((s) => s.removeBookmark);
  const [showMarks, setShowMarks] = useState(false);

  const setJd = (jd: number) => { const j = Math.min(RANGE.maxJd, Math.max(RANGE.minJd, jd)); live.jd = j; setClock({ jd: j }); };
  const step = (days: number) => { setClock({ playing: false }); setJd(live.jd + days); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') { e.preventDefault(); useVoyager.getState().setClock({ playing: !useVoyager.getState().clock.playing }); }
      if (e.key === '.') step(1);
      if (e.key === ',') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const d = dateFromJd(clock.jd);
  const localValue = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 16) : '';
  const year = d.getUTCFullYear();

  return (
    <section className="timeline" aria-label="Simulation timeline">
      <div className="timeline-row">
        <button className="icon-btn" onClick={() => step(-1)} title="Step back 1 day (,)" aria-label="Step back one day">⏮</button>
        <button className="icon-btn" onClick={() => setClock({ rate: -Math.abs(clock.rate), playing: true })} title="Reverse playback" aria-label="Play in reverse" style={clock.playing && clock.rate < 0 ? { color: 'var(--accent-2)' } : undefined}>◀</button>
        <button className="icon-btn" onClick={() => setClock({ playing: !clock.playing })} aria-label={clock.playing ? 'Pause' : 'Play'} title="Play / pause (Space)" style={{ minWidth: 44 }}>{clock.playing ? '❚❚' : '▶'}</button>
        <button className="icon-btn" onClick={() => setClock({ rate: Math.abs(clock.rate), playing: true })} title="Forward playback" aria-label="Play forward" style={clock.playing && clock.rate > 0 ? { color: 'var(--accent-2)' } : undefined}>▶▶</button>
        <button className="icon-btn" onClick={() => step(1)} title="Step forward 1 day (.)" aria-label="Step forward one day">⏭</button>
        <span className="date" aria-live="polite">{formatJdUtc(clock.jd)}</span>
        <select value={Math.abs(clock.rate)} onChange={(e) => setClock({ rate: Math.sign(clock.rate || 1) * Number(e.target.value) })} aria-label="Playback rate">
          {RATE_PRESETS.filter((p) => p.rate > 0).map((p) => <option key={p.rate} value={p.rate}>{p.label}</option>)}
        </select>
        <span className="rate">{clock.rate < 0 ? 'reverse ' : ''}{describeRate(Math.abs(clock.rate))}</span>
        <span style={{ flex: 1 }} />
        <input type="datetime-local" value={localValue} min="1800-01-01T00:00" max="2050-12-31T00:00" onChange={(e) => e.target.value && setJd(jdFromDate(new Date(`${e.target.value}:00Z`)))} aria-label="Set date and time (UTC)" />
        <button className="icon-btn" onClick={() => setJd(jdFromDate(new Date()))} title="Jump to the present">Now</button>
        <button className={`icon-btn ${showMarks ? 'active' : ''}`} onClick={() => setShowMarks((s) => !s)} title="Timeline bookmarks">★</button>
      </div>
      <div className="timeline-row">
        <span className="valid">1800</span>
        <input type="range" min={RANGE.minJd} max={RANGE.maxJd} step={1} value={clock.jd} onChange={(e) => { setClock({ playing: false }); setJd(Number(e.target.value)); }} aria-label={`Date slider, year ${year}`} />
        <span className="valid">2050</span>
        <span className="valid" title="Planet positions use JPL Keplerian elements valid 1800–2050; the timeline is clamped to that range.">· ephemeris playback (JPL elements) — not an N-body simulation</span>
      </div>
      {showMarks && (
        <div className="timeline-row" style={{ alignItems: 'flex-start' }}>
          <div className="chip-row" style={{ flex: 1 }}>
            {bookmarks.map((b, i) => (
              <span key={i} className="chip" style={{ display: 'inline-flex', gap: 6 }}>
                <button className="link-btn" onClick={() => { setClock({ playing: false }); setJd(b.jd); }}>{b.label}</button>
                <button className="link-btn" aria-label={`Remove bookmark ${b.label}`} onClick={() => removeBookmark(i)}>✕</button>
              </span>
            ))}
          </div>
          <button className="icon-btn" onClick={() => addBookmark({ label: formatJdUtc(live.jd).slice(0, 10), jd: live.jd })}>+ Bookmark this date</button>
        </div>
      )}
    </section>
  );
}
