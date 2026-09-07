import { getRepositories, offlineRepositories } from './github-data.mjs';
import { escapeXml, readConfig, truncate, writeGenerated } from './utils.mjs';

const DEFAULT_DESCRIPTIONS = {
  'meter-reading-engine-v2': 'Production LCD meter OCR pipeline with explicit quality gates & PP-OCRv6 recognition.',
  'meter-reading-inference-service': 'FastAPI inference microservice with revision verification and fail-closed readiness.',
  'meter-reading-pipeline-visualizer': 'Visual telemetry and interactive stage inspector for meter-reading pipeline.',
  'Medical-NLU-Pipeline': 'Clinical NLU pipeline for medical entity extraction and classification benchmarks.',
  'tdtu-student-handbook-chatbot': 'Domain-specific student handbook assistant with retrieval-augmented generation.',
  'Invoice-engine': 'Local-first Vietnamese business document parser with deterministic validation.',
  'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis': 'Interactive web dashboard for Apriori mining, pruning analysis, and visualization.'
};

const config = await readConfig();

const cvRepoNames = config.tracks?.cv?.repositories?.slice(0, 3) ?? [
  'meter-reading-engine-v2',
  'meter-reading-inference-service',
  'meter-reading-pipeline-visualizer'
];

const ragRepoNames = config.tracks?.rag?.repositories?.slice(0, 3) ?? [
  'Medical-NLU-Pipeline',
  'tdtu-student-handbook-chatbot',
  'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis'
];

const allNames = [...cvRepoNames, ...ragRepoNames];

let repoMap = new Map();
if (process.env.PROFILE_OFFLINE === '1') {
  for (const r of offlineRepositories()) repoMap.set(r.name, r);
} else {
  try {
    const fetched = await getRepositories(config.username, allNames);
    for (const r of fetched) repoMap.set(r.name, r);
  } catch {
    for (const r of offlineRepositories()) repoMap.set(r.name, r);
  }
}

function renderCard(repoName, x, y, accentColor, tag) {
  const repo = repoMap.get(repoName) ?? { name: repoName, language: 'Python', stargazers_count: 0 };
  const desc = repo.description || DEFAULT_DESCRIPTIONS[repo.name] || 'Systems research repository on GitHub.';
  const lang = repo.language || (repo.name.includes('visualizer') ? 'TypeScript' : 'Python');
  const displayName = repo.name === 'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis'
    ? 'FIM / APRIORI DASHBOARD'
    : repo.name.replaceAll('-', ' ').toUpperCase();

  return `<g transform="translate(${x} ${y})">
    <rect width="446" height="122" rx="12" class="card" stroke="#1e293b"/>
    <line x1="0" y1="14" x2="0" y2="108" stroke="${accentColor}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="20" y="28" class="project-title">${escapeXml(truncate(displayName, 36))}</text>
    <rect x="356" y="14" width="74" height="18" rx="9" fill="${accentColor}22" stroke="${accentColor}55"/>
    <text x="393" y="27" text-anchor="middle" font-size="9" font-weight="700" fill="${accentColor}">${tag}</text>
    <text x="20" y="50" class="meta">${escapeXml(lang)} · ★ ${repo.stargazers_count ?? 0}</text>
    <text x="20" y="75" class="desc">${escapeXml(truncate(desc, 60))}</text>
    <text x="20" y="100" class="link">github.com/${config.username}/${escapeXml(repo.name)}</text>
  </g>`;
}

const cvCards = cvRepoNames.map((name, i) => renderCard(name, 24, 72 + i * 136, '#38bdf8', 'CV / OCR')).join('\n');
const ragCards = ragRepoNames.map((name, i) => renderCard(name, 490, 72 + i * 136, '#8b5cf6', 'AGENTIC')).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="495" viewBox="0 0 960 495" role="img" aria-label="Featured Systems Tracks">
<style>
  :root { color-scheme: dark; }
  .bg { fill: #07111f; }
  .panel { fill: #0b1424; stroke: #1e293b; }
  .card { fill: #0f172a; }
  .lane-hdr { font: 700 11px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing: 2px; }
  .lane-cv { fill: #38bdf8; }
  .lane-rag { fill: #8b5cf6; }
  .project-title { font: 700 13px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #e5eefb; letter-spacing: .3px; }
  .meta { font: 600 11px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #2dd4bf; }
  .desc { font: 500 11.5px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; fill: #9fb3c8; }
  .link { font: 500 10px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #627d98; }
</style>
<rect width="960" height="495" rx="18" class="bg"/>
<rect x="14" y="14" width="932" height="467" rx="14" class="panel"/>
<!-- CV Lane Header -->
<g transform="translate(24 44)">
  <circle cx="6" cy="-4" r="4.5" fill="#38bdf8"/>
  <text x="18" y="0" class="lane-hdr lane-cv">TRACK 01 // COMPUTER VISION &amp; OCR SYSTEMS</text>
</g>
<!-- RAG Lane Header -->
<g transform="translate(490 44)">
  <circle cx="6" cy="-4" r="4.5" fill="#8b5cf6"/>
  <text x="18" y="0" class="lane-hdr lane-rag">TRACK 02 // AGENTIC-RAG &amp; RESEARCH SYSTEMS</text>
</g>
${cvCards}
${ragCards}
</svg>`;

await writeGenerated('projects.svg', svg);
