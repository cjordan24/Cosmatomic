/**
 * Transport and biochemistry (Phase 11, Gate 11.6) → datasets/biology/transport.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-transport.ts
 *
 * Every equation and number was read on the archive.org page images (2026-11-28):
 *  - fick-1855: Phil. Mag. 4th ser. 10, 30–39 (londonedinburghp10maga, leaves n43–n44 = pp. 30–31); the German
 *    original Ann. Phys. 94 (1855) 59 (sim_annalen-der-physik_1855_94_1, pp. 65–66).
 *  - einstein-brownian-1926: Investigations on the Theory of the Brownian Movement, ed. R. Fürth, tr. A. D. Cowper
 *    (Methuen, 1926) (investigationson0000albe): p. 17 (n28) eqs (11), (12) and D = (RT/N)·1/(6πkP); p. 18 (n29)
 *    the worked example; p. 62 (n73) the 1906 supplement (Thovert's sugar coefficient; P and N).
 *  - van-t-hoff-1887: Z. physik. Chem. 1, 481 (sim_zeitschrift_physikalische_chemie_1887_1), p. 491 (n496).
 *  - michaelis-menten-1913: Biochem. Z. 49, 333 (sim_biochemische-zeitschrift-…_1913_49), p. 344 (n347) eqs (2)–(4)
 *    and Fig. 4a (“log k (−1,78)” marked on the abscissa).
 *  - ict-1929: International Critical Tables V (1929), H. R. Bruins, “Coefficients of Diffusion in Liquids”
 *    (internationalcri0005vari): p. 63 (n80) definition and units; p. 71 (n88) the sugars at 15 °C, c₀ = 0*.
 * Left out (no allowed source read): ATP yield per glucose; the water self-diffusion coefficient; O₂ in pure water.
 */
import { writeDataset } from './lib/ingest.ts';

const ICT = 'ict-1929';
// 10⁵Δ in cm²/s at 15 °C, “c = 0* indicates diffusion in very dilute solution”; reliability letters as printed
const diffusion = [
  { id: 'glucose', name: 'Glucose', formula: 'C6H12O6', molecule: 'pubchem-5793', tC: 15, c0: '0*', e5: 0.52, reliability: 'C-D', lit: '(136)', where: 'p. 71', source: ICT },
  { id: 'mannitol', name: 'Mannitol', formula: 'C6H14O6', molecule: null, tC: 15, c0: '0*', e5: 0.50, reliability: 'C-D', lit: '(136)', where: 'p. 71', source: ICT },
  { id: 'sucrose', name: 'Saccharose (sucrose)', formula: 'C12H22O11', molecule: 'pubchem-5988', tC: 15, c0: '0*', e5: 0.38, reliability: 'D', lit: '(136)', where: 'p. 71', source: ICT },
  { id: 'lactose', name: 'Lactose', formula: 'C12H22O11', molecule: 'pubchem-6134', tC: 15, c0: '0*', e5: 0.38, reliability: 'D', lit: '(136)', where: 'p. 71', source: ICT },
  { id: 'maltose', name: 'Maltose', formula: 'C12H22O11', molecule: 'pubchem-439186', tC: 15, c0: '0*', e5: 0.38, reliability: 'D', lit: '(136)', where: 'p. 71', source: ICT },
  { id: 'raffinose', name: 'Raffinose', formula: 'C18H32O16', molecule: null, tC: 15, c0: '0*', e5: 0.33, reliability: 'E', lit: '(136)', where: 'p. 71', source: ICT },
];
const reliability = { A: 0.02, B: 0.03, C: 0.05, D: 0.07, E: 0.10, where: 'p. 63', note: 'probable error of the letter-graded values' };

