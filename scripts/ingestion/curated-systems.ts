/**
 * Organ systems (Phase 12, Gates 12.5–12.6) → datasets/biology/systems.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-systems.ts
 *
 * Quotes checked verbatim against the saved pages (2026-11-28): NIDDK (kidneys, GFR, digestion; “copyright free”),
 * NCI SEER Training Modules (endocrine, lymphatic, blood, skin, reproductive; text free of copyright).
 * U.S. customary units are converted with NIST SP 811 (2008) Appendix B.9: quart (U.S. liquid) = 9.463 529 E-01 L,
 * cup (U.S.) = 2.365 882 E-01 L, pound (avoirdupois) = 4.535 924 E-01 kg.
 */
import { writeDataset } from './lib/ingest.ts';

const SEER = 'seer-training', NIDDK = 'niddk';
const S = (p: string) => `https://training.seer.cancer.gov${p}`;
const KID = 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work';
const Q = (quote: string, source: string, url: string) => ({ quote, source, url });
const data = {
  version: '1.0.0',
  units: { source: 'nist-sp811', quartL: 0.9463529, cupL: 0.2365882, poundKg: 0.4535924 },
  urinary: {
    nephrons: Q('Each of your kidneys is made up of about a million filtering units called nephrons.', NIDDK, KID),
    filteredPerDay: { ...Q('In a single day, your kidneys filter about 150 quarts of blood.', NIDDK, KID), quarts: 150 },
    urinePerDay: { ...Q('Only 1 to 2 quarts become urine.', NIDDK, KID), low: 1, high: 2 },
    perMinute: { ...Q('Healthy kidneys filter about a half cup of blood every minute, removing wastes and extra water to make urine.', NIDDK, KID), cups: 0.5 },
    size: Q('In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long.', SEER, S('/anatomy/urinary/components/kidney.html')),
    gfr: { url: 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis', source: NIDDK, lines: [
      { id: 'normal', quote: 'a GFR of 60 or more is in the normal range.' },
      { id: 'disease', quote: 'a GFR of less than 60 may mean you have kidney disease.' },
      { id: 'failure', quote: 'a GFR of 15 or less is called kidney failure.' },
    ] },
  },
  digestive: {
    length: Q('The long continuous tube that is the digestive tract is about 9 meters in length.', SEER, S('/anatomy/digestive/structure.html')),
    solid: Q('The liver, pancreas, and gallbladder are the solid organs of the digestive system.', NIDDK, 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works'),
    breakdown: { source: NIDDK, url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works', items: [
      { from: 'Proteins', to: 'amino acids', link: '/biologic/molecules' },
      { from: 'Fats', to: 'fatty acids and glycerol', link: '/biologic/molecules?tab=lipids' },
      { from: 'Carbohydrates', to: 'simple sugars', link: '/biologic/molecules?tab=carbs' },
    ], tail: 'Your digestive system breaks nutrients into parts that are small enough for your body to absorb.' },
  },
  endocrine: {
    glands: Q('Although there are eight major endocrine glands scattered throughout the body, they are still considered to be one system because they have similar functions, similar mechanisms of influence, and many important interrelationships.', SEER, S('/anatomy/endocrine/glands/')),
    pituitary: Q('The pituitary gland or hypophysis is a small gland about 1 centimeter in diameter or the size of a pea.', SEER, S('/anatomy/endocrine/glands/pituitary.html')),
    thyroid: Q('About 95 percent of the active thyroid hormone is thyroxine, and most of the remaining 5 percent is triiodothyronine.', SEER, S('/anatomy/endocrine/glands/thyroid.html')),
    pancreas: [
      Q('Alpha cells in the pancreatic islets secrete the hormone glucagons in response to a low concentration of glucose in the blood.', SEER, S('/anatomy/endocrine/glands/pancreas.html')),
      Q('Beta cells in the pancreatic islets secrete the hormone insulin in response to a high concentration of glucose in the blood.', SEER, S('/anatomy/endocrine/glands/pancreas.html')),
    ],
  },
  bloodImmune: {
    formed: Q('Three classes of formed elements: erythrocytes (red blood cells), leukocytes (white blood cells), and the thrombocytes (platelets)', SEER, S('/hematopoietic1/intro-to-blood.html')),
    lymphReturn: Q('Of the fluid that leaves the capillary, about 90 percent is returned.', SEER, S('/anatomy/lymphatic/')),
    nodes: Q('Lymph nodes are small bean-shaped structures that are usually less than 2.5 cm in length.', SEER, S('/anatomy/lymphatic/components/nodes.html')),
    spleen: Q('The spleen is the largest lymphatic organ in the body.', SEER, S('/anatomy/lymphatic/components/spleen.html')),
    thymus: Q('The thymus is a soft organ with two lobes that is located anterior to the ascending aorta and posterior to the sternum.', SEER, S('/anatomy/lymphatic/components/thymus.html')),
  },
  skin: {
    organ: { ...Q('The skin is the body\'s largest organ; covering the entire outside of the body, it is about 2 mm thick and weighs approximately six pounds.', SEER, S('/melanoma/anatomy/')), pounds: 6, thicknessMm: 2 },
    epidermis: { ...Q('The thickness of the epidermis varies in different types of skin; it is only .05 mm thick on the eyelids, and is 1.5 mm thick on the palms and the soles of the feet.', SEER, S('/melanoma/anatomy/layers.html')), lowMm: 0.05, highMm: 1.5 },
    dermis: { ...Q('The dermis is located beneath the epidermis and is the thickest of the three layers of the skin (1.5 to 4 mm thick), making up approximately 90 percent of the thickness of the skin.', SEER, S('/melanoma/anatomy/layers.html')), lowMm: 1.5, highMm: 4 },
    turnover: { ...Q('Complete cell turnover occurs every 28 to 30 days in young adults, while the same process takes 45 to 50 days in elderly adults.', SEER, S('/melanoma/anatomy/layers.html')), young: [28, 30], elderly: [45, 50] },
    sweat: Q('The average person has about 3 million sweat glands.', SEER, S('/melanoma/anatomy/layers.html')),
  },
  reproductive: {
    functions: { ...Q('Within the context of producing offspring, the reproductive system has four functions', SEER, S('/anatomy/reproductive/')), list: ['To produce egg and sperm cells', 'To transport and sustain these cells', 'To nurture the developing offspring', 'To produce hormones'] },
    testis: Q('Each testis is an oval structure about 5 cm long and 3 cm in diameter.', SEER, S('/anatomy/reproductive/male/testes.html')),
    spermatogenesis: Q('The entire process, beginning with a primary spermatocyte, takes about 74 days.', SEER, S('/anatomy/reproductive/male/testes.html')),
    ovary: Q('Each ovary is a solid, ovoid structure about the size and shape of an almond, about 3.5 cm in length, 2 cm wide, and 1 cm thick.', SEER, S('/anatomy/reproductive/female/ovaries.html')),
    oocytesBirth: { ...Q('Many of the primary oocytes degenerate before birth, but even with this decline, the two ovaries together contain approximately 700,000 oocytes at birth.', SEER, S('/anatomy/reproductive/female/ovaries.html')), count: 700000 },
    oocytesPuberty: { ...Q('By puberty the number of primary oocytes has further declined to about 400,000.', SEER, S('/anatomy/reproductive/female/ovaries.html')), count: 400000 },
  },
};

writeDataset('datasets/biology/systems.json', data, {
  dataset: 'systems',
  version: '1.0.0',
  records: 9 + 4 + 5 + 5 + 5 + 6,
  sources: [
    { institution: 'NIDDK', url: KID, license: 'NIDDK: “The majority of information on this site is copyright free”', notes: 'kidneys, GFR, digestion' },
    { institution: 'NCI SEER Training Modules', url: 'https://training.seer.cancer.gov/', notes: 'endocrine, lymphatic, blood, skin, reproductive' },
    { institution: 'NIST SP 811 (2008), Appendix B.9', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9', notes: 'quart, cup and pound conversion factors' },
  ],
  adapter: 'scripts/ingestion/curated-systems.ts',
  warnings: ['Quotes verbatim (SEER prints “glucagons”).', 'U.S. customary values converted with NIST SP 811 factors; conversions are labelled derived.'],
});
