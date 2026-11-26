import { SOLAR_LOG_EPS, relationshipsFrom } from '@/shared/scientific-relationships/registry';
import { getElement } from '@/modes/atomic/atoms/elements';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { navigate, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { KV, Panel, SourceList } from '@/ui/components';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { norm, sub } from '@/core/mathematics/vec3';
import { BODIES, childrenOf, getBody, type CelestialBody } from './bodies';
import { heliocentric, AU_KM, ELEMENT_EPOCH_JD, spacecraftState, CRAFT, trajectoryQuality, loadEncounters, positionSource, solarElevationOnEquator } from './ephemeris';
import { ProvenanceBadge } from '@/ui/components';
import { formatJdUtc } from '@/core/simulation/clock';
import { SolarScene, moonSystemScale, type Frame } from './SolarScene';
import { LabelLayer, LabelOverlay } from '@/rendering/labels';
import { Timeline } from './Timeline';
import { moleculeByFormula } from '@/modes/atomic/molecules/molecules';
import { elementBySymbol } from '@/modes/atomic/atoms/elements';

function SpeciesLink({ species }: { species: string }) {
  const mol = moleculeByFormula(species === 'NH3' ? 'H3N' : species);
  const el = elementBySymbol(species);
  if (mol) return <button className="link-btn" onClick={() => navigate(`/atomic/molecules/${mol.id}`)} title="Open molecular model">{species}</button>;
  if (el) return <button className="link-btn" onClick={() => navigate(`/atomic/element/${el.Z}`)} title="Open atomic model">{species}</button>;
  return <span>{species}</span>;
}

const ATM_COLORS = ['#7df9ff', '#b18cff', '#f5c76b', '#5cf2a6', '#ff7a90', '#58b4ff', '#c9d1e8'];

function InfoPanel({ body, jd, measureId, setMeasureId }: { body: CelestialBody; jd: number; measureId: string; setMeasureId: (id: string) => void }) {
  const craft = body.kind === 'spacecraft' ? spacecraftState(body.id, jd) : null;
  if (body.kind === 'spacecraft' && !craft) {
    const s = CRAFT[body.id].samples;
    return (<><h2 style={{ margin: 0, fontWeight: 400 }}>{body.name}</h2><p className="note warn">No trajectory at this date — data span {formatJdUtc(s[0][0]).slice(0, 10)} → {formatJdUtc(s[s.length - 1][0]).slice(0, 10)} (JPL Horizons). Nothing is extrapolated.</p></>);
  }
  const pos = heliocentric(body.id, jd);
  const rSun = norm(pos);
  const other = getBody(measureId)!;
  const dOther = norm(sub(pos, heliocentric(measureId, jd)));
  const lightTime = (km: number) => { const s = (km * 1000) / CONSTANTS.c.value; return s < 120 ? `${s.toFixed(1)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : `${(s / 3600).toFixed(2)} h`; };
  const lon = ((Math.atan2(pos[1], pos[0]) * 180) / Math.PI + 360) % 360;
  const lat = (Math.asin(pos[2] / (rSun || 1)) * 180) / Math.PI;
  const yearsFromEpoch = Math.abs(jd - ELEMENT_EPOCH_JD) / 365.25;
  return (
    <>
      <h2 style={{ margin: '0 0 2px', fontWeight: 400, fontSize: 24 }}>{body.name}</h2>
      <div className="note">{body.classification}</div>
      {body.radiusKm === null && <p className="note warn">Radius not available in the ingested catalogue — drawn as a small marker, not to scale.</p>}

      <div className="section-title">Physical</div>
      <dl className="kv">
        <KV k="Mass" v={body.massKg} unit="kg" />
        <KV k="Mean radius" v={body.radiusKm} unit={body.radiusSigmaKm ? `± ${body.radiusSigmaKm} km` : 'km'} />
        <KV k="Radius (Earth = 1)" v={body.radiusKm ? body.radiusKm / 6371.0 : null} sig={3} />
        <KV k="Density" v={body.densityKgM3} unit="kg/m³" />
        <KV k="Surface gravity" v={body.gravityMs2} unit="m/s²" sig={3} />
        <KV k="Escape velocity" v={body.escapeVelocityKms} unit="km/s" sig={3} />
        <KV k="Rotation period" v={body.rotationPeriodH} unit="h" />
        <KV k="Axial tilt" v={body.obliquityDeg} unit="°" sig={3} />
        <KV k={body.kind === 'star' ? 'Effective temperature' : 'Mean temperature'} v={body.meanTemperatureK} unit="K" sig={4} />
        <KV k="Surface pressure" v={body.surfacePressureBar} unit="bar" />
        {body.kind === 'planet' && <KV k="Known moons" v={body.knownMoons} />}
        {body.id === 'saturn' && <KV k="Sun elevation above rings (B′)" v={solarElevationOnEquator('saturn', jd)} unit="°" sig={3} title="Derived from the IAU pole and the modelled position; near 0° around Saturn's equinox (May 2025) the rings are lit edge-on and appear dark." />}
      </dl>

      {body.atmosphere && (
        <>
          <div className="section-title">{body.kind === 'star' ? 'Composition (mass fraction)' : 'Atmosphere (volume fraction)'}</div>
          <div className="atm-bar">{body.atmosphere.map((a, i) => <span key={a.species} style={{ width: `${a.fraction * 100}%`, background: ATM_COLORS[i % ATM_COLORS.length] }} title={`${a.species} ${(a.fraction * 100).toPrecision(3)} %`} />)}</div>
          <dl className="kv">
            {body.atmosphere.map((a) => <Fragment key={a.species}><dt>{a.species === 'metals (Z)' ? 'Metals (all Z > 2)' : <SpeciesLink species={a.species} />}</dt><dd>{(a.fraction * 100) >= 0.01 ? `${(a.fraction * 100).toPrecision(4)} %` : `${formatSig(a.fraction * 1e6, 3)} ppm`}</dd></Fragment>)}
          </dl>
          <p className="note">Click a species to open its atomic or molecular model.</p>
        </>
      )}

      {craft && (
        <>
          <div className="section-title">Trajectory (JPL Horizons)</div>
          <dl className="kv">
            <KV k="Heliocentric speed" v={norm(craft.v)} unit="km/s" sig={5} />
            <KV k="Speed" v={(norm(craft.v) * 86400 * 365.25) / AU_KM} unit="au/yr" sig={4} />
            <KV k="Trajectory data from" v={CRAFT[body.id].samples.length ? formatJdUtc(CRAFT[body.id].samples[0][0]).slice(0, 10) : null} />
            <KV k="Encounters" v={CRAFT[body.id].encounters.map(([p]) => p).join(', ')} />
          </dl>
          {(() => { const q = trajectoryQuality(body.id, jd); return <p className="note" style={{ color: q.kind === 'tracking-fit' ? undefined : 'var(--warn)' }}><ProvenanceBadge cls={q.kind === 'tracking-fit' ? 'derived' : 'simulated'} title={q.kind} /> {q.text}</p>; })()}
        </>
      )}
      {body.kind !== 'star' && body.kind !== 'spacecraft' && (
        <>
          <div className="section-title">Orbit</div>
          <dl className="kv">
            <KV k="Orbital period" v={body.orbitalPeriodDays} unit="d" />
            <KV k="Eccentricity" v={body.eccentricity} sig={4} />
            <KV k="Inclination (ecliptic)" v={body.inclinationDeg} unit="°" sig={4} />
          </dl>
        </>
      )}

      <div className="section-title">Modelled position</div>
      <dl className="kv">
        <KV k="Distance from Sun" v={rSun / AU_KM} unit="au" sig={6} />
        <KV k="Ecliptic longitude" v={body.kind === 'star' ? null : lon} unit="°" sig={5} />
        <KV k="Ecliptic latitude" v={body.kind === 'star' ? null : lat} unit="°" sig={3} />
        <dt>
          Distance to{' '}
          <select value={measureId} onChange={(e) => setMeasureId(e.target.value)} aria-label="Measure distance to" style={{ height: 24 }}>
            {BODIES.filter((b) => b.id !== body.id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </dt>
        <dd>{body.id === other.id ? '—' : dOther > 0.01 * AU_KM ? `${(dOther / AU_KM).toFixed(5)} au` : `${formatSig(dOther, 6)} km`}</dd>
        <KV k="Light time" v={body.id === other.id ? null : lightTime(dOther)} />
      </dl>
      {positionSource(body.id, jd) === 'horizons-encounter' && <p className="note" style={{ color: 'var(--accent-3)' }}><ProvenanceBadge cls="derived" /> Voyager encounter window: position taken directly from JPL Horizons (DE440 / satellite ephemerides), not the approximate model.</p>}
      <p className="note">Frame: heliocentric ecliptic J2000. {body.kind === 'spacecraft' ? 'JPL Horizons trajectory (cubic Hermite interpolation).' : body.kind === 'moon' || body.kind === 'dwarf-planet' ? `Two-body propagation from 2025-01-01 elements (${yearsFromEpoch.toFixed(1)} yr from epoch${yearsFromEpoch > 2 ? ' — accuracy degraded' : ''}).` : body.id === 'moon' ? '' : body.kind === 'star' ? '' : 'JPL Keplerian elements (Table 1).'}{body.id === 'moon' && ' Truncated ELP-2000/82 lunar theory (validated ≤ 0.3° vs Horizons).'}</p>

      {body.notes.length > 0 && <><div className="section-title">Notes</div>{body.notes.map((n) => <p key={n} className="note">{n}</p>)}</>}

      {body.kind !== 'spacecraft' && <><div className="section-title">Missions & imagery</div>
      <p className="note">Mission histories and telescope image galleries are not yet curated (Phase 6). Nothing is shown rather than placeholder content.</p></>}

      {body.id === 'sun' && <>
        <RelatedLinks id="body:sun" filter={(r) => r.context !== 'photospheric abundance'} />
        <div className="section-title">Photospheric composition <ProvenanceBadge cls="observed" title="log ε, log ε(H) = 12 (manually transcribed)" /></div>
        <p className="note" style={{ lineHeight: 1.9 }} aria-label="Solar photospheric elements">{relationshipsFrom('body:sun').filter((r) => r.context === 'photospheric abundance').map((r) => { const Z = Number(r.to.split(':')[1]); const el = getElement(Z)!; return <span key={Z}><button className="link-btn" onClick={() => navigate(`/atomic/element/${Z}`)} title={`${el.name}: log ε = ${SOLAR_LOG_EPS[el.symbol]}`}>{el.symbol}</button> <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>{SOLAR_LOG_EPS[el.symbol]}</span>{'  '}</span>; })}</p>
        <p className="note" style={{ fontSize: 10.5 }}>log ε(X) = log₁₀(N_X/N_H) + 12 for the {Object.keys(SOLAR_LOG_EPS).length} transcribed elements; others are unknown here, not absent. <SourceLinks ids={['asplund-2009']} /></p>
        <div className="chip-row"><button className="chip" onClick={() => navigate('/cosmic/stars/hr?d=hr')}>The Sun on the HR diagram →</button><button className="chip" onClick={() => navigate('/cosmic/stars')}>Nearby stars →</button></div>
      </>}

      <div className="section-title">Data provenance</div>
      <SourceList sources={body.provenance} />
    </>
  );
}

export default function CosmicView({ focusId: focusParam }: { focusId: string }) {
  const focus = getBody(focusParam) ? focusParam : 'sun';
  const overview = focusParam === 'sun' && !/#\/cosmic\/sun/.test(window.location.hash);
  const jd = useVoyager((s) => s.clock.jd);
  const settings = useVoyager((s) => s.settings);
  const set = useVoyager((s) => s.setSetting);
  const [frame, setFrame] = useState<Frame>('focus');
  const [showHill, setShowHill] = useState(false);
  const [measureId, setMeasureId] = useState('earth');
  const [listOpen, setListOpen] = useState(false);
  const body = getBody(focus)!;
  const distParam = Number(useRoute().query.get('dist')) || null;
  const [, setEncReady] = useState(false);
  useEffect(() => { loadEncounters().then(() => setEncReady(true)); }, []);
  const tree = useMemo(() => BODIES.filter((b) => b.kind !== 'moon'), []);
  const labelLayer = useMemo(() => new LabelLayer(), []);
  const labelItems = BODIES.map((b) => ({
    id: b.id,
    className: `${b.kind === 'moon' ? 'moon' : ''} ${b.id === focus ? 'focused' : ''}`,
    style: { ['--c' as string]: b.color } as React.CSSProperties,
    onClick: () => navigate(`/cosmic/${b.id}`),
    content: <><span className="ring" />{b.name}</>,
  }));

  return (
    <>
      <Viewport logDepth camera={{ fov: 45, near: 0.0005, far: 5e9, position: [0, 0, 10] }}>
        <color attach="background" args={['#020309']} />
        <SolarScene focusId={focus} frame={frame} overview={overview} showHill={showHill} labels={labelLayer} distanceKm={distParam} />
      </Viewport>
      <LabelOverlay layer={labelLayer} labels={labelItems} />

      <div className="cosmic-tools" role="toolbar" aria-label="Scene options">
        <label><input type="checkbox" checked={settings.showLabels} onChange={(e) => set('showLabels', e.target.checked)} /> Labels</label>
        <label><input type="checkbox" checked={settings.showOrbits} onChange={(e) => set('showOrbits', e.target.checked)} /> Orbits</label>
        <label title="Hill sphere: region where the body's gravity dominates over its parent's tide (derived)"><input type="checkbox" checked={showHill} onChange={(e) => setShowHill(e.target.checked)} /> Gravity (Hill sphere)</label>
        <label title="Reference frame / camera origin">Frame
          <select value={frame} onChange={(e) => setFrame(e.target.value as Frame)} style={{ height: 24 }}>
            <option value="focus">Body-centred</option>
            <option value="heliocentric">Heliocentric</option>
          </select>
        </label>
        <label title="Visual only — physical positions are unaffected">Size
          <select value={settings.sizeExaggeration} onChange={(e) => set('sizeExaggeration', Number(e.target.value))} style={{ height: 24 }}>
            {[1, 10, 50, 200, 1000].map((k) => <option key={k} value={k}>{k === 1 ? 'true scale' : `×${k}`}</option>)}
          </select>
        </label>
        <button className="icon-btn" onClick={() => navigate('/cosmic/sandbox')} title="Experiment: editable N-body sandbox (never alters the real solar system)">Experiment ⟶</button>
        <button className="icon-btn mobile-only" onClick={() => setListOpen((o) => !o)}>Objects</button>
      </div>
      {settings.sizeExaggeration > 1 && (
        <div className="model-label scale-banner" role="note">
          Illustrative scale: body radii ×{settings.sizeExaggeration} (Sun ×{Math.min(settings.sizeExaggeration, 20)}){body.parent || childrenOf(body.id).length ? `; moon distances in this system ×${moonSystemScale(body.parent ?? body.id, settings.sizeExaggeration).toFixed(1)} (only as needed to clear the enlarged planet)` : ''}. Physics and the info panel are unaffected.
        </div>
      )}

      <Panel id="cosmic-bodies" className={`bodies-panel ${listOpen ? 'mobile-open' : ''}`} title="Solar system">
        <button className={`body-btn ${overview ? 'active' : ''}`} onClick={() => navigate('/cosmic')}><span className="sw" style={{ background: 'conic-gradient(#ffd27a,#b18cff,#4f8fe6,#ffd27a)' }} />Overview</button>
        {tree.map((b) => (
          <div key={b.id}>
            <button className={`body-btn ${b.id === focus && !overview ? 'active' : ''}`} onClick={() => navigate(`/cosmic/${b.id}`)}>
              <span className="sw" style={{ background: b.color }} />{b.name}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-faint)' }}>{b.kind === 'dwarf-planet' ? 'dwarf' : b.kind === 'star' ? 'star' : b.kind === 'spacecraft' ? 'craft' : ''}</span>
            </button>
            {(b.id === focus || getBody(focus)?.parent === b.id) && childrenOf(b.id).map((m) => (
              <button key={m.id} className={`body-btn moon ${m.id === focus ? 'active' : ''}`} onClick={() => navigate(`/cosmic/${m.id}`)}><span className="sw" style={{ background: m.color }} />{m.name}</button>
            ))}
          </div>
        ))}
        <p className="note" style={{ padding: '8px 6px 2px', margin: 0 }}>Asteroid & Kuiper belts, comets, further spacecraft and the Oort Cloud population model are planned (not shown — none are fabricated).</p>
      </Panel>

      <Panel id="cosmic-info" className="right-panel" title="Object" style={{ maxHeight: 'calc(100% - 150px)' }}>
        <InfoPanel body={body} jd={jd} measureId={measureId === body.id ? 'sun' : measureId} setMeasureId={setMeasureId} />
      </Panel>

      <Timeline />
    </>
  );
}
