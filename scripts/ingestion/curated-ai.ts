/**
 * Machine learning and AI (Phase 16) → datasets/engineering/ai.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-ai.ts
 *
 * Read 2026-11-28 (notes: research/SOURCE_NOTES_PHASE16.md). Page images: Cauchy 1847 p. 537; Widrow & Hoff 1960
 * pp. 16–18; Turing 1950 pp. 433, 442; Rosenblatt 1961 p. viii; Vaswani et al. 2017 p. 4 (rendered); Ho et al.
 * 2020 p. 2 (rendered). Born-digital PDF text: Goodfellow 2014, Kaplan 2020, GPT-4 report, Llama 3 paper, Elsworth et
 * al. 2025, Luccioni et al. 2024, Jegham et al. 2025. Web pages: Dartmouth proposal (Stanford JMC), d2l.ai, MCP
 * specification 2026-07-28, Claude Code docs, Anthropic models overview and Transparency Hub, Google AI Studio and
 * DeepMind model cards. OpenAI and Meta web pages were not used (terms / notices forbid automated collection).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  timeline: [
    { year: 1847, kind: 'documented', title: 'Steepest descent', source: 'cauchy-1847', quote: 'Concevons maintenant que, θ étant une quantité positive, on prenne α = −θX, β = −θY, γ = −θZ,…', en: 'Now suppose, θ being a positive quantity, we take α = −θX, β = −θY, γ = −θZ, … (a step against the gradient)' },
    { year: 1950, kind: 'documented', title: 'Turing asks “Can machines think?”', source: 'turing-1950', quote: 'I PROPOSE to consider the question, ‘Can machines think ?’' },
    { year: 1950, kind: 'prediction', title: 'Turing’s fifty-year prediction', source: 'turing-1950', quote: 'I believe that in about fifty years’ time it will be possible to programme computers … to make them play the imitation game so well that an average interrogator will not have more than 70 per cent. chance of making the right identification after five minutes of questioning.' },
    { year: 1955, kind: 'documented', title: 'The Dartmouth proposal', source: 'dartmouth-1955', quote: 'We propose that a 2 month, 10 man study of artificial intelligence be carried out during the summer of 1956 at Dartmouth College in Hanover, New Hampshire.' },
    { year: 1955, kind: 'conjecture', title: 'Dartmouth’s conjecture', source: 'dartmouth-1955', quote: 'The study is to proceed on the basis of the conjecture that every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.' },
    { year: 1958, kind: 'documented', title: 'The perceptron', source: 'rosenblatt-1961', quote: 'A perceptron is first and foremost a brain model, not an invention for pattern recognition.', note: 'Rosenblatt, Principles of Neurodynamics (1961), preface; his 1958 paper in Psychological Review is cited, not read.' },
    { year: 1960, kind: 'documented', title: 'Adaline and the LMS rule', source: 'widrow-hoff-1960', quote: 'The method of searching that has proven most useful is the method of steepest descent. Vector adjustment changes are made in the direction of the gradient.' },
    { year: 1986, kind: 'documented', title: 'Backpropagation (Rumelhart, Hinton & Williams)', source: 'rumelhart-1986', quote: '“Learning representations by back-propagating errors”, Nature 323 (cited; not openly available).' },
    { year: 2014, kind: 'documented', title: 'Generative adversarial networks', source: 'goodfellow-2014', quote: 'This framework corresponds to a minimax two-player game.' },
    { year: 2017, kind: 'documented', title: 'The Transformer', source: 'vaswani-2017', quote: 'We compute the dot products of the query with all keys, divide each by √d_k, and apply a softmax function to obtain the weights on the values.' },
    { year: 2020, kind: 'documented', title: 'Scaling laws', source: 'kaplan-2020', quote: 'Performance has a power-law relationship with each of the three scale factors N, D, C when not bottlenecked by the other two, with trends spanning more than six orders of magnitude' },
    { year: 2020, kind: 'documented', title: 'GPT-3: 175 billion parameters', source: 'brown-2020', quote: 'we train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model' },
    { year: 2020, kind: 'documented', title: 'Diffusion models', source: 'ho-2020', quote: 'Transitions of this chain are learned to reverse a diffusion process, which is a Markov chain that gradually adds noise to the data in the opposite direction of sampling until signal is destroyed.' },
    { year: 2023, kind: 'documented', title: 'GPT-4: details withheld', source: 'openai-2023', quote: 'this report contains no further details about the architecture (including model size), hardware, training compute, dataset construction, training method, or similar.' },
    { year: 2024, kind: 'documented', title: 'Llama 3: open weights, disclosed scale', source: 'llama3-2024', quote: 'Our largest model is dense Transformer with 405B parameters, processing information in a context window of up to 128K tokens.' },
  ],
  learning: {
    cauchy: { source: 'cauchy-1847', where: 'p. 537', eq: 'f(x − θX, y − θY, z − θZ, …) = u − θ(X² + Y² + Z² …)', converge: 'on trouvera successivement des valeurs de u de plus en plus petites, qui convergeront vers une valeur minimum de u.', en: 'one will find successively smaller and smaller values of u, which will converge towards a minimum value of u.' },
    widrow: { source: 'widrow-hoff-1960', where: 'p. 18, eq. (13)', eq: '∂ε²(k)/∂aⱼ = −2 sⱼ(k) ε(k)', quote: 'It follows that all derivatives have the same magnitude, and have signs determined by the error sign and the respective input signal signs.', stable: 'the method of steepest descent will be stable when the proportionality constant k is less than the reciprocal of the second partial derivative.' },
    d2l: { source: 'd2l', gd: 'Gradient descent with learning rate η > 0 updates the iterate via x ← x − η∇f(x).', backprop: 'reverse-mode automatic differentiation records the forward pass as a computational graph and walks the chain rule backward from the scalar loss.' },
  },
  attention: { source: 'vaswani-2017', where: 'p. 4, eq. (1)', eq: 'Attention(Q, K, V) = softmax(QKᵀ/√d_k)V', why: 'We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. To counteract this effect, we scale the dot products by 1/√d_k.' },
  scaling: { source: 'kaplan-2020', where: 'p. 4, eq. (1.1)', eq: 'L(N) = (N_c/N)^α_N', alpha: 0.076, Nc: 8.8e13, unit: 'cross entropy loss in nats; N = non-embedding parameters', caution: 'A separate joint fit (their Table 2) gives N_c = 6.4 × 10¹³; the two are not mixed here.' },
  models: [
    { family: 'Claude (Anthropic)', source: 'anthropic-models', weights: 'proprietary', disclosed: ['Current models: Claude Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5', '“All current models support text and image input, text output, multilingual capabilities, vision, and tool use.”', 'Context window 1M tokens; maximum output 128K tokens', 'Training data cutoff Jun 2026', 'Opus 5.5 and Sonnet 5.5 released September 2026 (Transparency Hub)', 'Opus 5.5 “trained on a proprietary mix of publicly available information from online sources, public and private datasets, user data, and synthetic data generated by other models.”'], undisclosed: ['parameter count', 'architecture details', 'training compute', 'dataset size', 'training and inference energy', 'water'] },
    { family: 'Gemini (Google DeepMind)', source: 'google-gemini-cards', weights: 'proprietary', disclosed: ['Gemini 4 family: Carbon, Neon, Hydrogen, Argon', 'Gemini 4 Carbon: inputs text, image, video, audio, PDF; output text; context 1,048,576 tokens', '“a large scale sparse mixture-of-experts (MoE) … transformer-based model” (Argon card)', '“trained using Google’s Tensor Processing Units (TPUs)”'], undisclosed: ['parameter count (total or active)', 'training compute', 'dataset size', 'training energy'] },
    { family: 'GPT (OpenAI)', source: 'openai-2023', weights: 'proprietary', disclosed: ['GPT-3 (2020): 175 billion parameters (Brown et al.)', 'GPT-4 report (2023): architecture, size, hardware, compute, data and method withheld'], undisclosed: ['GPT-4 and later: model size, hardware, training compute, dataset construction, training method'], note: 'OpenAI’s current model pages were not read: its terms forbid automated extraction.' },
    { family: 'Llama (Meta)', source: 'llama3-2024', weights: 'open weights (Llama 3 Community License — not an OSI open-source licence)', disclosed: ['8B, 70B and 405B parameters', 'pre-trained with 3.8 × 10²⁵ FLOPs on 15.6T text tokens (405B)', 'context up to 128K tokens', 'trained on up to 16K H100 GPUs at 700 W TDP', 'Llama 3 8B/70B April 2024; Llama 3.1 July 2024'], undisclosed: ['total training energy (MWh) and water — not in the paper'], note: 'Meta’s web pages were not read: a notice prohibits automated collection.' },
  ],
  agents: {
    claudeCode: { source: 'claude-code-docs', what: 'Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools.', phases: 'When you give Claude a task, it works through three phases: gather context, take action, and verify results.', loop: 'The agentic loop is powered by two components: models that reason and tools that act.', tools: 'Tools are what make Claude Code agentic. Without tools, Claude can only respond with text.', context: 'Claude’s context window holds your conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions. As you work, context fills up.', safety: 'Claude has two safety mechanisms: checkpoints let you undo file changes, and permissions control what Claude can do without asking.' },
    mcp: { source: 'mcp-spec', what: 'Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools.', roles: 'Hosts: LLM applications that initiate connections; Clients: Connectors within the host application; Servers: Services that provide context and capabilities', tools: 'Tools: Functions for the AI model to execute', human: 'there SHOULD always be a human in the loop with the ability to deny tool invocations.', consent: 'Hosts must obtain explicit user consent before invoking any tool' },
  },
  energy: {
    google: { source: 'elsworth-2025', kind: 'company-reported measurement', whPerPrompt: 0.24, narrowWh: 0.10, gco2: 0.03, mlWater: 0.26, scope: 'median Gemini Apps text prompt, May 2025', quote: 'the median Gemini Apps text prompt consumes 0.24 Wh of energy', tv: 'a modern television consumes approximately 100 watts of electricity, so 0.24 Wh represents less energy than watching TV for 9 seconds.', wue: 1.15 },
    jegham: { source: 'jegham-2025', kind: 'independent estimate (model-based)', wh: 0.42, sd: 0.13, scope: 'short GPT-4o prompt', quote: 'Our framework estimates 0.42 Wh (±0.13 Wh) for a short GPT-4o prompt (0.37 Wh without datacenter overhead)' },
    luccioni: { source: 'luccioni-2024', kind: 'independent measurement (peer reviewed)', scope: '88 open models on one GPU, mean kWh per 1,000 inferences', rows: [
      { task: 'text classification', kwh: 0.002 }, { task: 'extractive QA', kwh: 0.003 }, { task: 'masked LM', kwh: 0.003 }, { task: 'token classification', kwh: 0.004 }, { task: 'image classification', kwh: 0.007 },
      { task: 'object detection', kwh: 0.038 }, { task: 'text generation', kwh: 0.047 }, { task: 'summarization', kwh: 0.049 }, { task: 'image captioning', kwh: 0.063 }, { task: 'image generation', kwh: 2.907 }],
      note: 'The paper’s prose gives 0.042 kWh for text generation (a median); its Table 2 gives a mean of 0.047 — the table is used.' },
    llama: { source: 'llama3-2024', quote: 'instant fluctuations of power consumption across the data center on the order of tens of megawatts' },
  },
};
writeDataset('datasets/engineering/ai.json', data, { dataset: 'ai', version: '1.0.0', records: 40,
  sources: [
    { institution: 'Cauchy (1847); Turing (1950); Dartmouth proposal (1955); Rosenblatt (1961); Widrow & Hoff (1960)', url: 'https://archive.org/details/ComptesRendusAcademieDesSciences0025', notes: 'history and gradient descent (page images)' },
    { institution: 'arXiv papers: Vaswani 2017, Goodfellow 2014, Ho 2020, Kaplan 2020, Brown 2020, OpenAI 2023, Llama 3 2024', url: 'https://arxiv.org/abs/1706.03762', license: 'arXiv non-exclusive licence: equations and short quotations only', notes: 'architectures, scaling, disclosed facts' },
    { institution: 'Elsworth et al. 2025 (Google, CC BY 4.0); Luccioni et al. 2024 (CC BY-SA 4.0); Jegham et al. 2025 (CC BY 4.0)', url: 'https://arxiv.org/abs/2508.15734', notes: 'energy per prompt / per 1,000 inferences, labelled by kind' },
    { institution: 'Anthropic and Google model documentation; Claude Code docs; MCP specification (Apache-2.0); d2l.ai (CC BY-SA 4.0)', url: 'https://modelcontextprotocol.io/specification/2026-07-28', notes: 'facts as each publisher states them' },
  ],
  adapter: 'scripts/ingestion/curated-ai.ts', warnings: ['Turing’s storage figure (“about 10⁹”) is omitted: the exponent is not legible on the scan.', 'Company figures are company-reported; independent estimates are labelled as such.'] });
