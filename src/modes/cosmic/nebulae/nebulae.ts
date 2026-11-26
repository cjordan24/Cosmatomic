/**
 * Nebulae and the licensed image gallery (Phase 6, Gate 6.5). Records: datasets/astronomical/nebulae.json
 * (curated-nebulae.ts); images: datasets/astronomical/gallery.json + public/images/gallery (gallery-images.ts).
 */
import nebulaData from '@datasets/astronomical/nebulae.json';
import galleryData from '@datasets/astronomical/gallery.json';

export type Val = [number, number, number];
export interface LineLink { spectrum: string; label: string; context: string; source: string }
export interface Nebula {
  id: string; name: string; aliases: string[]; type: string; typeSource: string;
  distance: { value: Val | number; unit: 'pc' | 'ly'; approximate: boolean; method: string; source: string } | null;
  image: string; lines: LineLink[]; notes: { text: string; source: string }[];
}
export interface GalleryImage {
  id: string; title: string; object: string; credit: string; publisher: 'ESA/Hubble' | 'ESA/Webb' | 'ESO'; telescope: string; page: string;
  colours: string | null; path: string; bytes: number; sha256: string; licence: { name: string; url: string; terms: string };
}

export const NEBULAE = (nebulaData as unknown as { nebulae: Nebula[] }).nebulae;
export const GALLERY = (galleryData as unknown as { images: GalleryImage[]; note: string }).images;
export const GALLERY_NOTE = (galleryData as unknown as { note: string }).note;
export const imageById = (id: string) => GALLERY.find((g) => g.id === id);
export const imageForObject = (object: string) => GALLERY.find((g) => g.object === object);
export const PUBLISHER_SOURCE: Record<GalleryImage['publisher'], string> = { 'ESA/Hubble': 'esa-hubble-images', 'ESA/Webb': 'esa-webb-images', ESO: 'eso-eht-images' };

const PC_LY = 3.261563777; // light-years per parsec (IAU definitions; tested in stars.test.ts)
/** Distance as text in both units; approximate values are marked "≈". */
export function distanceText(n: Nebula): string | null {
  const d = n.distance;
  if (!d) return null;
  if (Array.isArray(d.value)) {
    const [v, lo, hi] = d.value;
    const pc = d.unit === 'pc' ? v : v / PC_LY;
    return `${v} ${lo === hi ? `± ${lo}` : `+${hi} −${lo}`} ${d.unit} (${Math.round(d.unit === 'pc' ? v * PC_LY : pc)} ${d.unit === 'pc' ? 'ly' : 'pc'})`;
  }
  return `≈ ${d.value.toLocaleString('en-US')} ${d.unit} (≈ ${Math.round(d.unit === 'ly' ? d.value / PC_LY : d.value * PC_LY).toLocaleString('en-US')} ${d.unit === 'ly' ? 'pc' : 'ly'})`;
}
