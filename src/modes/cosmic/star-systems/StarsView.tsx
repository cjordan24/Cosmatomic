/**
 * Nearby stars — #/cosmic/stars?sel=<seq>&frame=galactic|icrs&bg=1
 * Every known star, brown dwarf and exoplanet within 10 pc (Reylé et al. 2021, 2023 update), with
 * CNS5 stars out to 20 pc as an optional background layer. Distances come from parallaxes; the
 * Sun sits at the origin. Phase 5, Gate 5.1.
 */
import { useEffect, useMemo, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { LabelLayer, LabelOverlay } from '@/rendering/labels';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { StarScene, type ScenePoint, type StarFrame } from './StarScene';
import {
  PC_IN_LY, absoluteMag, adsUrl, calibrateDwarf, crossMatch, displayColor, distancePc, distanceRangePc, galacticLB, icrsCartesian,
  icrsToGalactic, isBibcode, loadCns5, loadTenParsec, parseSpectralType, spaceVelocity, tangentialVelocity, totalPm,
  type CnsStar, type NearbyObject, type ObjectType, type Vec3,
} from './stars';

const TYPES: ObjectType[] = ['star', 'low-mass star', 'white dwarf', 'brown dwarf'];
const TYPE_LABEL: Record<ObjectType, string> = { star: 'Stars (K and earlier)', 'low-mass star': 'Low-mass stars (M, early L)', 'white dwarf': 'White dwarfs', 'brown dwarf': 'Brown dwarfs', exoplanet: 'Exoplanets', unknown: 'Unclassified' };

/** Reference link: NASA ADS for bibcodes, plain text otherwise (e.g. "FROM:host"). */
function Ref({ r }: { r: string | null }) {
  if (!r) return null;
  if (isBibcode(r)) return <a href={adsUrl(r)} target="_blank" rel="noreferrer" title="Original reference (NASA ADS)" style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{r}</a>;
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-faint)' }}>{r}</span>;
}

function framePos(o: { ra: number | null; dec: number | null; plx: number | null }, frame: StarFrame): Vec3 | null {
  const d = distancePc(o.plx);
  if (d === null || o.ra === null || o.dec === null) return null;
  const v = icrsCartesian(o.ra, o.dec, d);
  return frame === 'galactic' ? icrsToGalactic(v) : v;
}

