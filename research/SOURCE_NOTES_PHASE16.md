# Phase 16 research — Machine Learning & Artificial Intelligence

Retrieved 2026-11-28. User agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`. At least 1.2 s between requests per host; **16 s between arxiv.org requests**, because arXiv robots.txt sets `Crawl-delay: 15` for `*`.
Raw files are in `/tmp/vv-research/p16/`. Subfolders: `robots/`, `ia/` (archive.org metadata and OCR used only to find pages), `img/` (page images that were read), `co/` (company pages), `mcp/`, `cc/` (Claude Code docs) and `crossref/`.

**How text was read.** I read scanned works (Turing, Cauchy, Widrow & Hoff, Rosenblatt) on page images. Their OCR was used only to locate pages. For born-digital arXiv PDFs I used the text layer, extracted with macOS PDFKit (`*.txt` beside each PDF). I also checked eq. (1) of Vaswani and eq. (2) of DDPM on rendered page images (`img/vaswani_p4.png`, `img/ddpm_p2.png`), because the text layer drops √ signs.

---

## 0. Robots and terms log

| Host | robots.txt result | Action |
|---|---|---|
| archive.org | `*`: Disallow only `/control/`, `/report/` | used |
| arxiv.org | `*`: Allow `/abs`, `/pdf`, `/html`; **Crawl-delay 15**; no ClaudeBot group | used at ≥16 s spacing |
| www-formal.stanford.edu | 200, empty file (no restrictions) | used (Dartmouth proposal) |
| jmc.stanford.edu | TLS certificate mismatch, no response | not used |
| apps.dtic.mil | **403 on robots.txt** | not used; DTIC reports were taken from the archive.org mirror |
| discover.dtic.mil | permissive | not needed |
| d2l.ai | comment-only file: it defines Cloudflare content-signal terms (search / ai-input / ai-train) but contains **no** `Content-Signal:` line and no `User-agent` group, so per its own clause (c) it "neither grants nor restricts" | used |
| neuralnetworksanddeeplearning.com | 404 (no robots) | fetched; **book has been taken down by the author** (see §2) |
| api.crossref.org | 404 (no robots) | used |
| www.anthropic.com | `*`: Allow / | used |
| docs.anthropic.com / docs.claude.com → platform.claude.com | `*`: Disallow `/api/` only | used |
| code.claude.com | `Content-Signal: ai-train=yes, search=yes, ai-input=yes`; Disallow `/cdn-cgi/`, `/_next/` | used |
| openai.com | `*`: Allow / | robots permits, **but the Terms of Use forbid automated extraction** (see §3) → no OpenAI web pages used |
| platform.openai.com → developers.openai.com | robots of both permit | one page was fetched before I read the terms; it was **deleted unused** |
| deepmind.google | `*`: Allow / | used |
| ai.google.dev → aistudio.google.com | ai.google.dev: Disallow `/*?*authuser=`; aistudio: Allow `*` except app paths (`/app`, `/prompts/`, …) | used. **Process note:** the docs page redirected to aistudio.google.com before I had fetched aistudio's robots.txt; I fetched it straight after, and it permits `/docs/` |
| ai.meta.com, www.llama.com (→ developer.meta.com) | the robots.txt header says: "Collection of data on Facebook through automated means is prohibited unless you have express written permission from Facebook" | **treated as a terms prohibition: Meta web pages NOT fetched**; Meta facts come from the Llama 3 arXiv paper |
| www.iea.org | **Cloudflare "Just a moment…" challenge served even for robots.txt** | bot wall → **IEA "Energy and AI" not retrieved** (and not attempted via the blob CDN) |
| iea.blob.core.windows.net | 400 | not used |
| modelcontextprotocol.io | `Content-Signal: ai-train=yes, search=yes, ai-input=yes` | used |
| api.github.com | **process deviation:** I called the licence endpoint once before fetching robots.txt; robots.txt then returned 404 (no rules) | used for one call (MCP licence) |

Off-limits hosts were not contacted. In particular, Gallica (the source of the Comptes rendus scan) was never fetched; the scan was read from archive.org.

---

## 1. History

### 1a. Turing 1950 — "Computing Machinery and Intelligence"
- **Citation (Crossref-verified):** A. M. Turing, "I.—Computing Machinery and Intelligence", *Mind* LIX (236): 433–460, October 1950. DOI 10.1093/mind/LIX.236.433 (Crossref publisher: Oxford University Press; no licence field).
- **Open copy:** https://archive.org/details/MIND--COMPUTING-MACHINERY-AND-INTELLIGENCE. This is a community upload (2017) with no licence or rights statement in its metadata. It is a scan of the original Mind pages: the masthead reads "Vol. LIX. No. 236.] [October, 1950".
- **Copyright status (my analysis, not legal advice):**
  - Turing died in 1954, so under life+70 the work is public domain in the UK/EU from 1 Jan 2025.
  - In the US, a foreign work from 1950 is probably restored under the URAA and runs for 95 years from publication (to the end of 2045).
  - **Use short quotations only.** No open licence has been found.
- **Quotes (read on page images):**
  - p. 433 (leaf n0): "I PROPOSE to consider the question, 'Can machines think ?'"
  - p. 433: "The new form of the problem can be described in terms of a game which we call the 'imitation game'."
  - p. 442 (leaf n9): "I believe that in about fifty years' time it will be possible to programme computers, with a storage capacity of about 10⁹, to make them play the imitation game so well that an average interrogator will not have more than 70 per cent. chance of making the right identification after five minutes of questioning."
  - **Caveat on 10⁹:** the superscript is too blurred to read with certainty, even in a zoomed crop (`img/t9crop2.jpg`). It looks like "9" but needs a second copy before it is shown as a value. The "fifty years", "70 per cent." and "five minutes" are clear.

### 1b. Dartmouth proposal, 31 Aug 1955
- **Citation:** J. McCarthy (Dartmouth College), M. L. Minsky (Harvard University), N. Rochester (I.B.M. Corporation), C. E. Shannon (Bell Telephone Laboratories), "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence", August 31, 1955.
- **Copy:** http://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html. This is an HTML transcription on John McCarthy's Stanford site; its footer reads "John McCarthy Wed Apr 3 19:48:31 PST 1996". **It has no licence statement**, so use short quotations.
- **Quote:** "We propose that a 2 month, 10 man study of artificial intelligence be carried out during the summer of 1956 at Dartmouth College in Hanover, New Hampshire. The study is to proceed on the basis of the conjecture that every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it."
- The proposal also lists "3. Neuron Nets — How can a set of (hypothetical) neurons be arranged so as to form concepts."
- **Not a page image:** this is a 1996 transcription, not a scan of the original.

### 1c. Rosenblatt
- **1958 paper (cite only, APA, not open):** F. Rosenblatt, "The perceptron: A probabilistic model for information storage and organization in the brain", *Psychological Review* 65(6): 386–408 (1958). DOI 10.1037/h0042519 (Crossref ✔).
- **Cornell Aeronautical Laboratory report 85-460-1 (1957):** NOT FOUND on archive.org. Phrase searches returned 0 hits; apps.dtic.mil is blocked (robots 403).
- **Open government-contract report used instead:** F. Rosenblatt, *Principles of Neurodynamics: Perceptrons and the Theory of Brain Mechanisms*, Cornell Aeronautical Laboratory Report No. VG-1196-G-8, 15 March 1961. DTIC AD0256582, mirrored at https://archive.org/details/DTIC_AD0256582 (626 leaves, collection "dticarchive / usgovernmentmirrors").
- **Title page (leaf n6, image), verbatim:** "The work reported in this volume has been carried out under Contract Nonr-2381(00) (Project PARA) at C.A.L. and Contract Nonr-401(40) at Cornell University. Reproduction in whole or in part is permitted for any purpose of the United States Government."
- **Status:**
  - This is a contractor work, not a federal-employee work.
  - No copyright notice is visible on the title page.
  - Treat it as **probably PD (pre-1978 publication without notice), but unconfirmed**. Short quotations are safe.
- **Quote (preface, p. viii, leaf n9, image):** "A perceptron is first and foremost a brain model, not an invention for pattern recognition."
- **p. vii (leaf n8):** "…the handling of the first public announcement of the program in 1958 by the popular press…"
- **Frontispiece (leaf n5):** a photograph captioned "THE MARK I PERCEPTRON". It is a possible image, but its licence is the same unconfirmed contractor-report status.

### 1d. Rumelhart, Hinton & Williams 1986 — cite only
"Learning representations by back-propagating errors", *Nature* 323 (6088): 533–536, October 1986. DOI 10.1038/323533a0 (Crossref ✔). Not fetched.

### 1e. Vaswani et al. 2017 — "Attention Is All You Need"
- **arXiv:** arXiv:1706.03762. v1 was 12 Jun 2017; **v7** (2 Aug 2023) was used. DOI 10.48550/arXiv.1706.03762.
- **Licence: arXiv non-exclusive distribution licence 1.0** (http://arxiv.org/licenses/nonexclusive-distrib/1.0/). This is **not** CC.
- **Statement on PDF p. 1:** "Provided proper attribution is provided, Google hereby grants permission to reproduce the tables and figures in this paper solely for use in journalistic or scholarly works."
- **Eq. (1), PDF p. 4, §3.2.1** (checked on the rendered image): **Attention(Q, K, V) = softmax(QKᵀ / √d_k) V**
- **Quote (p. 4):** "We compute the dot products of the query with all keys, divide each by √d_k, and apply a softmax function to obtain the weights on the values."
- **Quote (p. 4):** "We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. To counteract this effect, we scale the dot products by 1/√d_k."
- **Footnote 4 (p. 4):** if the components of q and k are independent with mean 0 and variance 1, "their dot product, q·k = Σ_{i=1}^{d_k} q_i k_i, has mean 0 and variance d_k."
- **Abstract (p. 1):** 28.4 BLEU on WMT 2014 English-to-German; 41.8 BLEU on English-to-French "after training for 3.5 days on eight GPUs".

### 1f. Goodfellow et al. 2014 — GANs
- **arXiv:** arXiv:1406.2661 v1 (10 Jun 2014). Licence: **arXiv non-exclusive 1.0**.
- **Abstract (p. 1):** "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G. … This framework corresponds to a minimax two-player game."
- **Eq. (1), PDF p. 3:** min_G max_D V(D,G) = E_{x∼p_data(x)}[log D(x)] + E_{z∼p_z(z)}[log(1 − D(G(z)))] (text layer; the layout is simple).

### 1g. Ho, Jain & Abbeel 2020 — DDPM
- **arXiv:** arXiv:2006.11239 v2 (16 Dec 2020). Licence: **arXiv non-exclusive 1.0**. Published at NeurIPS 2020 (footer on p. 1).
- **Quote (p. 2):** "A diffusion probabilistic model (which we will call a "diffusion model" for brevity) is a parameterized Markov chain trained using variational inference to produce samples matching the data after finite time. Transitions of this chain are learned to reverse a diffusion process, which is a Markov chain that gradually adds noise to the data in the opposite direction of sampling until signal is destroyed."
- **Eq. (2), p. 2** (checked on the rendered image): q(x_t | x_{t−1}) := N(x_t; √(1−β_t) x_{t−1}, β_t I)
- **Abstract:** CIFAR10 "Inception score of 9.46 and a state-of-the-art FID score of 3.17".

### 1h. Kaplan et al. 2020 — Scaling laws
- **arXiv:** arXiv:2001.08361 v1 (23 Jan 2020). Licence: **arXiv non-exclusive 1.0**.
- **Eq. (1.1), PDF p. 4, §1.2:** **L(N) = (N_c / N)^{α_N}; α_N ∼ 0.076, N_c ∼ 8.8 × 10¹³ (non-embedding parameters)**. L is "the cross entropy loss in nats" (§1.3, p. 6).
- **Also on p. 4:**
  - L(D) = (D_c/D)^{α_D}, with α_D ∼ 0.095 and D_c ∼ 5.4 × 10¹³ tokens.
  - L(C_min) with α_C^min ∼ 0.050 and C_c^min ∼ 3.1 × 10⁸ PF-days.
- **Quote (p. 3):** "Performance has a power-law relationship with each of the three scale factors N, D, C when not bottlenecked by the other two, with trends spanning more than six orders of magnitude".
- **Caution:** Table 2 (p. 12) gives a *joint* L(N,D) fit with α_N = 0.076 and N_c = 6.4 × 10¹³. That differs from eq. 1.1's 8.8 × 10¹³, so do not mix the two.

### 1i. Brown et al. 2020 (GPT-3) — disclosed parameter count
- **arXiv:** arXiv:2005.14165 v4. Licence: non-exclusive 1.0.
- **Abstract (arXiv abs page):** "we train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model".

---

## 2. Gradient descent and learning fundamentals

### 2a. Cauchy 1847 — first statement of steepest descent
- **Citation:** A. Cauchy, "Méthode générale pour la résolution des systèmes d'équations simultanées", *Comptes rendus hebdomadaires des séances de l'Académie des sciences* **25**, No. 16 (2nd semester 1847), pp. 536–538.
- **Date of sitting:** inferred as 18 Oct 1847 from neighbouring archive.org issue items (No. 15 = 11 Oct, No. 17 = 25 Oct). It has not been checked on an image.
- **Copy:** https://archive.org/details/ComptesRendusAcademieDesSciences0025. **Licence: Public Domain Mark 1.0** (metadata `licenseurl`); metadata source is Gallica ark:/12148/bpt6k29812, which was not contacted.
- **Page images:** p. 536 = leaf **n539**; p. 537 = leaf **n540**. The footer on p. 537 reads "C. R., 1847, 2me Semestre. (T. XXV, Nº 16.)".
- **Equations (read on the images):**
  - p. 536: u = f(x, y, z) is "une fonction de plusieurs variables x, y, z,…, qui ne devienne jamais négative et qui reste continue".
  - p. 536: (2) u = f(x+α, y+β, …) = u + αX + βY + γZ + …, where X, Y, Z are the values of D_x u, D_y u, D_z u.
  - p. 537: "Concevons maintenant que, θ étant une quantité positive, on prenne α = −θX, β = −θY, γ = −θZ,…" (the step against the gradient).
  - p. 537: (3) f(x − θX, y − θY, z − θZ, …) = u − θ(X² + Y² + Z² …)
  - p. 537: "…on trouvera successivement des valeurs de u de plus en plus petites, qui convergeront vers une valeur minimum de u."
  - p. 537: (6) θ = u / (X² + Y² + Z² + …)
- **Quote (p. 536):** "il suffira de faire décroître indéfiniment la fonction u, jusqu'à ce qu'elle s'évanouisse."

### 2b. Widrow & Hoff 1960 — the LMS / steepest-descent rule for ADALINE
- **Citation:** B. Widrow and M. E. Hoff, *Adaptive Switching Circuits*, Technical Report No. 1553-1, Solid-State Electronics Laboratory, Stanford Electronics Laboratories, Stanford University, June 30, 1960. Office of Naval Research Contract Nonr 225(24). DTIC AD0241531.
- **Copy:** https://archive.org/details/DTIC_AD0241531 (48 leaves).
- **Status (from the DTIC cover sheet):** "Approved for public release; distribution is unlimited" (authority: ONR ltr, 28 Jul 1977); "THIS REPORT HAS BEEN DELIMITED AND CLEARED FOR PUBLIC RELEASE … NO RESTRICTIONS ARE IMPOSED UPON ITS USE AND DISCLOSURE … DISTRIBUTION STATEMENT A".
  - The title page also says: "Reproduction in whole or in part is permitted for any purpose of the United States Government".
  - This is a contractor work, so its copyright status is unconfirmed. Short quotes plus equations are fine.
- **The IRE WESCON 1960 version:** no open copy was searched or found.
- **Summary quote (from OCR, for orientation only):** "An adaptive pattern classification machine (called "Adaline", for adaptive linear) has been devised…"
- **Read on page images:**
  - **p. 16 (leaf n24), eq. (9):** ε(k) = d(k) − a₀ − a₁s₁(k) − a₂s₂(k) − … − a_n s_n(k)
    - The s's "have values of +1 or −1".
    - "the measured mean square error ε̄² must be a precisely parabolic function of the gain settings".
  - **p. 17 (leaf n25):** "The method of searching that has proven most useful is the method of steepest descent. Vector adjustment changes are made in the direction of the gradient."
    - Also: "the method of steepest descent will be stable when the proportionality constant k is less than the reciprocal of the second partial derivative."
    - Also: "The method of adaption that has been used requires an extremely small sample size per iteration cycle, namely one pattern."
  - **p. 18 (leaf n26), eq. (13):** **∂ε²(k)/∂a_j = −2 s_j(k) ε(k)**
    - "It follows that all derivatives have the same magnitude, and have signs determined by the error sign and the respective input signal signs."
    - The time constant is "τ = (n + 1) patterns. On the 4x4 Adaline, there are n = 16 input line gains plus a level control. Therefore, the time constant should be roughly 17 patterns".

### 2c. Open textbooks
- **Dive into Deep Learning (d2l.ai):**
  - **Licence (index page, verbatim):** "The text is licensed under CC BY-SA 4.0 (LICENSE), and the sample and reference code under a modified MIT license (LICENSE-SAMPLECODE)."
  - **Citation (second edition):** Smola, A. J., *Dive into Deep Learning*, version 2026.11.26, https://d2l.ai.
  - **First edition:** Zhang, Lipton, Li, Smola, Cambridge University Press, 2023.
  - **This is a living text.** Section numbers below are from version 2026.11.26.
  - **§4.3 Backpropagation** (https://d2l.ai/chapter_multilayer-perceptrons/backprop.html):
    - "reverse-mode automatic differentiation records the forward pass as a computational graph and walks the chain rule backward from the scalar loss."
    - Worked example: e = (a + b)c at a = 2, b = 1, c = −3 gives u = 3 and e = −9. Backward: ∂e/∂u = c = −3, ∂e/∂c = u = 3, ∂e/∂a = ∂e/∂b = −3.
    - "an addition node copies its incoming gradient unchanged to each summand, whereas a multiplication node multiplies the incoming gradient by the other factor".
  - **§9.1 Landscapes and Gradient Descent** (https://d2l.ai/chapter_optimization/gd.html):
    - "Gradient descent with learning rate η > 0 updates the iterate via x ← x − η∇f(x)."
    - Example f(x) = 0.1x₁² + 2x₂²: the stability ceiling is η < 0.5; for stable η, "each step removes less than 10% of the remaining error along x₁".
  - **Attribution:** use requires CC BY-SA 4.0 attribution and ShareAlike for adapted text.
- **Nielsen, "Neural Networks and Deep Learning": DO NOT USE.**
  - The site (https://neuralnetworksanddeeplearning.com/) now shows: "I don't wish to help (even in a very small way) train people to contribute to this work, and so I've taken the book down. Michael Nielsen, November 2026".
  - Chapter URLs redirect to that note.
  - Licence was not checked, and I did not work around the takedown via archive copies.

---

## 3. Model families — only what each company states

Distinguish **disclosed facts** (stated by the developer), **independent estimates** (third parties) and **undisclosed** information.

### 3a. Anthropic (Claude)
**Sources**
- https://platform.claude.com/docs/en/about-claude/models/overview, which redirected to `/docs/en/models/overview`. Retrieved 2026-11-28.
- https://www.anthropic.com/transparency (Transparency Hub "Model Report", page dated "October 2, 2026").
- Licence: none stated (copyright Anthropic). Use facts plus short quotes.

**Disclosed facts**
- **Overview page:** "Claude is a family of state-of-the-art large language models developed by Anthropic."
- **Current lineup:** Claude Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5.
- **Modalities and capabilities:** "All current models support text and image input, text output, multilingual capabilities, vision, and tool use."
- **Context window:** "1M tokens" for all four. **Max output:** "128K tokens".
- **Cutoffs:** reliable knowledge cutoff "Jun 2026"; training data cutoff "Jun 2026".
- **Release dates:** the Transparency Hub gives "September 2026" for Claude Opus 5.5 and for Claude Sonnet 5.5.
- **Modalities (Transparency Hub):** "can understand both text (including voice dictation) and image inputs … Claude can output text, including text-based artifacts, and diagrams."
- **Training-data statement (Opus 5.5):** "trained on a proprietary mix of publicly available information from online sources, public and private datasets, user data, and synthetic data generated by other models."
- **Method:** "pretrained on large, diverse datasets … After the pretraining process, Opus 5.5 underwent substantial post-training".
- **Weights:** proprietary. Models are available via API and products, and no weights are released.

**NOT disclosed** (not found on these pages): parameter count, architecture details, training compute, dataset size, training or inference energy, water.

### 3b. OpenAI
- **Terms of Use** (https://openai.com/policies/terms-of-use/): the terms "apply to your use of ChatGPT, DALL·E, and OpenAI's other services for individuals, along with any associated software applications and websites (all together, "Services")".
- Under what users may not do, the terms list: "**Automatically or programmatically extract data or Output**".
  - I treated this as forbidding automated retrieval of OpenAI web pages.
  - The one docs page fetched before I read the terms (developers.openai.com/api/docs/models) **was deleted without use**.
  - **No current OpenAI model list, release dates or context windows were collected.**
- **OpenAI's own words, via arXiv** (GPT-4 Technical Report, arXiv:2303.08774 v6, 4 Mar 2024; licence non-exclusive 1.0; PDF p. 2): "Given both the competitive landscape and the safety implications of large-scale models like GPT-4, this report contains no further details about the architecture (including model size), hardware, training compute, dataset construction, training method, or similar."
  - This is an ideal primary source for "undisclosed".
- **Disclosed historical fact:** GPT-3 has 175 billion parameters (§1i).

### 3c. Google DeepMind (Gemini)
**Sources**
- https://ai.google.dev/gemini-api/docs/models, which redirected to `aistudio.google.com/docs/models`.
- https://aistudio.google.com/docs/models/gemini-4-carbon
- https://deepmind.google/models/model-cards/gemini-4-carbon/ (published 10 November 2026).
- https://deepmind.google/models/model-cards/gemini-4-argon/ (published 13 October 2026).
- **Licence:** no CC notice was found in the fetched HTML. Treat as copyright Google; use facts plus short quotes.

**Disclosed facts**
- **Gemini 4 family:** Carbon, Neon, Hydrogen, Argon. Each card lists "Context 1M tokens" and "Modalities Text, Image, Audio, Video, PDF".
- **Gemini 4 Carbon:**
  - inputs "Text, Image, Video, Audio, and PDF"; output "Text";
  - "Context window (unified input and output token limit) 1,048,576";
  - max output 65,536 (default) or up to 1,048,576 with long decode;
  - "Latest update November 2026".
- **Architecture (Argon card):** "Gemini 4 Argon is a large scale sparse mixture-of-experts (MoE) … transformer-based model (Vaswani et al., 2017) with native multimodal support for text, vision, and audio inputs."
- **Carbon card:** "Gemini 4 Carbon is based on Gemini 4 Argon."
- **Training data (Argon card):** "publicly-available web-documents, text, code, images, audio … and video", plus "data obtained by crawlers; licensed data …; user data …; and generated synthetic data".
  - Processing included "deduplication, honoring robots.txt, safety filtering …".
- **Hardware:** "trained using Google's Tensor Processing Units (TPUs)". **Software:** "JAX and ML Pathways".
- **Weights:** proprietary (API and app distribution).

**NOT disclosed:** parameter count (total or active), training compute, dataset size, training energy. The card says only that TPU efficiency is "aligned with Google's commitment to operate sustainably" and gives no figure.

**Google's per-prompt disclosure:** see §4b. It covers Gemini Apps text prompts measured in May 2025, not Gemini 4.

### 3d. Meta (Llama) — open weights, disclosed scale
Meta web pages were not fetched (see §0). Source: **"The Llama 3 Herd of Models"**, arXiv:2407.21783 v3 (23 Nov 2024; v1 was 31 Jul 2024). Licence: **arXiv non-exclusive 1.0**. Corresponding authors on the arXiv record include Grattafiori, Dubey, et al. (Meta).

**Disclosed facts**
- **p. 1:** "Our largest model is dense Transformer with 405B parameters, processing information in a context window of up to 128K tokens."
- **p. 1:** "our flagship language model was pre-trained using 3.8 × 10²⁵ FLOPs … we pre-trained a flagship model with 405B trainable parameters on 15.6T text tokens."
  - It also gives "about 15T multilingual tokens, compared to 1.8T tokens for Llama 2".
- **p. 2:** "a herd of three multilingual language models with 8B, 70B, and 405B parameters."
- **Openness (p. 2):** "We are publicly releasing all three Llama 3 models under an updated version of the Llama 3 Community License". This is **open weights** under a custom licence, **not** OSI open source; that is a label for the app to explain.
- **Table 1 (p. 2), releases:** Llama 3 8B/70B "April 2024"; Llama 3.1 8B/70B/405B "July 2024".
- **Table 3 (p. 7):** layers 32 / 80 / 126; model dimension 4,096 / 8,192 / 16,384; vocabulary 128,000.
- **p. 9:** "Llama 3 405B is trained on up to 16K H100 GPUs, each running at 700W TDP with 80GB HBM3".
- **p. 14:** "instant fluctuations of power consumption across the data center on the order of tens of megawatts".

**NOT disclosed in the paper:** total training energy in MWh, and water. A GPU-hours or CO₂ figure may exist in Meta's model card, but that card was not fetched because of the Meta notice.

---

## 4. Energy and environment

### 4a. IEA "Energy and AI" (2025) — NOT RETRIEVED
www.iea.org serves a Cloudflare challenge even on robots.txt. I treated this as a bot wall, so the licence and figures were **not obtained**.

### 4b. Google first-party measurement (company disclosure, CC BY 4.0)
- **Citation:** Elsworth, C., Huang, K., Patterson, D., Schneider, I., Sedivy, R., Goodman, S., Townsend, B., Ranganathan, P., Dean, J., Vahdat, A., Gomes, B., Manyika, J., "Measuring the environmental impact of delivering AI at Google Scale". Google, arXiv:2508.15734 v1, 21 Aug 2025.
- **Licence: CC BY 4.0** (arXiv). This is a preprint by the company itself, so present it as a **company-reported measurement**, not independent.
- **Abstract (p. 1):** "the median Gemini Apps text prompt consumes 0.24 Wh of energy" and "consumes the equivalent of five drops of water (0.26 mL)".
  - Also: "a 33x reduction in energy consumption and a 44x reduction in carbon footprint for the median Gemini Apps text prompt over one year."
- **Table 1 (p. 6), May 2025, Wh/prompt:**

  | Approach | Active AI accel. | CPU & DRAM | Idle machines | Overhead | **Total** |
  |---|---|---|---|---|---|
  | Comprehensive (fleet average) | 0.14 | 0.06 | 0.02 | 0.02 | **0.24** |
  | Existing (top-10% most efficient DCs) | 0.10 | 0.04 * | 0.02 * | 0.01 * | **0.10** |

  \* In the Existing approach, the CPU & DRAM, idle and overhead values are "presented, but not included in the total energy".
- **p. 7:**
  - "a median Gemini Apps text prompt generates 0.03 gCO2e and consumes 0.26 mL of water when measured comprehensively"; the narrow method gives 0.01 gCO2e and 0.15 mL.
  - "a modern television consumes approximately 100 watts of electricity, so 0.24 Wh represents less energy than watching TV for 9 seconds."
  - "The comprehensive approach reveals a total energy consumption that is 2.4 times greater than the estimate from the existing approach".
- **Water method (p. 6):** Water/prompt = (E_Total/prompt − E_Overhead/prompt) × WUE.
  - "For both 2023 and 2024, Google's WUE Category 2 value was 1.15 L/kWh."
  - "On average, Google consumes 80% of the water withdrawn."
- **Scope:** median *text* prompt, Gemini Apps, May 2025. It is not a figure for other models, for images or video, or for training.

### 4c. Independent, peer-reviewed: Luccioni, Jernite & Strubell
- **Citation:** "Power Hungry Processing: Watts Driving the Cost of AI Deployment?", ACM FAccT '24, pp. 85–99, DOI 10.1145/3630106.3658542 (Crossref ✔; the Crossref licence is **CC BY-SA 4.0**).
- **arXiv:** arXiv:2311.16863 v3 (15 Oct 2024); its arXiv licence is also **CC BY-SA 4.0**.
- The PDF also prints an ACM permission notice: "© 2024 Copyright held by the owner/author(s)."
- **Setup:** 88 models, 10 tasks. Energy is per **1,000 inferences** on one GPU; text generation produces 10 new tokens per input (p. 6).
- **Table 2 (p. 6), mean (std) kWh per 1,000 queries:**

  | Task | Mean | Std |
  |---|---|---|
  | text classification | 0.002 | 0.001 |
  | extractive QA | 0.003 | 0.001 |
  | masked LM | 0.003 | 0.001 |
  | token classification | 0.004 | 0.002 |
  | image classification | 0.007 | 0.001 |
  | object detection | 0.038 | 0.02 |
  | text generation | 0.047 | 0.03 |
  | summarization | 0.049 | 0.01 |
  | image captioning | 0.063 | 0.02 |
  | image generation | 2.907 | 3.31 |

- **Quote (p. 6):** "the least efficient image generation model uses as much energy as 522 smartphone charges (11.49 kWh), or around half a charge per image generation".
  - The smartphone charge is taken as 0.022 kWh. The text notes that the EPA figure was 0.012 kWh before January 2024.
- **Caveat:** these are 2023-era open models on A100-class hardware, not frontier chat models.
- **Internal inconsistency:** the prose gives text generation as "0.042 KwH" (median) while Table 2 gives a mean of 0.047. Use the table and label it as the mean.

### 4d. Independent estimate (preprint, CC BY 4.0): Jegham et al.
- **Citation:** Jegham, N., Abdelatti, M., Koh, C. Y., Elmoubarki, L., Hendawi, A., "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference". arXiv:2505.09598 v6, 24 Nov 2025. **Licence CC BY 4.0.**
- **Method:** public API latency data, combined with *inferred* hardware and company PUE/WUE/CIF multipliers. It is model-based, not measured.
- **p. 10:** "Our framework estimates 0.42 Wh (±0.13 Wh) for a short GPT-4o prompt (0.37 Wh without datacenter overhead)".
  - It compares this to the statement that "OpenAI CEO Sam Altman reported that the default ChatGPT model consumed approximately 0.34 Wh per query". That is **secondary**: the original blog post was not fetched.
- **Abstract:** "the most energy-intensive models exceed 29 Wh per long prompt, over 65× the most efficient systems."
- **Label:** independent *estimate* with stated assumptions.

### 4e. Also identified (licence checked; PDF not read)
Samsi et al., "From Words to Watts: Benchmarking the Energy Costs of Large Language Model Inference", arXiv:2310.03003 v1 (4 Oct 2023), **CC BY 4.0**. These are MIT Lincoln Lab measurements on LLaMA.

### 4f. LBNL water
- I grepped `/tmp/vv-research/p15/lbnl2025update.txt` for water.
- It has **no water figures**. The only mentions are on p. 27, "…may be constrained by, supply chain capacity, workforce availability, and water resources", and in an acknowledgements table (feedback on "energy and water consumption" of cooling systems).
- The LBNL 2024 report, which contains water figures, is still blocked: escholarship 403, as recorded in Phase 15.

---

## 5. Coding agents and MCP

### 5a. Model Context Protocol specification
- **Source:** https://modelcontextprotocol.io/specification/latest, which redirected to **/specification/2026-07-28** (the current revision).
- **Licence:** GitHub `modelcontextprotocol/modelcontextprotocol` LICENSE, verbatim: "All new code and specification contributions to the project are licensed under Apache-2.0. Documentation contributions (excluding specifications) are licensed under CC-BY-4.0. … Contributions made by authors who originally licensed their work under the MIT License and who have not yet granted explicit permission to relicense remain licensed under the MIT License."
  - So the spec text is **Apache-2.0 (or MIT for legacy parts)**.
