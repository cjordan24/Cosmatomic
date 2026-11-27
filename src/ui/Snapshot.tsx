/**
 * “Snapshot this view” (Gate 8.5): captures what the current view shows (route, title, readouts, provenance
 * badges, cited sources, live recorder series, a screenshot) and saves it to the notebook. Capture reads the
 * rendered page only; it computes nothing.
 */
import { useState } from 'react';
import { navigate } from '@/shared/router';
import { saveExperiment } from '@/shared/notebook';
import { makeSnapshot, type Reading } from '@/shared/snapshot';
import { liveSeries } from '@/shared/instruments/liveSeries';
import { PROVENANCE_LABEL } from '@/core/provenance/provenance';

const text = (el: Element) => {
  const c = el.cloneNode(true) as HTMLElement;
  // a unit menu contributes only its selected unit
  c.querySelectorAll('select').forEach((s, i) => { const orig = el.querySelectorAll('select')[i] as HTMLSelectElement; s.replaceWith(document.createTextNode(` ${orig.selectedOptions[0]?.textContent ?? ''}`)); });
  return (c.textContent ?? '').replace(/\s+/g, ' ').trim();
};

/** Downscaled JPEG of the largest canvas in the view (3D scenes and maps), or null. */
function screenshot(root: Element): string | null {
  const canvases = [...root.querySelectorAll('canvas')].filter((c) => c.width > 0 && c.height > 0).sort((a, b) => b.width * b.height - a.width * a.height);
  const src = canvases[0];
  if (!src) return null;
  try {
    const w = Math.min(640, src.width), h = Math.round((src.height / src.width) * w);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const g = out.getContext('2d'); if (!g) return null;
    g.fillStyle = '#05060c'; g.fillRect(0, 0, w, h); g.drawImage(src, 0, 0, w, h);
    return out.toDataURL('image/jpeg', 0.8);
  } catch { return null; }
}

export function captureView() {
  const root = document.querySelector('main.stage') ?? document.body;
  const readings: Reading[] = [];
  root.querySelectorAll('dl').forEach((dl) => {
    const ctx = dl.getAttribute('aria-label');
    dl.querySelectorAll('dt').forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== 'DD') return;
      const label = text(dt), value = text(dd);
      if (label && value) readings.push({ label: ctx ? `${ctx} · ${label}` : label, value });
    });
  });
  // readouts that are not definition lists mark themselves: data-reading="label", value in [data-value]
  root.querySelectorAll('[data-reading]').forEach((el) => {
    const ctx = el.closest('[aria-label]:not([data-reading])')?.getAttribute('aria-label');
    const label = el.getAttribute('data-reading') ?? '', value = text(el.querySelector('[data-value]') ?? el);
    if (label && value) readings.push({ label: ctx ? `${ctx} · ${label}` : label, value });
  });
  const labels = Object.entries(PROVENANCE_LABEL).map(([k, v]) => [k, v.label.toLowerCase()] as const);
  const provenance = [...new Set([...root.querySelectorAll('.badge')].map((b) => (b.textContent ?? '').trim().toLowerCase()).flatMap((t) => labels.filter(([, l]) => t === l).map(([k]) => k)))];
  const sources = [...root.querySelectorAll('[data-source]')].map((e) => e.getAttribute('data-source')!).filter(Boolean);
  const title = (root.querySelector('h1')?.textContent ?? root.querySelector('h2')?.textContent ?? document.title).replace(/\s+/g, ' ').trim();
  return { route: window.location.hash || '#/', title, provenance, sources, readings, series: liveSeries(), screenshot: screenshot(root) };
}

export function SnapshotDialog({ onClose }: { onClose: () => void }) {
  const [cap] = useState(captureView);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const save = async () => { const s = makeSnapshot(cap, name, notes); await saveExperiment(s); setSaved(s.name); };
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Snapshot this view" onClick={onClose}>
      <section className="panel" style={{ maxWidth: 460, margin: '10vh auto', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <header className="panel-head"><span className="title">📸 Snapshot this view</span><button onClick={onClose} aria-label="Close snapshot dialog">✕</button></header>
        <div className="panel-body">
          {saved ? (<>
            <p role="status">Saved “{saved}” to the notebook.</p>
            <div className="chip-row"><button className="chip active" onClick={() => { onClose(); navigate('/notebook'); }}>Open notebook</button><button className="chip" onClick={onClose}>Close</button></div>
          </>) : (<>
            <p className="note" style={{ wordBreak: 'break-all' }}><strong>{cap.title || 'This view'}</strong> · {cap.route}</p>
            <p className="note" aria-label="Snapshot contents">{cap.readings.length} readings · {cap.provenance.length ? cap.provenance.join(', ') : 'no provenance badge shown'} · {new Set(cap.sources).size} sources · {cap.series.length} recorded series · {cap.screenshot ? 'screenshot' : 'no canvas to capture'}</p>
            <input className="text-input" aria-label="Snapshot name" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
            <textarea className="text-input" aria-label="Snapshot notes" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', minHeight: 70 }} />
            <p className="note" style={{ fontSize: 10.5 }}>Stored only in this browser. The view reopens from its route; readings are saved as displayed, with the Voyager version {__APP_VERSION__} ({__APP_COMMIT__}).</p>
            <div className="chip-row"><button className="chip active" onClick={save}>Save snapshot</button><button className="chip" onClick={onClose}>Cancel</button></div>
          </>)}
        </div>
      </section>
    </div>
  );
}
