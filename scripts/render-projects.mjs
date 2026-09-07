import { getRepositories, offlineRepositories } from './github-data.mjs';
import { escapeXml, readConfig, truncate, writeGenerated } from './utils.mjs';

const DEFAULT_DESCRIPTIONS = {
  'Medical-NLU-Pipeline': 'Clinical NLU pipeline for medical entity extraction and classification benchmarks.',
  'tdtu-student-handbook-chatbot': 'Domain-specific assistant using retrieval-augmented generation for handbook knowledge.',
  'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis': 'Interactive web dashboard for Apriori mining, pruning analysis, and visualization.',
  'Invoice-engine': 'Local-first Vietnamese business document parser with deterministic validation.',
  'meter-reading-engine-v2': 'Production LCD meter OCR pipeline with explicit quality gates & PP-OCRv6 recognition.',
  'meter-reading-inference-service': 'FastAPI inference microservice with revision verification and fail-closed readiness.',
  'meter-reading-pipeline-visualizer': 'Visual telemetry and interactive stage inspector for meter-reading pipeline.'
};

const config = await readConfig();

const healthRepoNames = config.tracks?.healthcare?.repositories?.slice(0, 3) ?? [
  'Medical-NLU-Pipeline',
  'tdtu-student-handbook-chatbot',
  'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis'
];

const visionRepoNames = config.tracks?.vision?.repositories?.slice(0, 3) ?? [
  'Invoice-engine',
  'meter-reading-engine-v2',
  'meter-reading-inference-service'
];

const allNames = [...healthRepoNames, ...visionRepoNames];

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
  const lang = repo.language || (repo.name.includes('visualizer') ? 'TypeScript' : (repo.name.includes('Dashboard') ? 'PHP' : 'Python'));
  const displayName = repo.name === 'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis'
    ? 'FIM / Apriori Mining Dashboard'
    : repo.name.replaceAll('-', ' ');

  return `<g transform="translate(${x} ${y})">
    <rect width="446" height="120" rx="12" class="card" stroke="#153b60"/>
    <line x1="0" y1="14" x2="0" y2="106" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
    <text x="20" y="28" class="project-title">${escapeXml(truncate(displayName, 38))}</text>
    <rect x="352" y="14" width="78" height="18" rx="9" fill="${accentColor}18" stroke="${accentColor}44"/>
    <text x="391" y="27" text-anchor="middle" font-size="9.5" font-weight="600" fill="${accentColor}">${tag}</text>
    <text x="20" y="50" class="meta">${escapeXml(lang)} · ★ ${repo.stargazers_count ?? 0}</text>
    <text x="20" y="74" class="desc">${escapeXml(truncate(desc, 62))}</text>
    <text x="20" y="98" class="link">github.com/${config.username}/${escapeXml(repo.name)}</text>
  </g>`;
}

const healthCards = healthRepoNames.map((name, i) => renderCard(name, 24, 68 + i * 134, '#14b8a6', 'HEALTH AI')).join('\n');
const visionCards = visionRepoNames.map((name, i) => renderCard(name, 490, 68 + i * 134, '#38bdf8', 'VISION AI')).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="485" viewBox="0 0 960 485" role="img" aria-label="Featured Systems Tracks">
<style>
  :root { color-scheme: dark; }
  .bg { fill: #051324; }
  .panel { fill: #081e35; stroke: #153b60; }
  .card { fill: #0a2542; }
  .lane-hdr { font: 700 12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; letter-spacing: 1px; }
  .lane-health { fill: #14b8a6; }
  .lane-vision { fill: #38bdf8; }
  .project-title { font: 700 13.5px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; fill: #f8fafc; }
  .meta { font: 500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; fill: #2dd4bf; }
  .desc { font: 400 11.5px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; fill: #94a3b8; }
  .link { font: 500 10px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #60a5fa; }
</style>
<rect width="960" height="485" rx="18" class="bg"/>
<rect x="14" y="14" width="932" height="457" rx="14" class="panel"/>
<!-- Healthcare Lane Header -->
<g transform="translate(24 42)">
  <circle cx="6" cy="-4" r="4.5" fill="#14b8a6"/>
  <text x="18" y="0" class="lane-hdr lane-health">TRACK 01: HEALTHCARE AI &amp; CLINICAL INFORMATICS</text>
</g>
<!-- Vision Lane Header -->
<g transform="translate(490 42)">
  <circle cx="6" cy="-4" r="4.5" fill="#38bdf8"/>
  <text x="18" y="0" class="lane-hdr lane-vision">TRACK 02: COMPUTER VISION &amp; DOCUMENT AI</text>
</g>
${healthCards}
${visionCards}
</svg>`;

await writeGenerated('projects.svg', svg);
