/**
 * Shared instrument UI (Phase 8, Gate 8.4): unit-switchable values, probe readouts, rulers, time-series
 * recorders and a unit converter, used by the Sandbox, Wave lab, Fields and Cosmic views. Logic lives in
 * src/shared/instruments/instruments.ts. The unit chosen for a dimension is remembered (localStorage) and
 * applies in every view.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { UNITS, convert, formatSig, type UnitDef, type UnitKey } from '@/core/units/units';
import { CONVERTER_GROUPS, compatibleUnits, dimensionKey, readableUnit, seriesCSV, seriesStats, unitKeyOf, type SeriesMeta, type Sample } from '@/shared/instruments/instruments';
import { download } from '@/shared/notebook';
import { registerSeries } from '@/shared/instruments/liveSeries';
import { LinePlot } from './plots';
import { ProvenanceBadge } from './components';
import type { ProvenanceClass } from '@/core/provenance/provenance';

// ---------------------------------------------------------------- shared unit preferences
const STORE_KEY = 'voyager.instrument-units';
let prefs: Record<string, UnitKey> = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}'); } catch { return {}; } })();
const listeners = new Set<() => void>();
function setPref(dim: string, k: UnitKey | null) {
  prefs = { ...prefs };
  if (k) prefs[dim] = k; else delete prefs[dim];
  try { localStorage.setItem(STORE_KEY, JSON.stringify(prefs)); } catch { /* private mode */ }
  listeners.forEach((l) => l());
}
const usePrefs = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => prefs);

/** Display unit for a value: the reader's choice for this dimension, else the most readable one. */
export function useDisplayUnit(value: number | null | undefined, unit: UnitKey): UnitKey {
  const p = usePrefs()[dimensionKey(unit)];
  if (p && compatibleUnits(unit).includes(p)) return p;
  return value === null || value === undefined || !Number.isFinite(value) ? unit : readableUnit(value, unit);
}

const sym = (k: UnitKey) => (UNITS[k] as UnitDef).symbol;

/** A value in a registered unit with a unit menu (dimension-checked conversion). Unknown values stay "unknown". */
export function UnitValue({ value, unit, sig = 5, label }: { value: number | null | undefined; unit: UnitKey; sig?: number; label: string }) {
  const shown = useDisplayUnit(value, unit);
  const ok = value !== null && value !== undefined && Number.isFinite(value);
  const opts = compatibleUnits(unit);
  return (
    <span className="unit-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span className={ok ? '' : 'unknown'}>{ok ? formatSig(convert(value!, unit, shown), sig) : 'unknown'}</span>
      {opts.length > 1
        ? <select className="unit-select" aria-label={`Unit for ${label}`} value={shown} onChange={(e) => setPref(dimensionKey(unit), e.target.value as UnitKey)}
            style={{ height: 22, fontSize: 11, padding: '0 2px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--line)', borderRadius: 4 }}>
            {opts.map((k) => <option key={k} value={k}>{sym(k)}</option>)}
          </select>
        : <span>{sym(unit)}</span>}
    </span>
  );
}

