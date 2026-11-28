/**
 * Information and encoding — #/engineering/information?t=<text>   (Phase 15, Gate 15.5)
 *
 * Type any text: its characters as Unicode code points, its UTF-8 bytes (built from the bit patterns, checked against
 * the standard's own example), and Shannon's entropy of its letter frequencies against what UTF-8 actually spends.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { formatSig } from '@/core/units/units';
import { CODESPACE, codePoints, hex2, textEntropy, uPlus, utf8, utf8OfCodePoint } from '@/core/computing/information';
import data from '@datasets/engineering/information.json';

const D = data as unknown as { shannon: { source: string; where: string; theorem: string; quote: string; digit: { where: string; quote: string } }; unicode: { source: string; codespace: string; d92: string; example: string; versions: { v: string; date: string; total: number }[]; note: string } };
const SAMPLES = ['abracadabra', 'Voyager → Ψ 銀河 🚀', 'to be or not to be that is the question', 'AAAAAAAAAAAAAAAA'];
const LEN_COL = ['', '#7df9ff', '#5cf2a6', '#f5c76b', '#ff7a90'];

export default function InformationView() {
  const { query } = useRoute();
  const text = (query.get('t') ?? 'Voyager → Ψ 銀河 🚀').slice(0, 200);
  const cps = codePoints(text), bytes = utf8(text), ent = textEntropy(text);
  const latest = D.unicode.versions[D.unicode.versions.length - 1];
  return (
    <>
      <Panel id="info-controls" className="left-panel" title="Some text">
        <textarea aria-label="Text to encode" value={text} onChange={(e) => setQuery({ t: e.target.value || null })} rows={3} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 8, padding: 8, font: 'inherit' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>{SAMPLES.map((s) => <button key={s} className="chip" onClick={() => setQuery({ t: s })}>{s.length > 18 ? `${s.slice(0, 16)}…` : s}</button>)}</div>
        <dl className="kv" aria-label="Encoding values">
          <KV k="Characters (code points)" v={String(cps.length)} />
          <KV k="UTF-8 bytes" v={String(bytes.length)} />
          <KV k="UTF-8 bits per character" v={cps.length ? (bytes.length * 8) / cps.length : 0} sig={3} />
          <KV k="Entropy of the letter mix" v={ent.H} unit="bits per character" sig={3} />
          <KV k="Distinct characters" v={String(ent.distinct)} />
        </dl>
        <p className="note">The entropy treats the text as independent draws from its own letter frequencies; it says how few bits per character a code built on those frequencies alone could average. Real text has more structure than that.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Information and encoding <ProvenanceBadge cls="derived" title="UTF-8 from its bit patterns; Shannon entropy computed" /></h1>
          <p className="note">Shannon (1948), Theorem 2: {D.shannon.theorem}. “{D.shannon.quote}” ({D.shannon.where}) With base-2 logarithms the unit is the bit; “{D.shannon.digit.quote}” ({D.shannon.digit.where}) <SourceLinks ids={[D.shannon.source]} /></p></div>
        <div role="list" aria-label="Characters and their bytes" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cps.slice(0, 60).map((cp, i) => { const b = utf8OfCodePoint(cp); return (
            <div key={i} role="listitem" style={{ border: `1px solid ${LEN_COL[b.length]}`, borderRadius: 8, padding: '4px 8px', minWidth: 54, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{cp === 32 ? '␠' : String.fromCodePoint(cp)}</div>
              <div className="note" style={{ fontSize: 10 }}>{uPlus(cp)}</div>
              <div style={{ fontSize: 11, color: LEN_COL[b.length], fontFamily: 'monospace' }}>{b.map(hex2).join(' ')}</div>
            </div>); })}
        </div>
        <p className="note">Border colour = bytes used: <span style={{ color: LEN_COL[1] }}>1</span>, <span style={{ color: LEN_COL[2] }}>2</span>, <span style={{ color: LEN_COL[3] }}>3</span> or <span style={{ color: LEN_COL[4] }}>4</span>. Unicode's definition: “{D.unicode.d92}”; its own example: “{D.unicode.example}” — reproduced exactly by this page's encoder (tested). <SourceLinks ids={[D.unicode.source]} /></p>
        <table className="table-mini" aria-label="UTF-8 byte patterns">
          <thead><tr><th>Code points</th><th>Bytes</th><th>Bit pattern (x = bits of the code point)</th></tr></thead>
          <tbody>
            <tr><td>U+0000 – U+007F</td><td>1</td><td>0xxxxxxx</td></tr>
            <tr><td>U+0080 – U+07FF</td><td>2</td><td>110xxxxx 10xxxxxx</td></tr>
            <tr><td>U+0800 – U+FFFF (not surrogates)</td><td>3</td><td>1110xxxx 10xxxxxx 10xxxxxx</td></tr>
            <tr><td>U+10000 – U+10FFFF</td><td>4</td><td>11110xxx 10xxxxxx 10xxxxxx 10xxxxxx</td></tr>
          </tbody>
        </table>
        <p className="note">Table drawn for this page from the encoding it implements.</p>
      </div>
      <Panel id="info-detail" className="right-panel" title="How many characters">
        <dl className="kv" aria-label="Unicode values">
          <KV k="Codespace" v={`0 – 10FFFF₁₆ (${CODESPACE.toLocaleString('en-US')} code points)`} />
          {D.unicode.versions.map((v) => <KV key={v.v} k={`Unicode ${v.v} (${v.date})`} v={v.total.toLocaleString('en-US')} unit="characters" />)}
        </dl>
        <p className="note">“{D.unicode.codespace}” {D.unicode.note} Unicode {latest.v} assigns {formatSig((latest.total / CODESPACE) * 100, 3)} % of the codespace. <SourceLinks ids={[D.unicode.source]} /></p>
        <button className="chip" onClick={() => navigate('/engineering')}>Bits and bytes →</button>
        <RelatedLinks id="instrument:information" limit={3} />
      </Panel>
    </>
  );
}
