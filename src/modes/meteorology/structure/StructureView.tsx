/**
 * The structure of the atmosphere — #/meteorology?z=<m>&depth=explore|understand|research   (Phase 20, Gate 20.1)
 *
 * The U.S. Standard Atmosphere, 1976 evaluated from its own layer table (temperature, pressure, density to 86 km),
 * the layers in the NWS's and FAA's words, the composition of dry air, a box of air thinning with height, and the
 * equations behind it at the Research depth.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { LAYER_NAMES, scaleHeight, standardAtmosphere, USSA } from '@/core/meteorology/atmosphere';
import data from '@datasets/meteorology/atmosphere.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** A fixed set of “molecules” (deterministic positions); the box shows the share that density allows. */
const DOTS = (() => { let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 400 }, () => [r() * 200, r() * 200] as [number, number]); })();

export default function StructureView() {
  const { query } = useRoute();
  const z = clamp(Number(query.get('z') ?? 0) || 0, 0, 86000);
  const s = standardAtmosphere(z), s0 = standardAtmosphere(0);
  const U = D.ussa, G = D.glossary, F = D.faa;
  const prof = useMemo(() => Array.from({ length: 173 }, (_, i) => { const zz = i * 500, a = standardAtmosphere(zz); return { z: zz / 1000, T: a.T, P: a.P / 100, rho: a.rho }; }), []);
  const nDots = Math.round(DOTS.length * Math.min(1, s.rho / s0.rho));
  const layer = LAYER_NAMES[s.layer];
  const presets: [string, number][] = [['Sea level', 0], ['Everest (8.8 km)', 8849], ['Airliner (11 km)', 11000], ['Ozone layer (25 km)', 25000], ['Stratopause (48 km)', 48000], ['Mesopause (86 km)', 86000]];
  return (
    <>
      <Panel id="m-controls" className="left-panel" title="Climb through the air">
        <label className="slider-row"><span style={{ minWidth: 60 }}>altitude</span><input type="range" min={0} max={86000} step={100} value={z} aria-label="Altitude" onChange={(e) => setQuery({ z: e.target.value })} /><span>{formatSig(z / 1000, 3)} km</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>{presets.map(([l, v]) => <button key={l} className={`chip ${Math.abs(v - z) < 50 ? 'active' : ''}`} onClick={() => setQuery({ z: String(v) })}>{l}</button>)}</div>
        <dl className="kv" aria-label="Air at this height">
          <KV k="Layer (standard)" v={layer} />
          <KV k="Temperature" v={`${formatSig(s.T, 5)} K (${formatSig(s.T - 273.15, 3)} °C)`} />
          <KV k="Pressure" v={s.P / 100} unit="hPa" sig={4} />
          <KV k="Share of sea-level pressure" v={`${formatSig((s.P / USSA.P0) * 100, 3)} %`} />
          <KV k="Density" v={s.rho} unit="kg/m³" sig={4} />
          <KV k="Scale height R*T/(gM)" v={scaleHeight(s.T) / 1000} unit="km" sig={3} />
        </dl>
        <p className="note">The 1976 standard is “{U.definition}” — a reference, not today's weather. <SourceLinks ids={[U.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The structure of the atmosphere <ProvenanceBadge cls="illustrative" title="U.S. Standard Atmosphere 1976: an idealised reference model, evaluated from its layer table" /><DepthSwitch /></h1>
          <p className="note">Temperature falls, then rises, then falls again with height; pressure and density fall all the way. Move the slider or pick a height.</p></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 260px' }}><LinePlot ariaLabel="Temperature against altitude" width={300} height={300} xLabel="temperature (K)" yLabel="altitude (km)" series={[{ points: prof.map((p) => [p.T, p.z] as [number, number]), color: ON, label: 'T' }]} markers={[{ x: s.T, y: z / 1000, color: '#f5c76b' }]} /></div>
          <div style={{ flex: '0 0 260px' }}><LinePlot ariaLabel="Pressure against altitude" width={300} height={300} xLog xLabel="pressure (hPa, log)" yLabel="altitude (km)" series={[{ points: prof.map((p) => [p.P, p.z] as [number, number]), color: '#5cf2a6', label: 'P' }]} markers={[{ x: s.P / 100, y: z / 1000, color: '#f5c76b' }]} /></div>
          <svg viewBox="0 0 200 230" role="img" aria-label="A box of air" style={{ width: 160, flex: '0 0 160px' }}>
            <rect x={0} y={0} width={200} height={200} fill="none" stroke="var(--line)" />
            {DOTS.slice(0, nDots).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill={ON} opacity={0.8} />)}
            <text x={100} y={220} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{nDots} of {DOTS.length} dots = density ÷ sea level</text>
          </svg>
        </div>
        <p className="note">Explore — NWS: the troposphere is “{G.troposphere}” FAA: “{F.tropo}” “{F.strato}” <SourceLinks ids={[G.source, F.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — the standard treats air as a perfect gas, {U.gas}, held up by its own pressure, {U.hydro}, so {U.dlnP} NWS: the tropopause is “{G.tropopause}” <SourceLinks ids={[U.source, G.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — layer by layer, {U.p33a} when L ≠ 0 and {U.p33b} when L = 0, in geopotential height H. “{U.scale}” — but it “{U.scaleWarn}” “{U.caveat}” Finding: {U.rstarFinding} Humphreys (1920): “{D.humphreys.Hquote}” <SourceLinks ids={[D.humphreys.source]} /> — the 1976 constants give {formatSig(scaleHeight(273.15), 4)} m.</p>
          <table className="table-mini" aria-label="Layer table">
            <thead><tr><th>base H (km′)</th><th>lapse rate (K/km′)</th><th>T at base (K)</th></tr></thead>
            <tbody>{U.layers.slice(0, 7).map(([h, l]: [number, number]) => <tr key={h}><td>{h}</td><td>{l}</td><td>{formatSig(standardAtmosphere(h * 1000 * USSA.r0 / (USSA.r0 - h * 1000)).T, 5)}</td></tr>)}</tbody>
          </table>
        </AtDepth>
      </div>
      <Panel id="m-detail" className="right-panel" title="What the air is made of">
        <table className="table-mini" aria-label="Dry-air composition">
          <thead><tr><th>gas</th><th>share by volume</th></tr></thead>
          <tbody>{U.composition.map(([g, , f]: [string, number, number]) => <tr key={g}><td>{g}</td><td>{f >= 0.001 ? `${formatSig(f * 100, 4)} %` : `${formatSig(f * 1e6, 3)} ppm`}</td></tr>)}</tbody>
        </table>
        <p className="note">USSA 1976, Table 3 (dry air at sea level). {U.co2Note} <SourceLinks ids={[U.source, 'noaa-aggi']} /></p>
        <button className="chip" onClick={() => navigate('/meteorology/air')}>Moist air and clouds →</button>
        <button className="chip" onClick={() => navigate('/meteorology/radiation')}>Sunlight and heat →</button>
        <button className="chip" onClick={() => navigate('/spectral/atmosphere')}>Why the sky is blue →</button>
        <button className="chip" onClick={() => navigate('/atomic/phases')}>Gases and phases →</button>
        <RelatedLinks id="instrument:atmosphere-structure" limit={3} />
      </Panel>
    </>
  );
}