- **Overview quotes:**
  - "Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools."
  - "The protocol uses JSON-RPC 2.0 messages to establish communication between: **Hosts**: LLM applications that initiate connections; **Clients**: Connectors within the host application; **Servers**: Services that provide context and capabilities".
  - Server features: "Resources: Context and data, for the user or the AI model to use; Prompts: Templated messages and workflows for users; **Tools: Functions for the AI model to execute**".
  - Client feature: "Elicitation: Server requests for additional information from users".
  - "MCP takes some inspiration from the Language Server Protocol".
  - Safety: "Tools represent arbitrary code execution and must be treated with appropriate caution." "Hosts must obtain explicit user consent before invoking any tool".
- **Tools page** (/specification/2026-07-28/server/tools):
  - "The Model Context Protocol (MCP) allows servers to expose tools that can be invoked by language models. Tools enable models to interact with external systems, such as querying databases, calling APIs, or performing computations. Each tool is uniquely identified by a name and includes metadata describing its schema."
  - "Tools in MCP are designed to be model-controlled".
  - "there SHOULD always be a human in the loop with the ability to deny tool invocations."

### 5b. Claude Code documentation
- **Sources:**
  - https://code.claude.com/docs/en/overview
  - https://code.claude.com/docs/en/how-claude-code-works
