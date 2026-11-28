/**
 * Model checks — #/meteorology/validation   (Phase 26)
 * Recomputes every reference check in this browser with the app's own code and shows it beside the printed value.
 */
import { useMemo } from 'react';
import { navigate } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { CHECKS, run } from './checks';

export default function ValidationView() {
  const rows = useMemo(() => CHECKS.map((c) => ({ c, r: run(c) })), []);
  const agree = rows.filter((x) => x.c.expect === 'agree'), findings = rows.filter((x) => x.c.expect === 'finding');
  const ok = rows.filter((x) => x.r.ok).length;
  const areas = [...new Set(CHECKS.map((c) => c.area))];
  return (
    <>
      <Panel id="va-s" className="left-panel" title="Summary">
        <dl className="kv" aria-label="Check summary">
          <KV k="Checks run here, now" v={rows.length} />
          <KV k="Agree within tolerance" v={`${agree.filter((x) => x.r.ok).length} of ${agree.length}`} />
          <KV k="Source disagreements still present" v={`${findings.filter((x) => x.r.ok).length} of ${findings.length}`} />
          <KV k="Status" v={ok === rows.length ? 'all as expected' : `${rows.length - ok} unexpected`} />
        </dl>
        <p className="note">The App column is computed by the same code the views use; the printed value comes from the cited source. The same checks run in the automated tests.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Model checks <ProvenanceBadge cls="derived" title="Recomputed in your browser and compared with printed reference values" /><DepthSwitch /></h1>
          <p className="note">Simple models are only useful if they reproduce what is measured where they should. These are the reference examples the Meteorology section is held to — and {findings.length === 1 ? 'one place' : `${findings.length} places`} where a source disagrees with itself.</p></div>
        {areas.map((a) => (
          <div key={a}>
            <div className="section-title">{a}</div>
            <table className="table-mini" aria-label={`Checks: ${a}`} style={{ fontSize: 12, width: '100%' }}>
              <thead><tr><th>What</th><th>App</th><th>Printed</th><th>Difference</th><th></th></tr></thead>
              <tbody>{rows.filter((x) => x.c.area === a).map(({ c, r }) => (
                <tr key={c.id}>
                  <td><button className="chip" style={{ textAlign: 'left', whiteSpace: 'normal' }} onClick={() => navigate(c.route)}>{c.what}</button> <SourceLinks ids={c.sources} /></td>
                  <td>{formatSig(r.value, 6)} {c.unit}</td>
                  <td>{c.printedText}</td>
                  <td>{r.diff < 1e-9 ? '0' : c.abs ? `${formatSig(r.diff, 2)} ${c.unit}` : `${formatSig(r.diff * 100, 2)} %`} (tolerance {c.abs ? `${c.tol} ${c.unit}` : `${c.tol * 100} %`})</td>
                  <td aria-label={`Status ${c.id}`} style={{ color: r.ok ? '#5cf2a6' : '#ff7a90' }}>{c.expect === 'finding' ? (r.ok ? '⚑ source disagrees' : '✗ finding gone') : r.ok ? '✓' : '✗'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ))}
        <AtDepth level="research">
          <p className="note">Tolerances reflect the models’ stated simplifications: gravity ignores oblateness (3 %), sunlight uses the mean distance (2 %), scale height uses one temperature (6 %). A “finding” row passes when the disagreement in the source is still there: NSSDCA’s Pluto black-body temperature (37.5 K) does not follow from its own irradiance and albedo.</p>
        </AtDepth>
      </div>
    </>
  );
}
