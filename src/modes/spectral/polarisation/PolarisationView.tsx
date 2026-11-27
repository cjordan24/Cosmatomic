/**
 * Polarisation and optical materials — #/spectral/polarisation?tab=fresnel|reflection|crystal   (Phase 10, Gate 10.3)
 *
 *  fresnel     reflectance of s and p light against angle: mat, wl (nm), dir (out = from air | in = from inside), a (°)
 *  reflection  two reflections at the polarizing angle (Nörrenberg): mat, al (°, angle between the planes of incidence)
 *  crystal     uniaxial crystal: cr (calcite | alpha-quartz | sapphire | rutile), wl (nm), g (°, wave normal to optic axis)
 * Physics: src/core/physics/optics/polarisation.ts (Drude 1902). Indices: materials dataset and datasets/materials/birefringence.json.
 */
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { MATERIALS, refractiveIndex, type RefractiveModel } from '@/modes/atomic/materials/materials';
import { brewsterAngle, extraordinaryIndex, fresnel, plateThickness, twoReflections } from '@/core/physics/optics/polarisation';
import { criticalAngle } from '@/core/physics/optics/geometric';
import bire from '@datasets/materials/birefringence.json';

type Tab = 'fresnel' | 'reflection' | 'crystal';
const TABS: [Tab, string][] = [['fresnel', 'Reflection of s and p'], ['reflection', 'Polarizing by reflection'], ['crystal', 'Uniaxial crystals']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const deg = Math.PI / 180;
const DRUDE = ['drude-1902'];
const OPTICAL = MATERIALS.filter((m) => m.refractiveIndex);
interface Crystal { id: string; name: string; opticSign: string; ordinary: RefractiveModel & { sources: string[] }; extraordinary: RefractiveModel & { sources: string[] } }
const CRYSTALS = (bire as unknown as { crystals: Crystal[] }).crystals;
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}
function MatSelect({ value }: { value: string }) {
  return <select className="text-input" aria-label="Material" value={value} onChange={(e) => setQuery({ mat: e.target.value })} style={{ width: '100%' }}>{OPTICAL.map((m) => <option key={m.id} value={m.id}>{m.refractiveIndex!.label}</option>)}</select>;
}

