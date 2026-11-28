/**
 * Biomolecular encyclopedia data (Phase 11, Gate 11.2) → datasets/biology/biomolecules.json
 *
 *   node --experimental-strip-types scripts/ingestion/biomolecules.ts
 *
 *  - NCBI “The Genetic Codes” (Elzanowski & Ostell; updated Sep. 23, 2024), https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi
 *    robots.txt allows /Taxonomy/Utils/ with crawl-delay 5 (one request here, 5 s spacing). The Standard Code
 *    (transl_table=1) and the Vertebrate Mitochondrial Code (transl_table=2) are parsed from their AAs/Starts/Base
 *    lines exactly as printed. NLM policy: information created by or for the U.S. government is public domain.
 *  - NHGRI Talking Glossary (genome.gov, public domain; “Courtesy: National Human Genome Research Institute”):
 *    the definition paragraph of each term, verbatim. One pronunciation guide is replaced by “[…]”.
 *  - IUPAC-IUB JCBN (1984) Recommendations 1983, Table 5 “The One-Letter Symbols” (web version by G. P. Moss):
 *    one-letter symbol, three-letter symbol and name of the 20 amino acids, transcribed as facts (the text is
 *    © IUBMB and IUPAC and is not quoted). Each amino acid is joined to its bundled molecule record (L-form).
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const html = await fetchText('https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c', { minIntervalMs: 5000, cacheKey: 'ncbi/wprintgc-mode-c.html' });
const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
function code(n: number) {
  const re = new RegExp(`${n}\\. ([^\\n]+?) \\(transl_table=${n}\\)[\\s\\S]*?AAs\\s*=\\s*(\\S+)\\s*Starts\\s*=\\s*(\\S+)\\s*Base1\\s*=\\s*(\\S+)\\s*Base2\\s*=\\s*(\\S+)\\s*Base3\\s*=\\s*(\\S+)`);
  const m = text.match(re);
  if (!m) throw new Error(`code ${n} not found`);
  const [, name, AAs, Starts, Base1, Base2, Base3] = m;
  for (const s of [AAs, Starts, Base1, Base2, Base3]) if (s.length !== 64) throw new Error(`code ${n}: a line is not 64 long`);
  return { id: n, name, AAs, Starts, Base1, Base2, Base3 };
}
const compiled = text.match(/Compiled by ([^\n]+)\n\s*Last update of the Genetic Codes: ([^\n]+)/);
const standardNote = 'The standard code currently allows initiation from UUG and CUG in addition to AUG.';
if (!text.includes(standardNote)) throw new Error('initiation note not found');
const humanMito = 'at least in humans it has now been shown that AGA and AGG sequences are not recognized as termination codons';
if (!text.includes(humanMito)) throw new Error('code 2 comment not found');

const TERMS = ['Amino-Acids', 'Base-Pair', 'Codon', 'Genetic-Code', 'Nucleotide', 'Protein', 'Translation', 'Uracil'];
const glossary = [];
for (const slug of TERMS) {
  const url = `https://www.genome.gov/genetics-glossary/${slug}`;
  const page = await fetchText(url, { minIntervalMs: 2000, cacheKey: `nhgri/${slug}.html` });
  const lines = page.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n').replace(/&#039;|&rsquo;/g, '’').replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const i = lines.findIndex((l) => l.startsWith('​'));
  if (i < 0) throw new Error(`no definition: ${slug}`);
  const para: string[] = [];
  for (const l of lines.slice(i + 1, i + 12)) { if (l.length > 80) para.push(l); else if (para.length) break; }
  glossary.push({ term: lines[i].replace('​', ''), url, text: para.map((p) => p.replace(' [GWA-NeeN]', ' […]')) });
}

// IUPAC-IUB 1983, Table 5 (one-letter, three-letter, name) joined to the bundled L-amino-acid molecule records
const AMINO_ACIDS: [string, string, string, string][] = [
  ['A', 'Ala', 'alanine', 'pubchem-5950'], ['C', 'Cys', 'cysteine', 'pubchem-5862'], ['D', 'Asp', 'aspartic acid', 'pubchem-5960'],
  ['E', 'Glu', 'glutamic acid', 'pubchem-33032'], ['F', 'Phe', 'phenylalanine', 'pubchem-6140'], ['G', 'Gly', 'glycine', 'pubchem-750'],
  ['H', 'His', 'histidine', 'pubchem-6274'], ['I', 'Ile', 'isoleucine', 'pubchem-6306'], ['K', 'Lys', 'lysine', 'pubchem-5962'],
  ['L', 'Leu', 'leucine', 'pubchem-6106'], ['M', 'Met', 'methionine', 'pubchem-6137'], ['N', 'Asn', 'asparagine', 'pubchem-6267'],
  ['P', 'Pro', 'proline', 'pubchem-145742'], ['Q', 'Gln', 'glutamine', 'pubchem-5961'], ['R', 'Arg', 'arginine', 'pubchem-6322'],
  ['S', 'Ser', 'serine', 'pubchem-5951'], ['T', 'Thr', 'threonine', 'pubchem-6288'], ['V', 'Val', 'valine', 'pubchem-6287'],
  ['W', 'Trp', 'tryptophan', 'pubchem-6305'], ['Y', 'Tyr', 'tyrosine', 'pubchem-6057'],
];
const aminoAcids = AMINO_ACIDS.map(([one, three, name, molecule]) => ({ one, three, name, molecule }));

const data = {
  version: '1.0.0',
  geneticCodes: {
    compiledBy: compiled?.[1]?.trim() ?? null, lastUpdate: compiled?.[2]?.trim() ?? null,
    url: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi',
    codes: [code(1), code(2)],
    notes: [
      { code: 1, text: 'Initiation Codon: AUG' },
      { code: 1, text: standardNote },
      { code: 2, text: `AGA and AGG were thought to have become mitochondrial stop codons early in vertebrate evolution (Osawa, Ohama, Jukes & Watanabe 1989). However, ${humanMito}.` },
    ],
  },
  aminoAcids,
  glossary,
};

writeDataset('datasets/biology/biomolecules.json', data, {
  dataset: 'biomolecules',
  version: '1.0.0',
  records: 2 + aminoAcids.length + glossary.length,
  sources: [
    { institution: 'NCBI, The Genetic Codes (A. Elzanowski and J. Ostell)', url: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi', license: 'NLM: “Information that is created by or for the US government on this site is within the public domain.”', notes: 'standard and vertebrate mitochondrial codes, initiation codons' },
    { institution: 'NHGRI Talking Glossary of Genomic and Genetic Terms', url: 'https://www.genome.gov/genetics-glossary', license: 'Public domain (NHGRI: “Text … on National Human Genome Research Institute (NHGRI) websites are in the public domain, unless otherwise indicated”)', notes: 'definitions of amino acids, base pair, codon, genetic code, nucleotide, protein, translation, uracil' },
    { institution: 'IUPAC-IUB Joint Commission on Biochemical Nomenclature (1984), Pure Appl. Chem. 56, 595–624', url: 'https://iupac.qmul.ac.uk/AminoAcid/A2021.html', license: '© IUBMB and IUPAC; only the symbols are used (facts)', notes: 'one- and three-letter amino-acid symbols (Table 5)' },
  ],
  adapter: 'scripts/ingestion/biomolecules.ts',
  warnings: ['Glossary text quoted verbatim; one pronunciation guide replaced by […].', 'Amino acids are joined to the bundled L-forms (glycine has no stereocentre).'],
});