const data = {
  version: '1.0.0',
  fick: {
    source: 'fick-1855',
    law: { where: 'Phil. Mag., p. 30', quote: 'the transfer of salt and water occurring in a unit of time, between two elements of space filled with differently concentrated solutions of the same salt, must be, ceteris paribus, directly proportional to the difference of concentration, and inversely proportional to the distance of the elements from one another.' },
    flux: { where: 'p. 30', quote: 'a quantity of salt = −Q . k . dy/dx dt, in which Q signifies the surface of the stratum, and k a constant dependent upon the nature of the substances.' },
    equation2: { where: 'p. 31, eq. (2)', text: 'δy/δt = −k δ²y/δx²', note: 'printed with a minus sign; the International Critical Tables define the coefficient by ∂c/∂t = Δ ∂²c/∂x² (p. 63), the form used here' },
  },
  einstein: {
    source: 'einstein-brownian-1926',
    eq11: { where: 'p. 17, eq. (11)', text: 'λx = √(x̄²) = √(2Dt)', quote: 'The mean displacement is therefore proportional to the square root of the time.' },
    eq12: { where: 'p. 17, eq. (12)', quote: 'the square root of the mean of the squares of the total displacements of the particles has the value λx√3' },
    stokes: { where: 'p. 17', text: 'D = (RT/N) · 1/(6πkP)', note: 'k is the viscosity of the liquid, P the radius of the spheres' },
    example: { where: 'p. 18', quote: 'We will calculate how great λx is for one second, if N is taken equal to 6·10²³ in accordance with the kinetic theory of gases, water at 17° C. is chosen as the liquid (k = 1·35 · 10⁻²), and the diameter of the particles ·001 mm. We get λx = 8·10⁻⁵ cm. = 0·8μ. The mean displacement in one minute would be, therefore, about 6μ.', N: 6e23, tC: 17, viscosityCgs: 1.35e-2, diameterCm: 1e-4, lambda1sCm: 8e-5, lambda60sMicron: 6 },
    supplement1906: { where: 'p. 62, Supplement (Berne, January 1906)', quote: 'Thovert found (Table, p. 372) for the diffusion-coefficient of sugar in water at 18·5° C. and the concentration 0·005 mol./litre the value 0·33 cm.²/day.', thovertCm2PerDay: 0.33, tC: 18.5, sugarRadiusMm: 0.49e-6, N: 6.56e23 },
  },
  vantHoff: {
    source: 'van-t-hoff-1887', where: 'p. 491, §V',
    quote: 'Die bekannte Formel, welche für Gase die beiden Gesetze von Boyle und Gay-Lussac zum Ausdruck bringt: PV=RT ist nunmehr, wo die genannten Sätze auch auf Flüssigkeiten anwendbar sind, falls es sich da um den osmotischen Druck handelt, auch für Lösungen gültig; sogar mit derselben Beschränkung, die auch bei Gasen zu berücksichtigen ist, dass nämlich die Verdünnung genügend gross sei, um die gegenseitige Wirkung und den eingenommenen Raum der gelösten Partikelchen vernachlässigen zu können.',
    numbers: { P: 10333, V: '2/0·08956', Vvalue: 2 / 0.08956, T: 273, R: 845.05, units: 'P in kilograms-force per square metre, V in cubic metres, for one kilogram-molecule (2 kg of hydrogen at 0° and atmospheric pressure)' },
    summary: 'PV=845 T … nicht nur auf Gase, sondern auf sämtliche Lösungen, falls dann nur immer P als osmotischer Druck genommen wird.',
  },
  michaelisMenten: {
    source: 'michaelis-menten-1913', where: 'p. 344',
    eq2: 'φ = Φ · [S]/([S] + k)', eq3: 'v = C · Φ · [S]/([S] + k)', eq4: 'V = [S]/([S] + k)',
    definitions: 'φ die Konzentration des gebundenen Fermentes oder der Ferment-Zuckerbindung, also [Φ − φ] die Konzentration des freien Fermentes. k ist die Dissoziationskonstante.',
    proportional: 'Dieser Menge muß also die Anfangsgeschwindigkeit, v, der Inversion immer proportional sein',
    fig4aLogK: -1.78, fig4aWhere: 'Fig. 4a (invertase acting on sucrose), “log k (−1,78)” marked on the abscissa',
  },
  diffusion, reliability,
};

writeDataset('datasets/biology/transport.json', data, {
  dataset: 'transport',
  version: '1.0.0',
  records: diffusion.length + 4,
  sources: [
    { institution: 'Fick, A. (1855) Phil. Mag. 10, 30; Ann. Phys. 94, 59', url: 'https://doi.org/10.1080/14786445508641925', notes: 'law of diffusion and eq. (2) (page images)' },
    { institution: 'Einstein, A., Investigations on the Theory of the Brownian Movement, tr. A. D. Cowper (Methuen, 1926)', url: 'https://archive.org/details/investigationson0000albe', notes: 'eqs (11), (12), D = RT/(6πkPN), worked example, 1906 supplement' },
    { institution: "van 't Hoff, J. H. (1887) Z. physik. Chem. 1, 481", url: 'https://doi.org/10.1515/zpch-1887-0151', notes: 'PV = RT for osmotic pressure (p. 491)' },
    { institution: 'Michaelis, L. and Menten, M. L. (1913) Biochem. Z. 49, 333', url: 'https://archive.org/details/sim_biochemische-zeitschrift-beitraege-zur-chemischen_1913_49', notes: 'eqs (2)–(4), Fig. 4a' },
    { institution: 'International Critical Tables V (1929), H. R. Bruins, Coefficients of Diffusion in Liquids', url: 'https://archive.org/details/internationalcri0005vari', notes: 'diffusion coefficients of sugars at 15 °C (p. 71)' },
  ],
  adapter: 'scripts/ingestion/curated-transport.ts',
  warnings: ['Hand-transcribed from page images.', 'Diffusion coefficients at 15 °C in very dilute solution only; letter grades give the probable error.', 'ATP yield per glucose left out: no allowed open source was found.'],
});