- **Robots:** Content-Signal ai-input=yes.
- **Licence:** none stated (copyright Anthropic), so use short quotes only.
- **Quotes:**
  - "Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools."
  - "When you give Claude a task, it works through three phases: gather context, take action, and verify results."
  - "The agentic loop is powered by two components: models that reason and tools that act."
  - "Tools are what make Claude Code agentic. Without tools, Claude can only respond with text."
  - "Claude's context window holds your conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions. As you work, context fills up."
  - "Claude has two safety mechanisms: checkpoints let you undo file changes, and permissions control what Claude can do without asking."
  - "Sessions are independent. Each new session starts with a fresh context window".

---

## 6. Licence summary

| Item | Licence / status |
|---|---|
| Vaswani, Goodfellow, Ho, Kaplan, Brown (GPT-3), OpenAI GPT-4 report, Llama 3 | **arXiv non-exclusive 1.0** (not CC): short quotes; equations are facts. Vaswani adds a Google figures/tables permission for "journalistic or scholarly works". |
| Google Elsworth et al.; Jegham et al.; Samsi et al. | **CC BY 4.0** |
| Luccioni et al. | **CC BY-SA 4.0** (arXiv and Crossref) |
| d2l.ai | text **CC BY-SA 4.0**; code modified MIT |
| MCP spec | **Apache-2.0** (legacy MIT); docs CC BY 4.0 |
| Cauchy 1847 (archive.org) | **Public Domain Mark 1.0** |
| Turing 1950 | PD in UK/EU since 2025; probably © in US until 2045; IA copy unlicensed → short quotes |
| Dartmouth 1955 (Stanford JMC) | no licence → short quotes |
| Rosenblatt 1961, Widrow–Hoff 1960 (DTIC via IA) | US-contract reports; Widrow–Hoff is Distribution A, "no restrictions … upon its use and disclosure"; copyright not formally confirmed → short quotes plus equations |
| Anthropic, Google model pages; Claude Code docs | proprietary → facts plus short quotes |

