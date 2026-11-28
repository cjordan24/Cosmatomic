/**
 * Imaging the body — #/biologic/imaging?tab=tissue|microscope|xray|ultrasound|mri|compare   (Phase 13, Gates 13.4–13.7)
 *
 *  tissue      Gabriel's Cole–Cole tissues (IFAC-CNR): ε′, σ against frequency; skin depth and SAR (USAF handbook);
 *              FCC limits (47 CFR §1.1310)
 *  microscope  Abbe's limit for light; de Broglie's electron wavelength (eq. 24) for NCI's microscopes
 *  xray        NIST SRD 126 μ/ρ: transmission through tissue, bone and lead; half-value layers
 *  ultrasound  NBS SP 525 tissue speeds; Rayleigh's reflection at a boundary; echo time; FDA's 0.3 dB/cm/MHz
 *  mri         CODATA shielded-proton γ′/2π: precession frequency against field; FDA criteria
 *  compare     the wavelength each method uses, on one axis, with links to the spectral atlas
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { abbeLimit, echoTimeS, electronWavelengthApproxM, electronWavelengthClassicalM, electronWavelengthM, fdaDeratingDb, gabriel, halfValueLayerCm, larmorMHz, photonWavelengthM, rayleighAmplitude, relativisticTerm, sar, skinDepthM, transmission, type ColeCole } from '@/core/biology/imaging';
import data from '@datasets/biology/imaging.json';

interface Mat { id: string; label: string; rho: number; muRho: number[]; kEdge?: { keV: number; below: number; above: number } }
interface US { id: string; label: string; v: [number, number]; att: string; rho: number | null; rhoNote?: string }
const D = data as unknown as {
  xray: { energiesKeV: number[]; notice: string; materials: Mat[]; equation: string };
  ultrasound: { table: string; tissues: US[]; rayleigh: { eq: string; noReflection: string; intensity: string }; fda: { attenuation: string; limits: string }; fdaPage: { quote: string; quote2: string } };
  mri: { gammaShieldedMHzT: number; gammaMHzT: number; fdaPage: { quote: string }; fdaLimits: { staticAdultT: number; staticNeonateT: number; sarWholeBody: number; sarWholeBodyMin: number; sarHead: number; sarHeadMin: number } };
  tissue: { eq: string; caution: string; params: Record<string, ColeCole>; handbook: { skinDepth: string; sar: string }; fcc: { definition: string; general: string; occupational: string; generalWB: number; general1g: number }; densities: Record<string, number | null> };
  microscopy: { abbe: { de: string; en: string }; dbf: { eq24: string; small: string }; nci: { instruments: { name: string; kV: number }[] } };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const COLORS = ['#5cf2a6', '#f5c76b', '#7df9ff', '#ff7a90', '#b18cff', '#9aa6c8', '#e8e2d0'];
const fmtLen = (m: number) => (m >= 1 ? `${formatSig(m, 3)} m` : m >= 1e-3 ? `${formatSig(m * 1e3, 3)} mm` : m >= 1e-6 ? `${formatSig(m * 1e6, 3)} µm` : m >= 1e-9 ? `${formatSig(m * 1e9, 3)} nm` : `${formatSig(m * 1e12, 3)} pm`);

function TissueTab() {
  const { query } = useRoute();
  const names = Object.keys(D.tissue.params);
  const t = names.find((n) => n === query.get('t')) ?? 'Muscle';
  const lf = num(query, 'f', Math.log10(9e8), 6, 11), f = 10 ** lf, E = num(query, 'E', 50, 1, 500);
  const g = gabriel(D.tissue.params[t], f);
  const rho = D.tissue.densities[t];
  const sweep = (key: 'epsR' | 'sigma', name: string, i: number) => ({ points: Array.from({ length: 101 }, (_, k) => { const ff = 10 ** (6 + k * 0.05); return [ff / 1e6, gabriel(D.tissue.params[name], ff)[key]] as [number, number]; }), color: COLORS[i % COLORS.length], label: name });
  const shown = [t, ...['Muscle', 'Fat', 'Blood'].filter((n) => n !== t)].slice(0, 3);
  return (
    <>
      <Panel id="tissue-controls" className="left-panel" title="Radio waves in tissue">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{names.map((n) => <button key={n} className={`chip ${n === t ? 'active' : ''}`} aria-pressed={n === t} onClick={() => setQuery({ t: n })}>{n}</button>)}</div>
        <label className="slider-row"><span style={{ minWidth: 70 }}>frequency</span><input type="range" min={6} max={11} step={0.01} value={lf} aria-label="Frequency (log)" onChange={(e) => setQuery({ f: e.target.value })} /><span>{f >= 1e9 ? `${formatSig(f / 1e9, 3)} GHz` : `${formatSig(f / 1e6, 3)} MHz`}</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>field E</span><input type="range" min={1} max={500} step={1} value={E} aria-label="Electric field (rms)" onChange={(e) => setQuery({ E: e.target.value })} /><span>{E} V/m</span></label>
        <dl className="kv" aria-label="Tissue values">
          <KV k="Permittivity ε′" v={g.epsR} sig={3} />
          <KV k="Conductivity σ" v={g.sigma} unit="S/m" sig={3} />
          <KV k="Skin depth δ" v={skinDepthM(g.epsR, g.epsI, f / 1e6) * 100} unit="cm" sig={3} title="USAF handbook Table 3.4" />
          <KV k="SAR = σ|E|²/ρ" v={rho ? sar(g.sigma, E, rho) : null} unit="W/kg" sig={3} title={rho ? `ρ = ${rho} kg/m³ (NIST)` : 'no density in NIST Table 2'} />
        </dl>
        <p className="note">Densities from NIST's ICRU-44 tissues where listed; none for skin or liver, so no SAR for them.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Radio waves in tissue <ProvenanceBadge cls="derived" title="Gabriel's Cole–Cole model (IFAC-CNR); USAF handbook formulas" /></h1>
          <p className="note">Tissue is a lossy dielectric: Gabriel's model, {D.tissue.eq}, fitted to measurements on 44 tissue types. “{D.tissue.caution}” <SourceLinks ids={['ifac-gabriel', 'gabriel-1996']} /> Skin depth {D.tissue.handbook.skinDepth}; {D.tissue.handbook.sar}. <SourceLinks ids={['usaf-rf-dosimetry-1986']} /></p></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LinePlot ariaLabel="Permittivity against frequency" width={400} height={220} xLog yLog xLabel="frequency (MHz)" yLabel="ε′" series={shown.map((n, i) => sweep('epsR', n, i))} markers={[{ x: f / 1e6, y: g.epsR, color: '#fff' }]} legend="tr" />
          <LinePlot ariaLabel="Conductivity against frequency" width={400} height={220} xLog yLog xLabel="frequency (MHz)" yLabel="σ (S/m)" series={shown.map((n, i) => sweep('sigma', n, i))} markers={[{ x: f / 1e6, y: g.sigma, color: '#fff' }]} legend="tl" />
        </div>
        <p className="note">Finding: the handbook's 67.52 is c√2/2π with c rounded to 3 × 10⁸ m/s (as its own table prints); the exact speed of light gives 67.48, so its skin depths are 0.06 % long.</p>
      </div>
      <Panel id="tissue-detail" className="right-panel" title="Exposure limits (FCC)">
        <p className="note">“{D.tissue.fcc.definition}”</p>
        <blockquote className="quote">“{D.tissue.fcc.general}” <SourceLinks ids={['cfr-47-1-1310']} /></blockquote>
        <p className="note">Occupational: 0.4 W/kg whole body, 8 W/kg over 1 g. The SAR here is at one point for an assumed field; it is not a whole-body or 1-gram average.</p>
        <RelatedLinks id="instrument:imaging" limit={4} />
      </Panel>
    </>
  );
}

function MicroscopeTab() {
  const { query } = useRoute();
  const lam = num(query, 'l', 550, 380, 700), u = num(query, 'u', 70, 5, 90), kV = num(query, 'kv', 300, 1, 400);
  const ob = query.get('ob') === '1';
  const d = abbeLimit(lam, u, ob);
  const le = electronWavelengthM(kV * 1e3);
  return (
    <>
      <Panel id="mic-controls" className="left-panel" title="Resolution">
        <h3 style={{ margin: '4px 0' }}>Light (Abbe)</h3>
        <label className="slider-row"><span style={{ minWidth: 80 }}>wavelength</span><input type="range" min={380} max={700} step={1} value={lam} aria-label="Light wavelength" onChange={(e) => setQuery({ l: e.target.value })} /><span>{lam} nm</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>half-angle u</span><input type="range" min={5} max={90} step={1} value={u} aria-label="Half aperture angle" onChange={(e) => setQuery({ u: e.target.value })} /><span>{u}°</span></label>
        <label className="toggle-row"><input type="checkbox" checked={ob} onChange={(e) => setQuery({ ob: e.target.checked ? '1' : null })} /> most oblique illumination</label>
        <dl className="kv" aria-label="Light resolution"><KV k="Smallest distance" v={d} unit="nm" sig={3} /></dl>
        <h3 style={{ margin: '10px 0 4px' }}>Electrons (de Broglie)</h3>
        <label className="slider-row"><span style={{ minWidth: 80 }}>voltage</span><input type="range" min={1} max={400} step={1} value={kV} aria-label="Accelerating voltage" onChange={(e) => setQuery({ kv: e.target.value })} /><span>{kV} kV</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{D.microscopy.nci.instruments.map((i) => <button key={i.name} className="chip" onClick={() => setQuery({ kv: String(i.kV) })}>{i.name} ({i.kV} kV)</button>)}</div>
        <dl className="kv" aria-label="Electron values">
          <KV k="λ, eq. (24)" v={le * 1e12} unit="pm" sig={4} />
          <KV k="λ, eq. (25)" v={electronWavelengthApproxM(kV * 1e3) * 1e12} unit="pm" sig={4} />
          <KV k="λ without relativity" v={electronWavelengthClassicalM(kV * 1e3) * 1e12} unit="pm" sig={4} />
          <KV k="eP/2mc²" v={relativisticTerm(kV * 1e3)} sig={3} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Microscopes <ProvenanceBadge cls="derived" title="Abbe (1873); de Broglie (1930) eq. (24)" /></h1>
          <p className="note">Abbe (1873), §19: „{D.microscopy.abbe.de}“ — {D.microscopy.abbe.en} <SourceLinks ids={['abbe-1873']} /></p>
          <p className="note">Electrons are waves too. de Broglie (1930): {D.microscopy.dbf.eq24} for electrons accelerated through P volts. <SourceLinks ids={['debroglie-1930']} /> NCI's cryo-electron microscopes run at 120–300 kV. <SourceLinks ids={['nci-nice-cryoem']} /></p></div>
        <div style={{ flex: '1 1 380px', maxWidth: 460 }}>
          <LinePlot ariaLabel="Electron wavelength against voltage" width={460} height={230} xLog yLog xLabel="accelerating voltage (kV)" yLabel="λ (pm)" legend="tr"
            series={[
              { points: Array.from({ length: 61 }, (_, i) => { const v = 10 ** (i * 0.045); return [v, electronWavelengthM(v * 1e3) * 1e12] as [number, number]; }), color: '#5cf2a6', label: 'eq. (24)' },
              { points: Array.from({ length: 61 }, (_, i) => { const v = 10 ** (i * 0.045); return [v, electronWavelengthClassicalM(v * 1e3) * 1e12] as [number, number]; }), color: '#9aa6c8', label: 'without relativity', dashed: true },
            ]} markers={[{ x: kV, y: le * 1e12, color: '#f5c76b' }]} />
        </div>
        <p className="note">Finding: de Broglie writes “{D.microscopy.dbf.small}”. At 300 kV it is 0.29, so the short form (25) is 3 % off and the non-relativistic wavelength 14 % too long. At 10 kV the term is 0.0098. Electrons at 300 kV have a wavelength about 280 000 times shorter than 555 nm light. Abbe's limit is not applied to electron lenses here.</p>
      </div>
      <Panel id="mic-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/proteins')}>Structures solved at these scales →</button>
        <button className="chip" onClick={() => navigate('/biologic/senses')}>The eye's own diffraction limit →</button>
        <RelatedLinks id="instrument:imaging" limit={3} />
      </Panel>
    </>
  );
}

function XrayTab() {
  const { query } = useRoute();
  const Es = D.xray.energiesKeV;
  const ei = Math.round(num(query, 'e', 4, 0, Es.length - 1)), tcm = num(query, 'x', 2, 0.01, 30);
  const keV = Es[ei];
  return (
    <>
      <Panel id="xray-controls" className="left-panel" title="X-ray beam">
        <label className="slider-row"><span style={{ minWidth: 70 }}>energy</span><input type="range" min={0} max={Es.length - 1} step={1} value={ei} aria-label="Photon energy" onChange={(e) => setQuery({ e: e.target.value })} /><span>{keV} keV</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>thickness</span><input type="range" min={-2} max={Math.log10(30)} step={0.01} value={Math.log10(tcm)} aria-label="Thickness (log)" onChange={(e) => setQuery({ x: (10 ** Number(e.target.value)).toPrecision(3) })} /><span>{formatSig(tcm, 3)} cm</span></label>
        <dl className="kv" aria-label="X-ray values">
          <KV k="Photon wavelength" v={photonWavelengthM(keV) * 1e12} unit="pm" sig={3} title="λ = hc/E" />
          {D.xray.materials.map((m) => <KV key={m.id} k={`${m.label}: passes`} v={`${formatSig(transmission(m.muRho[ei], m.rho, tcm) * 100, 3)} %`} />)}
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>X-rays through the body <ProvenanceBadge cls="derived" title="NIST SRD 126 coefficients; I/I₀ = exp[−(μ/ρ)x]" /></h1>
          <p className="note">A beam loses photons exponentially: {D.xray.equation}, with x = ρt the mass per unit area crossed (Hubbell & Seltzer, §2). Compare the half-value layers: at low energies cortical bone stops the beam in a fraction of the thickness soft tissue needs, and the gap closes as the energy rises. <SourceLinks ids={['nist-srd126']} /></p></div>
        <div className="bio-cards" role="list" aria-label="Half-value layers">
          {D.xray.materials.map((m) => <div key={m.id} role="listitem" className="bio-card"><span className="bio-card-sym" style={{ fontSize: 15 }}>{m.label}</span><span className="note">half-value layer {formatSig(halfValueLayerCm(m.muRho[ei], m.rho) * 10, 3)} mm · μ/ρ {m.muRho[ei]} cm²/g</span></div>)}
        </div>
        <div style={{ flex: '1 1 380px', maxWidth: 460 }}>
          <LinePlot ariaLabel="Mass attenuation coefficient against energy" width={460} height={230} xLog yLog xLabel="photon energy (keV)" yLabel="μ/ρ (cm²/g)" legend="tr"
            series={D.xray.materials.map((m, i) => ({ points: Es.flatMap((e, k) => (m.kEdge && e === 100 ? [[m.kEdge.keV, m.kEdge.below], [m.kEdge.keV, m.kEdge.above], [e, m.muRho[k]]] : [[e, m.muRho[k]]]) as [number, number][]), color: COLORS[i], label: m.label }))} vLines={[{ x: keV, label: `${keV} keV`, color: '#9aa6c8' }]} />
        </div>
        <p className="note">Lead's coefficient jumps at its K-shell absorption edge, which the table lists at 88.0045 keV (1.910 → 7.683 cm²/g); those two values are drawn too. Only these eight energies (and lead's edge) from NIST's tables are used. {D.xray.notice}</p>
      </div>
      <Panel id="xray-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/spectral?lambda=1e-11')}>X-rays in the spectral atlas →</button>
        <button className="chip" onClick={() => navigate('/biologic/body?sel=skeleton')}>The skeleton in 3D →</button>
        <RelatedLinks id="instrument:imaging" limit={3} />
      </Panel>
    </>
  );
}

function UltrasoundTab() {
  const { query } = useRoute();
  const T = D.ultrasound.tissues;
  const a = T.find((x) => x.id === query.get('a')) ?? T.find((x) => x.id === 'fat')!, b = T.find((x) => x.id === query.get('b')) ?? T.find((x) => x.id === 'muscle')!;
  const fMHz = num(query, 'f', 5, 1, 15), depth = num(query, 'd', 5, 0.5, 20);
  const mid = (x: US) => (x.v[0] + x.v[1]) / 2;
  const amp = a.rho && b.rho ? rayleighAmplitude(a.rho, mid(a), b.rho, mid(b)) : null;
  return (
    <>
      <Panel id="us-controls" className="left-panel" title="Echo at a boundary">
        <label className="slider-row"><span style={{ minWidth: 70 }}>from</span><select aria-label="First tissue" value={a.id} onChange={(e) => setQuery({ a: e.target.value })}>{T.filter((x) => x.rho).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>into</span><select aria-label="Second tissue" value={b.id} onChange={(e) => setQuery({ b: e.target.value })}>{T.filter((x) => x.rho).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>frequency</span><input type="range" min={1} max={15} step={0.5} value={fMHz} aria-label="Ultrasound frequency" onChange={(e) => setQuery({ f: e.target.value })} /><span>{fMHz} MHz</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>depth</span><input type="range" min={0.5} max={20} step={0.5} value={depth} aria-label="Reflector depth" onChange={(e) => setQuery({ d: e.target.value })} /><span>{depth} cm</span></label>
        <dl className="kv" aria-label="Ultrasound values">
          <KV k="Reflected amplitude" v={amp} sig={3} title="Rayleigh eq. (23), midpoints of the speed ranges" />
          <KV k="Reflected intensity" v={amp === null ? null : `${formatSig(amp * amp * 100, 3)} %`} />
          <KV k="Echo time" v={echoTimeS(depth / 100, mid(a)) * 1e6} unit="µs" sig={3} title={`2d/V, V = ${mid(a)} m/s`} />
          <KV k="Wavelength" v={(mid(a) / (fMHz * 1e6)) * 1000} unit="mm" sig={3} />
          <KV k="FDA derating to depth" v={fdaDeratingDb(fMHz, depth)} unit="dB" sig={3} title="0.3 dB cm⁻¹ MHz⁻¹, one way" />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Ultrasound <ProvenanceBadge cls="derived" title="NBS SP 525 speeds; Rayleigh's reflection formula; FDA's attenuation" /></h1>
          <p className="note">FDA: “{D.ultrasound.fdaPage.quote}” “{D.ultrasound.fdaPage.quote2}” <SourceLinks ids={['fda-ultrasound-imaging']} /> Echoes come from boundaries. Rayleigh (1896, §270): {D.ultrasound.rayleigh.eq}, “{D.ultrasound.rayleigh.noReflection}”. Multiplying out gives (ρ₁V₁ − ρV)/(ρ₁V₁ + ρV) (our rearrangement). <SourceLinks ids={['rayleigh-1896']} /></p></div>
        <table className="table-mini" aria-label="Speed of sound in tissues">
          <caption className="note" style={{ textAlign: 'left' }}>{D.ultrasound.table} <SourceLinks ids={['nbs-sp525']} /></caption>
          <thead><tr><th>Tissue</th><th>Velocity (m/s)</th><th>Attenuation at 1 MHz (cm⁻¹)</th><th>Density (g/cm³, NIST)</th></tr></thead>
          <tbody>{T.map((x) => <tr key={x.id}><td>{x.label}</td><td>{x.v[0] === x.v[1] ? x.v[0] : `${x.v[0]} – ${x.v[1]}`}</td><td>{x.att}</td><td>{x.rho ?? '—'}</td></tr>)}</tbody>
        </table>
        <p className="note">The table prints ranges; the calculation uses their midpoints (derived). Densities exist only for the tissues NIST lists, so only those can be paired. The FDA assumes “{D.ultrasound.fda.attenuation}”. <SourceLinks ids={['fda-ultrasound-guidance-2023']} /></p>
      </div>
      <Panel id="us-detail" className="right-panel" title="Related">
        <p className="note">Rayleigh's own example, air into hydrogen: amplitude −·5833 and “{D.ultrasound.rayleigh.intensity}” (·5833² = ·3403 — he truncates).</p>
        <button className="chip" onClick={() => navigate('/spectral/acoustics')}>Sound waves in the acoustic lab →</button>
        <RelatedLinks id="instrument:imaging" limit={3} />
      </Panel>
    </>
  );
}

function MriTab() {
  const { query } = useRoute();
  const B = num(query, 'B', 1.5, 0.1, 11.7);
  const L = D.mri.fdaLimits;
  return (
    <>
      <Panel id="mri-controls" className="left-panel" title="Magnetic field">
        <label className="slider-row"><span style={{ minWidth: 50 }}>B</span><input type="range" min={0.1} max={11.7} step={0.1} value={B} aria-label="Magnetic field" onChange={(e) => setQuery({ B: e.target.value })} /><span>{B} T</span></label>
        <dl className="kv" aria-label="MRI values">
          <KV k="Proton frequency (in water)" v={larmorMHz(B)} unit="MHz" sig={5} title="γ′p/2π = 42.576 385 43 MHz/T (shielded)" />
          <KV k="Free proton" v={larmorMHz(B, D.mri.gammaMHzT)} unit="MHz" sig={5} />
          <KV k="Radio wavelength in vacuum" v={299.792458 / larmorMHz(B)} unit="m" sig={3} />
        </dl>
        <p className="note">FDA counts a study as significant risk above {L.staticAdultT} T for adults, children and infants over 1 month, and above {L.staticNeonateT} T for neonates. {B > L.staticNeonateT ? 'This field is above the neonate threshold.' : ''}</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>MRI <ProvenanceBadge cls="derived" title="CODATA 2022 gyromagnetic ratio; FDA" /></h1>
          <p className="note">FDA: “{D.mri.fdaPage.quote}” <SourceLinks ids={['fda-mri']} /> Protons in a field precess at a frequency proportional to it: CODATA gives the shielded proton's ratio as {D.mri.gammaShieldedMHzT} MHz per tesla — the unit says “megahertz for every tesla”. <SourceLinks ids={['codata-2022']} /></p></div>
        <div style={{ flex: '1 1 380px', maxWidth: 460 }}>
          <LinePlot ariaLabel="Proton frequency against field" width={460} height={220} xLabel="field B (T)" yLabel="frequency (MHz)" series={[{ points: [[0, 0], [11.7, larmorMHz(11.7)]], color: '#5cf2a6', label: 'f = (γ′p/2π) B' }]} markers={[{ x: B, y: larmorMHz(B), color: '#f5c76b' }]} vLines={[{ x: L.staticNeonateT, label: 'FDA 4 T (neonates)', color: '#9aa6c8' }, { x: L.staticAdultT, label: 'FDA 8 T', color: '#ff7a90' }]} />
        </div>
        <p className="note">FDA's SAR criteria for MRI: more than {L.sarWholeBody} W/kg averaged over the whole body for {L.sarWholeBodyMin} minutes, or {L.sarHead} W/kg over the head for {L.sarHeadMin} minutes. <SourceLinks ids={['fda-mri-significant-risk-2014']} /> The “shielded” value is for protons in water; the free-proton value is shown beside it. Typical clinical field strengths are not given (no allowed open source stated them).</p>
      </div>
      <Panel id="mri-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/spectral?lambda=4')}>These radio waves in the spectral atlas →</button>
        <button className="chip" onClick={() => navigate('/biologic/imaging?tab=tissue&f=8.11')}>How tissue absorbs them →</button>
        <RelatedLinks id="instrument:imaging" limit={3} />
      </Panel>
    </>
  );
}

function CompareTab() {
  const muscleV = (1568 + 1603) / 2;
  const rows = [
    { l: 'Electrons, 300 kV', s: 'Electrons, 300 kV', m: electronWavelengthM(3e5), to: '/biologic/imaging?tab=microscope', src: 'debroglie-1930' },
    { l: 'X-rays, 60 keV', s: 'X-rays, 60 keV', m: photonWavelengthM(60), to: '/biologic/imaging?tab=xray', src: 'nist-srd126' },
    { l: 'Visible light, day-vision peak', s: 'Light, 555 nm peak', m: 555e-9, to: '/biologic/senses?tab=colour', src: 'cvrl' },
    { l: 'Ultrasound, 5 MHz in muscle', s: 'Ultrasound, 5 MHz', m: muscleV / 5e6, to: '/biologic/imaging?tab=ultrasound', src: 'nbs-sp525' },
    { l: 'MRI radio waves at 1.5 T (example field, vacuum)', s: 'MRI, 1.5 T', m: 299.792458 / larmorMHz(1.5), to: '/biologic/imaging?tab=mri', src: 'codata-2022' },
  ];
  const W = 640, x = (m: number) => 30 + ((Math.log10(m) + 12) / 13) * (W - 60);
  return (
    <>
      <Panel id="cmp-list" className="left-panel" title="Waves that see inside">
        <ol className="life-list" aria-label="Imaging wavelengths">{rows.map((r) => <li key={r.l}><button className="link-btn" onClick={() => navigate(r.to)}>{r.l}</button> <span className="note">{fmtLen(r.m)}</span></li>)}</ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Waves that see inside the body <ProvenanceBadge cls="derived" title="Each wavelength computed from its own source" /></h1>
          <p className="note">Each way of seeing uses a wave, and its wavelength runs over twelve powers of ten. Shorter waves can resolve finer detail (Abbe), but what a wave shows depends on what stops it: bone stops X-rays, boundaries reflect sound, and in MRI the signal comes from protons in fat and water. This chart compares wavelengths only; it does not say what each method can resolve.</p></div>
        <svg viewBox={`0 0 ${W} 220`} role="img" aria-label="Wavelengths of imaging methods" style={{ width: '100%', maxWidth: W }}>
          <line x1={30} x2={W - 30} y1={180} y2={180} stroke="var(--line-strong)" />
          {[-12, -9, -6, -3, 0].map((e) => <g key={e}><line x1={x(10 ** e)} x2={x(10 ** e)} y1={176} y2={184} stroke="var(--text-dim)" /><text x={x(10 ** e)} y={200} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{fmtLen(10 ** e)}</text></g>)}
          {rows.map((r, i) => { const last = i === rows.length - 1; return <g key={r.l}><line x1={x(r.m)} x2={x(r.m)} y1={20 + i * 30} y2={180} stroke={COLORS[i]} strokeWidth={2} /><text x={x(r.m) + (last ? -6 : 6)} y={30 + i * 30} textAnchor={last ? 'end' : 'start'} fontSize={12} fill={COLORS[i]}>{r.s}: {fmtLen(r.m)}</text></g>; })}
        </svg>
        <p className="note">Sources: <SourceLinks ids={[...new Set(rows.map((r) => r.src))]} /></p>
      </div>
      <Panel id="cmp-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/spectral')}>The whole spectrum →</button>
        <button className="chip" onClick={() => navigate('/biologic/zoom')}>From body to molecule →</button>
        <RelatedLinks id="instrument:imaging" limit={4} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['tissue', 'Radio & tissue'], ['microscope', 'Microscopes'], ['xray', 'X-rays'], ['ultrasound', 'Ultrasound'], ['mri', 'MRI'], ['compare', 'Compare']];
export default function ImagingView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'compare';
  return (
    <>
      <nav className="view-switch" aria-label="Imaging sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'compare' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'tissue' ? <TissueTab /> : tab === 'microscope' ? <MicroscopeTab /> : tab === 'xray' ? <XrayTab /> : tab === 'ultrasound' ? <UltrasoundTab /> : tab === 'mri' ? <MriTab /> : <CompareTab />}
    </>
  );
}
