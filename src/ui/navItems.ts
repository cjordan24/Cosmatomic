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
