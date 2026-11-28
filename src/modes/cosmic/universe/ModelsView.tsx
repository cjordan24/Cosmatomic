/**
 * Dark matter or modified gravity? — #/cosmic/models?tab=rar|galaxy&g=<SPARC name>   (Phase 14, Gate 14.6)
 *
 *  rar     every SPARC point that passes McGaugh, Lelli & Schombert's (2016) cuts: observed acceleration against
 *          the acceleration the visible matter supplies; Newton's 1:1 line; their eq. (4) with g† = 1.20 × 10⁻¹⁰
 *          and with g† refitted here to the bundled curves
 *  galaxy  one rotation curve: observed, Newtonian from the baryons (Υ⋆ 0.50 / 0.7), and eq. (4) applied point by
 *          point; NFW halos for comparison are in the dark-matter evidence view (Gate 7.4)
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot, ScatterPlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { G_DAGGER, UPSILON_BULGE, UPSILON_DISK, fitGDagger, rarPredict, rarScatterDex, rowAccelerations } from '@/core/physics/rar';
import { ACCEL_SI_PER_KMS2_KPC } from '@/core/physics/darkMatter';
import sparc from '@datasets/astronomical/sparc-galaxies.json';
import adv from '@datasets/astronomical/advanced.json';

const S = sparc as unknown as { galaxies: { name: string; Q: number; inc: number; T: number; Vflat: number | null }[]; curves: Record<string, number[][]> };
const R = (adv as unknown as { rar: { eq4: string; gDagger: string; cuts: string; upsilon: string; caution: string; mond: { quote: string; note: string } }; friedmann: { eq5: string; eq6: string } });
const GALS = S.galaxies.filter((g) => g.Q < 3 && g.inc >= 30);
const keep = (r: number[]) => r[1] > 0 && r[2] / r[1] < 0.1;
export const RAR_POINTS = GALS.flatMap((g) => (S.curves[g.name] ?? []).filter(keep).map((r) => ({ g: g.name, ...rowAccelerations(r)! })).filter((p) => p.gObs !== undefined));
const FIT = fitGDagger(RAR_POINTS);
const SRC = ['mcgaugh-2016-rar', 'lelli-2016-sparc'];

function RarTab() {
  const pts = useMemo(() => RAR_POINTS.map((p, i) => ({ key: `${p.g}-${i}`, x: p.gBar, y: p.gObs, color: '#7df9ff', r: 1.4, title: p.g })), []);
  const line = (gd: number) => Array.from({ length: 60 }, (_, i) => { const x = 10 ** (-12.5 + i * 0.07); return [x, rarPredict(x, gd)] as [number, number]; });
  return (
    <>
      <Panel id="rar-panel" className="left-panel" title="The radial acceleration relation">
        <dl className="kv" aria-label="RAR values">
          <KV k="Galaxies" v={GALS.length} /><KV k="Points" v={RAR_POINTS.length} title="paper: 2693" />
          <KV k="g† (paper)" v="1.20 × 10⁻¹⁰" unit="m/s²" />
          <KV k="g† refitted here" v={FIT} unit="m/s²" sig={3} />
          <KV k="Scatter about eq. (4)" v={rarScatterDex(RAR_POINTS, FIT)} unit="dex" sig={2} />
        </dl>
        <p className="note">Their selection: “{R.rar.cuts}” Applied to the bundled SPARC tables it keeps {GALS.length} galaxies and {RAR_POINTS.length} points. <SourceLinks ids={SRC} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Dark matter or modified gravity? <ProvenanceBadge cls="derived" title="SPARC rotation curves; McGaugh, Lelli & Schombert (2016) eq. (4)" /></h1>
          <p className="note">In each galaxy, at each radius: the acceleration measured from the rotation speed (g_obs = V²/R) against the one the stars and gas supply by Newton's law (g_bar, with {R.rar.upsilon}). Their eq. (4): {R.rar.eq4}, {R.rar.gDagger}. <SourceLinks ids={SRC} /></p></div>
        <ScatterPlot ariaLabel="Observed against baryonic acceleration" width={600} height={420} xLog yLog xDomain={[10 ** -12.5, 10 ** -8.3]} yDomain={[10 ** -12.5, 10 ** -8.3]} xLabel="g_bar from stars and gas (m/s²)" yLabel="g_obs from rotation (m/s²)" points={pts}
          lines={[{ points: [[10 ** -12.5, 10 ** -12.5], [10 ** -8.3, 10 ** -8.3]], color: '#9aa6c8', label: 'Newton, no dark matter', dashed: true }, { points: line(G_DAGGER), color: '#f5c76b', label: 'eq. (4), g† = 1.20 × 10⁻¹⁰' }, { points: line(FIT), color: '#5cf2a6', label: `refitted, g† = ${formatSig(FIT, 3)}` }]} />
        <p className="note">At high accelerations the points lie on Newton's line; at low accelerations they rise above it — the visible matter alone cannot hold the gas and stars in orbit at the measured speeds. The paper: “{R.rar.caution}” MOND's constant: “{R.rar.mond.quote}”. <SourceLinks ids={['famaey-mcgaugh-2012']} /> {R.rar.mond.note}</p>
      </div>
      <Panel id="rar-detail" className="right-panel" title="Two readings">
        <p className="note">This view shows data and one fitted function. It does not decide whether the difference is unseen matter (the halo models of the dark-matter evidence view) or a change in the law of gravity at low accelerations (MOND, quoted beside the plot).</p>
        <button className="chip" onClick={() => navigate('/cosmic/darkmatter')}>Dark-matter evidence (NFW) →</button>
        <button className="chip" onClick={() => setQuery({ tab: 'galaxy' })}>One galaxy at a time →</button>
        <p className="note">The cosmological side: Friedmann (1922, p. 381) wrote the expansion of a uniform universe as {R.friedmann.eq5}. <SourceLinks ids={['friedmann-1922']} /> <button className="link-btn" onClick={() => navigate('/cosmic/universe')}>Expansion →</button></p>
        <RelatedLinks id="instrument:models" limit={3} />
      </Panel>
    </>
  );
}

function GalaxyTab() {
  const { query } = useRoute();
  const g = GALS.find((x) => x.name === query.get('g')) ?? GALS.find((x) => x.name === 'NGC3198') ?? GALS[0];
  const rows = (S.curves[g.name] ?? []).filter((r) => r[0] > 0);
  const vbar = (r: number[]) => Math.sqrt(Math.max(0, r[3] * Math.abs(r[3]) + UPSILON_DISK * r[4] * r[4] + UPSILON_BULGE * r[5] * r[5]));
  const vRar = (r: number[], gd: number) => { const gb = (vbar(r) ** 2 / r[0]) * ACCEL_SI_PER_KMS2_KPC; return gb > 0 ? Math.sqrt((rarPredict(gb, gd) / ACCEL_SI_PER_KMS2_KPC) * r[0]) : 0; };
  return (
    <>
      <Panel id="gal-list" className="left-panel" title="Galaxies (153)">
        <label className="slider-row"><span style={{ minWidth: 60 }}>galaxy</span><select aria-label="Galaxy" value={g.name} onChange={(e) => setQuery({ g: e.target.value })}>{GALS.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}</select></label>
        <dl className="kv" aria-label="Galaxy values"><KV k="Inclination" v={g.inc} unit="°" /><KV k="Flat speed" v={g.Vflat} unit="km/s" /><KV k="Points" v={rows.length} /></dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{g.name} <ProvenanceBadge cls="derived" title="SPARC curve; baryons with Υ⋆ 0.50/0.7; eq. (4)" /></h1></div>
        <LinePlot ariaLabel="Rotation curve" width={600} height={340} xLabel="radius (kpc)" yLabel="rotation speed (km/s)" legend="br"
          series={[
            { points: rows.map((r) => [r[0], r[1]] as [number, number]), color: '#7df9ff', label: 'observed' },
            { points: rows.map((r) => [r[0], vbar(r)] as [number, number]), color: '#9aa6c8', label: 'stars + gas, Newton', dashed: true },
            { points: rows.map((r) => [r[0], vRar(r, G_DAGGER)] as [number, number]), color: '#f5c76b', label: 'eq. (4), g† = 1.20 × 10⁻¹⁰' },
          ]} errorBars={rows.map((r) => ({ x: r[0], y: r[1], lo: r[2], hi: r[2], color: '#7df9ff' }))} />
        <p className="note">Observed speeds with their errors (SPARC); the Newtonian curve of the visible matter; and eq. (4) turned back into a speed, V = √(R·F(g_bar)), with the paper's fixed g† — no parameter is fitted to this galaxy. <SourceLinks ids={SRC} /></p>
      </div>
      <Panel id="gal-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: null })}>All galaxies →</button>
        <button className="chip" onClick={() => navigate('/cosmic/darkmatter')}>Halo fits →</button>
        <RelatedLinks id="instrument:models" limit={3} />
      </Panel>
    </>
  );
}

export default function ModelsView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'galaxy' ? 'galaxy' : 'rar';
  return (
    <>
      <nav className="view-switch" aria-label="Model comparison sections">
        <button className={tab === 'rar' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>All galaxies</button>
        <button className={tab === 'galaxy' ? 'active' : ''} onClick={() => setQuery({ tab: 'galaxy' })}>One galaxy</button>
      </nav>
      {tab === 'galaxy' ? <GalaxyTab /> : <RarTab />}
    </>
  );
}
