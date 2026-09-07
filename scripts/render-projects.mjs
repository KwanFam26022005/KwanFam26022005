import { getRepositories, offlineRepositories } from './github-data.mjs';
import { escapeXml, FONT_MONO, FONT_SANS, readConfig, truncate, writeGenerated } from './utils.mjs';

const DEFAULT_DESCRIPTIONS = {
  'Medical-NLU-Pipeline': 'Clinical and medical natural-language understanding experiments and evaluation.',
  'tdtu-student-handbook-chatbot': 'Domain-specific assistant using retrieval-augmented generation for handbook knowledge.',
  'Invoice-engine': 'Local-first Vietnamese business-document processing with deterministic validation.',
  'meter-reading-engine-v2': 'Production-oriented LCD meter OCR pipeline with explicit quality gates and PP-OCRv6.',
  'meter-reading-inference-service': 'FastAPI inference adapter with revision checks, readiness probes and fail-closed behavior.'
};

const AGENTIC_TAGS = {
  'tdtu-student-handbook-chatbot': 'RAG',
  'Medical-NLU-Pipeline': 'CLINICAL NLP'
};

const VISION_TAGS = {
  'meter-reading-engine-v2': 'OCR',
  'Invoice-engine': 'DOCUMENT AI',
  'meter-reading-inference-service': 'INFERENCE'
};

const config = await readConfig();
const agenticNames = config.tracks?.agentic?.repositories ?? ['tdtu-student-handbook-chatbot', 'Medical-NLU-Pipeline'];
const visionNames = config.tracks?.vision?.repositories ?? ['meter-reading-engine-v2', 'Invoice-engine', 'meter-reading-inference-service'];
const fetchNames = [...new Set([...agenticNames, ...visionNames])];

let repoMap = new Map();
if (process.env.PROFILE_OFFLINE === '1') {
  for (const r of offlineRepositories()) repoMap.set(r.name, r);
} else {
  try {
    const fetched = await getRepositories(config.username, fetchNames);
    for (const r of fetched) repoMap.set(r.name, r);
  } catch {
    for (const r of offlineRepositories()) repoMap.set(r.name, r);
  }
}

function repoRow(repoName, x, y, accent, tag) {
  const repo = repoMap.get(repoName) ?? { name: repoName, language: 'Python', stargazers_count: 0 };
  const desc = repo.description || DEFAULT_DESCRIPTIONS[repo.name] || 'Systems research repository.';
  const display = repo.name.replaceAll('-', ' ');
  return `<g transform="translate(${x} ${y})">
    <line x1="0" y1="0" x2="414" y2="0" stroke="#e2e8f0"/>
    <circle cx="8" cy="22" r="3.5" fill="#2563eb"/>
    <text x="22" y="20" class="repo">${escapeXml(truncate(display, 34))}</text>
    <text x="22" y="39" class="desc">${escapeXml(truncate(desc, 58))}</text>
    <text x="414" y="20" class="tag">${tag}</text>
  </g>`;
}

function researchRow(x, y) {
  return `<g transform="translate(${x} ${y})">
    <line x1="0" y1="0" x2="414" y2="0" stroke="#e2e8f0"/>
    <circle cx="8" cy="22" r="3.5" fill="#2563eb"/>
    <text x="22" y="20" class="repo">KOA Agentic-RAG</text>
    <text x="22" y="39" class="desc">Bilingual evidence-verified clinical guideline QA research prototype.</text>
    <text x="414" y="20" class="tag">RESEARCH</text>
  </g>`;
}

const leftRows = [
  researchRow(32, 108),
  ...agenticNames.slice(0, 2).map((name, i) => repoRow(name, 32, 170 + i * 62, '#0969da', AGENTIC_TAGS[name] ?? 'AGENTIC'))
].join('\n');

const rightRows = visionNames.slice(0, 3).map((name, i) => repoRow(name, 510, 108 + i * 62, '#0969da', VISION_TAGS[name] ?? 'VISION')).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="330" viewBox="0 0 960 330" role="img" aria-label="Research and engineering tracks">
<style>
  text { font-family: ${FONT_SANS}; }
  .mono { font-family: ${FONT_MONO}; }
  .sans { font-family: ${FONT_SANS}; }
  .prompt { font-family: ${FONT_MONO}; font-size: 10.5px; fill: #0969da; font-weight: 600; }
  .lane { font-family: ${FONT_SANS}; font-size: 13px; font-weight: 700; letter-spacing: .8px; fill: #0969da; }
  .sub { font-family: ${FONT_MONO}; font-size: 10.5px; fill: #64748b; }
  .repo { font-family: ${FONT_SANS}; font-size: 12px; font-weight: 600; fill: #0f172a; }
  .desc { font-family: ${FONT_SANS}; font-size: 10.5px; font-weight: 400; fill: #475569; }
  .tag { font-family: ${FONT_MONO}; font-size: 9px; font-weight: 700; letter-spacing: .6px; text-anchor: end; fill: #0969da; }
</style>
<rect width="960" height="330" rx="14" fill="#ffffff" stroke="#d0d7de" stroke-width="1.2"/>
<rect x="12" y="12" width="936" height="306" rx="10" fill="#f8fafc" stroke="#d0d7de" stroke-width="1"/>
<text x="30" y="36" class="mono prompt">&gt; ls ./research-tracks --featured</text>
<rect x="247" y="26" width="6" height="12" rx="1" fill="#0969da"><animate attributeName="opacity" values="1;.12;1" dur="1.15s" repeatCount="indefinite"/></rect>

<g transform="translate(32 72)">
  <text class="sans lane">01 / AGENTIC-RAG · EVIDENCE SYSTEMS</text>
  <text y="20" class="mono sub">retrieval · verification · healthcare knowledge</text>
</g>
<g transform="translate(510 72)">
  <text class="sans lane">02 / COMPUTER VISION · OCR SYSTEMS</text>
  <text y="20" class="mono sub">document AI · inspection · production inference</text>
</g>
<line x1="480" y1="66" x2="480" y2="298" stroke="#e2e8f0"/>
${leftRows}
${rightRows}
</svg>`;

await writeGenerated('projects.svg', svg);
await writeGenerated('projects-light.svg', svg);
