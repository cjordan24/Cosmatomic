/**
 * In-browser PubChem PUG REST client (CORS-enabled by NCBI).
 *  - request queue: ≤ 4 requests/second (NCBI policy ≤ 5/s), backs off when the
 *    X-Throttling-Control header reports Red/Black status
 *  - IndexedDB response cache (30 days) so repeat lookups never hit the network
 *  - explicit "no 3D conformer" state instead of inventing coordinates
 */
import { idbGet, idbSet } from '@/shared/idb';
import { hillFormula, type MolAtom, type MolBond, type MoleculeRecord } from './molecules';

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const TTL_MS = 30 * 86_400_000;
const MIN_INTERVAL = 250;

let last = 0;
let chain: Promise<unknown> = Promise.resolve();
let backoffUntil = 0;

export class PubChemError extends Error {
  constructor(msg: string, readonly kind: 'not-found' | 'no-3d' | 'network' | 'throttled') { super(msg); }
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const cached = await idbGet<{ t: number; body: T | null; status: number }>('http', url);
  if (cached && Date.now() - cached.t < TTL_MS) {
    if (cached.status === 404) throw new PubChemError('Not found in PubChem', 'not-found');
    return cached.body as T;
  }
  const run = async () => {
    const wait = Math.max(last + MIN_INTERVAL, backoffUntil) - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    let res: Response;
    try { res = await fetch(url); } catch { throw new PubChemError('Network error contacting PubChem', 'network'); }
    const throttle = res.headers.get('X-Throttling-Control') ?? '';
    if (/\b(Red|Black)\b/.test(throttle)) backoffUntil = Date.now() + 5000;
    if (res.status === 404) { await idbSet('http', url, { t: Date.now(), body: null, status: 404 }); throw new PubChemError('Not found in PubChem', 'not-found'); }
    if (res.status === 503 || res.status === 429) { backoffUntil = Date.now() + 10000; throw new PubChemError('PubChem is busy — try again shortly', 'throttled'); }
    if (!res.ok) throw new PubChemError(`PubChem HTTP ${res.status}`, 'network');
    const body = (await res.json()) as T;
    await idbSet('http', url, { t: Date.now(), body, status: 200 });
    return body;
  };
  const p = chain.then(run, run);
  chain = p.catch(() => undefined);
  return p as Promise<T>;
}

export interface SearchHit { cid: number; title: string; formula: string; weight: number }

/** Search by name/synonym, then by molecular formula if the query looks like one. */
export async function searchPubChem(query: string, max = 12): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  let cids: number[] = [];
  try {
    cids = (await getJson<{ IdentifierList: { CID: number[] } }>(`/compound/name/${encodeURIComponent(q)}/cids/JSON`)).IdentifierList.CID;
  } catch (e) { if ((e as PubChemError).kind !== 'not-found') throw e; }
  if (!cids.length && /^([A-Z][a-z]?\d*)+$/.test(q)) {
    try {
      cids = (await getJson<{ IdentifierList: { CID: number[] } }>(`/compound/fastformula/${encodeURIComponent(q)}/cids/JSON?MaxRecords=${max}`)).IdentifierList.CID;
    } catch (e) { if ((e as PubChemError).kind !== 'not-found') throw e; }
  }
  if (!cids.length) return [];
  const props = await getJson<{ PropertyTable: { Properties: { CID: number; Title?: string; MolecularFormula: string; MolecularWeight: string }[] } }>(
    `/compound/cid/${cids.slice(0, max).join(',')}/property/Title,MolecularFormula,MolecularWeight/JSON`);
  return props.PropertyTable.Properties.map((p) => ({ cid: p.CID, title: p.Title ?? `CID ${p.CID}`, formula: p.MolecularFormula, weight: Number(p.MolecularWeight) }));
}

interface Rec3D { PC_Compounds: { atoms: { aid: number[]; element: number[]; charge?: { aid: number; value: number }[] }; bonds?: { aid1: number[]; aid2: number[]; order: number[] }; coords: { conformers: { x: number[]; y: number[]; z: number[] }[] }[] }[] }

/** Fetch a compound with its PubChem3D conformer as a MoleculeRecord (provenance: derived, computed). */
export async function fetchPubChemMolecule(cid: number): Promise<MoleculeRecord> {
  const [propsRes, rec] = await Promise.all([
    getJson<{ PropertyTable: { Properties: Record<string, string | number>[] } }>(`/compound/cid/${cid}/property/Title,IUPACName,MolecularFormula,MolecularWeight,SMILES,InChI,InChIKey,Charge/JSON`),
    getJson<Rec3D>(`/compound/cid/${cid}/record/JSON?record_type=3d`).catch((e: PubChemError) => {
      if (e.kind === 'not-found') throw new PubChemError('PubChem has no computed 3D conformer for this compound (common for salts, metals, radicals, large or very flexible molecules). No coordinates are invented.', 'no-3d');
      throw e;
    }),
  ]);
  const p = propsRes.PropertyTable.Properties[0];
  const c = rec.PC_Compounds[0];
  const conf = c.coords[0].conformers[0];
  const charges = new Map((c.atoms.charge ?? []).map((q) => [q.aid, q.value]));
  const atoms: MolAtom[] = c.atoms.aid.map((aid, k) => ({ Z: c.atoms.element[k], x: conf.x[k], y: conf.y[k], z: conf.z[k], charge: charges.get(aid) ?? 0 }));
  const idx = new Map(c.atoms.aid.map((aid, k) => [aid, k]));
  const bonds: MolBond[] = (c.bonds?.aid1 ?? []).map((a1, k) => ({ a: idx.get(a1)!, b: idx.get(c.bonds!.aid2[k])!, order: c.bonds!.order[k] }));
  const title = String(p.Title ?? `CID ${cid}`);
  return {
    id: `pubchem-${cid}`, name: title, iupacName: (p.IUPACName as string) ?? null, category: 'pubchem search', detectedInISM: false, context: null,
    formula: String(p.MolecularFormula ?? hillFormula(atoms)), molecularWeight: Number(p.MolecularWeight), netCharge: Number(p.Charge ?? 0),
    smiles: (p.SMILES as string) ?? null, inchi: (p.InChI as string) ?? null, inchiKey: (p.InChIKey as string) ?? null, pubchemCid: cid,
    atoms, bonds,
    geometry: { source: 'PubChem3D computed conformer (MMFF94s), retrieved on demand', units: 'angstrom', provenance: 'derived', experimental: false },
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
  };
}
