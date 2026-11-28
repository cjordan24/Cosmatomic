/**
 * Biomolecules — #/biologic/molecules?tab=amino|nucleic|carbs|lipids|code&sel=<molecule id>   (Phase 11, Gate 11.2)
 *
 *  amino · nucleic · carbs · lipids   cards of bundled molecule records; the selected one in 3D with its ChEBI
 *                                     description, and for amino acids its IUPAC symbols and codons
 *  code                               the standard and vertebrate mitochondrial genetic codes (NCBI) as a codon
 *                                     table; translate a DNA or RNA sequence: gc=1|2, seq=, frame=0|1|2, strand=+|-
 * Text: NHGRI Talking Glossary (public domain), quoted. Data: datasets/biology/biomolecules.json.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { EntityBio } from '@/ui/Encyclopedia';
import { Viewport } from '@/rendering/Viewport';
import { MoleculeSceneContents, cameraDistanceFor } from '@/modes/atomic/molecules/MoleculeScene';
import { prettyFormula } from '@/modes/atomic/molecules/molecules';
import { cleanSequence, codonTable, degeneracy, differences, reverseComplement, toRna, translate, type NcbiCode } from '@/core/biology/geneticCode';
import { AMINO_ACIDS, BASE_LETTER, GENETIC_CODES, GROUPS, STANDARD_CODE, VERT_MITO_CODE, aminoAcidByLetter, aminoAcidFor, glossary, molecule, type BioGroup } from './biomolecules';

type Tab = BioGroup | 'code';
const TABS: [Tab, string][] = [['amino', 'Amino acids'], ['nucleic', 'Nucleic-acid parts'], ['carbs', 'Sugars'], ['lipids', 'Lipids'], ['code', 'Genetic code']];
const NHGRI = ['nhgri-glossary'];
/** 1BNA, one strand (the dodecamer used on the landing portal); it is not a gene. */
const EXAMPLE_1BNA = 'CGCGAATTCGCG';

function Quote({ term }: { term: string }) {
  const g = glossary(term);
  return <blockquote className="quote" data-term={term}>“{g.text.join(' ')}” <span className="note" style={{ fontStyle: 'normal' }}>— NHGRI, <em>{g.term}</em> <SourceLinks ids={NHGRI} /></span></blockquote>;
}

