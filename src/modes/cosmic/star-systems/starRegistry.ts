/**
 * Registers 10 pc stars in the scientific-relationship registry once the catalogue is loaded
 * (Gate 5.4): star → its MK class, and star → a Planck spectrum at its class V mean T_eff (a model,
 * not the observed spectrum). Reverse links come from the same edges (RelatedLinks).
 */
import { getEntity, registerEntity, registerRelationship } from '@/shared/scientific-relationships/registry';
import { calibrateDwarf, parseSpectralType, type NearbyObject } from './stars';
import { spectrumId } from '@/shared/scientific-relationships/registry';

export const blackbodyId = (T: number) => `spectrum:blackbody-${Math.round(T)}`;
export const blackbodyRoute = (T: number, seq?: number) => `#/spectral?tab=blackbody&T=${Math.round(T)}${seq !== undefined ? `&star=${seq}` : ''}`;
/** Class V mean T_eff for a catalogue object, rounded to 1 K, or null. */
export function modelTeff(o: NearbyObject): number | null {
  if (o.type === 'exoplanet' || o.type === 'white dwarf') return null;
  const t = calibrateDwarf(parseSpectralType(o.spt))?.values.Teff ?? null;
  return t === null ? null : Math.round(t);
}

let done = false;
export function registerStars(objs: NearbyObject[]) {
  if (done) return;
  done = true;
  for (const o of objs) {
    if (o.type === 'exoplanet') continue;
    const id = `star:${o.seq}`;
    registerEntity({ id, kind: 'star', label: o.common && o.common !== o.name ? `${o.name} (${o.common})` : o.name, route: `#/cosmic/stars?sel=${o.seq}`, status: 'available' });
    const p = parseSpectralType(o.spt);
    if (p?.kind === 'mk' && p.cls && getEntity(`stellar-class:${p.cls}`)) registerRelationship({ from: id, to: `stellar-class:${p.cls}`, type: 'part-of', context: `spectral type ${o.spt}`, source: 'reyle-2021' });
    // Gate 6.2: Sirius B's Hα line is measurably redshifted by its gravity (Joyce et al. 2018)
    if (o.seq === 14 && o.type === 'white dwarf') registerRelationship({ from: id, to: spectrumId('H I'), type: 'has-spectrum', context: 'Hα gravitationally redshifted by 80.65 ± 0.77 km/s', source: 'joyce-2018' });
    // Gate 6.3: Stein 2051 B (GJ 169.1 B) was weighed by astrometric microlensing (Sahu et al. 2017)
    if (o.seq === 129 && o.type === 'white dwarf') registerRelationship({ from: id, to: 'context:gravitational-lensing', type: 'observed-with', context: 'mass measured from the deflection of a background star (HST)', source: 'sahu-2017' });
    const T = modelTeff(o);
    if (T !== null) {
      const bb = blackbodyId(T);
      if (!getEntity(bb)) registerEntity({ id: bb, kind: 'spectrum', label: `Planck spectrum at ${T} K`, route: blackbodyRoute(T, o.seq), status: 'available', note: 'Ideal blackbody at a class V mean T_eff; real stellar spectra have absorption lines and bands' });
      registerRelationship({ from: id, to: bb, type: 'has-spectrum', context: 'blackbody model at the class V mean T_eff', source: 'pecaut-mamajek-2013' });
    }
  }
}
