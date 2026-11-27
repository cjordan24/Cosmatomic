/**
 * RF/wireless atlas — #/spectral/rf?tab=atlas|links&sel=<entry id>&R=<m>&q=<Hz>   (Phase 9, Gate 9.2)
 *
 * Real allocations and carriers from public primary documents (U.S. 47 CFR, GPS interface specifications, JPL
 * DESCANSO) on the ITU-R V.431 band axis, each with its verbatim source text; published link budgets (Voyager 2,
 * GPS) re-derived with the Friis equation of Gate 9.1.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { dB, freeSpacePathLoss } from '@/core/physics/em/antennas';
import { getConvention } from '@/modes/spectral/atlas/bands';
import {
  GPS, GROUP_COLOR, GROUP_LABEL, RF_ENTRIES, RF_LINKS, RF_RETRIEVED, centre, channelFrequency, checkLink, getRfEntry, ituBand, lambdaOf, slantRange, type RfEntry, type RfGroup,
} from './rf';

type Tab = 'atlas' | 'links';
const TABS: [Tab, string][] = [['atlas', 'Allocations'], ['links', 'Link budgets']];
const GROUPS: RfGroup[] = ['broadcast', 'navigation', 'unlicensed', 'ism', 'deep-space'];
const H = CONSTANTS.h.value, E = CONSTANTS.e.value, AU = 149_597_870_700, RE = CONSTANTS.ReEarth.value;
const F_MIN = 1e5, F_MAX = 3e11;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };

export function fmtHz(f: number, sig = 6) { return f >= 1e9 ? `${formatSig(f / 1e9, sig)} GHz` : f >= 1e6 ? `${formatSig(f / 1e6, sig)} MHz` : `${formatSig(f / 1e3, sig)} kHz`; }
function fmtLen(m: number) { const a = Math.abs(m); return a >= 1000 ? `${formatSig(m / 1000, 4)} km` : a >= 1 ? `${formatSig(m, 4)} m` : a >= 0.01 ? `${formatSig(m * 100, 4)} cm` : `${formatSig(m * 1000, 4)} mm`; }
const span = (e: RfEntry) => (e.fLo !== undefined && e.fHi !== undefined ? `${fmtHz(e.fLo)} – ${fmtHz(e.fHi)}` : fmtHz(e.f!));

// ------------------------------------------------------------------ frequency chart
const VB_W = 760, X0 = 70, W = 670, ROW = 30, TOP = 46;
const xOf = (f: number) => X0 + ((Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN))) * W;

function FrequencyChart({ sel, q }: { sel: RfEntry | null; q: number | null }) {
  const itu = (getConvention('itu-r-v431')?.bands ?? []).filter((b) => b.symbol && b.hi > F_MIN && b.lo < F_MAX);
  const Hh = TOP + GROUPS.length * ROW + 30;
  const decades = Array.from({ length: 7 }, (_, i) => 10 ** (5 + i)).filter((f) => f <= F_MAX);
  return (
    <svg viewBox={`0 0 ${VB_W} ${Hh}`} role="img" aria-label="Radio allocations on a frequency axis" style={{ width: '100%', maxWidth: 1000, display: 'block' }}>
      {itu.map((b, i) => { const x1 = xOf(Math.max(b.lo, F_MIN)), x2 = xOf(Math.min(b.hi, F_MAX)); return (
        <g key={b.id}><rect x={x1} y={8} width={x2 - x1} height={22} fill={i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'} stroke="var(--line)" />
          <text x={(x1 + x2) / 2} y={23} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text)' }}>{b.symbol}</text></g>); })}
      <text x={4} y={23} style={{ fontSize: 9.5, fill: 'var(--text-dim)' }}>ITU-R V.431</text>
      {GROUPS.map((g, gi) => (
        <g key={g}>
          <text x={4} y={TOP + gi * ROW + 18} style={{ fontSize: 9.5, fill: GROUP_COLOR[g] }}>{g === 'deep-space' ? 'deep space' : g}</text>
          <line x1={X0} x2={X0 + W} y1={TOP + gi * ROW + 26} y2={TOP + gi * ROW + 26} stroke="var(--line)" />
          {RF_ENTRIES.filter((e) => e.group === g).map((e) => {
            const on = sel?.id === e.id;
            const y = TOP + gi * ROW + 6;
            const lo = e.fLo ?? e.f!, hi = e.fHi ?? e.f!;
            const x1 = xOf(lo), x2 = Math.max(xOf(hi), x1 + 2.5);
            return (
              <g key={e.id} style={{ cursor: 'pointer' }} onClick={() => setQuery({ sel: e.id })}>
                <rect x={x1 - (e.kind === 'carrier' ? 1 : 0)} y={y} width={x2 - x1} height={18} fill={GROUP_COLOR[g]} fillOpacity={on ? 0.95 : 0.55} stroke={on ? '#fff' : 'none'} strokeWidth={1.5}><title>{`${e.name}: ${span(e)} (${e.ref})`}</title></rect>
              </g>
            );
          })}
        </g>
      ))}
      {decades.map((f) => <g key={f}><line x1={xOf(f)} x2={xOf(f)} y1={30} y2={Hh - 22} stroke="var(--line)" strokeDasharray="2 4" /><text x={xOf(f)} y={Hh - 8} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-dim)' }}>{fmtHz(f, 3)}</text></g>)}
      {q !== null && q >= F_MIN && q <= F_MAX && <line x1={xOf(q)} x2={xOf(q)} y1={6} y2={Hh - 22} stroke="#fff" strokeWidth={1.5}><title>{fmtHz(q)}</title></line>}
    </svg>
  );
}

function EntryDetail({ e, R }: { e: RfEntry; R: number }) {
  const f = centre(e), lam = lambdaOf(f), band = ituBand(f);
  const fspl = dB(freeSpacePathLoss(R, lam));
  return (
    <>
      <div className="section-title" style={{ color: GROUP_COLOR[e.group] }}>{e.name}</div>
      <p className="note" style={{ margin: '2px 0 6px' }}>{GROUP_LABEL[e.group]} · <ProvenanceBadge cls="observed" title="Frequencies as published in the cited regulation or specification (defined values)" /></p>
      <dl className="kv" aria-label="Selected allocation">
        <KV k={e.kind === 'carrier' ? 'carrier frequency' : 'band'} v={span(e)} />
        {e.tolerance !== undefined && <KV k="tolerance" v={`± ${fmtHz(e.tolerance, 4)}`} />}
        {e.channels && <KV k="channels" v={`${e.channels.count} carriers, ${fmtHz(e.channels.first, 5)} … ${fmtHz(e.channels.last, 5)} every ${fmtHz(e.channels.step, 3)}`} />}
        <KV k={e.kind === 'carrier' ? 'wavelength λ = c/f' : 'wavelength at band centre'} v={fmtLen(lam)} />
        <KV k="half-wave dipole length λ/2" v={fmtLen(lam / 2)} title="Thin-wire model of Gate 9.1" />
        <KV k="photon energy hf" v={(H * f) / E} unit="eV" sig={4} />
        <KV k="ITU-R V.431 band" v={band ? `${band.symbol} (band ${band.number})` : null} />
        <KV k={`free-space path loss at ${fmtLen(R)}`} v={fspl} unit="dB" sig={5} />
      </dl>
      <blockquote className="note" style={{ borderLeft: `3px solid ${GROUP_COLOR[e.group]}`, margin: '8px 0', padding: '2px 8px', fontSize: 11 }} aria-label="Source text">“{e.quote}” <br /><span style={{ color: 'var(--text-faint)' }}>— {e.ref}</span> <SourceLinks ids={[e.source]} /></blockquote>
      {e.note && <p className="note" style={{ fontSize: 10.5 }}>{e.note}</p>}
      {e.channels && (
        <details style={{ fontSize: 11 }}><summary>All {e.channels.count} carriers</summary>
          <p className="note" style={{ fontFamily: 'var(--mono)', fontSize: 10, lineHeight: 1.6 }}>{Array.from({ length: e.channels.count }, (_, n) => formatSig(channelFrequency(e, n) / (e.channels!.step >= 1e5 ? 1e6 : 1e3), 5)).join(' · ')} {e.channels.step >= 1e5 ? 'MHz' : 'kHz'}</p></details>
      )}
      <div className="chip-row" style={{ gap: 6, marginTop: 6 }}>
        <button className="chip" onClick={() => navigate(`/spectral/antennas?tab=link&f=${Number(f.toPrecision(7))}&R=${Number(R.toPrecision(4))}`)}>Friis link at this frequency →</button>
        <button className="chip" onClick={() => navigate(`/spectral?lambda=${Number(lam.toPrecision(6))}`)}>In the spectrum atlas →</button>
      </div>
    </>
  );
}

function AtlasTab() {
  const { query } = useRoute();
  const sel = getRfEntry(query.get('sel') ?? '') ?? getRfEntry('fm-broadcast')!;
  const R = num(query, 'R', 1000, 1, 1e13);
  const q = query.has('q') ? num(query, 'q', 1e8, F_MIN, F_MAX) : null;
  const hits = q !== null ? RF_ENTRIES.filter((e) => (e.fLo !== undefined && e.fHi !== undefined ? q >= e.fLo && q <= e.fHi : Math.abs(q - e.f!) < 1)) : [];
  const qBand = q !== null ? ituBand(q) : null;
  return (
    <>
      <Panel id="rf-list" className="left-panel" title="Allocations">
        <p className="note" style={{ fontSize: 10.5 }}>U.S. rules (FCC, 47 CFR) and system specifications as published; other countries allocate differently. Read {RF_RETRIEVED}.</p>
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="section-title" style={{ color: GROUP_COLOR[g] }}>{GROUP_LABEL[g]}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 6px' }} aria-label={GROUP_LABEL[g]}>
              {RF_ENTRIES.filter((e) => e.group === g).map((e) => <li key={e.id}><button className={`link-btn ${sel.id === e.id ? 'active' : ''}`} style={{ fontWeight: sel.id === e.id ? 700 : 400, fontSize: 12 }} onClick={() => setQuery({ sel: e.id })}>{e.name}</button> <span className="note" style={{ fontSize: 10 }}>{span(e)}</span></li>)}
            </ul>
          </div>
        ))}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Radio spectrum in use <ProvenanceBadge cls="observed" title="Allocations and carrier frequencies as defined in the cited documents" /></h1>
          <p className="note">Broadcast bands, unlicensed and ISM bands, GPS carriers and Voyager's deep-space links on one logarithmic frequency axis, under the ITU-R V.431 band names. Each entry quotes the rule or specification it comes from. Click a bar to read it. <SourceLinks ids={['ecfr-47-cfr', 'is-gps-200n', 'is-gps-705j', 'ludwig-taylor-2002', 'itu-r-v431']} /></p>
        </div>
        <FrequencyChart sel={sel} q={q} />
        <div className="slider-row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
          <span>Find a frequency</span>
          <input type="range" min={Math.log10(F_MIN)} max={Math.log10(F_MAX)} step={0.001} value={Math.log10(q ?? 1e8)} aria-label="Frequency to look up" onChange={(e) => setQuery({ q: Number((10 ** Number(e.target.value)).toPrecision(5)) })} style={{ flex: 1 }} />
          <span>{q !== null ? fmtHz(q, 5) : '—'}</span>
        </div>
        {q !== null && <p className="note" role="status" aria-label="Frequency lookup">{fmtHz(q, 5)} (λ = {fmtLen(lambdaOf(q))}) lies in ITU-R band {qBand ? `${qBand.symbol} (${qBand.number})` : 'unknown'}; {hits.length ? `inside ${hits.map((h) => h.name).join(', ')}` : 'not inside any bundled allocation'}.</p>}
        <label className="slider-row"><span style={{ minWidth: 150 }}>path-loss distance</span><input type="range" min={0} max={13} step={0.01} value={Math.log10(R)} aria-label="Distance for path loss" onChange={(e) => setQuery({ R: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{fmtLen(R)}</span></label>
        <p className="note" style={{ fontSize: 10.5 }}>Free-space path loss (4πR/λ)² from Ellingson eq. 10.167; it ignores the ground, buildings and the atmosphere. Atmospheric absorption (e.g. by water vapour and oxygen at tens of GHz) is not bundled. <SourceLinks ids={['ellingson-2020-vol2']} /></p>
      </div>
      <Panel id="rf-detail" className="right-panel" title="Allocation">
        <EntryDetail e={sel} R={R} />
        <RelatedLinks id={sel.group === 'navigation' ? 'context:gps' : sel.group === 'deep-space' ? 'body:voyager-2' : 'context:radio-allocations'} />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ link budgets
function LinksTab() {
  const { query } = useRoute();
  const el = num(query, 'el', 5, 0, 90);
  const gpsL1 = getRfEntry('gps-l1')!;
  const rng = slantRange(RE, GPS.altitudeKm * 1e3, (el * Math.PI) / 180);
  const fsplGps = dB(freeSpacePathLoss(rng, lambdaOf(gpsL1.f!)));
  const eirp = GPS.minReceivedDbw.L1CA - GPS.receiveAntennaDbi + fsplGps;
  const ratio = (2113.3125 * 880) / 221;
  return (
    <>
      <Panel id="rf-links-left" className="left-panel" title="Published budgets">
        <p className="note" style={{ fontSize: 10.5 }}>A design control table adds every gain and loss of a link in decibels. Here each published table is summed again, and its space loss is recomputed from the stated range and frequency with the Friis path loss (4πR/λ)². <SourceLinks ids={['ludwig-taylor-2002', 'ellingson-2020-vol2']} /></p>
        <dl className="kv" aria-label="Coherent turnaround">
          <KV k="Voyager 2 uplink" v="2113.312500 MHz" />
          <KV k="× 880/221 (X-band turnaround)" v={`${ratio.toFixed(6)} MHz`} title="Ludwig & Taylor (2002) §2.2.1: the downlink/uplink ratio is 880/221 at X-band" />
          <KV k="published X-band downlink" v="8415.000000 MHz" />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Link budgets <ProvenanceBadge cls="observed" title="Published design values (1996 predictions); the recomputation is derived" /></h1>
          <p className="note">Voyager 2 talking to the 70 m antenna DSS-43 at Canberra at 48.62 au on 1 January 1996, from the design control tables of JPL's DESCANSO summary. These are predictions, not measurements. Each table lists every item's design value with favourable and adverse tolerances, and prints the received power as the mean, so the plain sum of design values can differ from it by a tenth of a dB or two (the uplink's 70 m antenna gain is 62.10 dBi design, 61.9 dBi mean).</p>
        </div>
        {RF_LINKS.map((l) => {
          const c = checkLink(l);
          const curve = Array.from({ length: 70 }, (_, i) => { const au = 10 ** (i / 30); const r = au * AU; return [au, c.sum + c.publishedSpace - dB(freeSpacePathLoss(r, lambdaOf(l.f)))] as [number, number]; });
          return (
            <section key={l.id} aria-label={l.name} style={{ marginBottom: 14 }}>
              <div className="section-title">{l.name} <span className="note">({l.ref})</span></div>
              <table className="table-mini" aria-label={`Budget ${l.id}`} style={{ maxWidth: 640 }}>
                <thead><tr><th>item</th><th>published</th></tr></thead>
                <tbody>
                  {l.items.map((i) => <tr key={i.label}><td>{i.label}</td><td>{i.value > 0 ? '+' : ''}{i.value} {i.unit}</td></tr>)}
                  <tr><td><strong>sum of the design values</strong></td><td data-reading={`${l.id} sum`}><strong>{formatSig(c.sum, 5)} dBm</strong></td></tr>
                  <tr><td>published received power (mean)</td><td>{l.receivedDbm} dBm</td></tr>
                  <tr><td>space loss recomputed, (4πR/λ)² at {formatSig(l.f / 1e6, 6)} MHz, {formatSig(l.rangeKm, 4)} km</td><td data-reading={`${l.id} space loss`}>−{formatSig(c.spaceLossDb, 5)} dB</td></tr>
                  <tr><td>received power with the recomputed space loss</td><td data-reading={`${l.id} recomputed`}>{formatSig(c.recomputed, 5)} dBm</td></tr>
                  <tr><td>noise spectral density (T_sys = {l.systemTempK} K)</td><td>{l.noiseDbmHz} dBm/Hz</td></tr>
                  <tr><td>P_t/N₀ = received − noise</td><td>{formatSig(c.ptN0, 4)} dB-Hz (published {l.ptN0})</td></tr>
                </tbody>
              </table>
              <LinePlot ariaLabel={`Received power against distance, ${l.id}`} width={640} height={190} xLog xDomain={[1, 200]} xLabel="distance (au)" yLabel="received power (dBm)" series={[{ points: curve, color: '#b18cff', label: 'same link, Friis' }]} markers={[{ x: l.rangeAu, y: l.receivedDbm, label: `${l.receivedDbm} dBm` }]} legend="tr" />
            </section>
          );
        })}
      </div>
      <Panel id="rf-links-gps" className="right-panel" title="GPS from orbit">
        <p className="note" style={{ fontSize: 10.5 }}>GPS satellites orbit at about {GPS.altitudeKm.toLocaleString('en-US')} km. IS-GPS-200N guarantees at least {GPS.minReceivedDbw.L1CA} dBW of L1 C/A signal at a {GPS.receiveAntennaDbi} dBi antenna near the ground above 5° elevation. With the Friis path loss over the line-of-sight distance, that sets the smallest transmitted EIRP the specification implies. <SourceLinks ids={[...GPS.sources, GPS.source]} /></p>
        <label className="slider-row"><span style={{ minWidth: 80 }}>elevation</span><input type="range" min={0} max={90} step={1} value={el} aria-label="Satellite elevation" onChange={(e) => setQuery({ el: e.target.value })} /><span>{el}°</span></label>
        <dl className="kv" aria-label="GPS link">
          <KV k="line-of-sight distance" v={rng / 1e3} unit="km" sig={5} title="Spherical Earth of IAU nominal equatorial radius 6378.1 km; altitude approximate" />
          <KV k="free-space path loss at 1575.42 MHz" v={fsplGps} unit="dB" sig={5} />
          <KV k="minimum received power (spec)" v={GPS.minReceivedDbw.L1CA} unit="dBW" />
          <KV k="implied minimum EIRP" v={eirp} unit="dBW" sig={4} />
          <KV k="= implied minimum EIRP" v={10 ** (eirp / 10)} unit="W" sig={3} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Derived: EIRP = P_R − G_R + L_p, in free space. The specification's other conditions (a linearly polarised receiving antenna at its worst orientation, the atmosphere) are not modelled, so this is only the free-space part of the budget. <ProvenanceBadge cls="derived" /></p>
        <RelatedLinks id="context:gps" />
      </Panel>
    </>
  );
}

export default function RfView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'atlas';
  return (
    <>
      <nav className="view-switch" aria-label="RF atlas sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'atlas' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'links' ? <LinksTab /> : <AtlasTab />}
    </>
  );
}