// ------------------------------------------------------------------ Fresnel
function FresnelTab() {
  const { query } = useRoute();
  const mat = OPTICAL.find((m) => m.id === query.get('mat')) ?? OPTICAL.find((m) => m.id === 'fused-silica')!;
  const wl = num(query, 'wl', 589, 380, 750), inside = query.get('dir') === 'in', a = num(query, 'a', 45, 0, 89.9);
  const n = refractiveIndex(mat.refractiveIndex!, wl / 1000);
  const [n1, n2] = inside ? [n ?? 1, 1] : [1, n ?? 1];
  const pts = Array.from({ length: 900 }, (_, i) => i * 0.1);
  const vals = pts.map((p) => ({ p, f: n !== null ? fresnel(n1, n2, p * deg) : null }));
  const pb = n !== null ? brewsterAngle(n1, n2) : null, crit = n !== null ? criticalAngle(n1, n2) : null;
  const here = n !== null ? fresnel(n1, n2, a * deg) : null;
  const line = (k: 'Rs' | 'Rp' | 'R') => vals.map(({ p, f }) => [p, f ? f[k] : 1] as [number, number]);
  return (
    <>
      <Panel id="po-fresnel-controls" className="left-panel" title="Boundary">
        <MatSelect value={mat.id} />
        <div className="section-title">Light arrives</div>
        <select className="text-input" aria-label="Direction" value={inside ? 'in' : 'out'} onChange={(e) => setQuery({ dir: e.target.value === 'in' ? 'in' : null })} style={{ width: '100%' }}>
          <option value="out">from air onto the material</option><option value="in">from inside the material towards air</option>
        </select>
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <Slider k="a" label="incidence φ" v={a} min={0} max={89.9} step={0.1} unit="°" aria="Angle of incidence" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Reflection of s- and p-polarised light <ProvenanceBadge cls="derived" title="Drude Pt II Sec. II ch. II §3, eqs. 24–25" /></h1>
          <p className="note">The reflected amplitudes are R_s = −E_s sin(φ − χ)/sin(φ + χ) for light whose electric field is perpendicular to the plane of incidence (s) and R_p = E_p tan(φ − χ)/tan(φ + χ) for light whose field lies in it (p), χ being the angle of refraction (Drude eq. 24). R_p vanishes when φ + χ = 90°, that is when tan φ = n: light reflected at this polarizing angle is completely polarised (eq. 25; Brewster's law). The reflectance is the square of the amplitude ratio; unpolarised light is taken as an equal mixture of s and p. <SourceLinks ids={[...DRUDE, ...mat.refractiveIndex!.sources]} /></p>
        </div>
        <LinePlot ariaLabel="Reflectance against angle" width={600} height={240} xLabel="angle of incidence φ (°)" yLabel="reflectance" yDomain={[0, 1.02]} legend="tl"
          series={[{ points: line('Rs'), color: '#ff7a90', label: 's (⊥ plane of incidence)' }, { points: line('Rp'), color: '#7df9ff', label: 'p (in the plane)' }, { points: line('R'), color: '#f5c76b', label: 'unpolarised', dashed: true }]}
          vLines={[...(pb !== null ? [{ x: pb / deg, label: 'polarizing angle', color: '#5cf2a6' }] : []), ...(crit !== null ? [{ x: crit / deg, label: 'critical angle', color: '#b18cff' }] : []), { x: a, label: 'φ', color: '#888' }]} />
      </div>
      <Panel id="po-fresnel-readout" className="right-panel" title="At φ">
        <dl className="kv" aria-label="Fresnel result">
          <KV k="n at λ" v={n} sig={6} />
          <KV k="polarizing angle tan φ = n" v={pb !== null ? pb / deg : null} unit="°" sig={5} />
          <KV k="critical angle" v={crit !== null ? crit / deg : 'none'} unit={crit !== null ? '°' : undefined} sig={5} />
          <KV k="reflectance s" v={here ? here.Rs : n !== null ? 'total reflection' : null} sig={5} />
          <KV k="reflectance p" v={here ? here.Rp : n !== null ? 'total reflection' : null} sig={5} />
          <KV k="unpolarised reflectance" v={here ? here.R : null} sig={5} />
          <KV k="transmitted (unpolarised) 1 − R" v={here ? 1 - here.R : null} sig={5} />
          <KV k="degree of polarisation of the reflected light" v={here && here.Rs + here.Rp > 0 ? (here.Rs - here.Rp) / (here.Rs + here.Rp) : null} sig={4} />
        </dl>
        <RelatedLinks id="instrument:polarisation" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ two reflections
function ReflectionTab() {
  const { query } = useRoute();
  const mat = OPTICAL.find((m) => m.id === query.get('mat')) ?? OPTICAL.find((m) => m.id === 'fused-silica')!;
  const al = num(query, 'al', 30, 0, 360);
  const n = refractiveIndex(mat.refractiveIndex!, 0.589);
  const pb = n !== null ? brewsterAngle(1, n) : null;
  const curve = Array.from({ length: 361 }, (_, i) => [i, n !== null ? twoReflections(n, i * deg) : NaN] as [number, number]);
  const I = n !== null ? twoReflections(n, al * deg) : null, f = n !== null && pb !== null ? fresnel(1, n, pb) : null;
  return (
    <>
      <Panel id="po-refl-controls" className="left-panel" title="Two mirrors">
        <MatSelect value={mat.id} />
        <Slider k="al" label="angle α" v={al} min={0} max={360} step={1} unit="°" aria="Angle between the planes of incidence" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Polarizing by reflection <ProvenanceBadge cls="derived" title="Drude Pt II Sec. I ch. V §3, p. 246; Fresnel amplitudes eq. 24" /></h1>
          <p className="note">“Polarized light may be obtained by reflection at the surface of any transparent body if the angle of reflection φ fulfils the condition (Brewster's law) tan φ = n.” Drude calls the reflected light “polarized in the plane of incidence”: in today's words its electric field is perpendicular to that plane. Reflected a second time at the same angle, “the final intensity depends upon the angle α included between the planes of incidence upon the two surfaces and is proportional to cos² α” (Nörrenberg polariscope). The curve below is computed from the Fresnel amplitudes for both reflections and reproduces cos² α. <SourceLinks ids={[...DRUDE, ...mat.refractiveIndex!.sources]} /></p>
        </div>
        <LinePlot ariaLabel="Intensity after two reflections" width={600} height={220} xLabel="angle α between the planes of incidence (°)" yLabel="I / I(α = 0)" yDomain={[0, 1.05]} series={[{ points: curve, color: '#f5c76b', label: 'Fresnel, two reflections' }, { points: curve.map(([x]) => [x, Math.cos(x * deg) ** 2] as [number, number]), color: '#7df9ff', label: 'cos² α', dashed: true }]} vLines={[{ x: al, label: 'α', color: '#888' }]} />
      </div>
      <Panel id="po-refl-readout" className="right-panel" title="Result">
        <dl className="kv" aria-label="Two-reflection result">
          <KV k="n at 589 nm" v={n} sig={6} />
          <KV k="polarizing angle" v={pb !== null ? pb / deg : null} unit="°" sig={5} />
          <KV k="s reflectance at that angle" v={f ? f.Rs : null} sig={4} title="What one reflection keeps" />
          <KV k="relative intensity after the second reflection" v={I} sig={5} />
          <KV k="cos² α" v={Math.cos(al * deg) ** 2} sig={5} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Drude quotes 57° for crown glass.</p>
        <RelatedLinks id="instrument:polarisation" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ crystals
function CrystalTab() {
  const { query } = useRoute();
  const c = CRYSTALS.find((x) => x.id === query.get('cr')) ?? CRYSTALS[0];
  const wl = num(query, 'wl', 589, 380, 750), g = num(query, 'g', 45, 0, 90);
  const no = refractiveIndex(c.ordinary, wl / 1000), ne = refractiveIndex(c.extraordinary, wl / 1000);
  const disp = Array.from({ length: 75 }, (_, i) => 380 + i * 5);
  const ng = no !== null && ne !== null ? extraordinaryIndex(no, ne, g * deg) : null;
  const qw = no !== null && ne !== null ? plateThickness(wl * 1e-9, no, ne, Math.PI / 2) : null;
  const srcs = [...new Set(c.ordinary.sources)];
  return (
    <>
      <Panel id="po-crystal-controls" className="left-panel" title="Crystal">
        <select className="text-input" aria-label="Crystal" value={c.id} onChange={(e) => setQuery({ cr: e.target.value })} style={{ width: '100%' }}>{CRYSTALS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <Slider k="g" label="angle to axis g" v={g} min={0} max={90} step={0.5} unit="°" aria="Angle between wave normal and optic axis" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Double refraction in uniaxial crystals <ProvenanceBadge cls="derived" title="Drude Pt II Sec. II ch. III §§7, 11, eqs. 35, 74; Sec. I ch. V §9" /></h1>
          <p className="note">In a uniaxial crystal two waves travel in every direction: the ordinary wave with speed a whatever its direction, and the extraordinary wave with V₂² = a² cos² g + c² sin² g, g being the angle between the wave normal and the optic axis (Drude eq. 35). The principal indices are n_o = V/a and n_e = V/c (eq. 74), so along the axis both waves have n_o and across it the extraordinary wave has n_e. “Quartz is positively, calc-spar negatively, uniaxial.” A plate cut parallel to the axis delays one wave behind the other; a path difference of a quarter wavelength makes a quarter-wave plate (§9). <SourceLinks ids={[...DRUDE, ...srcs]} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <LinePlot ariaLabel="Principal indices against wavelength" width={360} height={220} xLabel="wavelength (nm)" yLabel="n" legend="tr"
            series={[{ points: disp.map((w) => [w, refractiveIndex(c.ordinary, w / 1000) ?? NaN] as [number, number]).filter((p) => Number.isFinite(p[1])), color: '#7df9ff', label: 'n_o' }, { points: disp.map((w) => [w, refractiveIndex(c.extraordinary, w / 1000) ?? NaN] as [number, number]).filter((p) => Number.isFinite(p[1])), color: '#ff7a90', label: 'n_e' }]} vLines={[{ x: wl, label: 'λ', color: '#888' }]} />
          <LinePlot ariaLabel="Extraordinary index against direction" width={360} height={220} xLabel="angle g to the optic axis (°)" yLabel="n of the extraordinary wave" series={no !== null && ne !== null ? [{ points: Array.from({ length: 91 }, (_, i) => [i, extraordinaryIndex(no, ne, i * deg)] as [number, number]), color: '#f5c76b' }] : []} vLines={[{ x: g, label: 'g', color: '#888' }]} />
        </div>
      </div>
      <Panel id="po-crystal-readout" className="right-panel" title="Indices">
        <dl className="kv" aria-label="Crystal result">
          <KV k="n_o at λ" v={no} sig={6} title="Outside the formula's range: unknown" />
          <KV k="n_e at λ" v={ne} sig={6} />
          <KV k="birefringence n_e − n_o" v={no !== null && ne !== null ? ne - no : null} sig={4} />
          <KV k="optic sign" v={c.opticSign} />
          <KV k="extraordinary index at g" v={ng} sig={6} />
          <KV k="quarter-wave plate thickness" v={qw !== null ? qw * 1e6 : null} unit="µm" sig={4} title="path difference t|n_e − n_o| = λ/4" />
        </dl>
        <RelatedLinks id="instrument:polarisation" />
      </Panel>
    </>
  );
}

export default function PolarisationView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'fresnel';
  return (
    <>
      <nav className="view-switch" aria-label="Polarisation sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'fresnel' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'reflection' ? <ReflectionTab /> : tab === 'crystal' ? <CrystalTab /> : <FresnelTab />}
    </>
  );
}