function ObjectPanel({ o, all, cns }: { o: NearbyObject; all: NearbyObject[]; cns: CnsStar | undefined }) {
  const d = distancePc(o.plx);
  const dr = distanceRangePc(o.plx, o.ePlx);
  const spt = parseSpectralType(o.spt);
  const cal = o.type === 'exoplanet' ? null : calibrateDwarf(spt);
  const pm = totalPm(o.pmra, o.pmdec);
  const vt = tangentialVelocity(pm, o.plx);
  const lb = o.ra !== null && o.dec !== null ? galacticLB(icrsCartesian(o.ra, o.dec, 1)) : null;
  const members = all.filter((x) => x.sys === o.sys);
  const planets = members.filter((x) => x.type === 'exoplanet');
  const gAbs = absoluteMag(o.G, o.plx);
  const cnsG = cns?.G ?? null;
  const fromHost = o.rPlx?.startsWith('FROM:');
  return (
    <>
      <h2 style={{ margin: '0 0 2px', fontWeight: 400, fontSize: 22 }}>{o.name}</h2>
      <div className="note">{TYPE_LABEL[o.type]}{o.typeUncertain ? ' (category uncertain)' : ''} · system {o.system}{o.common && o.common !== o.name ? ` · ${o.common}` : ''}</div>
      {o.seq >= 1001 && <p className="note warn">Listed by the catalogue as a candidate: within 1σ of its parallax it may lie inside 10 pc, but its nominal distance is just outside.</p>}

      <div className="section-title">Position and distance <ProvenanceBadge cls="observed" title="Catalogue astrometry (reference per value)" /></div>
      <dl className="kv" aria-label="Astrometry">
        <KV k="Parallax ϖ" v={o.plx !== null ? `${o.plx}${o.ePlx !== null ? ` ± ${o.ePlx}` : ''}` : null} unit="mas" />
        <KV k="Right ascension α (ICRS)" v={o.ra} unit="°" sig={9} />
        <KV k="Declination δ (ICRS)" v={o.dec} unit="°" sig={9} />
        <KV k="Epoch of position" v={o.epoch !== null ? `J${o.epoch.toFixed(1)}` : null} />
        <KV k="Proper motion μα*, μδ" v={o.pmra !== null && o.pmdec !== null ? `${o.pmra.toFixed(2)}, ${o.pmdec.toFixed(2)}` : null} unit="mas/yr" />
        <KV k="Radial velocity" v={o.rv !== null ? `${o.rv}${o.eRv !== null ? ` ± ${o.eRv}` : ''}` : null} unit="km/s" />
      </dl>
      <p className="note" style={{ fontSize: 10.5 }}>References: ϖ <Ref r={o.rPlx} /> · μ <Ref r={o.rPm} /> · v<sub>r</sub> <Ref r={o.rRv} />{fromHost && ' (planets take the host star’s astrometry)'}</p>
      {o.plx && o.ePlx !== null && o.ePlx / o.plx > 0.1 && <p className="note warn">The parallax error is {((o.ePlx / o.plx) * 100).toFixed(0)} % of the parallax. At that level 1/ϖ is a biased distance estimate; treat the distance as approximate.</p>}
      <div className="section-title">Derived <ProvenanceBadge cls="derived" title="Computed from the catalogue values with the relations noted below" /></div>
      <dl className="kv" aria-label="Derived astrometry">
        <KV k="Distance d = 1/ϖ" v={d} unit="pc" sig={5} />
        <KV k="1σ range" v={dr ? `${dr[0].toFixed(4)} – ${dr[1].toFixed(4)}` : null} unit="pc" />
        <KV k="Distance" v={d !== null ? d * PC_IN_LY : null} unit="ly" sig={5} />
        <KV k="Galactic l, b" v={lb ? `${lb.l.toFixed(3)}°, ${lb.b.toFixed(3)}°` : null} />
        <KV k="Total proper motion μ" v={pm} unit="mas/yr" sig={6} />
        <KV k="Tangential velocity v_t = κμ/ϖ" v={vt} unit="km/s" sig={4} />
        <KV k="Space velocity √(v_t² + v_r²)" v={spaceVelocity(vt, o.rv)} unit="km/s" sig={4} title="Heliocentric; unknown without a radial velocity" />
      </dl>

      {o.type !== 'exoplanet' && <>
        <div className="section-title">Photometry <ProvenanceBadge cls="observed" /></div>
        <dl className="kv" aria-label="Photometry">
          <KV k="Gaia G" v={o.G} unit="mag" sig={6} title={o.gCode === 2 ? 'Gaia DR2' : o.gCode === 3 ? 'Gaia EDR3' : undefined} />
          <KV k="Gaia BP − RP" v={o.BP !== null && o.RP !== null ? o.BP - o.RP : null} unit="mag" sig={4} />
          <KV k="Johnson V" v={o.V} unit="mag" sig={4} />
          <KV k="2MASS J, H, Ks" v={o.J !== null ? `${o.J}, ${o.H ?? '—'}, ${o.Ks ?? '—'}` : null} unit="mag" />
          <KV k="Absolute G (derived)" v={gAbs} unit="mag" sig={4} title="M_G = G + 5 log10(ϖ/100 mas); no extinction correction (negligible within 20 pc)" />
          {o.G === null && <KV k="CNS5 resulting G" v={cnsG} unit="mag" sig={5} title={cns?.fGRP === 2 ? 'converted from Hipparcos Hp' : 'Gaia EDR3'} />}
        </dl>
        {o.G === null && o.Gest !== null && <p className="note" style={{ fontSize: 10.5 }}>The catalogue also lists an <em>estimated</em> G = {o.Gest} ({o.gCode === 20 ? 'assumes M_G = 25, a lower limit' : 'from the spectral type, σ ≈ 0.6 mag'}). Its authors say estimates are not for scientific use, so it is not used here.</p>}

        <div className="section-title">Spectral type <ProvenanceBadge cls="observed" /></div>
        <dl className="kv" aria-label="Spectral type">
          <KV k="Type" v={o.spt} />
          <KV k="Method" v={o.sptMethod} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Reference: <Ref r={o.rSpt} /></p>
        <div className="section-title">Typical dwarf of this type <ProvenanceBadge cls="derived" title="Calibration, not a measurement of this star" /></div>
        {cal ? <>
          <dl className="kv" aria-label="Spectral-type calibration">
            <KV k="Effective temperature" v={cal.values.Teff} unit="K" sig={4} />
            <KV k="Luminosity log₁₀(L/L☉)" v={cal.values.logL} sig={3} />
            <KV k="Radius" v={cal.values.R} unit="R☉" sig={3} />
            <KV k="Mass" v={cal.values.Msun} unit="M☉" sig={3} />
            <KV k="Expected M_G" v={cal.values.MG} unit="mag" sig={4} />
          </dl>
          <p className="note" style={{ fontSize: 10.5 }}>{cal.exact ? 'Table row' : `Interpolated between ${cal.between!.join(' and ')}`}. {cal.caveats.join(' ')} <SourceLinks ids={['pecaut-mamajek-2013']} /></p>
        </> : <p className="note">Not calibrated: {o.type === 'white dwarf' ? 'the dwarf sequence does not cover white dwarfs' : !spt ? 'no spectral type' : spt.limit ? 'only a bound on the type is known' : spt.subdwarf ? 'subdwarfs (metal-poor) lie below the dwarf sequence' : 'type outside the table'}.</p>}
      </>}

      {members.length > 1 && <>
        <div className="section-title">System {o.system} · {members.length} catalogue objects</div>
        <div className="mol-list" role="listbox" aria-label="System members">
          {members.map((m) => <button key={m.seq} role="option" aria-selected={m.seq === o.seq} className={m.seq === o.seq ? 'active' : ''} onClick={() => setQuery({ sel: m.seq })}><span>{m.name}</span><span className="f">{m.type === 'exoplanet' ? 'planet' : m.spt ?? m.type}</span></button>)}
        </div>
      </>}
      {planets.length > 0 && <p className="note" style={{ fontSize: 10.5 }}>Confirmed exoplanets in this system: {planets.length}. References: {[...new Set(planets.map((p) => p.rSys).filter(Boolean))].map((r) => <span key={r}><Ref r={r} /> </span>)}</p>}
      {o.comment && <p className="note" style={{ fontSize: 10.5 }}><strong>Catalogue note:</strong> {o.comment}</p>}
      <dl className="kv" aria-label="Identifiers">
        <KV k="Gaia DR3 source_id" v={o.gaia} />
        <KV k="HIP / HD / GJ" v={[o.hip, o.hd, o.gj].some(Boolean) ? `${o.hip ?? '—'} / ${o.hd ?? '—'} / ${o.gj ?? '—'}` : null} />
        <KV k="CNS5 number" v={cns?.cns5 ?? null} />
      </dl>
      <RelatedLinks id={`star:${o.seq}`} />
      <p className="note" style={{ marginTop: 10 }}>Catalogue: <SourceLinks ids={['reyle-2021', 'gaia-edr3', 'vizier']} />. Unknown means the catalogue has no value. Nothing is filled from other stars.</p>
    </>
  );
}

