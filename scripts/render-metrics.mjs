import { getProfileData, offlineProfile } from './github-data.mjs';
import { bar, escapeXml, readConfig, writeGenerated } from './utils.mjs';

const config = await readConfig();
const data = process.env.PROFILE_OFFLINE === '1'
  ? offlineProfile(config.username)
  : await getProfileData(config.username);

const langs = data.languages.slice(0, 5);
const maxLang = Math.max(...langs.map(([, count]) => count), 1);
const recent = data.recent.slice(0, 4);
const updated = new Date().toISOString().slice(0, 10);

const langColors = ['#38bdf8', '#8b5cf6', '#2dd4bf', '#a78bfa', '#60a5fa'];

const languageRows = langs.map(([name, count], i) => {
  const y = 190 + i * 29;
  const color = langColors[i % langColors.length];
  return `<text x="44" y="${y}" class="label">${escapeXml(name)}</text>
  <rect x="156" y="${y - 11}" width="180" height="7" rx="3.5" class="track"/>
  <rect x="156" y="${y - 11}" width="${bar(count, maxLang)}" height="7" rx="3.5" fill="${color}"/>
  <text x="348" y="${y}" class="muted">${count} repos</text>`;
}).join('\n');

const recentRows = recent.map((repo, i) => {
  const y = 190 + i * 44;
  const nodeColor = i % 2 === 0 ? '#38bdf8' : '#8b5cf6';
  const date = String(repo.pushed_at ?? '').slice(0, 10);
  return `<circle cx="496" cy="${y - 5}" r="4" fill="${nodeColor}"/>
  <line x1="496" y1="${y}" x2="496" y2="${y + 38}" class="trace"/>
  <text x="516" y="${y}" class="repo">${escapeXml(repo.name)}</text>
  <text x="516" y="${y + 17}" class="muted">push ${escapeXml(date)}</text>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="370" viewBox="0 0 960 370" role="img" aria-label="Live GitHub telemetry">
<style>
  :root { color-scheme: dark; }
  .bg { fill: #07111f; }
  .panel { fill: #0b1424; stroke: #1e293b; }
  .kicker { font: 700 11px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing: 2.5px; fill: #38bdf8; }
  .kicker-rag { font: 700 11px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing: 2.5px; fill: #8b5cf6; }
  .title { font: 700 21px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; fill: #e5eefb; }
  .metric { font: 700 26px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #f8fafc; }
  .label { font: 600 12.5px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #c8d9ea; }
  .repo { font: 600 12.5px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #e5eefb; }
  .muted { font: 500 11px ui-monospace,SFMono-Regular,Menlo,monospace; fill: #7188a1; }
  .track { fill: #152238; }
  .trace { stroke: #1e334d; stroke-width: 1.5; }
  .scan { fill: url(#scan-telemetry); opacity: .18; animation: scan 6s linear infinite; }
  @keyframes scan { from { transform: translateY(-70px); } to { transform: translateY(410px); } }
</style>
<defs>
  <linearGradient id="scan-telemetry" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#38bdf8" stop-opacity="0"/>
    <stop offset=".5" stop-color="#8b5cf6" stop-opacity=".4"/>
    <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="960" height="370" rx="18" class="bg"/>
<rect x="14" y="14" width="932" height="342" rx="14" class="panel"/>
<text x="42" y="52" class="kicker">SYSTEM TELEMETRY</text>
<text x="42" y="78" class="title">Engineering &amp; Activity Telemetry</text>
<text x="755" y="52" class="muted">SNAPSHOT ${updated}</text>
<g transform="translate(42 100)">
  <text y="22" class="metric">${data.stats.publicRepos}</text>
  <text y="42" class="muted">PUBLIC REPOS</text>
  <g transform="translate(120 0)">
    <text y="22" class="metric">${data.stats.recentlyUpdated}</text>
    <text y="42" class="muted">ACTIVE / 30D</text>
  </g>
  <g transform="translate(245 0)">
    <text y="22" class="metric">${data.stats.stars}</text>
    <text y="42" class="muted">STARS</text>
  </g>
  <g transform="translate(350 0)">
    <text y="22" class="metric">${data.stats.forks}</text>
    <text y="42" class="muted">FORKS</text>
  </g>
</g>
<text x="42" y="166" class="kicker">CORE STACK DISTRIBUTION</text>
${languageRows}
<text x="496" y="166" class="kicker-rag">RECENT REPOSITORY COMMITS</text>
${recentRows}
<rect x="0" y="-70" width="960" height="70" class="scan"/>
</svg>`;

await writeGenerated('metrics.svg', svg);
