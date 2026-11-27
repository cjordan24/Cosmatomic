/**
 * Curated reaction library (Phase 4, Gate 4.1) → datasets/chemistry/reactions.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-reactions.ts
 *
 * These are hand-curated, *stoichiometric* statements of well-established chemistry, each with a
 * citation. No values are fetched; the script exists so the dataset gets the same manifest +
 * SHA-256 treatment as ingested data. Atom and charge conservation of every entry is verified by
 * tests/science/reactions.test.ts (never trusted by hand).
 *
 * Species syntax (parsed by src/modes/atomic/reactions/formula.ts):
 *   formula[^charge][(phase)]   e.g.  CH4(g)   Fe^3+(aq)   SO4^2-(aq)   e^-   hν   M
 * `hν` is a photon and `M` an unspecified third body (no atoms, no charge).
 */
import { writeDataset } from './lib/ingest.ts';

type Ctx = 'combustion' | 'industrial' | 'acid-base' | 'precipitation' | 'redox' | 'atmospheric' | 'interstellar' | 'biological' | 'geochemical' | 'photochemical';

interface Species { c: number; s: string; name?: string; mol?: string }
interface Reaction {
  id: string;
  name: string;
  reactants: Species[];
  products: Species[];
  reversible?: boolean;
  contexts: Ctx[];
  /** true when the equation summarises a multi-step mechanism or pathway (not an elementary step) */
  net: boolean;
  elementary?: boolean;
  conditions?: string;
  description: string;
  caveats?: string[];
  /** ids in the scientific-relationship registry (src/shared/scientific-relationships) */
  relationships?: string[];
  citation: string;
}

// Library molecule ids (datasets/molecular/molecules.json + curated experimental diatomics).
const MOL: Record<string, string> = {
  H2O: 'pubchem-962', O2: 'pubchem-977', O3: 'pubchem-24823', CO2: 'pubchem-280', CO: 'pubchem-281', CH4: 'pubchem-297',
  H2: 'exp-h2', N2: 'pubchem-947', NH3: 'pubchem-222', SO2: 'pubchem-1119', H2SO4: 'pubchem-1118', NO: 'exp-no', HCl: 'pubchem-313',
  C2H5OH: 'pubchem-702', C3H8: 'pubchem-6334', C2H6: 'pubchem-6324', C8H18: 'pubchem-356', CH3OH: 'pubchem-887', C2H2: 'pubchem-6326',
  C6H12O6: 'pubchem-5793', C3H6O3: 'pubchem-612', CH3COOH: 'pubchem-176', HNO3: 'pubchem-944', H3PO4: 'pubchem-1004',
  C10H16N5O13P3: 'pubchem-5957', H2S: 'pubchem-402', HCN: 'pubchem-768', N2O: 'pubchem-948',
};
const sp = (c: number, s: string, name?: string): Species => {
  const bare = s.replace(/\((s|l|g|aq|cr)\)$/, '').replace(/\^.*$/, '');
  return { c, s, ...(name ? { name } : {}), ...(MOL[bare] && !s.includes('^') ? { mol: MOL[bare] } : {}) };
};

// Open sources for the general-chemistry reactions (they replaced OpenStax Chemistry 2e on 2026-11-27; OpenStax forbids AI ingestion).
const WEBBOOK = 'NIST Chemistry WebBook (SRD 69)';
const KEYVALS = 'CODATA Key Values for Thermodynamics (Cox, Wagman & Medvedev, 1989)';
const GOLDBERG = 'Goldberg, Kishore & Lennen (2002) J. Phys. Chem. Ref. Data 31, 231';
const BANDURA = 'Bandura & Lvov (2006) J. Phys. Chem. Ref. Data 35, 15';
const BRATSCH = 'Bratsch (1989) J. Phys. Chem. Ref. Data 18, 1';
const PROSEN = 'Prosen & Goldberg (1973) NBSIR 73-180';
const FOWLER = 'Fowler & Bright (1935) J. Res. Natl. Bur. Stand. 15, 493';
const ROMANOFF = 'Romanoff (1957) Underground Corrosion, NBS Circular 579';
const BARITE = 'USGS Mineral Commodity Summaries 2026: Barite';
const CARMODY = 'Carmody, Plummer, Busenberg & Coplen (1998) USGS Open-File Report 97-234';
const HARDNESS = 'USGS Water Science School: Hardness of Water';
const CLARKE = 'Clarke & Wheeler (1917) USGS Professional Paper 102';
const SEINFELD = 'Seinfeld & Pandis, Atmospheric Chemistry and Physics, 3rd ed. (Wiley, 2016)';
const CHAPMAN = 'Chapman, S. (1930) Mem. R. Meteorol. Soc. 3, 103 — oxygen-only stratospheric ozone cycle';
const MOLINA = 'Molina & Rowland (1974) Nature 249, 810 — chlorine-catalysed ozone destruction';
const TIELENS = 'Tielens, A. G. G. M. (2013) Rev. Mod. Phys. 85, 1021 — the molecular universe';
const BERG = 'Berg, Tymoczko, Gatto & Stryer, Biochemistry, 9th ed. (W. H. Freeman, 2019)';
const GREENWOOD = 'Greenwood & Earnshaw, Chemistry of the Elements, 2nd ed. (Butterworth-Heinemann, 1997)';

