/**
 * Scale of life — #/biologic?sel=<id>&cmp=<id>&cat=<category,…>   (Phase 11, Gate 11.1)
 *
 * Every size from a water molecule to an ant on one logarithmic axis (10⁻¹⁰ m to 10⁻² m). Each item shows its
 * reported value or range with the verbatim quote and source; disagreeing sources are all drawn (faint) and listed.
 * Selecting two items gives their size ratio. Data: datasets/biology/life-sizes.json (see lifeSizes.ts).
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { CATEGORY_COLOR, CATEGORY_LABEL, LIFE_SIZES, formatLen, formatReport, lifeSize, reportCentre, reportSpan, type LifeCategory, type LifeSize } from './lifeSizes';

const LOG_MIN = -10, LOG_MAX = -2;
const W = 640, X0 = 24, X1 = 626, TOP = 30, LANE = 15, FONT = 11;
const CATS: LifeCategory[] = ['molecule', 'macromolecule', 'assembly', 'virus', 'organelle', 'cell', 'reference', 'organism'];
const x = (m: number) => X0 + ((Math.log10(m) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);
const DECADE_LABEL: Record<number, string> = { [-10]: '0.1 nm', [-9]: '1 nm', [-8]: '10 nm', [-7]: '100 nm', [-6]: '1 µm', [-5]: '10 µm', [-4]: '100 µm', [-3]: '1 mm', [-2]: '1 cm' };
const textW = (t: string, f = FONT) => t.length * f * 0.56;

/** Label lanes for one category row: each label goes in the first lane above the marks where it does not overlap. */
function layoutRow(items: LifeSize[]) {
  const lanes: [number, number][][] = [];
  const out = items.map((it) => {
    const cx = Math.min(X1 - textW(it.label) / 2, Math.max(X0 + textW(it.label) / 2, x(reportCentre(it.reports[0]))));
    const a = cx - textW(it.label) / 2 - 4, b = cx + textW(it.label) / 2 + 4;
    let lane = 0;
    while (lanes[lane]?.some(([p, q]) => p < b && a < q)) lane++;
    (lanes[lane] ??= []).push([a, b]);
    return { it, cx, lane };
  });
  return { placed: out, lanes: Math.max(1, lanes.length) };
}

