/** Spectral sub-views, shared by the top-bar chip menus and the Spectral navigation wheel. */
export type NavItem = [label: string, route: string];
export const WAVE_ITEMS: NavItem[] = [['Wave lab', '/spectral/lab'], ['Acoustic lab', '/spectral/acoustics'], ['Audio & FFT', '/spectral/audio'], ['Room acoustics', '/spectral/roomacoustics']];
export const RADIO_ITEMS: NavItem[] = [['Antennas & fields', '/spectral/antennas'], ['RF atlas', '/spectral/rf'], ['Comms room (3D)', '/spectral/room'], ['Modulation lab', '/spectral/modulation']];
/** Phase 10: light and optics; the Compare chip moved here so the bar keeps its width. */
export const LIGHT_ITEMS: NavItem[] = [['Compare spectra', '/spectral/compare'], ['Geometric optics', '/spectral/optics'], ['Wave optics', '/spectral/waveoptics'], ['Polarisation', '/spectral/polarisation'], ['Spectroscopy', '/spectral/spectroscopy'], ['Thermal radiation', '/spectral/thermal'], ['Telescopes', '/spectral/telescopes'], ['Atmosphere & remote sensing', '/spectral/atmosphere']];
export const SPECTRAL_GROUPS: { key: string; label: string; icon: string; items: NavItem[] }[] = [
  { key: 'atlas', label: 'Atlas', icon: '◐', items: [['Spectral atlas', '/spectral'], ['Fields', '/spectral/fields']] },
  { key: 'waves', label: 'Waves', icon: '∿', items: WAVE_ITEMS },
  { key: 'radio', label: 'Radio', icon: '⌁', items: RADIO_ITEMS },
  { key: 'light', label: 'Light', icon: '✦', items: LIGHT_ITEMS },
];

/** Meteorology sections, shared by the top-bar menus (desktop) and the ☰ menu (phones). */
export const METEOROLOGY_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Atmosphere', items: [['Structure of the atmosphere', '/meteorology'], ['Moist air & stability', '/meteorology/air'], ['Sunlight, heat & greenhouse', '/meteorology/radiation'], ['Wind, clouds & water', '/meteorology/motion'], ['Model checks', '/meteorology/validation']] },
  { label: 'Weather', items: [['Earth weather atlas', '/meteorology/atlas'], ['Storm laboratory', '/meteorology/storms'], ['Regional climates', '/meteorology/climates'], ['Temperature record', '/meteorology/records']] },
  { label: 'Climate', items: [['Climate through geological time', '/meteorology/deeptime'], ['Ice ages and the orbit', '/meteorology/iceages'], ['Oceans, ice and biomes', '/meteorology/oceans'], ['Human activities', '/meteorology/human'], ['Future climate', '/meteorology/future']] },
];
export const METEOROLOGY_CHIPS: NavItem[] = [['Other worlds', '/meteorology/planets'], ['Sandbox', '/meteorology/sandbox']];
