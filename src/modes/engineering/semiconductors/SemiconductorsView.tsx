/**
 * Semiconductors and the junction — #/engineering/semiconductors   (Phase 15, Gate 15.2)
 *
 * Silicon (Z = 14) and its band gap (1.12 eV ↔ 1107 nm, TU Delft OCW); Shockley's 1949 p-n junction and his
 * eq. (4.13), drawn as a live current–voltage curve: saturation current and temperature adjustable, forward and
 * reverse bias, the e-fold rise per kT/q.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { cutoffWavelengthNm, diodeCurrent, diodeVoltage, thermalVoltage } from '@/core/computing/semiconductor';
import elements from '@datasets/atomic/elements.json';
import data from '@datasets/engineering/semiconductors.json';

interface W { where: string; quote: string }
const D = data as unknown as { shockley: { source: string; intro: W; abstract: W; transistor: W; eq413: { where: string; eq: string; note: string; sign: string } }; silicon: { source: string; gapEV: number; gapNm: number; quote: string; indirect: string } };
const SI = (elements as unknown as { Z: number; name: string; electronConfiguration: string }[]).find((e) => e.Z === 14)!;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const fmtA = (I: number) => { const a = Math.abs(I), s = I < 0 ? '−' : ''; return a >= 1 ? `${s}${formatSig(a, 3)} A` : a >= 1e-3 ? `${s}${formatSig(a * 1e3, 3)} mA` : a >= 1e-6 ? `${s}${formatSig(a * 1e6, 3)} µA` : a >= 1e-9 ? `${s}${formatSig(a * 1e9, 3)} nA` : `${s}${formatSig(a * 1e12, 3)} pA`; };

export default function SemiconductorsView() {
  const { query } = useRoute();
  const lIs = num(query, 'is', -12, -15, -6), Is = 10 ** lIs, T = num(query, 'T', 300, 200, 450), V = num(query, 'v', 0.6, -1, 0.9);
  const vt = thermalVoltage(T), I = diodeCurrent(V, Is, T);
  const curve = useMemo(() => Array.from({ length: 191 }, (_, i) => { const v = -1 + i * 0.01; return [v, diodeCurrent(v, Is, T) * 1000] as [number, number]; }).filter(([, i]) => i < 60), [Is, T]);
  const S = D.shockley;
  return (
    <>
      <Panel id="semi-controls" className="left-panel" title="A p-n junction">
        <label className="slider-row"><span style={{ minWidth: 80 }}>bias V</span><input type="range" min={-1} max={0.9} step={0.005} value={V} aria-label="Bias voltage" onChange={(e) => setQuery({ v: e.target.value })} /><span>{V.toFixed(3)} V</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>I_s</span><input type="range" min={-15} max={-6} step={0.1} value={lIs} aria-label="Saturation current (log)" onChange={(e) => setQuery({ is: e.target.value })} /><span>{fmtA(Is)}</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>temperature</span><input type="range" min={200} max={450} step={1} value={T} aria-label="Temperature" onChange={(e) => setQuery({ T: e.target.value })} /><span>{T} K</span></label>
        <dl className="kv" aria-label="Junction values">
          <KV k="Current I" v={fmtA(I)} />
          <KV k="kT/q" v={vt * 1000} unit="mV" sig={4} />
          <KV k="Bias for 1 mA" v={diodeVoltage(1e-3, Is, T)} unit="V" sig={3} />
          <KV k="Forward ÷ reverse at ±0.6 V" v={Math.abs(diodeCurrent(0.6, Is, T) / diodeCurrent(-0.6, Is, T))} sig={3} />
        </dl>
        <p className="note">I_s is set by the materials and the junction area (Shockley's prefactor); here it is a free parameter, not a measured device.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Semiconductors and the junction <ProvenanceBadge cls="derived" title="Shockley's eq. (4.13) evaluated; band gap from TU Delft OCW" /></h1>
          <p className="note">Shockley (1949): “{S.intro.quote}” “{S.abstract.quote}.” <SourceLinks ids={[S.source]} /></p></div>
        <LinePlot ariaLabel="Current against voltage" width={600} height={300} xLabel="bias V (volts)" yLabel="current (mA)" yDomain={[-5, 60]} series={[{ points: curve, color: '#ff8a65', label: `I_s = ${fmtA(Is)}, T = ${T} K` }]} markers={[{ x: V, y: clamp(I * 1000, -5, 60), color: '#f5c76b' }]} vLines={[{ x: 0, label: '0 V', color: '#9aa6c8' }]} />
        <p className="note">His equation, {S.eq413.where}: {S.eq413.eq}, “{S.eq413.note}”. Written compactly, I = I_s(e^{'{qV/kT}'} − 1). “{S.eq413.sign}” <SourceLinks ids={[S.source]} /> Reverse bias lets through at most I_s; forward bias multiplies the current by e for every {formatSig(vt * 1000, 3)} mV — the junction is a one-way valve.</p>
      </div>
      <Panel id="semi-detail" className="right-panel" title="Silicon">
        <dl className="kv" aria-label="Silicon values">
          <KV k="Element" v={`${SI.name} (Z = 14)`} /><KV k="Electron configuration" v={SI.electronConfiguration} />
          <KV k="Band gap" v={D.silicon.gapEV} unit="eV" /><KV k="hc / E_g" v={cutoffWavelengthNm(D.silicon.gapEV)} unit="nm" sig={4} />
        </dl>
        <p className="note">TU Delft: “{D.silicon.quote}” “{D.silicon.indirect}.” <SourceLinks ids={[D.silicon.source]} /> Computing hc/E_g from CODATA constants gives the same 1107 nm.</p>
        <p className="note">The same paper goes on to the junction transistor: “{S.transistor.quote}”</p>
        <button className="chip" onClick={() => navigate('/atomic/element/14')}>Silicon in the periodic table →</button>
        <button className="chip" onClick={() => navigate('/spectral?lambda=1.107e-6')}>1107 nm in the spectrum →</button>
        <button className="chip" onClick={() => navigate('/engineering')}>Logic gates →</button>
        <RelatedLinks id="instrument:semiconductors" limit={3} />
      </Panel>
    </>
  );
}