function Axis({ sel, cmp, cats }: { sel: string | null; cmp: string | null; cats: LifeCategory[] }) {
  const rows = cats.map((c) => ({ c, ...layoutRow(LIFE_SIZES.filter((i) => i.category === c)) }));
  const heights = rows.map((r) => 22 + r.lanes * LANE + 12);
  const H = TOP + heights.reduce((a, b) => a + b, 0) + 28;
  let y0 = TOP;
  return (
    <svg className="life-axis" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scale of life: sizes on a logarithmic axis" style={{ width: '100%', maxWidth: 1100 }}>
      {Array.from({ length: LOG_MAX - LOG_MIN + 1 }, (_, i) => LOG_MIN + i).map((d) => (
        <g key={d}>
          <line x1={x(10 ** d)} x2={x(10 ** d)} y1={TOP - 6} y2={H - 24} stroke="var(--line)" />
          <text x={x(10 ** d)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{DECADE_LABEL[d]}</text>
        </g>
      ))}
      <text x={X0} y={TOP - 12} fontSize={10} fill="var(--text-faint)">metres, logarithmic: each gridline is ten times the last</text>
      {rows.map((row, ri) => {
        const top = y0; y0 += heights[ri];
        const base = top + 18 + row.lanes * LANE + 4; // marks sit under the label lanes
        const col = CATEGORY_COLOR[row.c];
        return (
          <g key={row.c} data-category={row.c}>
            <line x1={X0} x2={X1} y1={top + heights[ri] - 2} y2={top + heights[ri] - 2} stroke="var(--line)" strokeDasharray="2 4" opacity={0.5} />
            <text x={X0} y={top + 11} fontSize={10} fill={col} opacity={0.85} letterSpacing="0.08em">{CATEGORY_LABEL[row.c].toUpperCase()}</text>
            {row.placed.map(({ it, cx, lane }) => {
              const active = it.id === sel || it.id === cmp;
              const ly = base - 8 - lane * LANE;
              const mx = x(reportCentre(it.reports[0]));
              return (
                <g key={it.id} className="life-item" data-id={it.id} role="button" tabIndex={0} aria-label={`${it.label}: ${formatReport(it.reports[0])}`} style={{ cursor: 'pointer' }}
                  onClick={(e) => setQuery(e.shiftKey && sel && sel !== it.id ? { cmp: it.id } : { sel: it.id })} onKeyDown={(e) => { if (e.key === 'Enter') setQuery({ sel: it.id }); }}>
                  {lane > 0 && <line x1={mx} x2={mx} y1={ly + 3} y2={base - 4} stroke={col} strokeOpacity={0.35} />}
                  {it.reports.map((r, k) => {
                    const [a, b] = reportSpan(r);
                    return a === b
                      ? <circle key={k} cx={x(a)} cy={base + 2 + k * 3} r={active ? 5.5 : 4} fill={k ? 'none' : col} stroke={col} strokeWidth={1.5} opacity={k ? 0.5 : 1} />
                      : <rect key={k} x={x(a)} y={base + (k ? 4 + k * 3 : -1)} width={Math.max(3, x(b) - x(a))} height={k ? 3 : 6} rx={3} fill={col} opacity={k ? 0.45 : active ? 1 : 0.8} />;
                  })}
                  <text x={cx} y={ly} textAnchor="middle" fontSize={FONT} fontWeight={active ? 700 : 400} fill={active ? 'var(--text)' : 'var(--text-dim)'}>{it.label}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Detail({ it }: { it: LifeSize }) {
  const z = Math.log10(reportCentre(it.reports[0])) + 0.7;
  return (
    <>
      <h3 style={{ margin: '4px 0' }}>{it.label} <ProvenanceBadge cls={it.provenance} title={it.provenance === 'derived' ? 'Computed from a computed 3D conformer' : 'Reported size, quoted from the source'} /></h3>
      <p className="note" style={{ marginTop: 0 }}>{CATEGORY_LABEL[it.category]} · {it.quantity}</p>
      <ul className="life-reports" aria-label="Reported sizes">
        {it.reports.map((r, i) => (
          <li key={i}>
            <strong style={{ color: CATEGORY_COLOR[it.category] }}>{formatReport(r)}</strong>{r.approximate && <span className="note"> (approximate)</span>}
            <blockquote className="quote">“{r.quote}”</blockquote>
            <span className="note">{r.where} — <SourceLinks ids={[r.source]} /></span>
          </li>
        ))}
      </ul>
      {it.reports.length > 1 && new Set(it.reports.map((r) => formatReport(r))).size > 1 && (
        <p className="note warn-note">The sources give different values; all of them are shown, none is preferred.</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {it.links?.map((l) => <button key={l.to} className="chip" onClick={() => navigate(l.to)}>{l.label} →</button>)}
        <button className="chip" onClick={() => navigate(`/scale?z=${z.toFixed(1)}`)}>See it in the scale navigator →</button>
      </div>
    </>
  );
}

export default function LifeAtlasView() {
  const { query } = useRoute();
  const sel = lifeSize(query.get('sel') ?? '') ? query.get('sel') : null;
  const cmp = lifeSize(query.get('cmp') ?? '') && query.get('cmp') !== sel ? query.get('cmp') : null;
  const hidden = new Set((query.get('hide') ?? '').split(',').filter(Boolean));
  const cats = CATS.filter((c) => !hidden.has(c));
  const a = sel ? lifeSize(sel)! : null, b = cmp ? lifeSize(cmp)! : null;
  const ratio = a && b ? reportCentre(b.reports[0]) / reportCentre(a.reports[0]) : null;
  return (
    <>
      <Panel id="life-list" className="left-panel" title="Sizes">
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 8 }} aria-label="Categories">
          {CATS.map((c) => (
            <button key={c} className={`chip ${hidden.has(c) ? '' : 'active'}`} style={{ fontSize: 10.5 }} aria-pressed={!hidden.has(c)}
              onClick={() => { const h = new Set(hidden); h.has(c) ? h.delete(c) : h.add(c); setQuery({ hide: h.size ? [...h].join(',') : null }); }}>{CATEGORY_LABEL[c]}</button>
          ))}
        </div>
        <ol className="life-list" aria-label="All sizes, smallest first">
          {LIFE_SIZES.filter((i) => !hidden.has(i.category)).map((i) => (
            <li key={i.id}>
              <button className={`link-btn ${i.id === sel ? 'active' : ''}`} onClick={() => setQuery({ sel: i.id })}>
                <span style={{ color: CATEGORY_COLOR[i.category] }}>●</span> {i.label}
              </button>
              <span className="note"> {formatReport(i.reports[0])}</span>
              {sel && i.id !== sel && <button className="link-btn" style={{ fontSize: 10, marginLeft: 6 }} aria-label={`Compare with ${i.label}`} onClick={() => setQuery({ cmp: i.id })}>compare</button>}
            </li>
          ))}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Scale of life <ProvenanceBadge cls="observed" title="Reported sizes from NIH/NIGMS, nano.gov, U.S. DOE and RCSB PDB-101; small molecules derived from PubChem3D conformers" /></h1>
          <p className="note">From a water molecule to an ant: eight powers of ten on one logarithmic axis, every size as its source states it. Bars are quoted ranges; faint marks are other sources for the same thing. “Virtually all forms of life fall into one of two categories: eukaryotes or prokaryotes” — most prokaryotic cells are 1–10 µm across, most animal cells 10–30 µm and most plant cells 10–100 µm. <SourceLinks ids={['nigms-inside-the-cell']} /> Click an item for its sources; shift-click (or “compare”) a second one for the ratio.</p>
        </div>
        <Axis sel={sel} cmp={cmp} cats={cats} />
      </div>
      <Panel id="life-detail" className="right-panel" title={a ? a.label : 'Select a size'}>
        {a ? <Detail it={a} /> : <p className="note">Pick any mark on the axis or a name in the list.</p>}
        {a && b && ratio && (
          <section className="life-compare" aria-label="Size comparison">
            <h4 style={{ margin: '14px 0 4px' }}>Compared with {b.label}</h4>
            <p style={{ margin: 0 }}>{b.label} ({formatLen(reportCentre(b.reports[0]))}) is <strong>{ratio >= 1 ? `${Number(ratio.toPrecision(2)).toLocaleString('en-GB')} ×` : `1/${Number((1 / ratio).toPrecision(2)).toLocaleString('en-GB')}`}</strong> the size of {a.label} ({formatLen(reportCentre(a.reports[0]))}). <ProvenanceBadge cls="derived" title="Ratio of the two representative sizes; a range counts as its geometric mean" /></p>
            <p className="note">A quoted range counts as its geometric mean (its midpoint on the log axis). <button className="link-btn" onClick={() => setQuery({ cmp: null })}>clear</button></p>
          </section>
        )}
        <RelatedLinks id="instrument:life-atlas" />
      </Panel>
    </>
  );
}