export default function StarsView() {
  const { query } = useRoute();
  const frame: StarFrame = query.get('frame') === 'icrs' ? 'icrs' : 'galactic';
  const showBg = query.get('bg') === '1';
  const selSeq = Number(query.get('sel')) || null;
  const [ten, setTen] = useState<NearbyObject[] | null>(null);
  const [cns, setCns] = useState<CnsStar[] | null>(null);
  const [types, setTypes] = useState<Set<ObjectType>>(new Set(TYPES));
  const [drop, setDrop] = useState(true);
  const [labelsOn, setLabelsOn] = useState(true);
  const [filter, setFilter] = useState('');
  useEffect(() => { loadTenParsec().then(setTen); loadCns5().then(setCns); }, []);
  const match = useMemo(() => (ten && cns ? crossMatch(ten, cns) : new Map<number, CnsStar>()), [ten, cns]);

  const objs = useMemo(() => (ten ?? []).filter((o) => o.type !== 'exoplanet').map((o) => {
    const pos = framePos(o, frame);
    const cal = calibrateDwarf(parseSpectralType(o.spt));
    const mg = absoluteMag(o.G ?? match.get(o.seq)?.G ?? null, o.plx);
    const size = mg === null ? 0.35 : Math.max(0.25, Math.min(1.6, 0.3 + (16 - mg) * 0.07));
    return { o, pos, color: displayColor(cal?.values.Teff ?? null, o.type), size };
  }), [ten, frame, match]);

  const points: ScenePoint[] = useMemo(() => objs.filter((x) => x.pos && types.has(x.o.type)).map((x) => ({ key: String(x.o.seq), pos: x.pos!, color: x.color, size: x.size })), [objs, types]);
  const background: ScenePoint[] = useMemo(() => {
    if (!showBg || !cns) return [];
    const matched = new Set([...match.values()].map((c) => c.cns5));
    return cns.filter((c) => !matched.has(c.cns5) && c.plx < 100).map((c) => ({ key: `c${c.cns5}`, pos: framePos(c, frame)!, color: [0.55, 0.5, 0.75] as [number, number, number], size: 0.3 })).filter((p) => p.pos);
  }, [showBg, cns, match, frame]);

  const systems = useMemo(() => {
    const m = new Map<number, NearbyObject[]>();
    for (const o of ten ?? []) m.set(o.sys, [...(m.get(o.sys) ?? []), o]);
    const mag = (o: NearbyObject) => o.V ?? o.G ?? o.J ?? 99;
    return [...m.values()].map((ms) => {
      const bodies = ms.filter((x) => x.type !== 'exoplanet');
      const primary = [...bodies].sort((a, b) => mag(a) - mag(b))[0] ?? ms[0];
      const d = Math.min(...ms.map((x) => distancePc(x.plx) ?? 99));
      const label = primary.common ? (ms.length > 1 && primary.common !== ms[0].system ? `${primary.common} (${ms[0].system})` : primary.common) : ms[0].system;
      return { sys: ms[0].sys, name: ms[0].system, label, primary, members: ms, d: d < 99 ? d : null };
    })
      .sort((a, b) => (a.d ?? 99) - (b.d ?? 99));
  }, [ten]);
  const shown = systems.filter((s) => !filter || s.members.some((m) => `${m.name} ${m.system} ${m.common ?? ''} ${m.gj ?? ''}`.toLowerCase().includes(filter.toLowerCase())));

  const labelLayer = useMemo(() => new LabelLayer(), []);
  const labelled = useMemo(() => systems.filter((s, i) => i < 10 || (s.primary.common && (s.d ?? 99) < 6)).filter((s) => types.has(s.primary.type)), [systems, types]);
  const anchors = labelsOn ? labelled.map((s) => ({ id: `sys${s.sys}`, pos: framePos(s.primary, frame) })).filter((a): a is { id: string; pos: Vec3 } => !!a.pos) : [];
  const labelItems = [
    ...labelled.map((s) => ({ id: `sys${s.sys}`, content: <span>{s.primary.common ?? s.name}</span>, onClick: () => setQuery({ sel: s.primary.seq }) })),
  ];

  const sel = ten?.find((o) => o.seq === selSeq) ?? null;
  const selPos = sel ? framePos(sel, frame) : null;
  if (!ten) return <Loading label="Loading the 10 pc catalogue" />;

  return (
    <>
      <Viewport camera={{ fov: 45, near: 0.01, far: 1000, position: [0, -22, 14] }} raycaster={{ params: { Points: { threshold: 0.25 } } as never }}>
        <color attach="background" args={['#020309']} />
        <StarScene points={points} background={background} selected={selPos} showDrop={drop} ringRadii={showBg ? [5, 10, 15, 20] : [2.5, 5, 7.5, 10]}
          labels={labelLayer} labelAnchors={anchors} onPick={(k) => setQuery({ sel: Number(k) })} />
      </Viewport>
      <LabelOverlay layer={labelLayer} labels={labelItems} />

      <div className="cosmic-tools stars-tools" role="toolbar" aria-label="Star map options">
        <label title="Reference frame of the map">Frame
          <select value={frame} onChange={(e) => setQuery({ frame: e.target.value === 'icrs' ? 'icrs' : null })} style={{ height: 24 }} aria-label="Reference frame">
            <option value="galactic">Galactic</option>
            <option value="icrs">Equatorial (ICRS)</option>
          </select>
        </label>
        <label><input type="checkbox" checked={showBg} onChange={(e) => setQuery({ bg: e.target.checked ? 1 : null })} aria-label="Show CNS5 stars to 20 pc" /> CNS5 to 20 pc</label>
        <label><input type="checkbox" checked={drop} onChange={(e) => setDrop(e.target.checked)} /> Drop lines</label>
        <label><input type="checkbox" checked={labelsOn} onChange={(e) => setLabelsOn(e.target.checked)} /> Labels</label>
      </div>
      <div className="star-legend note" aria-label="Map legend">
        Rings every {showBg ? '5 pc (16.3 ly)' : '2.5 pc (8.2 ly)'} in the {frame === 'galactic' ? 'Galactic plane; +x points to the Galactic centre (l = 0°), +z to the north Galactic pole' : 'celestial equator; +x points to α = 0h, +z to the north celestial pole'}. Sun at the centre. Point colour and size are <em>illustrative</em> (from the spectral-type calibration and absolute G), not to scale.
      </div>

      <Panel id="stars-list" className="left-panel" title={`Within 10 pc · ${systems.length} systems`}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name, GJ…" aria-label="Filter systems" className="text-input" style={{ width: '100%', marginBottom: 6 }} />
        <div className="chip-row" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
          {TYPES.map((t) => <button key={t} className={`chip ${types.has(t) ? 'active' : ''}`} aria-pressed={types.has(t)} onClick={() => setTypes((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; })}>{TYPE_LABEL[t]} · {ten.filter((o) => o.type === t).length}</button>)}
        </div>
        <p className="note" style={{ fontSize: 10.5, margin: '0 0 6px' }}>{ten.filter((o) => o.type === 'exoplanet').length} exoplanets are listed with their host systems.</p>
        <div className="mol-list" role="listbox" aria-label="Nearby systems">
          {shown.map((s) => (
            <button key={s.sys} role="option" aria-selected={sel?.sys === s.sys} className={sel?.sys === s.sys ? 'active' : ''} onClick={() => setQuery({ sel: s.primary.seq })}>
              <span>{s.label}</span><span className="f">{s.d !== null ? `${(s.d * PC_IN_LY).toFixed(2)} ly` : '—'}{s.members.length > 1 ? ` · ${s.members.length}` : ''}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel id="stars-info" className="right-panel" title="Object">
        {sel ? <ObjectPanel o={sel} all={ten} cns={match.get(sel.seq)} /> : <>
          <h2 style={{ margin: '0 0 6px', fontWeight: 400 }}>The solar neighbourhood</h2>
          <p className="note">{ten.length} objects in {systems.length} systems within 10 pc of the Sun: every known star, brown dwarf and exoplanet (Reylé et al. 2021, 2023 update). Select a point or a system in the list.</p>
          <p className="note">Distances are 1/parallax. The nearest star, Proxima Centauri, is 1.30 pc (4.25 ly) away. Within this volume most objects are faint red M dwarfs; only a handful are visible to the naked eye.</p>
          <p className="note">Turn on <em>CNS5 to 20 pc</em> to add the {cns ? cns.filter((c) => c.plx < 100).length : '…'} stars between 10 and 20 pc from the Fifth Catalogue of Nearby Stars (Golovin et al. 2023).</p>
          <button className="chip" onClick={() => navigate('/cosmic/sun')}>The Sun in the Solar System view →</button>
          <p className="note" style={{ marginTop: 10 }}><SourceLinks ids={['reyle-2021', 'golovin-2023-cns5', 'gaia-edr3', 'liu-2011-galactic']} /></p>
        </>}
      </Panel>
    </>
  );
}
