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
    ? 'FIM / APRIORI MINING DASHBOARD'
    : repo.name.replaceAll('-', ' ').toUpperCase();

  return `<g transform="translate(${x} ${y})">
    <rect width="446" height="122" rx="12" class="card" stroke="#163f66"/>
    <line x1="0" y1="14" x2="0" y2="108" stroke="${accentColor}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="20" y="28" class="project-title">${escapeXml(truncate(displayName, 36))}</text>
    <rect x="356" y="14" width="74" height="18" rx="9" fill="${accentColor}1c" stroke="${accentColor}44"/>
    <text x="393" y="27" text-anchor="middle" font-size="9" font-weight="700" fill="${accentColor}">${tag}</text>
    <text x="20" y="50" class="meta">${escapeXml(lang)} · ★ ${repo.stargazers_count ?? 0}</text>
    <text x="20" y="75" class="desc">${escapeXml(truncate(desc, 60))}</text>
    <text x="20" y="100" class="link">github.com/${config.username}/${escapeXml(repo.name)}</text>
  </g>`;
}

const healthCards = healthRepoNames.map((name, i) => renderCard(name, 24, 72 + i * 136, '#14b8a6', 'HEALTH AI')).join('\n');
const visionCards = visionRepoNames.map((name, i) => renderCard(name, 490, 72 + i * 136, '#38bdf8', 'VISION AI')).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="495" viewBox="0 0 960 495" role="img" aria-label="Featured Systems Tracks">
<style>
  :root { color-scheme: dark; }
  .bg { fill: #041426; }
  .panel { fill: #08213a; stroke: #163f66; }
  .card { fill: #0b2949; }
  .lane-hdr { font: 700 11px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing: 2px; }
  .lane-health { fill: #14b8a6; }
  .lane-vision { fill: #38bdf8; }
  .project-title { font: 700 13px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #f0f9ff; letter-spacing: .3px; }
  .meta { font: 600 11px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #2dd4bf; }
  .desc { font: 500 11.5px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; fill: #94a3b8; }
  .link { font: 500 10px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #60a5fa; }
</style>
<rect width="960" height="495" rx="18" class="bg"/>
<rect x="14" y="14" width="932" height="467" rx="14" class="panel"/>
<!-- Healthcare Lane Header -->
<g transform="translate(24 44)">
  <circle cx="6" cy="-4" r="4.5" fill="#14b8a6"/>
  <text x="18" y="0" class="lane-hdr lane-health">TRACK 01 // HEALTHCARE AI &amp; CLINICAL INFORMATICS</text>
</g>
<!-- Vision Lane Header -->
<g transform="translate(490 44)">
  <circle cx="6" cy="-4" r="4.5" fill="#38bdf8"/>
  <text x="18" y="0" class="lane-hdr lane-vision">TRACK 02 // COMPUTER VISION &amp; DOCUMENT AI</text>
</g>
${healthCards}
${visionCards}
</svg>`;

await writeGenerated('projects.svg', svg);
