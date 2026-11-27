/**
 * HR diagrams and stellar classes — #/cosmic/stars/hr?d=cmd|hr|classes&sel=<seq>&bg=1
 * Observational colour–magnitude diagram (CNS5 to 20 pc), theoretical luminosity–temperature
 * diagram for 10 pc stars with calibrated T_eff, and the MK class table. Gate 5.2.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { ScatterPlot, type ScatterPoint } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import { DWARF_SEQUENCE, DWARF_SEQUENCE_VERSION, crossMatch, loadCns5, loadTenParsec, parseSpectralType, type CnsStar, type NearbyObject, type ObjectType } from './stars';
import { CLASS_LINES } from '@/shared/scientific-relationships/registry';
import { MK_CLASSES, TEFF_SUN_NOMINAL, cmdPoint, convertedGCheck, hrPoint, logLForRadius, type HrStar } from './hr';

const TYPE_COLOR: Record<ObjectType, string> = { star: '#ffd27a', 'low-mass star': '#ff8a5c', 'white dwarf': '#9ec5ff', 'brown dwarf': '#d0608a', exoplanet: '#5cf2a6', unknown: '#888' };
const OTHER = '#6f6890';
type Diagram = 'cmd' | 'hr' | 'classes';

function Legend({ bg }: { bg: boolean }) {
  return (
    <ul className="note" style={{ listStyle: 'none', padding: 0, margin: '6px 0' }} aria-label="Legend">
      {(['star', 'low-mass star', 'white dwarf', 'brown dwarf'] as ObjectType[]).map((t) => <li key={t}><span style={{ color: TYPE_COLOR[t] }}>●</span> {t} (10 pc sample)</li>)}
      {bg && <li><span style={{ color: OTHER }}>●</span> CNS5 star at 10–20 pc</li>}
      <li><span style={{ color: '#7df9ff' }}>—</span> mean class V sequence (Pecaut &amp; Mamajek)</li>
      <li><span style={{ color: '#f5c76b' }}>○</span> selected</li>
    </ul>
  );
}

function SelectedPanel({ o, hr, cns }: { o: NearbyObject; hr: HrStar | { reason: string }; cns: CnsStar | undefined }) {
  const cmd = cns ? cmdPoint(cns) : null;
  const dG = convertedGCheck(o, cns);
  return (
    <>
      <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{o.name}</h2>
      <div className="note">{o.type} · {o.spt ?? 'no spectral type'} · system {o.system}</div>
      <div className="section-title">Colour–magnitude <ProvenanceBadge cls="observed" title="CNS5 photometry; M_G uses the parallax (derived)" /></div>
      <dl className="kv" aria-label="CMD values">
        <KV k="G − RP (CNS5 resulting)" v={cmd?.colour ?? null} unit="mag" sig={4} />
        <KV k="Absolute G" v={cmd?.absG ?? null} unit="mag" sig={4} />
        <KV k="Colour origin" v={cmd ? (cmd.fGRP === 0 ? 'Gaia EDR3, deblended' : cmd.fGRP === 1 ? 'Gaia EDR3 as published' : cmd.fGRP === 2 ? 'converted from Hipparcos' : '—') : null} />
      </dl>
      {dG !== null && Math.abs(dG) > 0.2 && <p className="note warn">The Hipparcos-converted G differs by {dG > 0 ? '+' : ''}{dG.toFixed(2)} mag from this star’s catalogue V plus the G−V of a typical {o.spt} dwarf. The CNS5 value is shown unchanged; its place on the colour–magnitude diagram is uncertain by about that much.</p>}
      <div className="section-title">Luminosity–temperature <ProvenanceBadge cls="derived" /></div>
      {'reason' in hr ? <p className="note">Not on the theoretical diagram: {hr.reason}.</p> : <>
        <dl className="kv" aria-label="HR values">
          <KV k="T_eff (from spectral type)" v={hr.teff} unit="K" sig={4} />
          <KV k="log₁₀(L/L☉)" v={hr.logL} sig={3} />
          <KV k="Radius from L and T (Stefan–Boltzmann)" v={hr.radius} unit="R☉" sig={3} />
          <KV k={`Absolute ${hr.band} (observed) vs class V mean`} v={`${hr.absMag.toFixed(2)} vs ${hr.calMag.toFixed(2)}`} unit="mag" />
        </dl>
        {hr.flags.map((f) => <p key={f} className="note warn" style={{ margin: '4px 0' }}>{f}</p>)}
        <p className="note" style={{ fontSize: 10.5 }}>T_eff is the mean for its type, not measured for this star. L scales the type's mean luminosity by the observed–mean magnitude difference, which assumes the same bolometric correction. {hr.cal.caveats.join(' ')}</p>
      </>}
      <button className="chip" onClick={() => navigate(`/cosmic/stars?sel=${o.seq}`)}>Show on the star map →</button>
    </>
  );
}

function ClassTable({ ten, hl }: { ten: NearbyObject[]; hl: string | null }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of ten) { if (o.type === 'exoplanet') continue; const p = parseSpectralType(o.spt); const k = p?.kind === 'white-dwarf' ? 'D' : p?.cls ?? '?'; c[k] = (c[k] ?? 0) + 1; }
    return c;
  }, [ten]);
  return (
    <>
      <table className="table-mini" aria-label="Spectral classes" style={{ width: '100%' }}>
        <thead><tr><th>Class</th><th>Rows</th><th>T_eff, class V (K)</th><th>Mass (M☉)</th><th>Radius (R☉)</th><th>Within 10 pc</th><th>Strongest lines</th></tr></thead>
        <tbody>
          {MK_CLASSES.map((k) => (
            <tr key={k.cls} className={hl === k.cls ? 'active' : ''} style={hl === k.cls ? { background: 'rgba(177,140,255,0.16)' } : undefined}>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 15 }}>{k.cls}</td>
              <td>{k.first}–{k.last}</td>
              <td>{k.teffHot.toLocaleString('en-US')} – {k.teffCool.toLocaleString('en-US')}</td>
              <td>{k.massHi !== null ? `${k.massHi} – ${k.massLo}` : 'unknown'}</td>
              <td>{k.rHi !== null ? `${k.rHi} – ${k.rLo}` : 'unknown'}</td>
              <td>{counts[k.cls] ?? 0}</td>
              <td style={{ fontSize: 10.5 }}>{CLASS_LINES[k.cls] ? <>{CLASS_LINES[k.cls].note}{CLASS_LINES[k.cls].spectra.map((s) => <span key={s}> · <button className="link-btn" onClick={() => navigate(`/spectral?tab=lines&spec=${encodeURIComponent(s)}`)}>{s}</button></span>)}</> : '—'}</td>
            </tr>
          ))}
          <tr><td style={{ fontFamily: 'var(--mono)', fontSize: 15 }}>D</td><td>white dwarfs</td><td colSpan={3} className="unknown">not on the main-sequence calibration</td><td>{counts.D ?? 0}</td><td>—</td></tr>
        </tbody>
      </table>
      <p className="note" style={{ fontSize: 10.5 }}>Rows from E. Mamajek’s mean dwarf sequence (version {DWARF_SEQUENCE_VERSION}), whose content is published in part as Pecaut &amp; Mamajek (2013) Table 5 <SourceLinks ids={['pecaut-mamajek-2013']} />. Masses and radii are mean values for luminosity class V; blank cells are not tabulated. Counts use the catalogue spectral types (<SourceLinks ids={['reyle-2021']} />), {counts['?'] ?? 0} objects have none.</p>
      <p className="note">The letters follow the surface temperature, O, B, A, F, G, K, M from hottest to coldest, a sequence now extended to the cooler types L, T and Y. O stars are identified by lines of ionised helium, B stars by neutral helium, A stars by strong hydrogen lines, F and G stars by ionised calcium, K stars by lines of iron and manganese atoms and M stars by molecular bands, mainly titanium oxide <SourceLinks ids={['iau-oae-glossary']} />; the TiO bands disappear in the cooler L dwarfs <SourceLinks ids={['kirkpatrick-1999']} />. The Sun’s IAU nominal effective temperature, {TEFF_SUN_NOMINAL} K <SourceLinks ids={['iau-2015-b3']} />, is close to the G2 V mean in this table. Most objects within 10 pc are M dwarfs (counts above).</p>
    </>
  );
}

export default function HrView() {
  const { query } = useRoute();
  const d: Diagram = query.get('d') === 'hr' ? 'hr' : query.get('d') === 'classes' ? 'classes' : 'cmd';
  const bg = query.get('bg') !== '0';
  const selSeq = Number(query.get('sel')) || null;
  const [ten, setTen] = useState<NearbyObject[] | null>(null);
  const [cns, setCns] = useState<CnsStar[] | null>(null);
  const [showSeq, setShowSeq] = useState(true);
  const [showR, setShowR] = useState(true);
  useEffect(() => { loadTenParsec().then(setTen); loadCns5().then(setCns); }, []);
  const match = useMemo(() => (ten && cns ? crossMatch(ten, cns) : null), [ten, cns]);
  const cnsToTen = useMemo(() => new Map([...(match ?? new Map<number, CnsStar>()).entries()].map(([seq, c]) => [c.cns5, ten!.find((o) => o.seq === seq)!])), [match, ten]);

  const cmdPoints: ScatterPoint[] = useMemo(() => {
    if (!cns) return [];
    const out: ScatterPoint[] = [];
    for (const c of cns) {
      const p = cmdPoint(c);
      if (!p) continue;
      const o = cnsToTen.get(c.cns5);
      if (!o && (!bg || c.plx >= 100)) continue;
      out.push({ key: o ? String(o.seq) : `c${c.cns5}`, x: p.colour, y: p.absG, color: o ? TYPE_COLOR[o.type] : OTHER, r: o ? 2.6 : 1.6, ring: p.fGRP === 2, title: `${o ? o.name : `CNS5 ${c.cns5}${c.gj ? ` (GJ ${c.gj}${c.comp ? ' ' + c.comp : ''})` : ''}`}: G−RP ${p.colour.toFixed(3)}, M_G ${p.absG.toFixed(2)}${p.fGRP === 2 ? ' (Hipparcos-converted)' : ''}` });
    }
    // draw 10 pc points last (on top)
    return out.sort((a, b) => Number(!a.key.startsWith('c')) - Number(!b.key.startsWith('c')));
  }, [cns, cnsToTen, bg]);

  const hrStars = useMemo(() => (ten ?? []).map((o) => ({ o, h: hrPoint(o) })), [ten]);
  const hrPoints: ScatterPoint[] = hrStars.filter((x): x is { o: NearbyObject; h: HrStar } => !('reason' in x.h)).map(({ o, h }) => ({
    key: String(o.seq), x: h.teff, y: h.logL, color: TYPE_COLOR[o.type], r: 2.8, ring: h.band === 'V', title: `${o.name} (${o.spt}): T_eff ≈ ${h.teff.toFixed(0)} K, log L ≈ ${h.logL.toFixed(2)}${h.band === 'V' ? ' (from V)' : ''}`,
  }));
  if (!ten || !cns) return <Loading label="Loading nearby-star catalogues" />;

  const sel = ten.find((o) => o.seq === selSeq) ?? null;
  const seqCmd = DWARF_SEQUENCE.filter((r) => r.GRp !== null && r.MG !== null).map((r) => [r.GRp!, r.MG!] as [number, number]);
  const seqHr = DWARF_SEQUENCE.filter((r) => r.Teff !== null && r.logL !== null && r.Teff >= 1800 && r.Teff <= 12000).map((r) => [r.Teff!, r.logL!] as [number, number]);
  const T = [1800, 12000];
  const rLines = [0.01, 0.1, 1, 10].map((R) => ({ points: [[T[0], logLForRadius(R, T[0])], [T[1], logLForRadius(R, T[1])]] as [number, number][], color: 'rgba(177,140,255,0.45)', dashed: true }));
  const rLabels = [0.01, 0.1, 1, 10].map((R) => ({ x: 2100, y: logLForRadius(R, 2100) + 0.12, text: `${R} R☉`, color: 'rgba(177,140,255,0.8)' }));
  const classTicksHr = MK_CLASSES.filter((k) => 'BAFGKM'.includes(k.cls)).map((k) => ({ x: Math.sqrt(Math.min(12000, k.teffHot) * Math.max(1800, k.teffCool)), label: k.cls }));
  const classTicksCmd = MK_CLASSES.filter((k) => 'AFGKML'.includes(k.cls)).map((k) => { const r = DWARF_SEQUENCE.find((x) => x.spt === `${k.cls}5V`); return r?.GRp !== null && r?.GRp !== undefined ? { x: r.GRp, label: k.cls } : null; }).filter((t): t is { x: number; label: string } => !!t);
  const hrCount = hrPoints.length, noHr = hrStars.filter((x) => 'reason' in x.h && x.o.type !== 'exoplanet').length;

  return (
    <>
      <nav className="view-switch" aria-label="Diagram">
        <button className={d === 'cmd' ? 'active' : ''} onClick={() => setQuery({ d: null })}>Colour–magnitude (observed)</button>
        <button className={d === 'hr' ? 'active' : ''} onClick={() => setQuery({ d: 'hr' })}>Luminosity–temperature</button>
        <button className={d === 'classes' ? 'active' : ''} onClick={() => setQuery({ d: 'classes' })}>Spectral classes</button>
      </nav>
      <div className="center-stage hr-stage">
        {d === 'cmd' && <>
          <div className="stage-head"><h1>Colour–magnitude diagram <ProvenanceBadge cls="observed" title="Gaia/Hipparcos photometry from CNS5; absolute magnitude derived from the parallax" /></h1>
            <p className="note">Every star within {bg ? 20 : 10} pc with CNS5 photometry: absolute G magnitude against G−RP colour. Hotter, bluer stars are on the left, brighter ones at the top. The main sequence runs diagonally; white dwarfs form the faint group at bottom left. Hollow circles are Hipparcos-converted photometry (stars too bright for Gaia).</p></div>
          <ScatterPlot ariaLabel="Colour–magnitude diagram" points={cmdPoints} xLabel="colour G − RP (mag)" yLabel="absolute magnitude M_G (mag)" xDomain={[-0.2, 1.8]} yDomain={[-2, 20]} yReverse
            lines={showSeq ? [{ points: seqCmd, color: '#7df9ff', label: 'mean class V sequence' }] : []} selected={sel ? String(sel.seq) : null} onPick={(k) => !k.startsWith('c') && setQuery({ sel: Number(k) })} topTicks={classTicksCmd} />
          <p className="note" style={{ fontSize: 10.5 }}>M_G = G + 5 log₁₀(ϖ/100 mas), no extinction. Photometry and parallaxes: <SourceLinks ids={['golovin-2023-cns5', 'gaia-edr3']} />; sequence: <SourceLinks ids={['pecaut-mamajek-2013']} />. Class letters on top mark the G−RP of each class’s subtype 5 dwarf.</p>
        </>}
        {d === 'hr' && <>
          <div className="stage-head"><h1>Luminosity–temperature diagram <ProvenanceBadge cls="derived" title="T_eff from spectral-type calibration; L from observed absolute magnitude" /></h1>
            <p className="note">{hrCount} stars within 10 pc that have a calibratable spectral type and measured G or V ({noHr} others cannot be placed: white dwarfs, most brown dwarfs, untyped objects). T_eff is the class V mean for each spectral type; L is scaled from it by the measured absolute magnitude. Dashed lines are constant radius, from L = 4πR²σT⁴. Hollow circles were placed with Johnson V because Gaia has no G for them.</p></div>
          <ScatterPlot ariaLabel="Luminosity–temperature diagram" points={[...hrPoints, { key: 'sun', x: TEFF_SUN_NOMINAL, y: 0, color: '#fff3c4', r: 5, title: 'Sun: IAU 2015 nominal T_eff = 5772 K, L = L☉' }]}
            xLabel="effective temperature T_eff (K, log scale)" yLabel="luminosity log₁₀(L/L☉)" xLog xReverse xDomain={[1800, 12000]} yDomain={[-5, 2.2]} xTicks={[2000, 3000, 4000, 5000, 7000, 10000]}
            lines={[...(showR ? rLines : []), ...(showSeq ? [{ points: seqHr, color: '#7df9ff', label: 'mean class V sequence' }] : [])]} labels={[...(showR ? rLabels : []), { x: TEFF_SUN_NOMINAL, y: 0.25, text: 'Sun', color: '#fff3c4', anchor: 'middle' }]}
            selected={sel ? String(sel.seq) : null} onPick={(k) => k !== 'sun' && setQuery({ sel: Number(k) })} topTicks={classTicksHr} />
          <p className="note" style={{ fontSize: 10.5 }}>Sun from IAU 2015 B3 nominal values <SourceLinks ids={['iau-2015-b3']} />. σ from CODATA constants. Calibration: <SourceLinks ids={['pecaut-mamajek-2013']} />. Spectral types and photometry: <SourceLinks ids={['reyle-2021']} />.</p>
        </>}
        {d === 'classes' && <>
          <div className="stage-head"><h1>Stellar spectral classes</h1></div>
          <ClassTable ten={ten} hl={query.get('cls')} />
        </>}
      </div>
      <Panel id="hr-controls" className="left-panel" title="HR diagram">
        {d === 'cmd' && <label className="toggle-row"><span>CNS5 stars at 10–20 pc</span><input type="checkbox" checked={bg} onChange={(e) => setQuery({ bg: e.target.checked ? null : 0 })} aria-label="Include CNS5 stars at 10–20 pc" /></label>}
        {d !== 'classes' && <label className="toggle-row"><span>Mean class V sequence</span><input type="checkbox" checked={showSeq} onChange={(e) => setShowSeq(e.target.checked)} /></label>}
        {d === 'hr' && <label className="toggle-row"><span>Lines of constant radius</span><input type="checkbox" checked={showR} onChange={(e) => setShowR(e.target.checked)} /></label>}
        <Legend bg={bg && d === 'cmd'} />
        <p className="note">Click a coloured point to select a 10 pc object. {d === 'cmd' ? `${cmdPoints.length} points plotted.` : ''}</p>
        <p className="note" style={{ fontSize: 10.5 }}>An H–R diagram plots the luminosity of stars against their effective temperature or spectral type; main-sequence stars lie on a diagonal band from upper left to lower right <SourceLinks ids={['iau-oae-glossary']} />. Along it massive stars sit at the upper left, Sun-like stars mid-way and low-mass stars at the lower right <SourceLinks ids={['esa-gaia-hrd-2018']} />.</p>
      </Panel>
      <Panel id="hr-info" className="right-panel" title="Selected">
        {sel ? <SelectedPanel o={sel} hr={hrPoint(sel)} cns={match?.get(sel.seq)} /> : <p className="note">Select a point on the diagram, or open a star from the star map.</p>}
      </Panel>
    </>
  );
}