const R: Reaction[] = [
  // ---------- combustion ----------
  { id: 'methane-combustion', name: 'Combustion of methane', reactants: [sp(1, 'CH4(g)', 'methane'), sp(2, 'O2(g)', 'oxygen')], products: [sp(1, 'CO2(g)', 'carbon dioxide'), sp(2, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Complete combustion of natural gas. Liquid water is the conventional product for the standard enthalpy of combustion (higher heating value).', caveats: ['Real flames proceed through hundreds of radical elementary steps (e.g. GRI-Mech 3.0).'], relationships: ['context:energy-production'], citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'hydrogen-combustion', name: 'Combustion of hydrogen', reactants: [sp(2, 'H2(g)', 'hydrogen'), sp(1, 'O2(g)', 'oxygen')], products: [sp(2, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Formation of water from its elements; twice the standard enthalpy of formation of liquid water.', relationships: ['context:energy-production'], citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'hydrogen-combustion-gas', name: 'Combustion of hydrogen (water vapour product)', reactants: [sp(2, 'H2(g)', 'hydrogen'), sp(1, 'O2(g)', 'oxygen')], products: [sp(2, 'H2O(g)', 'water vapour')], contexts: ['combustion'], net: true,
    description: 'Same stoichiometry with gaseous water (lower heating value). Comparing with the liquid-water version isolates the enthalpy of vaporisation (Hess’s law).', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'ethanol-combustion', name: 'Combustion of ethanol', reactants: [sp(1, 'C2H5OH(l)', 'ethanol'), sp(3, 'O2(g)', 'oxygen')], products: [sp(2, 'CO2(g)', 'carbon dioxide'), sp(3, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Complete combustion of liquid ethanol (biofuel).', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'propane-combustion', name: 'Combustion of propane', reactants: [sp(1, 'C3H8(g)', 'propane'), sp(5, 'O2(g)', 'oxygen')], products: [sp(3, 'CO2(g)', 'carbon dioxide'), sp(4, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Complete combustion of propane (LPG).', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'ethane-combustion', name: 'Combustion of ethane', reactants: [sp(2, 'C2H6(g)', 'ethane'), sp(7, 'O2(g)', 'oxygen')], products: [sp(4, 'CO2(g)', 'carbon dioxide'), sp(6, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Complete combustion of ethane.', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'octane-combustion', name: 'Combustion of n-octane', reactants: [sp(2, 'C8H18(l)', 'n-octane'), sp(25, 'O2(g)', 'oxygen')], products: [sp(16, 'CO2(g)', 'carbon dioxide'), sp(18, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Idealised gasoline combustion (gasoline is a mixture; n-octane is a model compound).', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'methanol-combustion', name: 'Combustion of methanol', reactants: [sp(2, 'CH3OH(l)', 'methanol'), sp(3, 'O2(g)', 'oxygen')], products: [sp(2, 'CO2(g)', 'carbon dioxide'), sp(4, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Complete combustion of liquid methanol.', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'acetylene-combustion', name: 'Combustion of acetylene', reactants: [sp(2, 'C2H2(g)', 'acetylene'), sp(5, 'O2(g)', 'oxygen')], products: [sp(4, 'CO2(g)', 'carbon dioxide'), sp(2, 'H2O(l)', 'water')], contexts: ['combustion'], net: true,
    description: 'Oxy-acetylene welding flame chemistry (net).', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'graphite-combustion', name: 'Combustion of carbon (graphite)', reactants: [sp(1, 'C(s)', 'graphite'), sp(1, 'O2(g)', 'oxygen')], products: [sp(1, 'CO2(g)', 'carbon dioxide')], contexts: ['combustion'], net: true,
    description: 'Formation reaction of CO₂ from its elements in their reference states.', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'co-oxidation', name: 'Oxidation of carbon monoxide', reactants: [sp(2, 'CO(g)', 'carbon monoxide'), sp(1, 'O2(g)', 'oxygen')], products: [sp(2, 'CO2(g)', 'carbon dioxide')], contexts: ['combustion', 'industrial'], net: true,
    description: 'Burning of CO (the second step of a Hess cycle C → CO → CO₂); also the main reaction in automotive catalytic converters.', citation: WEBBOOK + '; ' + KEYVALS },
  { id: 'graphite-partial-oxidation', name: 'Partial oxidation of carbon', reactants: [sp(2, 'C(s)', 'graphite'), sp(1, 'O2(g)', 'oxygen')], products: [sp(2, 'CO(g)', 'carbon monoxide')], contexts: ['combustion'], net: true,
    description: 'Formation of CO from its elements. Subtracting the burning of CO from the formation of CO₂ gives the same enthalpy as the tabulated value (Hess’s law).', citation: WEBBOOK + '; ' + KEYVALS },

  // ---------- industrial synthesis ----------
  { id: 'haber-bosch', name: 'Haber–Bosch ammonia synthesis', reactants: [sp(1, 'N2(g)', 'nitrogen'), sp(3, 'H2(g)', 'hydrogen')], products: [sp(2, 'NH3(g)', 'ammonia')], reversible: true, contexts: ['industrial'], net: true,
    conditions: 'Fe-based catalyst, ~400–500 °C, 150–300 bar', description: 'Fixation of atmospheric nitrogen; exothermic with a decrease in gas moles, so equilibrium favours ammonia at low T and high p while kinetics needs high T.', relationships: ['process:nitrogen-cycle'], citation: GREENWOOD + ', ch. 11' },
  { id: 'contact-so3', name: 'Contact process: oxidation of SO₂', reactants: [sp(2, 'SO2(g)', 'sulfur dioxide'), sp(1, 'O2(g)', 'oxygen')], products: [sp(2, 'SO3(g)', 'sulfur trioxide')], reversible: true, contexts: ['industrial'], net: true,
    conditions: 'V₂O₅ catalyst, ~400–450 °C', description: 'Key step of sulfuric-acid manufacture.', citation: GREENWOOD + ', ch. 15' },
  { id: 'so3-hydration', name: 'Hydration of SO₃ to sulfuric acid', reactants: [sp(1, 'SO3(g)', 'sulfur trioxide'), sp(1, 'H2O(l)', 'water')], products: [sp(1, 'H2SO4(l)', 'sulfuric acid')], contexts: ['industrial', 'atmospheric'], net: true,
    description: 'Net result of the contact process (industrially SO₃ is absorbed in H₂SO₄ to form oleum, then diluted). In the atmosphere the same net change produces sulfate aerosol and acid rain.', relationships: ['context:acid-rain'], citation: GREENWOOD + ', ch. 15' },
  { id: 'ostwald-oxidation', name: 'Ostwald process: catalytic oxidation of ammonia', reactants: [sp(4, 'NH3(g)', 'ammonia'), sp(5, 'O2(g)', 'oxygen')], products: [sp(4, 'NO(g)', 'nitric oxide'), sp(6, 'H2O(g)', 'water vapour')], contexts: ['industrial'], net: true,
    conditions: 'Pt–Rh gauze, ~900 °C', description: 'First step of nitric-acid manufacture.', citation: GREENWOOD + ', ch. 11' },
  { id: 'steam-reforming', name: 'Steam–methane reforming', reactants: [sp(1, 'CH4(g)', 'methane'), sp(1, 'H2O(g)', 'steam')], products: [sp(1, 'CO(g)', 'carbon monoxide'), sp(3, 'H2(g)', 'hydrogen')], reversible: true, contexts: ['industrial'], net: true,
    conditions: 'Ni catalyst, 700–1000 °C', description: 'Main industrial source of hydrogen; strongly endothermic.', citation: GREENWOOD + ', ch. 3' },
  { id: 'water-gas-shift', name: 'Water–gas shift', reactants: [sp(1, 'CO(g)', 'carbon monoxide'), sp(1, 'H2O(g)', 'steam')], products: [sp(1, 'CO2(g)', 'carbon dioxide'), sp(1, 'H2(g)', 'hydrogen')], reversible: true, contexts: ['industrial'], net: true,
    description: 'Converts CO to additional H₂ after reforming; mildly exothermic.', citation: GREENWOOD + ', ch. 3' },
  { id: 'methanol-synthesis', name: 'Methanol synthesis', reactants: [sp(1, 'CO(g)', 'carbon monoxide'), sp(2, 'H2(g)', 'hydrogen')], products: [sp(1, 'CH3OH(g)', 'methanol')], reversible: true, contexts: ['industrial'], net: true,
    conditions: 'Cu/ZnO/Al₂O₃ catalyst, 50–100 bar', description: 'Synthesis-gas route to methanol.', citation: GREENWOOD + ', ch. 8' },
  { id: 'limestone-calcination', name: 'Calcination of limestone', reactants: [sp(1, 'CaCO3(s)', 'calcite')], products: [sp(1, 'CaO(s)', 'quicklime'), sp(1, 'CO2(g)', 'carbon dioxide')], reversible: true, contexts: ['industrial', 'geochemical'], net: true,
    conditions: '> ~850 °C', description: 'Lime production; a major industrial CO₂ source independent of fuel combustion.', citation: GREENWOOD + ', ch. 5' },
  { id: 'water-electrolysis', name: 'Electrolysis of water', reactants: [sp(2, 'H2O(l)', 'water')], products: [sp(2, 'H2(g)', 'hydrogen'), sp(1, 'O2(g)', 'oxygen')], contexts: ['redox', 'industrial'], net: true,
    description: 'Reverse of hydrogen combustion, driven by electrical work: ΔG° = +237.1 kJ per mol H₂O must be supplied (derived from the CODATA ΔfH° and S° of H₂O, H₂ and O₂).', citation: KEYVALS },

  // ---------- acid–base ----------
  { id: 'hcl-naoh', name: 'Neutralisation of HCl by NaOH (molecular equation)', reactants: [sp(1, 'HCl(aq)', 'hydrochloric acid'), sp(1, 'NaOH(aq)', 'sodium hydroxide')], products: [sp(1, 'NaCl(aq)', 'sodium chloride'), sp(1, 'H2O(l)', 'water')], contexts: ['acid-base'], net: true,
    description: 'Strong acid + strong base; NBS used the heat of this neutralisation (−55.74 kJ/mol measured) to test a microcalorimeter. See the net ionic form.', citation: PROSEN },
  { id: 'neutralisation-net-ionic', name: 'Neutralisation (net ionic equation)', reactants: [sp(1, 'H^+(aq)', 'hydrogen ion'), sp(1, 'OH^-(aq)', 'hydroxide')], products: [sp(1, 'H2O(l)', 'water')], contexts: ['acid-base'], net: true,
    description: 'The reverse of the ionisation of water, the change measured in any strong acid–strong base neutralisation (ΔrH° = −55.8 kJ/mol from the CODATA values of H₂O(l) and OH⁻(aq)).', citation: PROSEN + '; ' + KEYVALS },
  { id: 'ammonia-base', name: 'Ammonia as a Brønsted base', reactants: [sp(1, 'NH3(aq)', 'ammonia'), sp(1, 'H2O(l)', 'water')], products: [sp(1, 'NH4^+(aq)', 'ammonium'), sp(1, 'OH^-(aq)', 'hydroxide')], reversible: true, contexts: ['acid-base'], net: false, elementary: false,
    description: 'Weak-base equilibrium: K_b ≈ 1.8 × 10⁻⁵ at 25 °C, derived from pK = 9.245 for NH₄⁺ (Goldberg et al.) and pK_w = 13.99 (Bandura & Lvov).', citation: GOLDBERG + '; ' + BANDURA },
  { id: 'acetic-acid-dissociation', name: 'Dissociation of acetic acid', reactants: [sp(1, 'CH3COOH(aq)', 'acetic acid')], products: [sp(1, 'CH3COO^-(aq)', 'acetate'), sp(1, 'H^+(aq)', 'hydrogen ion')], reversible: true, contexts: ['acid-base', 'biological'], net: false,
    description: 'Weak-acid equilibrium: pK = 4.756 at 25 °C and zero ionic strength, K_a = 1.75 × 10⁻⁵.', citation: GOLDBERG },
  { id: 'co2-carbonic', name: 'Dissolved CO₂ ⇌ bicarbonate', reactants: [sp(1, 'CO2(aq)', 'dissolved carbon dioxide'), sp(1, 'H2O(l)', 'water')], products: [sp(1, 'H^+(aq)', 'hydrogen ion'), sp(1, 'HCO3^-(aq)', 'bicarbonate')], reversible: true, contexts: ['acid-base', 'geochemical', 'biological'], net: true,
    description: 'Combines hydration of CO₂ to H₂CO₃ and its first dissociation. Governs ocean acidification and (via carbonic anhydrase) blood pH buffering.', relationships: ['process:blood-co2-transport', 'context:ocean-acidification'], citation: 'Zeebe & Wolf-Gladrow, CO₂ in Seawater: Equilibrium, Kinetics, Isotopes (Elsevier, 2001)' },

  // ---------- precipitation ----------
  { id: 'agcl-precipitation', name: 'Precipitation of silver chloride', reactants: [sp(1, 'Ag^+(aq)', 'silver ion'), sp(1, 'Cl^-(aq)', 'chloride')], products: [sp(1, 'AgCl(s)', 'silver chloride')], contexts: ['precipitation'], net: true,
    description: 'Classical chloride test. K_sp ≈ 1.8 × 10⁻¹⁰ at 25 °C, derived from the CODATA ΔfH° and S° of AgCl(cr), Ag⁺(aq) and Cl⁻(aq).', citation: KEYVALS },
  { id: 'baso4-precipitation', name: 'Precipitation of barium sulfate', reactants: [sp(1, 'Ba^2+(aq)', 'barium ion'), sp(1, 'SO4^2-(aq)', 'sulfate')], products: [sp(1, 'BaSO4(s)', 'barium sulfate')], contexts: ['precipitation'], net: true,
    description: 'Dissolved sulfate is collected by precipitating it as BaSO₄ (also weighed: gravimetric determination); ultrapure barite (BaSO₄) is the contrast medium in X-ray examinations of the gut.', citation: CARMODY + '; ' + BARITE },
  { id: 'caco3-precipitation', name: 'Precipitation of calcium carbonate', reactants: [sp(1, 'Ca^2+(aq)', 'calcium ion'), sp(1, 'CO3^2-(aq)', 'carbonate')], products: [sp(1, 'CaCO3(s)', 'calcium carbonate')], reversible: true, contexts: ['precipitation', 'geochemical', 'biological'], net: true,
    description: 'Limescale in water heaters, and the shells and corals whose remains build limestone.', citation: HARDNESS + '; ' + CLARKE },
  { id: 'limestone-weathering', name: 'Carbonation weathering of limestone', reactants: [sp(1, 'CaCO3(s)', 'calcite'), sp(1, 'CO2(aq)', 'dissolved carbon dioxide'), sp(1, 'H2O(l)', 'water')], products: [sp(1, 'Ca^2+(aq)', 'calcium ion'), sp(2, 'HCO3^-(aq)', 'bicarbonate')], reversible: true, contexts: ['geochemical'], net: true,
    description: 'Dissolution of limestone by carbonic acid (karst caves); the reverse forms stalactites.', citation: 'Zeebe & Wolf-Gladrow, CO₂ in Seawater (Elsevier, 2001)' },

  // ---------- redox ----------
  { id: 'zn-cu-displacement', name: 'Zinc displaces copper (Daniell cell reaction)', reactants: [sp(1, 'Zn(s)', 'zinc'), sp(1, 'Cu^2+(aq)', 'copper(II) ion')], products: [sp(1, 'Zn^2+(aq)', 'zinc ion'), sp(1, 'Cu(s)', 'copper')], contexts: ['redox'], net: true,
    description: 'Overall cell reaction of the Daniell cell: E°cell = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = 0.339 − (−0.762) = +1.101 V.', citation: BRATSCH },
  { id: 'permanganate-iron', name: 'Permanganate oxidises iron(II)', reactants: [sp(1, 'MnO4^-(aq)', 'permanganate'), sp(5, 'Fe^2+(aq)', 'iron(II)'), sp(8, 'H^+(aq)', 'hydrogen ion')], products: [sp(1, 'Mn^2+(aq)', 'manganese(II)'), sp(5, 'Fe^3+(aq)', 'iron(III)'), sp(4, 'H2O(l)', 'water')], contexts: ['redox'], net: true,
    description: 'Classic redox titration of ferrous iron in sulfuric acid. Atoms and charge (+17 on each side) must balance; E°(MnO₄⁻/Mn²⁺) = 1.507 V, E°(Fe³⁺/Fe²⁺) = 0.771 V.', citation: FOWLER + '; ' + BRATSCH },
  { id: 'iron-rusting', name: 'Oxidation of iron (idealised rusting)', reactants: [sp(4, 'Fe(s)', 'iron'), sp(3, 'O2(g)', 'oxygen')], products: [sp(2, 'Fe2O3(s)', 'iron(III) oxide')], contexts: ['redox'], net: true,
    description: 'Net formation of anhydrous Fe₂O₃. Real corrosion is electrochemical: iron is lost as Fe²⁺ ions, which first form Fe(OH)₂; oxygen then converts the outer layers to ferric hydroxide and magnetic oxide (Fe₃O₄).', caveats: ['Corrosion is an electrochemical multi-step process.'], citation: ROMANOFF },
  { id: 'thermite', name: 'Thermite reaction', reactants: [sp(2, 'Al(s)', 'aluminium'), sp(1, 'Fe2O3(s)', 'iron(III) oxide')], products: [sp(1, 'Al2O3(s)', 'aluminium oxide'), sp(2, 'Fe(s)', 'iron')], contexts: ['redox'], net: true,
    description: 'Highly exothermic metal–oxide exchange (molten iron produced).', citation: GREENWOOD + ', ch. 7' },
  { id: 'sodium-chlorine', name: 'Sodium + chlorine → sodium chloride', reactants: [sp(2, 'Na(s)', 'sodium'), sp(1, 'Cl2(g)', 'chlorine')], products: [sp(2, 'NaCl(s)', 'sodium chloride')], contexts: ['redox'], net: true,
    description: 'Formation of an ionic solid from its elements (ΔfH° of NaCl(s) = −411.12 kJ/mol).', citation: WEBBOOK },

  // ---------- atmospheric ----------
  { id: 'chapman-o2-photolysis', name: 'Chapman cycle 1: photolysis of O₂', reactants: [sp(1, 'O2(g)', 'oxygen'), sp(1, 'hν', 'UV photon (λ < 242 nm)')], products: [sp(2, 'O(g)', 'atomic oxygen')], contexts: ['atmospheric', 'photochemical'], net: false, elementary: true,
    description: 'Ultraviolet photons below ~242 nm dissociate O₂ in the stratosphere.', relationships: ['context:ozone-layer', 'wave:em-ultraviolet'], citation: CHAPMAN + '; ' + SEINFELD + ', ch. 5' },
  { id: 'chapman-o3-formation', name: 'Chapman cycle 2: ozone formation', reactants: [sp(1, 'O(g)', 'atomic oxygen'), sp(1, 'O2(g)', 'oxygen'), sp(1, 'M', 'third body (N₂ or O₂)')], products: [sp(1, 'O3(g)', 'ozone'), sp(1, 'M', 'third body')], contexts: ['atmospheric'], net: false, elementary: true,
    description: 'Three-body recombination; M carries away the excess energy so O₃ does not immediately fall apart.', relationships: ['context:ozone-layer'], citation: CHAPMAN + '; ' + SEINFELD + ', ch. 5' },
  { id: 'chapman-o3-photolysis', name: 'Chapman cycle 3: photolysis of O₃', reactants: [sp(1, 'O3(g)', 'ozone'), sp(1, 'hν', 'UV photon (λ < ~320 nm)')], products: [sp(1, 'O2(g)', 'oxygen'), sp(1, 'O(g)', 'atomic oxygen')], contexts: ['atmospheric', 'photochemical'], net: false, elementary: true,
    description: 'Ozone absorbs UV-B/UV-C (the Hartley band, peak ≈ 255 nm); this absorption is what shields the surface.', relationships: ['context:ozone-layer', 'wave:em-ultraviolet'], citation: CHAPMAN + '; ' + SEINFELD + ', ch. 5' },
  { id: 'chapman-o3-loss', name: 'Chapman cycle 4: O + O₃', reactants: [sp(1, 'O(g)', 'atomic oxygen'), sp(1, 'O3(g)', 'ozone')], products: [sp(2, 'O2(g)', 'oxygen')], contexts: ['atmospheric'], net: false, elementary: true,
    description: 'Odd-oxygen loss step of the Chapman mechanism.', relationships: ['context:ozone-layer'], citation: CHAPMAN + '; ' + SEINFELD + ', ch. 5' },
  { id: 'cl-o3', name: 'Chlorine catalytic cycle step 1', reactants: [sp(1, 'Cl(g)', 'chlorine atom'), sp(1, 'O3(g)', 'ozone')], products: [sp(1, 'ClO(g)', 'chlorine monoxide'), sp(1, 'O2(g)', 'oxygen')], contexts: ['atmospheric'], net: false, elementary: true,
    description: 'Chlorine atoms from photolysed CFCs destroy ozone…', relationships: ['context:ozone-layer'], citation: MOLINA },
  { id: 'clo-o', name: 'Chlorine catalytic cycle step 2', reactants: [sp(1, 'ClO(g)', 'chlorine monoxide'), sp(1, 'O(g)', 'atomic oxygen')], products: [sp(1, 'Cl(g)', 'chlorine atom'), sp(1, 'O2(g)', 'oxygen')], contexts: ['atmospheric'], net: false, elementary: true,
    description: '…and are regenerated, so one Cl atom can remove many O₃ molecules (net: O + O₃ → 2 O₂).', relationships: ['context:ozone-layer'], citation: MOLINA },
  { id: 'no-o3', name: 'NO titration of ozone', reactants: [sp(1, 'NO(g)', 'nitric oxide'), sp(1, 'O3(g)', 'ozone')], products: [sp(1, 'NO2(g)', 'nitrogen dioxide'), sp(1, 'O2(g)', 'oxygen')], contexts: ['atmospheric'], net: false, elementary: true,
    description: 'Fast reaction that removes ozone near NO sources (traffic).', relationships: ['context:urban-smog'], citation: SEINFELD + ', ch. 6' },
  { id: 'no2-photolysis', name: 'Photolysis of NO₂', reactants: [sp(1, 'NO2(g)', 'nitrogen dioxide'), sp(1, 'hν', 'photon (λ < ~420 nm)')], products: [sp(1, 'NO(g)', 'nitric oxide'), sp(1, 'O(g)', 'atomic oxygen')], contexts: ['atmospheric', 'photochemical'], net: false, elementary: true,
    description: 'The only significant tropospheric source of O atoms (and thus ground-level ozone via O + O₂ + M).', relationships: ['context:urban-smog', 'wave:em-visible'], citation: SEINFELD + ', ch. 6' },
  { id: 'ch4-oh', name: 'Methane + hydroxyl radical', reactants: [sp(1, 'CH4(g)', 'methane'), sp(1, 'OH(g)', 'hydroxyl radical')], products: [sp(1, 'CH3(g)', 'methyl radical'), sp(1, 'H2O(g)', 'water vapour')], contexts: ['atmospheric'], net: false, elementary: true,
    description: 'Rate-limiting first step of atmospheric methane removal; sets methane’s ~9–12-year lifetime.', relationships: ['context:greenhouse-effect'], citation: SEINFELD + ', ch. 6' },

  // ---------- interstellar ----------
  { id: 'h2-grain-formation', name: 'H₂ formation on dust grains', reactants: [sp(2, 'H(g)', 'hydrogen atom')], products: [sp(1, 'H2(g)', 'molecular hydrogen')], contexts: ['interstellar'], net: true,
    conditions: 'on cold (~10–20 K) dust-grain surfaces', description: 'Gas-phase H + H cannot shed the binding energy fast enough; grain surfaces catalyse the most abundant molecule in the Universe.', caveats: ['The grain is a catalyst and is not written in the equation.'], citation: 'Gould & Salpeter (1963) ApJ 138, 393; Hollenbach & Salpeter (1971) ApJ 163, 155' },
  { id: 'h3plus-formation', name: 'H₃⁺ formation', reactants: [sp(1, 'H2^+(g)', 'dihydrogen cation'), sp(1, 'H2(g)', 'molecular hydrogen')], products: [sp(1, 'H3^+(g)', 'trihydrogen cation'), sp(1, 'H(g)', 'hydrogen atom')], contexts: ['interstellar'], net: false, elementary: true,
    description: 'Fast ion–molecule reaction following cosmic-ray ionisation of H₂; H₃⁺ then drives most interstellar gas-phase chemistry.', citation: TIELENS },
  { id: 'c-plus-radiative-association', name: 'Radiative association of C⁺ with H₂', reactants: [sp(1, 'C^+(g)', 'carbon cation'), sp(1, 'H2(g)', 'molecular hydrogen')], products: [sp(1, 'CH2^+(g)', 'methylene cation'), sp(1, 'hν', 'photon')], contexts: ['interstellar'], net: false, elementary: true,
    description: 'Slow but important route into hydrocarbon chemistry in diffuse clouds; the excess energy leaves as a photon.', citation: TIELENS },

  // ---------- biological (net equations) ----------
  { id: 'photosynthesis-net', name: 'Oxygenic photosynthesis (net equation)', reactants: [sp(6, 'CO2(g)', 'carbon dioxide'), sp(6, 'H2O(l)', 'water')], products: [sp(1, 'C6H12O6(s)', 'glucose'), sp(6, 'O2(g)', 'oxygen')], contexts: ['biological', 'photochemical'], net: true,
    conditions: 'driven by absorbed visible light (≈ 400–700 nm) in chloroplasts', description: 'Net equation only. The real process comprises the light-dependent reactions (photosystems II and I, electron transport, ATP synthase) and the Calvin–Benson cycle; it consumes ≥ 8 photons per O₂.',
    caveats: ['Not an elementary reaction: dozens of enzymatic steps.', 'O₂ released comes from water, not CO₂ — the net equation hides this.'], relationships: ['process:photosynthesis', 'wave:em-visible', 'context:sunlight'], citation: BERG + ', ch. 19–20' },
  { id: 'respiration-net', name: 'Aerobic respiration of glucose (net equation)', reactants: [sp(1, 'C6H12O6(s)', 'glucose'), sp(6, 'O2(g)', 'oxygen')], products: [sp(6, 'CO2(g)', 'carbon dioxide'), sp(6, 'H2O(l)', 'water')], contexts: ['biological'], net: true,
    description: 'Net equation of glycolysis + pyruvate oxidation + citric-acid cycle + oxidative phosphorylation. Chemically identical to burning glucose; in cells the free energy is captured as ~30–32 ATP per glucose.',
    caveats: ['Not an elementary reaction: > 20 enzymatic steps in two cellular compartments.', 'ATP yield per glucose is an estimate (P/O ratios), not a stoichiometric constant.'], relationships: ['process:cellular-respiration', 'structure:mitochondrion'], citation: BERG + ', ch. 16–18' },
  { id: 'lactic-fermentation', name: 'Lactic-acid fermentation (net)', reactants: [sp(1, 'C6H12O6(s)', 'glucose')], products: [sp(2, 'C3H6O3(aq)', 'lactic acid')], contexts: ['biological'], net: true,
    description: 'Anaerobic glycolysis in muscle and lactic-acid bacteria. At physiological pH the product is lactate⁻ + H⁺.', caveats: ['Net equation; the pathway has 11 enzymatic steps.'], relationships: ['process:glycolysis'], citation: BERG + ', ch. 16' },
  { id: 'alcoholic-fermentation', name: 'Alcoholic fermentation (net)', reactants: [sp(1, 'C6H12O6(s)', 'glucose')], products: [sp(2, 'C2H5OH(aq)', 'ethanol'), sp(2, 'CO2(g)', 'carbon dioxide')], contexts: ['biological'], net: true,
    description: 'Yeast metabolism under anaerobic conditions.', caveats: ['Net equation; glycolysis plus pyruvate decarboxylation and reduction.'], relationships: ['process:glycolysis'], citation: BERG + ', ch. 16' },
  { id: 'atp-hydrolysis', name: 'ATP hydrolysis (neutral-species bookkeeping)', reactants: [sp(1, 'C10H16N5O13P3(aq)', 'ATP (fully protonated)'), sp(1, 'H2O(l)', 'water')], products: [sp(1, 'C10H15N5O10P2(aq)', 'ADP (fully protonated)'), sp(1, 'H3PO4(aq)', 'phosphate (as H₃PO₄)')], contexts: ['biological'], net: true,
    description: 'Atom bookkeeping for ATP + H₂O → ADP + Pᵢ. In cells these species are mostly ionised and Mg²⁺-bound; the biologically relevant free energy depends on pH, [Mg²⁺] and concentrations.', caveats: ['Standard-state thermochemistry of the neutral species is not the cellular ΔG.'], relationships: ['process:cellular-respiration', 'process:muscle-contraction'], citation: BERG + ', ch. 15' },
];

// Map each citation to Source-index ids (src/shared/sources/sources.ts); tests require every reaction to have ≥ 1.
const SOURCE_KEYS: [string, string][] = [['NIST Chemistry WebBook', 'nist-webbook'], ['CODATA Key Values', 'codata-key-values'], ['Kishore', 'goldberg-2002'], ['Bandura', 'bandura-lvov-2006'], ['Bratsch', 'bratsch-1989'], ['Prosen', 'prosen-goldberg-1973'], ['Fowler & Bright', 'fowler-bright-1935'], ['Romanoff', 'romanoff-1957'], ['Barite', 'usgs-mcs-2026-barite'], ['Carmody', 'carmody-1998'], ['Hardness of Water', 'usgs-water-hardness'], ['Clarke & Wheeler', 'clarke-wheeler-1917'], ['Greenwood', 'greenwood-earnshaw-1997'], ['Seinfeld', 'seinfeld-pandis-2016'], ['Chapman', 'chapman-1930'],
  ['Molina', 'molina-rowland-1974'], ['Tielens', 'tielens-2013'], ['Gould & Salpeter', 'gould-salpeter-1963'], ['Hollenbach', 'hollenbach-salpeter-1971'], ['Berg,', 'berg-biochemistry-2019'], ['Zeebe', 'zeebe-wolf-gladrow-2001']];
const withSources = R.map((r) => ({ ...r, sources: SOURCE_KEYS.filter(([k]) => r.citation.includes(k)).map(([, id]) => id) }));

writeDataset('datasets/chemistry/reactions.json', { version: '1.0.0', speciesSyntax: 'formula[^charge][(phase)]; hν = photon; M = third body', reactions: withSources }, {
  dataset: 'reactions',
  version: '1.0.0',
  records: R.length,
  sources: [
    { institution: 'NIST Chemistry WebBook; CODATA Key Values (1989); J. Phys. Chem. Ref. Data (Goldberg 2002, Bandura & Lvov 2006, Bratsch 1989); NBS and USGS reports', url: 'https://webbook.nist.gov/chemistry/', notes: 'combustion, formation, acid–base, precipitation, redox (replaced OpenStax Chemistry 2e, 2026-11-27)' },
    { institution: 'Greenwood & Earnshaw, Chemistry of the Elements (2nd ed.)', url: 'https://doi.org/10.1016/C2009-0-30414-6', notes: 'industrial processes (cited, not reproduced)' },
    { institution: 'Seinfeld & Pandis (2016); Chapman (1930); Molina & Rowland (1974)', url: 'https://doi.org/10.1038/249810a0', notes: 'atmospheric chemistry' },
    { institution: 'Tielens (2013) Rev. Mod. Phys. 85, 1021; Gould & Salpeter (1963)', url: 'https://doi.org/10.1103/RevModPhys.85.1021', notes: 'interstellar chemistry' },
    { institution: 'Berg et al., Biochemistry (9th ed.)', url: 'https://www.macmillanlearning.com/college/us/product/Biochemistry/p/1319114679', notes: 'net biological equations' },
  ],
  adapter: 'scripts/ingestion/curated-reactions.ts',
  warnings: ['Hand-curated stoichiometric equations (no numeric values). Balance and charge are verified by tests/science/reactions.test.ts.'],
});