function MoleculePanel({ id }: { id: string }) {
  const m = molecule(id);
  const aa = aminoAcidFor(id);
  const base = BASE_LETTER[id];
  const codons = aa ? [...codonTable(STANDARD_CODE).values()].filter((c) => c.aa === aa.one).map((c) => toRna(c.codon)) : [];
  return (
    <Panel id="bio-mol" className="right-panel" title={m.name}>
      <div style={{ position: 'relative', height: 210, flex: '0 0 210px', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.25)' }} aria-label={`${m.name} in 3D`}>
        <Viewport key={m.id} camera={{ position: [0, 0, cameraDistanceFor(m)], fov: 40 }}>
          <MoleculeSceneContents mol={m} display="ball-stick" selected={[]} onPick={() => {}} showLabels={false} />
        </Viewport>
      </div>
      <p className="note" style={{ margin: '4px 0 8px' }}>3D: PubChem3D computed conformer <ProvenanceBadge cls="derived" title="Computed geometry, not experimental" /></p>
      <dl className="kv" aria-label="Molecule facts">
        <KV k="Formula" v={prettyFormula(m.formula)} />
        <KV k="Molecular weight" v={m.molecularWeight} unit="g/mol" sig={6} />
        {aa && <KV k="Symbols (IUPAC-IUB)" v={`${aa.three} · ${aa.one}`} title="IUPAC-IUB Joint Commission on Biochemical Nomenclature (1984), Table 5" />}
        {base && <KV k="Base letter (NHGRI)" v={base} />}
      </dl>
      {aa && (
        <section aria-label="Codons" style={{ marginTop: 8 }}>
          <strong style={{ fontSize: 12 }}>Codons in the standard code ({codons.length})</strong>
          <p style={{ margin: '4px 0', fontFamily: 'var(--mono)', letterSpacing: '0.08em' }}>{codons.join(' ')}</p>
          <p className="note" style={{ margin: 0 }}>From NCBI's Standard Code (transl_table=1). <SourceLinks ids={['ncbi-genetic-codes', 'iupac-iub-1984']} /> <button className="link-btn" onClick={() => setQuery({ tab: 'code', aa: aa.one })}>show in the code table</button></p>
        </section>
      )}
      <EntityBio entity={`molecule:${m.id}`} what={m.name} />
      <button className="chip" style={{ marginTop: 8 }} onClick={() => navigate(`/atomic/molecules/${m.id}`)}>Open in the molecule viewer →</button>
      <RelatedLinks id={`molecule:${m.id}`} limit={4} />
    </Panel>
  );
}

function MoleculeTab({ group }: { group: BioGroup }) {
  const { query } = useRoute();
  const g = GROUPS.find((x) => x.id === group)!;
  const sel = g.ids.includes(query.get('sel') ?? '') ? query.get('sel')! : g.ids[0];
  return (
    <>
      <Panel id="bio-list" className="left-panel" title={g.label}>
        <ol className="life-list" aria-label={`${g.label} list`}>
          {g.ids.map((id) => {
            const aa = aminoAcidFor(id);
            return <li key={id}><button className={`link-btn ${id === sel ? 'active' : ''}`} onClick={() => setQuery({ sel: id })}>{molecule(id).name}</button>{aa && <span className="note"> {aa.three} · {aa.one}</span>}{BASE_LETTER[id] && <span className="note"> {BASE_LETTER[id]}</span>}</li>;
          })}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>{g.label} <ProvenanceBadge cls="observed" title="Molecule records (PubChem), symbols (IUPAC-IUB), text (NHGRI, ChEBI)" /></h1>
          {group === 'amino' && <Quote term="Amino Acids" />}
          {group === 'nucleic' && <><Quote term="Nucleotide" /><Quote term="Base Pair" /></>}
          {group === 'carbs' && <p className="note">Sugars bundled with the molecule viewer. Each description is ChEBI's, as worded by PubChem. Glucose is the fuel the next gates follow into glycolysis and respiration.</p>}
          {group === 'lipids' && <p className="note">Fatty acids and cholesterol bundled with the molecule viewer; each description is ChEBI's. NHGRI's glossary has no lipid entry, and the membranes they form come in Gate 11.5.</p>}
        </div>
        <div className="bio-cards" role="list" aria-label={`${g.label} cards`}>
          {g.ids.map((id) => {
            const m = molecule(id), aa = aminoAcidFor(id);
            return (
              <button key={id} role="listitem" className={`bio-card ${id === sel ? 'active' : ''}`} onClick={() => setQuery({ sel: id })} aria-label={m.name}>
                <span className="bio-card-sym">{aa ? aa.one : BASE_LETTER[id] ?? prettyFormula(m.formula)}</span>
                <span className="bio-card-name">{m.name}</span>
                <span className="note">{aa ? aa.three : prettyFormula(m.formula)} · {m.molecularWeight.toFixed(2)} g/mol</span>
              </button>
            );
          })}
        </div>
      </div>
      <MoleculePanel id={sel} />
    </>
  );
}

const BASES = ['T', 'C', 'A', 'G'];
function CodonTable({ code, highlight, diff }: { code: NcbiCode; highlight: string | null; diff: Set<string> }) {
  const t = codonTable(code);
  return (
    <table className="codon-table" aria-label={`Codon table: ${code.name}`}>
      <thead><tr><th>1st ↓ · 2nd →</th>{BASES.map((b) => <th key={b}>{toRna(b)}</th>)}</tr></thead>
      <tbody>
        {BASES.map((b1) => (
          <tr key={b1}>
            <th>{toRna(b1)}</th>
            {BASES.map((b2) => (
              <td key={b2}>
                {BASES.map((b3) => {
                  const c = t.get(b1 + b2 + b3)!;
                  const aa = aminoAcidByLetter(c.aa);
                  const cls = [c.stop ? 'stop' : '', c.start ? 'start' : '', highlight && c.aa === highlight ? 'hl' : '', diff.has(c.codon) ? 'diff' : ''].join(' ');
                  return (
                    <button key={b3} className={`codon ${cls}`} data-codon={toRna(c.codon)} onClick={() => setQuery({ aa: c.aa === '*' ? null : c.aa })} title={`${toRna(c.codon)}: ${c.stop ? 'stop' : aa?.name}${c.start ? ' · may start translation' : ''}`}>
                      <span className="mono">{toRna(c.codon)}</span> <strong>{c.stop ? 'Stop' : aa?.three}</strong>
                    </button>
                  );
                })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CodeTab() {
  const { query } = useRoute();
  const code = query.get('gc') === '2' ? VERT_MITO_CODE : STANDARD_CODE;
  const other = code === STANDARD_CODE ? VERT_MITO_CODE : STANDARD_CODE;
  const diff = differences(code, other);
  const highlight = query.get('aa');
  const raw = query.get('seq') ?? EXAMPLE_1BNA;
  const frame = Math.min(2, Math.max(0, Number(query.get('frame') ?? 0) || 0));
  const minus = query.get('strand') === '-';
  const { seq, invalid } = cleanSequence(raw);
  const read = minus ? reverseComplement(seq) : seq;
  const tr = translate(read, code, frame);
  const deg = degeneracy(code);
  const hlAa = highlight ? aminoAcidByLetter(highlight) : null;
  return (
    <>
      <Panel id="code-controls" className="left-panel" title="Translate">
        <div role="group" aria-label="Genetic code" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <button className={`chip ${code.id === 1 ? 'active' : ''}`} aria-pressed={code.id === 1} onClick={() => setQuery({ gc: null })}>Standard (1)</button>
          <button className={`chip ${code.id === 2 ? 'active' : ''}`} aria-pressed={code.id === 2} onClick={() => setQuery({ gc: '2' })}>Vertebrate mitochondrial (2)</button>
        </div>
        <label className="note" htmlFor="seq-in">DNA or RNA sequence (5′→3′)</label>
        <textarea id="seq-in" aria-label="Sequence to translate" rows={4} value={raw} onChange={(e) => setQuery({ seq: e.target.value.slice(0, 600) || null })}
          style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: 12, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 8, padding: 6 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
          {[0, 1, 2].map((f) => <button key={f} className={`chip ${frame === f ? 'active' : ''}`} onClick={() => setQuery({ frame: f || null })}>frame {f + 1}</button>)}
          <button className={`chip ${minus ? 'active' : ''}`} aria-pressed={minus} onClick={() => setQuery({ strand: minus ? null : '-' })}>other strand</button>
        </div>
        <button className="chip" onClick={() => setQuery({ seq: null, frame: null, strand: null })}>Example: one strand of 1BNA (not a gene)</button>
        <p className="note">The reading frame decides which triplets are read. A random sequence also “translates”: finding a real gene needs more than the code.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>The genetic code <ProvenanceBadge cls="observed" title="NCBI, The Genetic Codes (Elzanowski & Ostell, updated Sep. 23, 2024)" /></h1>
          <Quote term="Codon" />
          <p className="note">{code.name}: {64 - (deg['*'] ?? 0)} codons specify amino acids and {deg['*'] ?? 0} are stops in this table. {GENETIC_CODES.notes.filter((n) => n.code === code.id).map((n) => `“${n.text}”`).join(' ')} Compiled by {GENETIC_CODES.compiledBy}; last update {GENETIC_CODES.lastUpdate}. <SourceLinks ids={['ncbi-genetic-codes']} /></p>
        </div>
        <CodonTable code={code} highlight={highlight} diff={new Set(diff.map((d) => d.codon))} />
        <p className="note">Red: stop codons. Outlined: codons where translation may start. Amber: codons read differently in {other.name.replace(/^The /, 'the ')} ({diff.map((d) => `${toRna(d.codon)} ${d.a === '*' ? 'Stop' : aminoAcidByLetter(d.a)?.three} here, ${d.b === '*' ? 'Stop' : aminoAcidByLetter(d.b)?.three} there`).join('; ')}).</p>
        <section aria-label="Translation" className="translation">
          <h3 style={{ margin: '10px 0 4px' }}>Translation, frame {frame + 1}{minus ? ', other strand' : ''} <ProvenanceBadge cls="derived" title="Codon-by-codon lookup in the selected NCBI table" /></h3>
          {invalid.length > 0 && <p className="warn-note">Not a base: {invalid.join(', ')} (read as “X”).</p>}
          <p className="mono" style={{ wordBreak: 'break-all', margin: 0 }} aria-label="Codons read">{tr.codons.map((c) => toRna(c.codon)).join(' ')}{tr.trailing && <span className="note"> +{toRna(tr.trailing)}</span>}</p>
          <p className="mono" style={{ wordBreak: 'break-all', fontSize: 16, color: 'var(--accent)', margin: '4px 0' }} aria-label="Protein (one-letter)">{tr.protein || '—'}</p>
          <p className="note" aria-label="Protein (three-letter)">{tr.codons.map((c) => (c.stop ? 'Stop' : aminoAcidByLetter(c.aa)?.three ?? 'X')).join('–') || '—'}</p>
        </section>
        <Quote term="Translation" />
      </div>
      <Panel id="code-detail" className="right-panel" title={hlAa ? hlAa.name : 'Degeneracy'}>
        {hlAa ? (
          <>
            <dl className="kv"><KV k="Symbols" v={`${hlAa.three} · ${hlAa.one}`} /><KV k="Codons in this code" v={deg[hlAa.one]} /></dl>
            <button className="chip" onClick={() => setQuery({ tab: null, sel: hlAa.molecule, aa: null })}>See {hlAa.name} in 3D →</button>
          </>
        ) : <p className="note">Click a codon to highlight every codon for its amino acid.</p>}
        <table className="table-mini" aria-label="Codons per amino acid" style={{ marginTop: 10 }}>
          <thead><tr><th>Amino acid</th><th>codons</th></tr></thead>
          <tbody>{[...AMINO_ACIDS].sort((a, b) => deg[b.one] - deg[a.one] || a.three.localeCompare(b.three)).map((a) => <tr key={a.one} className={a.one === highlight ? 'active' : ''}><td><button className="link-btn" onClick={() => setQuery({ aa: a.one })}>{a.three}</button></td><td>{deg[a.one]}</td></tr>)}
            <tr><td>Stop</td><td>{deg['*']}</td></tr></tbody>
        </table>
        <p className="note">Symbols: IUPAC-IUB (1984). <SourceLinks ids={['iupac-iub-1984']} /></p>
      </Panel>
    </>
  );
}

export default function BiomoleculesView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'amino';
  return (
    <>
      <nav className="view-switch" aria-label="Biomolecule sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'amino' ? null : t, sel: null })}>{label}</button>)}
      </nav>
      {tab === 'code' ? <CodeTab /> : <MoleculeTab group={tab} />}
    </>
  );
}