/** One readout row: `unit` may be a registered unit (switchable) or a plain label for units not in the registry. */
export interface ProbeRow { label: ReactNode; value: number | string | null | undefined; unit?: string | null; sig?: number; title?: string }
export function ProbeRows({ rows, ariaLabel }: { rows: ProbeRow[]; ariaLabel: string }) {
  return (
    <dl className="kv" aria-label={ariaLabel}>
      {rows.map((r, i) => {
        const key = typeof r.value === 'number' ? unitKeyOf(r.unit) : null;
        const text = typeof r.label === 'string' ? r.label : `row ${i + 1}`;
        const missing = r.value === null || r.value === undefined || (typeof r.value === 'number' && !Number.isFinite(r.value)) || r.value === '';
        return (
          <div key={i} style={{ display: 'contents' }}>
            <dt title={r.title}>{r.label}</dt>
            <dd className={missing ? 'unknown' : ''}>
              {key ? <UnitValue value={r.value as number} unit={key} sig={r.sig} label={text} />
                : missing ? 'unknown' : typeof r.value === 'number' ? `${formatSig(r.value, r.sig ?? 4)}${r.unit ? ` ${r.unit}` : ''}` : `${r.value}${r.unit ? ` ${r.unit}` : ''}`}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Probe: values of every quantity a view computes at one point, with the point's coordinates. */
export function Probe({ title, where, rows, provenance = 'derived', note, ariaLabel }: { ariaLabel?: string; title: string; where: ProbeRow[]; rows: ProbeRow[]; provenance?: ProvenanceClass; note?: ReactNode }) {
  return (
    <div className="instrument instrument-probe">
      <div className="section-title">🎯 {title} <ProvenanceBadge cls={provenance} title="Read directly from the view's own model at this point" /></div>
      <ProbeRows ariaLabel={ariaLabel ?? title} rows={[...where, ...rows]} />
      {note && <p className="note" style={{ fontSize: 10.5 }}>{note}</p>}
    </div>
  );
}

/** Ruler: distance from one object to another chosen object, relative speed and one-way light time. */
export function Ruler({ from, options, target, onTarget, distance, distanceUnit, relSpeed, speedUnit, lightTimeS, note, targetAria = 'Ruler target' }: {
  targetAria?: string; from: string; options: { id: string; label: string }[]; target: string; onTarget: (id: string) => void;
  distance: number | null; distanceUnit: UnitKey; relSpeed?: number | null; speedUnit?: UnitKey | null; lightTimeS: number | null; note?: ReactNode;
}) {
  return (
    <div className="instrument instrument-ruler">
      <div className="section-title">📏 Ruler</div>
      <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{from} ↔
        <select value={target} onChange={(e) => onTarget(e.target.value)} aria-label={targetAria} style={{ height: 24 }}>
          <option value="">choose…</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>
      {target && <ProbeRows ariaLabel="Ruler readout" rows={[
        { label: 'distance', value: distance, unit: sym(distanceUnit), sig: 6 },
        ...(relSpeed !== undefined && speedUnit ? [{ label: 'relative speed', value: relSpeed, unit: sym(speedUnit), sig: 5 }] : []),
        { label: 'light time d/c', value: lightTimeS, unit: 's', sig: 5 },
      ]} />}
      {note && <p className="note" style={{ fontSize: 10.5 }}>{note}</p>}
    </div>
  );
}

/** Time-series recorder display: plot, statistics and CSV export with provenance and method. */
export function TimeSeriesView({ meta, points, onClear, height = 180, color = '#7df9ff', csvName }: { meta: SeriesMeta; points: readonly Sample[]; onClear?: () => void; height?: number; color?: string; csvName: string }) {
  const st = seriesStats(points);
  const pts = useMemo(() => points.map(([t, y]) => [t, y] as [number, number]), [points]);
  // make the recorder visible to notebook snapshots (Gate 8.5)
  const latest = useRef(points); latest.current = points;
  useEffect(() => registerSeries(csvName, meta, () => latest.current), [csvName, meta.title, meta.method]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="instrument instrument-series">
      <div className="section-title">📈 {meta.title}</div>
      {pts.length >= 2 ? <LinePlot ariaLabel={meta.title} series={[{ points: pts, color }]} xLabel={`${meta.x.name}${meta.x.unit ? ` (${meta.x.unit})` : ''}`} yLabel={`${meta.y.name}${meta.y.unit ? ` (${meta.y.unit})` : ''}`} width={380} height={height} /> : <p className="note">Recording… (run the simulation)</p>}
      {st && <dl className="kv" aria-label={`${meta.title} statistics`}>
        <dt>samples</dt><dd>{st.n} over {formatSig(st.tSpan, 4)} {meta.x.unit}</dd>
        <dt>min / max</dt><dd>{formatSig(st.min, 4)} / {formatSig(st.max, 4)} {meta.y.unit}</dd>
        <dt>mean / rms</dt><dd>{formatSig(st.mean, 4)} / {formatSig(st.rms, 4)} {meta.y.unit}</dd>
      </dl>}
      <div className="chip-row">
        <button className="chip" disabled={!st} onClick={() => download(csvName, seriesCSV(meta, points), 'text/csv')}>Export CSV</button>
        {onClear && <button className="chip" onClick={onClear}>Clear</button>}
      </div>
    </div>
  );
}

/** Stand-alone, dimension-checked unit converter over the registered units. */
export function UnitConverter() {
  const [gid, setGid] = useState('length');
  const grp = CONVERTER_GROUPS.find((x) => x.id === gid)!;
  const [from, setFrom] = useState<UnitKey>('au');
  const [to, setTo] = useState<UnitKey>('km');
  const [txt, setTxt] = useState('1');
  const v = Number(txt);
  const f = grp.units.includes(from) ? from : grp.units[0], t = grp.units.includes(to) ? to : grp.units[Math.min(1, grp.units.length - 1)];
  const out = txt.trim() !== '' && Number.isFinite(v) ? convert(v, f, t) : null;
  return (
    <div className="instrument instrument-converter" aria-label="Unit converter" role="group">
      <select className="text-input" aria-label="Quantity" value={gid} onChange={(e) => setGid(e.target.value)} style={{ width: '100%', marginBottom: 6 }}>
        {CONVERTER_GROUPS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input className="text-input" aria-label="Value to convert" value={txt} onChange={(e) => setTxt(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
        <select className="text-input" aria-label="From unit" value={f} onChange={(e) => setFrom(e.target.value as UnitKey)} style={{ width: 84 }}>{grp.units.map((k) => <option key={k} value={k}>{sym(k)}</option>)}</select>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
        <output aria-label="Converted value" style={{ flex: 1, fontFamily: 'var(--mono)' }}>{out === null ? 'enter a number' : formatSig(out, 8)}</output>
        <select className="text-input" aria-label="To unit" value={t} onChange={(e) => setTo(e.target.value as UnitKey)} style={{ width: 84 }}>{grp.units.map((k) => <option key={k} value={k}>{sym(k)}</option>)}</select>
      </div>
      <p className="note" style={{ fontSize: 10.5 }}>{(UNITS[f] as UnitDef).name} → {(UNITS[t] as UnitDef).name}. SI factors from CODATA 2018 and IAU 2015 nominal values; only units of the same dimension are offered.</p>
    </div>
  );
}
