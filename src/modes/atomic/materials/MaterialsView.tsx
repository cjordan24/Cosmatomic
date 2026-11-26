/**
 * Materials & crystals — #/atomic/materials[/<id>]
 * Unit cells and supercells (3D), crystallographic quantities computed from the cited cell, and
 * condition-tagged material properties (optical, thermal, acoustic, electrical). Missing → unknown.
 */
import { useMemo, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import { SOURCES } from '@/shared/sources/sources';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { CU_KA1, cellVolume, coordination, formulaUnits, getCrystal, packingFraction, reflections, xrayDensity } from './crystal';
import { CrystalScene } from './CrystalScene';
import { MATERIALS, getMaterial, interpT, pointValue, refractiveIndex, type Material } from './materials';
import { prettyFormula } from '../molecules/molecules';

const R = CONSTANTS.NA.value * CONSTANTS.kB.value;

function CrystalPanel({ m }: { m: Material }) {
  const x = getCrystal(m.crystalId!)!;
  const refl = useMemo(() => reflections(x), [x]);
  const els = [...new Set(x.sites.map((s) => s.el))];
  const rho = xrayDensity(x);
  const pf = packingFraction(x);
  return (
    <>
      <div className="section-title">Unit cell <ProvenanceBadge cls="observed" title={`${x.latticeSource} (manually transcribed)`} /></div>
      <dl className="kv">
        <KV k="Structure type" v={x.structureType} />
        <KV k="Space group" v={`${x.spaceGroup} (No. ${x.spaceGroupNumber})`} />
        <KV k="a" v={x.a} unit="Å" sig={8} />
        {x.c !== undefined && <KV k="c (c/a)" v={`${x.c} (${(x.c / x.a).toFixed(4)})`} unit="Å" />}
        <KV k="Measured at" v={x.temperatureC} unit="°C" />
        <KV k="Atoms / formula units per cell" v={`${x.sites.length} / ${formulaUnits(x)}`} />
        <KV k="Cell volume" v={cellVolume(x)} unit="Å³" sig={6} />
      </dl>
      <p className="note" style={{ fontSize: 10.5 }}>Lattice: {x.latticeSource}. Positions: {x.positionsSource}. <em>Manually transcribed</em>; checked by recomputing the density.</p>
      <div className="section-title">Derived from the cell <ProvenanceBadge cls="derived" /></div>
      <dl className="kv">
        <KV k="X-ray density (computed)" v={rho} unit="g/cm³" sig={5} />
        <KV k="X-ray density (NBS stated)" v={x.xrayDensityNBS} unit="g/cm³" sig={4} />
        <KV k="Hard-sphere packing fraction" v={pf} sig={4} title="Only for single-element structures (spheres touching at the nearest-neighbour distance)" />
        {els.map((el) => { const i = x.sites.findIndex((s) => s.el === el); const c = coordination(x, i); const nb = [...new Set(c.shell.map((s) => s.el))].join('/'); const dmax = Math.max(...c.shell.map((s) => s.d)); return <KV key={el} k={`${el}: coordination`} v={`${c.cn} ${nb} at ${c.d.toFixed(4)}${dmax - c.d > 1e-4 ? `–${dmax.toFixed(4)}` : ""} Å`} />; })}
      </dl>
      <p className="note" style={{ fontSize: 10.5 }}>X-ray density is the ideal-crystal density from the cell and atomic weights. A real sample's bulk density can be lower (pores, defects).</p>
      <div className="section-title">Bragg reflections (Cu Kα₁, λ = {CU_KA1} Å)</div>
      <table className="table-mini" aria-label="Bragg reflections">
        <thead><tr><th>hkl</th><th>d (Å)</th><th>2θ (°)</th><th>status</th></tr></thead>
        <tbody>{refl.slice(0, 9).map((r) => <tr key={r.hkl.join('') + r.d}><td>{r.hkl.join(' ')}</td><td>{r.d.toFixed(4)}</td><td>{r.twoTheta?.toFixed(2) ?? '—'}</td><td style={{ color: r.allowed ? 'var(--accent-3)' : 'var(--text-faint)' }}>{r.allowed ? 'allowed' : 'absent'}</td></tr>)}</tbody>
      </table>
      <p className="note" style={{ fontSize: 10.5 }}>Absences come from the structure factor with f ≈ Z. They are exact, but intensities are not modelled (no form factors, thermal or Lorentz-polarisation corrections).</p>
    </>
  );
}

function PropertyPanel({ m, T }: { m: Material; T: number }) {
  const ri = m.refractiveIndex;
  const riPaper = ri?.doi ? SOURCES.find((s) => s.doi === ri.doi) : ri ? SOURCES.find((s) => s.usedFor.some((u) => u.toLowerCase().includes(m.name.split(' ')[0].toLowerCase()))) : undefined;
  const riPts = useMemo(() => {
    if (!ri?.rangeUm) return [] as [number, number][];
    const lo = Math.max(ri.rangeUm[0], 0.2), hi = Math.min(ri.rangeUm[1], 2.5);
    return Array.from({ length: 120 }, (_, i) => { const l = lo + ((hi - lo) * i) / 119; return [l, refractiveIndex(ri, l) ?? NaN] as [number, number]; });
  }, [ri]);
  const nD = ri ? refractiveIndex(ri, 0.5893) : null;
  const hc = m.heatCapacity;
  const cp = hc ? interpT(hc.rows, T, 'Cp') : null;
  const fl = m.fluid;
  const fT = (k: 'soundSpeed' | 'density' | 'cp' | 'viscosity' | 'thermalConductivity') => (fl ? interpT(fl.rows, T, k) : null);
  const phaseAtT = fl?.rows.find((r) => Math.abs(r.T - T) < 6)?.phase;
  const pv = (prop: string) => { const p = m.properties.find((x) => x.property === prop); return p ? { v: pointValue(p, T), p } : null; };
  const res = pv('electrical-resistivity'), eps = pv('relative-permittivity');
  return (
    <>
      <div className="section-title">Properties at T = {T.toFixed(0)} K, 1 atm</div>
      <dl className="kv" aria-label="Material properties">
        <KV k={`Refractive index n (589.3 nm${ri?.temperatureK ? `, measured at ${ri.temperatureK} K` : ri ? ", source conditions (hover)" : ""})`} v={nD} sig={5} title={ri ? `${ri.label}; ${ri.comments}` : 'not bundled'} />
        <KV k="Molar heat capacity Cp" v={cp} unit="J/(mol·K)" sig={5} title={hc ? `NIST-JANAF ${hc.table}` : undefined} />
        <KV k="Specific heat capacity cp (fluid)" v={fT('cp')} unit="J/(kg·K)" sig={5} />
        <KV k="Speed of sound" v={fT('soundSpeed')} unit="m/s" sig={5} title={fl ? 'NIST reference equation of state' : 'no sourced value bundled'} />
        <KV k="Density (fluid)" v={fT('density')} unit="kg/m³" sig={6} />
        <KV k="Thermal conductivity" v={fT('thermalConductivity')} unit="W/(m·K)" sig={4} />
        <KV k="Viscosity" v={fT('viscosity')} unit="Pa·s" sig={4} />
        <KV k="Electrical resistivity" v={res?.v ?? null} unit="Ω·m" sig={5} title={res?.p.definition} />
        <KV k="Relative permittivity (static)" v={eps?.v ?? null} sig={4} title={eps?.p.definition} />
        <KV k="Relative magnetic permeability" v={null} />
        <KV k="Emissivity" v={null} title="Depends strongly on surface finish and wavelength; no cited value bundled" />
        <KV k="Optical absorption coefficient" v={null} />
      </dl>
      {phaseAtT && <p className="note">Phase at {T.toFixed(0)} K and 1 atm (reference EOS): <strong>{phaseAtT}</strong>.</p>}
      {res && <p className="note" style={{ fontSize: 10.5 }}>{res.p.definition}. <SourceLinks ids={res.p.sources} /></p>}
      {eps && <p className="note" style={{ fontSize: 10.5 }}>{eps.p.definition}. <SourceLinks ids={eps.p.sources} /></p>}
      {ri && riPts.length > 0 && (
        <>
          <div className="section-title">Dispersion n(λ) <ProvenanceBadge cls="observed" title="Measured dispersion formula" /></div>
          <LinePlot ariaLabel="Refractive index versus wavelength" series={[{ points: riPts, color: 'var(--accent)' }]} xLabel="vacuum wavelength λ (µm)" yLabel="refractive index n" vLines={[{ x: 0.5893, label: 'Na D' }]} />
          <p className="note" style={{ fontSize: 10.5 }}>{ri.label}{ri.comments ? ` · ${ri.comments}` : ''}. Valid {ri.rangeUm?.join('–')} µm and blank outside that range. Formula from {riPaper ? <SourceLinks ids={[riPaper.id]} /> : ri.references.slice(0, 120)} via <SourceLinks ids={['refractiveindex-info']} />.</p>
        </>
      )}
      {hc && (
        <>
          <div className="section-title">Heat capacity Cp(T) <ProvenanceBadge cls="observed" /></div>
          <LinePlot ariaLabel="Heat capacity versus temperature" series={[{ points: hc.rows.filter((r) => r.T <= 1500).map((r) => [r.T, r.Cp]), color: '#f5c76b' }]} xLabel="temperature T (K)" yLabel="Cp (J mol⁻¹ K⁻¹)" hLines={[{ y: 3 * R, label: '3R (Dulong–Petit)', color: 'var(--text-dim)' }]} markers={cp !== null ? [{ x: T, y: cp }] : []} />
          <p className="note" style={{ fontSize: 10.5 }}>{hc.name}, NIST-JANAF table {hc.table} (<a href={hc.url} target="_blank" rel="noreferrer">data</a>). <SourceLinks ids={hc.sources} /></p>
        </>
      )}
      {fl && (
        <>
          <div className="section-title">Speed of sound vs temperature (1 atm) <ProvenanceBadge cls="derived" title="Reference equation of state fitted to measurements" /></div>
          <LinePlot ariaLabel="Speed of sound versus temperature" series={[{ points: fl.rows.map((r) => [r.T, r.soundSpeed]), color: '#5cf2a6' }]} xLabel="temperature T (K)" yLabel="speed of sound c (m/s)" markers={fT('soundSpeed') !== null ? [{ x: T, y: fT('soundSpeed')! }] : []} />
          <p className="note" style={{ fontSize: 10.5 }}><a href={fl.url} target="_blank" rel="noreferrer">NIST WebBook fluid data</a> · <SourceLinks ids={fl.sources} /></p>
        </>
      )}
    </>
  );
}

export default function MaterialsView({ id }: { id: string | null }) {
  const { query } = useRoute();
  const m = (id && getMaterial(id)) || getMaterial('nacl')!;
  const x = m.crystalId ? getCrystal(m.crystalId) : undefined;
  const n = Math.max(1, Math.min(4, Number(query.get('n') ?? 2)));
  const [showCell, setShowCell] = useState(true);
  const [showBonds, setShowBonds] = useState(true);
  const [hklText, setHklText] = useState(query.get('hkl') ?? '');
  const hkl = (() => { const v = (query.get('hkl') ?? '').split(/[\s,]+/).map(Number); return v.length === 3 && v.every(Number.isInteger) && v.some((t) => t !== 0) ? (v as [number, number, number]) : null; })();
  const [T, setT] = useState(298.15);
  const cats = [...new Set(MATERIALS.map((x) => x.category))];
  return (
    <>
      {x ? (
        <Viewport key={x.id} camera={{ position: [x.a * n * 1.2, x.a * n * 0.9, x.a * n * 1.7], fov: 40 }}>
          <CrystalScene x={x} n={n} showCell={showCell} showBonds={showBonds} hkl={hkl} />
        </Viewport>
      ) : (
        <div className="center-stage"><div className="stage-head"><h1>{m.name}</h1><p className="note">{m.category} · no crystal structure bundled. Properties are on the right.</p></div></div>
      )}
      {x && (
        <nav className="view-switch" aria-label="Crystal display">
          {[1, 2, 3, 4].map((k) => <button key={k} className={n === k ? 'active' : ''} onClick={() => setQuery({ n: k })} aria-label={`Supercell ${k}×${k}×${k}`}>{k}×{k}×{k}</button>)}
          <button className={showCell ? 'active' : ''} onClick={() => setShowCell((s) => !s)} aria-pressed={showCell}>Unit cell</button>
          <button className={showBonds ? 'active' : ''} onClick={() => setShowBonds((s) => !s)} aria-pressed={showBonds}>Nearest neighbours</button>
          <form onSubmit={(e) => { e.preventDefault(); setQuery({ hkl: hklText.trim() || null }); }} style={{ display: 'flex', gap: 4, alignItems: 'center', paddingLeft: 6 }}>
            <input value={hklText} onChange={(e) => setHklText(e.target.value)} placeholder="h k l" aria-label="Miller indices" style={{ width: 62, height: 26, borderRadius: 999, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', padding: '0 8px' }} />
            <button type="submit">Plane</button>
          </form>
        </nav>
      )}
      <Panel id="mat-list" className="left-panel" title={`Materials · ${MATERIALS.length}`}>
        {cats.map((c) => (
          <div key={c}>
            <div className="section-title" style={{ marginTop: 8 }}>{c}</div>
            <div className="mol-list" role="listbox" aria-label={c}>
              {MATERIALS.filter((y) => y.category === c).map((y) => <button key={y.id} role="option" aria-selected={y.id === m.id} className={y.id === m.id ? 'active' : ''} onClick={() => navigate(`/atomic/materials/${y.id}`)}><span>{y.name}</span><span className="f">{prettyFormula(y.formula)}</span></button>)}
            </div>
          </div>
        ))}
      </Panel>
      <Panel id="mat-info" className="right-panel" title="Material">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{m.name}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)' }}>{prettyFormula(m.formula)}</div>
        <div className="chip-row" style={{ margin: '8px 0' }}>
          {m.elementZ && <button className="chip" onClick={() => navigate(`/atomic/element/${m.elementZ}`)}>Element →</button>}
          {m.moleculeId && <button className="chip" onClick={() => navigate(`/atomic/molecules/${m.moleculeId}`)}>Molecule →</button>}
        </div>
        <div className="slider-row"><span>T</span><input type="range" min={200} max={1500} step={1} value={T} onChange={(e) => setT(Number(e.target.value))} aria-label="Material temperature in kelvin" /><span style={{ fontFamily: 'var(--mono)' }}>{T.toFixed(0)} K</span></div>
        {x && <CrystalPanel m={m} />}
        <PropertyPanel m={m} T={T} />
        <p className="note" style={{ marginTop: 10 }}>Unknown means no cited value is bundled. Nothing is estimated or copied from another material. Each value is valid only under its stated conditions (temperature, pressure, wavelength).</p>
      </Panel>
    </>
  );
}

export const formatProp = formatSig;
