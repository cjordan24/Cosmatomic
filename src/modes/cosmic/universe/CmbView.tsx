/**
 * Cosmic microwave background — #/cosmic/cmb?tab=spectrum|history|power&T=&err=&gal=&z=&m=&l=&axis=
 * FIRAS monopole spectrum against Planck's law; the temperature–redshift relation with measurements at
 * z > 0; the Planck 2018 TT angular power spectrum with the best-fit ΛCDM curve. Every plotted point is
 * published data; curves are labelled models. Gate 7.3.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import {
  bestFitT, blackbodyMJy, chi2About, clFromDl, cmbTemperature, firasIntensity, ghzFromWavenumber, localMaxima, pullSigma, residualAbout,
} from '@/core/physics/cmb';
import { WIEN_B, peakFrequency } from '@/core/physics/em/em';
import { PLANCK18, ageGyr, transverseComovingMpc } from '@/core/physics/cosmology';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { CMB, FIRAS, bandAt, theoryDl } from './cmb';
import { fmtE, logGrid, planckParam } from './universe';

type Tab = 'spectrum' | 'history' | 'power';
const TABS: [Tab, string][] = [['spectrum', 'Spectrum'], ['history', 'Temperature'], ['power', 'Power spectrum']];
const COL = { data: '#f5c76b', model: '#7df9ff', alt: '#b18cff', gal: '#ff7a90', meas: '#5cf2a6', muller: '#ff7a90' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const T0 = CMB.t0.value, TREF = CMB.firas.referenceT;
const F = CMB.firas;

// ------------------------------------------------------------------ spectrum
function SpectrumTab() {
  const { query } = useRoute();
  const best = useMemo(() => bestFitT(FIRAS, TREF), []);
  const T = num(query, 'T', T0, 2.6, 2.85);
  const mag = query.get('err') === '1' ? 1 : 400;
  const showGal = query.get('gal') === '1';
  const chi2 = chi2About(FIRAS, TREF, T), chi2Best = chi2About(FIRAS, TREF, best);
  const nus = useMemo(() => logGrid(1, 23, 160), []);
  const presets = [
    { T: T0, label: `${T0} K`, title: `Fixsen (2009): ${T0} ± ${CMB.t0.sigma} K`, src: 'fixsen-2009' },
    { T: TREF, label: `${TREF} K`, title: 'reference blackbody of the LAMBDA file', src: 'lambda-firas' },
    { T: F.fit1996.T, label: `${F.fit1996.T} K`, title: `Fixsen et al. (1996): ${F.fit1996.T} ± ${F.fit1996.sigma} K (${F.fit1996.interval})`, src: 'fixsen-1996' },
  ];
  const nuPeakGHz = peakFrequency(T) / 1e9;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The CMB spectrum: a blackbody <ProvenanceBadge cls="observed" title="FIRAS monopole, Fixsen et al. (1996) Table 4; the curve is Planck’s law" /></h1>
          <p className="note">COBE’s FIRAS instrument measured the spectrum of the cosmic microwave background across 2–21 cm⁻¹ (68–640 GHz). In its authors’ words: “{F.quote.text}” <SourceLinks ids={['fixsen-1996']} /> The deviations from a blackbody are less than {F.rmsPpm.value} parts per million of the peak brightness.</p></div>
        <LinePlot ariaLabel="FIRAS CMB spectrum and a blackbody curve" width={680} height={320} xDomain={[60, 660]} yDomain={[0, 420]} xLabel="frequency ν (GHz)" yLabel="intensity B_ν (MJy/sr)" legend="tr"
          series={[
            { points: nus.map((n) => [ghzFromWavenumber(n), blackbodyMJy(n, T)] as [number, number]), color: COL.model, width: 1.6, label: `Planck’s law, T = ${T.toFixed(5)} K` },
            ...(showGal ? [{ points: CMB.firas.rows.map((r) => [ghzFromWavenumber(r[0]), r[4] / 1000 * 100] as [number, number]), color: COL.gal, dashed: true, label: 'Galaxy model at the poles × 100' }] : []),
          ]}
          errorBars={FIRAS.map((p) => ({ x: ghzFromWavenumber(p.nu), y: firasIntensity(p, TREF), lo: (p.sigma / 1000) * mag, hi: (p.sigma / 1000) * mag, color: COL.data, title: `${p.nu} cm⁻¹ (${ghzFromWavenumber(p.nu).toFixed(1)} GHz): ${firasIntensity(p, TREF).toFixed(3)} MJy/sr ± ${p.sigma} kJy/sr` }))} />
        <p className="note" style={{ fontSize: 10.5 }}>Points: the {FIRAS.length} FIRAS frequencies, intensity = the published residual (Table 4) added to a {TREF} K blackbody, as in the NASA LAMBDA file <SourceLinks ids={['fixsen-1996', 'lambda-firas']} />. Error bars are 1σ{mag > 1 ? <strong> magnified × {mag}</strong> : ''}; unmagnified they are thinner than the curve. Frequency ν = c·ν̃ from the wavenumber ν̃ in cm⁻¹.</p>
        <LinePlot ariaLabel="FIRAS residuals about the chosen blackbody" width={680} height={220} xDomain={[60, 660]} xLabel="frequency ν (GHz)" yLabel={`residual about ${T.toFixed(4)} K (kJy/sr)`}
          series={[{ points: [[60, 0], [660, 0]], color: COL.model, width: 1 }]}
          errorBars={FIRAS.map((p) => ({ x: ghzFromWavenumber(p.nu), y: residualAbout(p, TREF, T), lo: p.sigma, hi: p.sigma, color: COL.data, title: `${p.nu} cm⁻¹: ${residualAbout(p, TREF, T).toFixed(1)} ± ${p.sigma} kJy/sr` }))} />
        <p className="note" style={{ fontSize: 10.5 }}>Residual = data − Planck’s law at your T, with unmagnified 1σ errors (1 MJy/sr = 1000 kJy/sr). A small temperature offset ΔT adds ΔT·∂B/∂T to every residual, the term Fixsen et al. fit alongside the Galaxy model <SourceLinks ids={['fixsen-1996']} /> <ProvenanceBadge cls="derived" title="computed here from Table 4" />.</p>
      </div>
      <Panel id="cmb-spec-controls" className="left-panel" title="Blackbody temperature">
        <label className="slider-row"><span>T (K)</span><input type="range" min={2.70} max={2.75} step={0.00001} value={T} onChange={(e) => setQuery({ T: e.target.value })} aria-label="Blackbody temperature" /><span>{T.toFixed(5)}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {presets.map((p) => <button key={p.label} className={`chip ${Math.abs(T - p.T) < 1e-7 ? 'active' : ''}`} title={p.title} onClick={() => setQuery({ T: p.T === T0 ? null : String(p.T) })}>{p.label}</button>)}
          <button className={`chip ${Math.abs(T - best) < 2e-6 ? 'active' : ''}`} title="χ² minimum of the FIRAS points, computed here" onClick={() => setQuery({ T: best.toFixed(6) })}>best fit</button>
        </div>
        <label className="toggle-row"><span>error bars × 400</span><input type="checkbox" checked={mag > 1} onChange={(e) => setQuery({ err: e.target.checked ? null : '1' })} aria-label="Magnify error bars" /></label>
        <label className="toggle-row"><span>Galaxy model (× 100)</span><input type="checkbox" checked={showGal} onChange={(e) => setQuery({ gal: e.target.checked ? '1' : null })} aria-label="Show Galaxy model" /></label>
        <p className="note" style={{ fontSize: 10.5 }}>The Galaxy column is Fixsen et al.’s model of Galactic emission at the poles (Table 4), drawn 100 times larger to be visible <SourceLinks ids={['fixsen-1996']} />.</p>
        <button className="chip" onClick={() => navigate(`/spectral?tab=blackbody&T=${T0}`)}>Open the {T0} K blackbody in the Spectral atlas →</button>
        <button className="chip" onClick={() => navigate('/spectral/compare?L=firas,bb.cmb,bb.sun&ax=frequency')}>FIRAS beside the Sun on one axis →</button>
      </Panel>
      <Panel id="cmb-spec-info" className="right-panel" title="Fit and limits">
        <dl className="kv" aria-label="FIRAS fit">
          <KV k={`χ² at ${T.toFixed(5)} K (${FIRAS.length} points)`} v={chi2} sig={4} />
          <KV k="Best-fit T (χ² minimum)" v={`${best.toFixed(5)} K`} title="derived: golden-section search, diagonal errors" />
          <KV k="χ² at the best fit" v={`${chi2Best.toFixed(1)} for ${FIRAS.length - 1} d.o.f.`} />
          <KV k="Published χ² (Fixsen et al. 1996)" v={`${F.chi2.value} for ${F.chi2.dof} d.o.f.`} title={F.chi2.note} />
          <KV k="Peak of B_ν (Wien)" v={`${nuPeakGHz.toFixed(1)} GHz (${(nuPeakGHz / ghzFromWavenumber(1)).toFixed(2)} cm⁻¹)`} />
          <KV k="Peak of B_λ (Wien)" v={`${(WIEN_B / T * 1e3).toFixed(3)} mm`} />
        </dl>
        <p className="note warn" style={{ fontSize: 10.5 }}>The temperature scale. The best fit returns ≈ {TREF} K because the residuals were published about FIRAS’s own fit. The 1σ errors do not include the absolute temperature calibration, so χ² at {T0} K is large even though that value agrees within its uncertainty ({CMB.t0.sigma} K). {F.referenceTNote} <SourceLinks ids={['fixsen-1996', 'fixsen-2009']} /></p>
        <div className="section-title">Limits on spectral distortions</div>
        <table className="table-mini" aria-label="Spectral distortion limits" style={{ width: '100%' }}>
          <thead><tr><th>Parameter</th><th>Measured</th><th>Limit (95 % CL)</th></tr></thead>
          <tbody>{F.distortions.map((d) => <tr key={d.key}><td>{d.key === 'mu' ? 'μ' : 'y'}</td><td>{d.measured}</td><td title={d.interval}>&lt; {fmtE(d.limit, 1)}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>{F.distortions.map((d) => `${d.label}: ${d.epoch}.`).join(' ')} <SourceLinks ids={['fixsen-1996']} /></p>
        <dl className="kv" aria-label="CMB temperature today">
          <KV k="T₀ today" v={`${T0} ± ${CMB.t0.sigma} K`} title={CMB.t0.interval} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>{CMB.t0.note}; ± read as {CMB.t0.interval} <SourceLinks ids={['fixsen-2009']} />.</p>
        <RelatedLinks id="context:cmb" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ temperature history
function HistoryTab() {
  const { query } = useRoute();
  const z = num(query, 'z', planckParam('zstar').value, 0, 1e5);
  const meas = CMB.tz.measurements;
  const sel = meas.find((m) => m.id === query.get('m')) ?? meas.find((m) => m.source === 'muller-2013')!;
  const Tz = cmbTemperature(z, T0);
  const zs = useMemo(() => logGrid(1, 1e5, 200), []);
  const epochs = [
    { key: 'zre', label: 'reionization', z: planckParam('zre').value },
    { key: 'zstar', label: 'last scattering z∗', z: planckParam('zstar').value },
    { key: 'zeq', label: 'matter–radiation equality', z: planckParam('zeq').value },
  ];
  const age = ageGyr(z, PLANCK18);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>T(z) = T₀(1 + z) <ProvenanceBadge cls="observed" title="measurements at z > 0; the line is the adiabatic prediction" /></h1>
          <p className="note">If the CMB has cooled adiabatically as the universe expanded, its temperature at redshift z is T₀(1 + z). “{CMB.tz.quotes[0].text}” <SourceLinks ids={['noterdaeme-2011']} /> The radiation excites the rotational levels of interstellar molecules such as CO, which can then serve as thermometers in distant gas clouds <SourceLinks ids={['noterdaeme-2011']} />.</p></div>
        <LinePlot ariaLabel="CMB temperature measurements at redshift above zero" width={680} height={300} xDomain={[0, 3]} yDomain={[0, 13]} xLabel="redshift z" yLabel="T_CMB (K)" legend="tl"
          series={[
            { points: [[0, T0], [3, cmbTemperature(3, T0)]], color: COL.model, width: 1.6, label: `adiabatic: ${T0} K × (1 + z)` },
            { points: [[0, T0], [3, cmbTemperature(3, T0, CMB.tz.beta.value + CMB.tz.beta.sigma)]], color: COL.alt, dashed: true, width: 1, label: `β = ${CMB.tz.beta.value} ± ${CMB.tz.beta.sigma} (1σ range)` },
            { points: [[0, T0], [3, cmbTemperature(3, T0, CMB.tz.beta.value - CMB.tz.beta.sigma)]], color: COL.alt, dashed: true, width: 1 },
          ]}
          errorBars={[{ x: 0, y: T0, lo: CMB.t0.sigma, hi: CMB.t0.sigma, color: '#ffffff', title: `z = 0: ${T0} K (Fixsen 2009)` },
            ...meas.map((m) => ({ x: m.z, y: m.T, lo: m.lo, hi: m.hi, color: m.source === 'muller-2013' ? COL.muller : COL.meas, title: `${m.object}, z = ${m.z}: ${m.T} +${m.hi}/−${m.lo} K (${m.method})` }))]}
          markers={[{ x: sel.z, y: sel.T, label: sel.object.split(' (')[0], color: '#ffffff' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Green: CO excitation temperatures in five quasar absorption systems, Table 1 of Noterdaeme et al. (2011) (two of them quoted there from earlier papers) <SourceLinks ids={['noterdaeme-2011']} />. Red: {meas.find((m) => m.source === 'muller-2013')!.T} ± 0.10 K at z = 0.89 from molecules in the lensing galaxy of PKS 1830−211, 68 % CL <SourceLinks ids={['muller-2013']} />. White: T₀ today <SourceLinks ids={['fixsen-2009']} />. Dashed: T₀(1 + z)^(1−β) with the fitted β; β = 0 is the adiabatic case.</p>
        <LinePlot ariaLabel="CMB temperature over cosmic history" width={680} height={240} xLog yLog xDomain={[1, 1e5]} yDomain={[1, 3e5]} xLabel="1 + z (log)" yLabel="T_CMB (K, log)"
          series={[{ points: zs.map((x) => [x, cmbTemperature(x - 1, T0)] as [number, number]), color: COL.model, width: 1.6 }]}
          vLines={epochs.map((e) => ({ x: 1 + e.z, label: e.label, color: '#9aa4b2' }))}
          markers={[{ x: 1 + z, y: Tz, label: `${Tz < 1e4 ? Tz.toPrecision(4) : fmtE(Tz, 2)} K`, color: '#ffffff' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>The same relation over the whole history, an extrapolation <ProvenanceBadge cls="derived" title="T₀(1+z) with β = 0" />. Epoch redshifts from Planck 2018 Table 2 <SourceLinks ids={['planck-2018-vi']} />. Planck’s base model assumes T₀ = {planckParam('T0').value} K.</p>
      </div>
      <Panel id="cmb-hist-controls" className="left-panel" title="Redshift">
        <label className="slider-row"><span>log₁₀(1 + z)</span><input type="range" min={0} max={5} step={0.001} value={Math.log10(1 + z)} onChange={(e) => setQuery({ z: (10 ** Number(e.target.value) - 1).toPrecision(5) })} aria-label="Redshift" /><span>z = {z < 10 ? z.toFixed(3) : z.toPrecision(5)}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className={`chip ${z === 0 ? 'active' : ''}`} onClick={() => setQuery({ z: '0' })}>today</button>
          <button className={`chip ${Math.abs(z - 0.88582) < 1e-6 ? 'active' : ''}`} onClick={() => setQuery({ z: '0.88582', m: 'PKS1830-211' })}>z = 0.89 (PKS 1830−211)</button>
          {epochs.map((e) => <button key={e.key} className={`chip ${Math.abs(z - e.z) < 1e-6 ? 'active' : ''}`} onClick={() => setQuery({ z: e.key === 'zstar' ? null : String(e.z) })}>{e.label}</button>)}
        </div>
        <div className="section-title">Measurements</div>
        {meas.map((m) => <label key={m.id} className="toggle-row"><span>{m.object}, z = {m.z}</span>
          <input type="radio" name="cmb-meas" checked={m.id === sel.id} onChange={() => setQuery({ m: m.id, z: String(m.z) })} aria-label={m.object} /></label>)}
      </Panel>
      <Panel id="cmb-hist-info" className="right-panel" title={`At z = ${z < 10 ? z.toFixed(3) : z.toPrecision(5)}`}>
        <dl className="kv" aria-label="CMB at the chosen redshift">
          <KV k="T = T₀(1 + z)" v={`${Tz < 1e4 ? Tz.toPrecision(5) : fmtE(Tz, 3)} K`} />
          <KV k="Peak of B_ν" v={`${fmtE(peakFrequency(Tz) / 1e9, 3)} GHz`} />
          <KV k="Peak of B_λ" v={WIEN_B / Tz >= 1e-3 ? `${(WIEN_B / Tz * 1e3).toPrecision(4)} mm` : `${(WIEN_B / Tz * 1e6).toPrecision(4)} µm`} />
          <KV k="Age of the universe then (ΛCDM)" v={age >= 1e-3 ? `${age < 1 ? (age * 1e3).toPrecision(4) + ' Myr' : age.toPrecision(4) + ' Gyr'}` : `${fmtE(age * 1e9, 2)} yr`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Peaks from Wien’s displacement law; age from the Planck 2018 background model of the Expansion view (radiation from z_eq) <SourceLinks ids={['codata-2018', 'planck-2018-vi', 'hogg-1999']} />.</p>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className="chip" onClick={() => navigate(`/spectral?tab=blackbody&T=${Number(Tz.toPrecision(5))}`)}>Blackbody at {Number(Tz.toPrecision(4))} K →</button>
          <button className="chip" onClick={() => navigate(`/cosmic/universe?z=${Number(z.toPrecision(5))}`)}>Expansion at this z →</button>
        </div>
        <div className="section-title">{sel.object}</div>
        <dl className="kv" aria-label="Selected measurement">
          <KV k="Redshift" v={sel.z} sig={6} />
          <KV k="Measured T" v={`${sel.T} +${sel.hi} / −${sel.lo} K`} title={sel.interval} />
          <KV k="Adiabatic prediction" v={`${cmbTemperature(sel.z, T0).toFixed(3)} K`} />
          <KV k="Difference / σ" v={`${pullSigma(sel.T, sel.lo, sel.hi, cmbTemperature(sel.z, T0)).toFixed(2)}σ`} title="derived: (prediction − measurement) / error on that side" />
          <KV k="Method" v={sel.method} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>{sel.note}. Interval: {sel.interval} <SourceLinks ids={[sel.source]} />.</p>
        <p className="note" style={{ fontSize: 10.5 }}>Fit of all measurements combined: β = {CMB.tz.beta.value} ± {CMB.tz.beta.sigma} ({CMB.tz.beta.note}) <SourceLinks ids={['noterdaeme-2011']} />.</p>
        <RelatedLinks id="context:cmb" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ power spectrum
function PowerTab() {
  const { query } = useRoute();
  const P = CMB.power;
  const l = Math.round(num(query, 'l', 220, 2, 2500));
  const linear = query.get('axis') === 'lin';
  const band = bandAt(l);
  const peaks = useMemo(() => localMaxima(P.theory.rows, 100).slice(0, 7), [P.theory.rows]);
  const bars = [
    ...P.lowEll.rows.map((r) => ({ x: r[0], y: r[1], lo: r[2], hi: r[3], color: COL.data, title: `ℓ = ${r[0]}: ${r[1].toFixed(0)} −${r[2].toFixed(0)}/+${r[3].toFixed(0)} µK²` })),
    ...P.binned.rows.map((r) => ({ x: r[0], y: r[1], lo: r[2], hi: r[2], color: COL.data, title: `ℓ_b = ${r[0].toFixed(1)}: ${r[1].toFixed(1)} ± ${r[2].toFixed(1)} µK²` })),
  ].filter((b) => !linear || b.x >= 2);
  const resid = [
    ...P.lowEll.rows.map((r) => ({ x: r[0], y: r[1] - theoryDl(r[0]), lo: r[2], hi: r[3], color: COL.data })),
    ...P.binned.rows.map((r) => ({ x: r[0], y: r[1] - r[3], lo: r[2], hi: r[2], color: COL.data })),
  ];
  const sigmaSide = band.D > band.bestFit ? band.lo : band.hi;
  const xDomain: [number, number] = linear ? [0, 2510] : [2, 2510];
  const thetaStar = planckParam('theta_star'), dmStar = transverseComovingMpc(planckParam('zstar').value, PLANCK18);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Temperature power spectrum (Planck 2018) <ProvenanceBadge cls="observed" title="Planck Legacy Archive band powers; the curve is the best-fit ΛCDM model" /></h1>
          <p className="note">How much the CMB temperature varies on each angular scale, as D_ℓ = ℓ(ℓ+1)C_ℓ/2π in µK² for each multipole ℓ <SourceLinks ids={['planck-2018-v']} />. Points are Planck’s measurements; the curve is the base-ΛCDM spectrum that fits them best (TT,TE,EE+lowl+lowE+lensing, without BAO, so its parameters differ slightly from the Table 2 values used elsewhere).</p></div>
        <LinePlot ariaLabel="Planck 2018 temperature angular power spectrum" width={680} height={320} xLog={!linear} xDomain={xDomain} yDomain={[0, 6600]} xLabel={`multipole ℓ (${linear ? 'linear' : 'log'})`} yLabel="D_ℓ^TT (µK²)" legend="tl"
          series={[{ points: P.theory.rows.map((r) => [r[0], r[1]] as [number, number]), color: COL.model, width: 1.4, label: 'best-fit ΛCDM' }]}
          errorBars={bars} vLines={[{ x: l, label: `ℓ = ${l}`, color: '#ffffff' }, ...(linear ? [] : [{ x: 30, label: 'ℓ = 30', color: '#9aa4b2' }])]} />
        <p className="note" style={{ fontSize: 10.5 }}>ℓ = 2–29: {P.lowEll.method}. ℓ ≥ 30: {P.binned.method}. {P.errorNote} <SourceLinks ids={['planck-2018-v', 'planck-pla']} /> Data: {P.credit} (CC BY-NC 3.0 IGO).</p>
        <LinePlot ariaLabel="Planck power spectrum residuals about the best fit" width={680} height={200} xLog={!linear} xDomain={xDomain} yDomain={[-1000, 1000]} xLabel={`multipole ℓ (${linear ? 'linear' : 'log'})`} yLabel="data − best fit (µK²)"
          series={[{ points: [[xDomain[0] || 1, 0], [2510, 0]], color: COL.model, width: 1 }]} errorBars={resid} />
        <p className="note" style={{ fontSize: 10.5 }}>Residuals about the best fit; at ℓ ≥ 30 against the binned best-fit column of the release. The error bars include cosmic variance, approximated as Gaussian <SourceLinks ids={['planck-2018-v']} />.</p>
      </div>
      <Panel id="cmb-power-controls" className="left-panel" title="Multipole">
        <label className="slider-row"><span>ℓ</span><input type="range" min={Math.log10(2)} max={Math.log10(2500)} step={0.001} value={Math.log10(l)} onChange={(e) => setQuery({ l: String(Math.round(10 ** Number(e.target.value))) })} aria-label="Multipole" /><span>{l}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {peaks.slice(0, 3).map((p, i) => <button key={p.l} className={`chip ${l === p.l ? 'active' : ''}`} onClick={() => setQuery({ l: String(p.l) })}>peak {i + 1}</button>)}
        </div>
        <label className="toggle-row"><span>linear ℓ axis</span><input type="checkbox" checked={linear} onChange={(e) => setQuery({ axis: e.target.checked ? 'lin' : null })} aria-label="Linear multipole axis" /></label>
        <div className="section-title">Peaks of the best-fit curve <ProvenanceBadge cls="derived" title="local maxima of the theory spectrum, computed here" /></div>
        <table className="table-mini" aria-label="Peaks of the best-fit spectrum" style={{ width: '100%' }}>
          <thead><tr><th>#</th><th>ℓ</th><th>D_ℓ (µK²)</th></tr></thead>
          <tbody>{peaks.map((p, i) => <tr key={p.l}><td>{i + 1}</td><td>{p.l}</td><td>{p.D.toFixed(0)}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Local maxima of the bundled curve ({P.theory.thinned}), so ℓ is good to about ± 2.</p>
      </Panel>
      <Panel id="cmb-power-info" className="right-panel" title={`ℓ = ${l}`}>
        <dl className="kv" aria-label="Band power at the chosen multipole">
          <KV k={band.kind === 'low' ? 'Measured D_ℓ' : `Measured D_ℓ (bin ${band.range[0]}–${band.range[1]}, ℓ_b = ${band.l.toFixed(1)})`} v={band.kind === 'low' ? `${band.D.toFixed(0)} −${band.lo.toFixed(0)} / +${band.hi.toFixed(0)} µK²` : `${band.D.toFixed(1)} ± ${band.lo.toFixed(1)} µK²`} />
          <KV k="Best fit at the same ℓ" v={`${band.bestFit.toFixed(1)} µK²`} />
          <KV k="Difference / σ" v={`${((band.D - band.bestFit) / sigmaSide).toFixed(2)}σ`} title="derived: diagonal error on the side of the model" />
          <KV k="C_ℓ = 2πD_ℓ / ℓ(ℓ+1) (best fit)" v={`${fmtE(clFromDl(l, theoryDl(l)), 3)} µK²`} />
        </dl>
        <div className="section-title">Link to the expansion model</div>
        <dl className="kv" aria-label="Acoustic scale">
          <KV k="100 θ∗ (Planck Table 2)" v={`${thetaStar.value} ± ${thetaStar.sigma}`} title={thetaStar.note} />
          <KV k="θ∗ in degrees" v={`${(thetaStar.value / 100 * 180 / Math.PI).toFixed(4)}°`} />
          <KV k="r∗ / D_M(z∗) in the Expansion model" v={`${(100 * planckParam('rstar').value / dmStar).toFixed(5)} (× 100)`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>θ∗ = r∗ / D_M(z∗), the comoving sound horizon at last scattering over the distance to it <SourceLinks ids={['planck-2018-vi']} />. The Expansion view recomputes D_M(z∗) from the same parameters <SourceLinks ids={['hogg-1999']} />.</p>
        <button className="chip" onClick={() => navigate(`/cosmic/universe?z=${planckParam('zstar').value}`)}>Expansion at z∗ →</button>
        <RelatedLinks id="context:cmb" />
      </Panel>
    </>
  );
}

export default function CmbView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'spectrum';
  return (
    <>
      <nav className="view-switch" aria-label="CMB sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'spectrum' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'history' ? <HistoryTab /> : tab === 'power' ? <PowerTab /> : <SpectrumTab />}
    </>
  );
}
