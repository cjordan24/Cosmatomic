/**
 * Particles — #/atomic/particles?sel=<id>   (Phase 14, Gate 14.1)
 *
 * The particles of the Standard Model with the Particle Data Group's 2025 values (CC BY 4.0): charge, spin, mass
 * (with the quark-mass schemes PDG states) and lifetime or width; a log mass ladder from the electron to the top
 * quark; plain-language sentences from the U.S. DOE Office of Science.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import data from '@datasets/atomic/particles.json';

interface P { id: string; name: string; symbol: string; group: 'quark' | 'lepton' | 'gauge' | 'scalar'; charge: string; spin: string; massMeV: number | null; mass: string; note: string }
const D = data as unknown as { citation: string; schemes: string; particles: P[]; neutrinoCount: { quote: string }; doe: { url: string; quote: string }[] };
const GROUPS: [P['group'], string, string][] = [['quark', 'Quarks', '#ff7a90'], ['lepton', 'Leptons', '#5cf2a6'], ['gauge', 'Gauge bosons', '#f5c76b'], ['scalar', 'Scalar boson', '#b18cff']];
const color = (g: P['group']) => GROUPS.find(([k]) => k === g)![2];

export default function ParticlesView() {
  const { query } = useRoute();
  const sel = D.particles.find((p) => p.id === query.get('sel')) ?? D.particles.find((p) => p.id === 'e')!;
  const massive = D.particles.filter((p) => p.massMeV !== null).sort((a, b) => a.massMeV! - b.massMeV!);
  const W = 640, x = (m: number) => 30 + ((Math.log10(m) + 0.5) / 6) * (W - 60);   // 10^-0.5 … 10^5.5 MeV
  return (
    <>
      <Panel id="particles-list" className="left-panel" title="The Standard Model">
        {GROUPS.map(([g, label, col]) => (
          <div key={g} style={{ marginBottom: 8 }}>
            <h3 style={{ margin: '4px 0', color: col }}>{label}</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="list" aria-label={label}>
              {D.particles.filter((p) => p.group === g).map((p) => <button key={p.id} role="listitem" className={`chip ${p.id === sel.id ? 'active' : ''}`} aria-pressed={p.id === sel.id} title={p.name} onClick={() => setQuery({ sel: p.id })}>{p.symbol}</button>)}
            </div>
          </div>
        ))}
        <p className="note">Grouped as PDG lists them. Antiparticles are not shown separately.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The particles of the Standard Model <ProvenanceBadge cls="observed" title="Particle Data Group 2025 (CC BY 4.0)" /></h1>
          <p className="note">“{D.doe[0].quote}” “{D.doe[1].quote}” <SourceLinks ids={['doe-explains']} /></p></div>
        <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="Particle masses on a logarithmic scale" style={{ width: '100%', maxWidth: W }}>
          <line x1={30} x2={W - 30} y1={210} y2={210} stroke="var(--line-strong)" />
          {[-0, 1, 2, 3, 4, 5].map((e) => <g key={e}><line x1={x(10 ** e)} x2={x(10 ** e)} y1={206} y2={214} stroke="var(--text-dim)" /><text x={x(10 ** e)} y={230} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{e < 3 ? `${10 ** e} MeV` : `${10 ** (e - 3)} GeV`}</text></g>)}
          {massive.map((p, i) => (
            <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => setQuery({ sel: p.id })}>
              <line x1={x(p.massMeV!)} x2={x(p.massMeV!)} y1={20 + (i % 6) * 30} y2={210} stroke={color(p.group)} strokeWidth={p.id === sel.id ? 3 : 1.5} opacity={p.id === sel.id ? 1 : 0.75} />
              <text x={x(p.massMeV!) + 4} y={30 + (i % 6) * 30} fontSize={13} fill={color(p.group)} fontWeight={p.id === sel.id ? 700 : 400}>{p.symbol}</text>
            </g>
          ))}
        </svg>
        <p className="note">Masses span more than five powers of ten, from the electron to the top quark. Not drawn: the photon and gluon (massless or nearly) and the neutrinos (below 0.8 eV). Quark masses depend on how they are defined: “{D.schemes}” <SourceLinks ids={['pdg-2025']} /></p>
      </div>
      <Panel id="particle-detail" className="right-panel" title={sel.name}>
        <dl className="kv" aria-label="Particle values">
          <KV k="Symbol" v={sel.symbol} /><KV k="Charge" v={sel.charge} unit="e" /><KV k="Spin" v={sel.spin} />
          <KV k="Mass" v={sel.mass} /><KV k="Note" v={sel.note} />
        </dl>
        <p className="note">{D.citation}. <SourceLinks ids={['pdg-2025']} /></p>
        {sel.group === 'quark' && <blockquote className="quote">“{D.doe[3].quote}” “{D.doe[4].quote}” <SourceLinks ids={['doe-explains']} /></blockquote>}
        {sel.group === 'lepton' && sel.id.startsWith('nu') && <blockquote className="quote">“{D.doe[7].quote}” “{D.doe[8].quote}” PDG: {D.neutrinoCount.quote}. <SourceLinks ids={['doe-explains', 'pdg-2025']} /></blockquote>}
        {sel.group === 'gauge' && <blockquote className="quote">“{D.doe[6].quote}” <SourceLinks ids={['doe-explains']} /></blockquote>}
        {sel.group === 'scalar' && <blockquote className="quote">“{D.doe[9].quote}” <SourceLinks ids={['doe-explains']} /></blockquote>}
        {(sel.id === 'u' || sel.id === 'd' || sel.id === 'e') && <blockquote className="quote">“{D.doe[2].quote}” <SourceLinks ids={['doe-explains']} /></blockquote>}
        <p className="note">“{D.doe[5].quote}”</p>
        {sel.id === 'e' && <button className="chip" onClick={() => navigate('/atomic/element/1')}>The electron in hydrogen →</button>}
        {(sel.id === 'u' || sel.id === 'd') && <button className="chip" onClick={() => navigate('/atomic/nuclei')}>Protons and neutrons in nuclei →</button>}
        <RelatedLinks id="instrument:particles" limit={3} />
      </Panel>
    </>
  );
}