## 7. NOT FOUND / NOT RETRIEVED
1. **IEA "Energy and AI" (2025):** www.iea.org bot wall (Cloudflare challenge on robots.txt). No licence or figures.
2. **Rosenblatt 1957 CAL report 85-460-1:** no open copy found (IA search 0 hits; apps.dtic.mil robots 403).
3. **Rosenblatt 1958 *Psych. Rev.*:** cite only (APA).
4. **Rumelhart, Hinton & Williams 1986:** cite only (Nature).
5. **Widrow & Hoff IRE WESCON 1960 proceedings version:** not found; the Stanford TR 1553-1 is used instead.
6. **Nielsen, *Neural Networks and Deep Learning*:** taken down by the author (Nov 2026). Not used.
7. **OpenAI current model documentation:** not collected, because the Terms of Use forbid programmatic extraction.
8. **Meta llama.com / ai.meta.com model cards** (GPU hours, CO₂): not fetched, because of the automated-collection prohibition notice.
9. **Water figures from LBNL:** none in the 2025 Update; the 2024 report is blocked.
10. **Turing's "10⁹" exponent:** not legible with certainty on the available scan. Needs a second copy.
11. **Cauchy sitting date (18 Oct 1847):** inferred only, not checked on an image.
12. **Parameter counts, training compute, energy and water for current Claude, Gemini 4 and OpenAI models:** **not disclosed** by their developers in any fetched source.
