/**
 * Networks — #/engineering/network?tab=packet|handshake|capacity   (Phase 15, Gate 15.6)
 *
 *  packet     a real IPv4 header (RFC 791) built from editable fields, its checksum, and its trip through routers
 *             that each decrease the Time to Live and recompute the checksum until the datagram is destroyed
 *  handshake  TCP's three-way handshake, RFC 9293 Figure 6, stepped line by line with the RFC's own explanation
 *  capacity   Shannon's Theorem 17: the most bits per second a band W can carry at a given signal-to-noise ratio
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { dbToRatio, forward, ipv4Header, shannonCapacity, verifies, type Ipv4 } from '@/core/computing/network';
import { hex2 } from '@/core/computing/information';
import data from '@datasets/engineering/network.json';

const D = data as unknown as {
  rfc791: { source: string; fields: { name: string; bits: number }[]; ihl: string; length: string; ttl: string; checksum: string; recompute: string };
  rfc9293: { source: string; intro: string; lines: string[]; caption: string; explain: string[]; why: string };
  shannon: { source: string; where: string; theorem: string; meaning: string };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65';
const FIELD_COL = ['#7df9ff', '#7df9ff', '#9aa6c8', '#5cf2a6', '#b18cff', '#b18cff', '#b18cff', '#f5c76b', '#9aa6c8', '#ff7a90', '#ff8a65', '#ff8a65'];
const fmtRate = (r: number) => (r >= 1e9 ? `${formatSig(r / 1e9, 3)} Gbit/s` : r >= 1e6 ? `${formatSig(r / 1e6, 3)} Mbit/s` : r >= 1e3 ? `${formatSig(r / 1e3, 3)} kbit/s` : `${formatSig(r, 3)} bit/s`);

function PacketTab() {
  const { query } = useRoute();
  const ttl = Math.round(num(query, 'ttl', 4, 1, 64)), hops = Math.round(num(query, 'hops', 6, 1, 20));
  const h: Ipv4 = { tos: 0, totalLength: 60, id: 0x1c46, flags: 2, fragOffset: 0, ttl, protocol: 6, src: [192, 168, 0, 1], dst: [10, 0, 0, 7] };
  const b = ipv4Header(h), trip = forward(h, hops);
  // field boundaries in bits → which byte belongs to which field (for colouring)
  const owner = (byteIdx: number) => { let bit = 0; for (let f = 0; f < D.rfc791.fields.length; f++) { bit += D.rfc791.fields[f].bits; if (byteIdx * 8 < bit) return f; } return 11; };
  return (
    <>
      <Panel id="packet-controls" className="left-panel" title="One datagram">
        <label className="slider-row"><span style={{ minWidth: 90 }}>Time to Live</span><input type="range" min={1} max={64} step={1} value={ttl} aria-label="Time to Live" onChange={(e) => setQuery({ ttl: e.target.value })} /><span>{ttl}</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>routers</span><input type="range" min={1} max={20} step={1} value={hops} aria-label="Routers on the path" onChange={(e) => setQuery({ hops: e.target.value })} /><span>{hops}</span></label>
        <dl className="kv" aria-label="Packet values">
          <KV k="Header length" v={`${b.length} octets (IHL 5 × 32 bits)`} />
          <KV k="Checksum" v={`0x${hex2(b[10])}${hex2(b[11])}`} />
          <KV k="Verifies" v={verifies(b) ? 'yes' : 'no'} />
          <KV k="Fate" v={trip[trip.length - 1].destroyed ? `destroyed at router ${trip[trip.length - 1].hop}` : `delivered after ${hops} routers`} />
        </dl>
        <p className="note">Addresses, identification and protocol number are example values.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A packet <ProvenanceBadge cls="derived" title="RFC 791 header built and checksummed" /></h1>
          <p className="note">RFC 791: “{D.rfc791.ihl}” “{D.rfc791.checksum}” “{D.rfc791.recompute}” <SourceLinks ids={[D.rfc791.source]} /></p></div>
        <div role="grid" aria-label="Header octets" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, maxWidth: 520 }}>
          {b.map((x, i) => <div key={i} role="gridcell" title={D.rfc791.fields[owner(i)].name} style={{ border: `1px solid ${FIELD_COL[owner(i)]}`, borderRadius: 6, padding: '4px 6px', fontFamily: 'monospace', fontSize: 13, color: FIELD_COL[owner(i)] }}>{hex2(x)} <span className="note" style={{ fontSize: 10 }}>{D.rfc791.fields[owner(i)].name}</span></div>)}
        </div>
        <h3 style={{ margin: '14px 0 6px' }}>Through the routers</h3>
        <ol className="life-list" aria-label="Hops">{trip.map((t) => <li key={t.hop}><span style={{ color: t.destroyed ? '#ff7a90' : ON }}>router {t.hop}</span> <span className="note">TTL {t.ttl} · checksum 0x{hex2(t.header[10])}{hex2(t.header[11])} · {t.destroyed ? 'destroyed' : 'forwarded'}</span></li>)}</ol>
        <p className="note">RFC 791: “{D.rfc791.ttl}” <SourceLinks ids={[D.rfc791.source]} /></p>
      </div>
      <Panel id="packet-detail" className="right-panel" title="Fields">
        <table className="table-mini" aria-label="IPv4 header fields"><thead><tr><th>Field</th><th>Bits</th></tr></thead>
          <tbody>{D.rfc791.fields.map((f, i) => <tr key={f.name}><td style={{ color: FIELD_COL[i] }}>{f.name}</td><td>{f.bits}</td></tr>)}</tbody></table>
        <p className="note">“{D.rfc791.length}”</p>
        <RelatedLinks id="instrument:network" limit={3} />
      </Panel>
    </>
  );
}

function HandshakeTab() {
  const { query } = useRoute();
  const line = Math.round(num(query, 'l', 1, 1, 5));
  const R = D.rfc9293;
  const explain = line === 2 ? R.explain[0] : line === 3 ? R.explain[1] : line >= 4 ? `${R.explain[2]} ${line === 5 ? R.explain[3] : ''}` : R.intro;
  return (
    <>
      <Panel id="hs-controls" className="left-panel" title="TCP's handshake">
        <div className="chip-row" role="group" aria-label="Handshake lines">{[1, 2, 3, 4, 5].map((l) => <button key={l} className={`chip ${l === line ? 'active' : ''}`} aria-pressed={l === line} onClick={() => setQuery({ l: String(l) })}>Line {l}</button>)}</div>
        <p className="note">“{R.why}”</p>
        <p className="note"><SourceLinks ids={[R.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Opening a connection <ProvenanceBadge cls="observed" title="RFC 9293 Figure 6, unmodified" /></h1>
          <p className="note">“{R.intro}” <SourceLinks ids={[R.source]} /></p></div>
        <pre aria-label="Figure 6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, overflowX: 'auto' }}>
          {R.lines.map((l, i) => <div key={i} style={{ color: i === 0 ? 'var(--text-dim)' : i === line ? ON : i < line ? 'var(--text)' : 'var(--text-faint)', fontWeight: i === line ? 700 : 400 }}>{l}</div>)}
          <div style={{ color: 'var(--text-dim)', marginTop: 8 }}>  {R.caption}</div>
        </pre>
        <blockquote className="quote" aria-label="What happens on this line">“{explain.trim()}” <SourceLinks ids={[R.source]} /></blockquote>
      </div>
      <Panel id="hs-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: null })}>The packet that carries it →</button>
        <RelatedLinks id="instrument:network" limit={3} />
      </Panel>
    </>
  );
}

function CapacityTab() {
  const { query } = useRoute();
  const lW = num(query, 'w', Math.log10(20e6), 2, 10), W = 10 ** lW, db = num(query, 'snr', 25, -10, 60);
  const C = shannonCapacity(W, dbToRatio(db));
  const pts = Array.from({ length: 141 }, (_, i) => { const d = -10 + i * 0.5; return [d, shannonCapacity(W, dbToRatio(d)) / W] as [number, number]; });
  return (
    <>
      <Panel id="cap-controls" className="left-panel" title="A channel">
        <label className="slider-row"><span style={{ minWidth: 80 }}>bandwidth W</span><input type="range" min={2} max={10} step={0.01} value={lW} aria-label="Bandwidth (log)" onChange={(e) => setQuery({ w: e.target.value })} /><span>{W >= 1e6 ? `${formatSig(W / 1e6, 3)} MHz` : W >= 1e3 ? `${formatSig(W / 1e3, 3)} kHz` : `${formatSig(W, 3)} Hz`}</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>signal / noise</span><input type="range" min={-10} max={60} step={0.5} value={db} aria-label="Signal to noise ratio in dB" onChange={(e) => setQuery({ snr: e.target.value })} /><span>{db} dB</span></label>
        <dl className="kv" aria-label="Capacity values"><KV k="P / N" v={dbToRatio(db)} sig={3} /><KV k="Capacity C" v={fmtRate(C)} /><KV k="Bits per hertz" v={C / W} sig={3} /></dl>
        <p className="note">(P + N)/N is written here as 1 + P/N; signal-to-noise in decibels is 10 log₁₀ (P/N).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>How much a channel can carry <ProvenanceBadge cls="derived" title="Shannon's Theorem 17 evaluated" /></h1>
          <p className="note">Shannon (1948), {D.shannon.where}: “{D.shannon.theorem}” “{D.shannon.meaning}” <SourceLinks ids={[D.shannon.source]} /></p></div>
        <LinePlot ariaLabel="Capacity per hertz against signal to noise" width={600} height={280} xLabel="signal-to-noise ratio (dB)" yLabel="capacity per hertz (bit/s/Hz)" series={[{ points: pts, color: ON, label: 'C / W = log₂ (1 + P/N)' }]} markers={[{ x: db, y: C / W, color: '#f5c76b' }]} />
        <p className="note">Wider bands carry proportionally more; more power helps only logarithmically — roughly one extra bit per second per hertz for every doubling of the signal at high signal-to-noise.</p>
      </div>
      <Panel id="cap-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/spectral/modulation')}>Modulation in Spectral →</button>
        <button className="chip" onClick={() => navigate('/spectral/rf')}>Radio links →</button>
        <RelatedLinks id="instrument:network" limit={3} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['packet', 'A packet'], ['handshake', 'Handshake'], ['capacity', 'Capacity']];
export default function NetworkView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'packet';
  return (
    <>
      <nav className="view-switch" aria-label="Network sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'packet' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'handshake' ? <HandshakeTab /> : tab === 'capacity' ? <CapacityTab /> : <PacketTab />}
    </>
  );
}
