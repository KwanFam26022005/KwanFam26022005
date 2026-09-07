import { getProfileData, offlineProfile } from './github-data.mjs';
import { bar, escapeXml, readConfig, writeGenerated } from './utils.mjs';

const config = await readConfig();
let data;
if (process.env.PROFILE_OFFLINE === '1') {
  data = offlineProfile(config.username);
} else {
  try {
    data = await getProfileData(config.username);
  } catch {
    data = offlineProfile(config.username);
  }
}

const langs = data.languages.slice(0, 5);
const maxLang = Math.max(...langs.map(([, count]) => count), 1);
const recent = data.recent.slice(0, 4);
const updated = new Date().toISOString().slice(0, 10);

const langColors = ['#14b8a6', '#38bdf8', '#06d6a0', '#60a5fa', '#2dd4bf'];

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
  const nodeColor = i % 2 === 0 ? '#14b8a6' : '#38bdf8';
  const date = String(repo.pushed_at ?? '').slice(0, 10);
  return `<circle cx="496" cy="${y - 5}" r="4" fill="${nodeColor}"/>
  <line x1="496" y1="${y}" x2="496" y2="${y + 38}" class="trace"/>
  <text x="516" y="${y}" class="repo">${escapeXml(repo.name)}</text>
  <text x="516" y="${y + 17}" class="muted">pushed ${escapeXml(date)}</text>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="360" viewBox="0 0 960 360" role="img" aria-label="Development Activity Telemetry">
<style>
  :root { color-scheme: dark; }
  .sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .bg { fill: #051324; }
  .panel { fill: #081e35; stroke: #153b60; }
  .kicker { font: 700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; letter-spacing: 1px; fill: #14b8a6; }
  .kicker-vision { font: 700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; letter-spacing: 1px; fill: #38bdf8; }
  .title { font: 700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #f8fafc; }
  .metric { font: 700 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #f0fdfa; }
  .label { font: 500 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #cbd5e1; }
  .repo { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #f8fafc; }
  .muted { font: 400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #7ba1c2; }
  .track { fill: #0d2847; }
  .trace { stroke: #153e66; stroke-width: 1.5; }
</style>
<rect width="960" height="360" rx="18" class="bg"/>
<rect x="14" y="14" width="932" height="332" rx="14" class="panel"/>
<text x="42" y="50" class="kicker">ACTIVITY TELEMETRY</text>
<text x="42" y="76" class="title">Development &amp; Research Activity</text>
<text x="760" y="50" class="muted">SNAPSHOT ${updated}</text>
<g transform="translate(42 98)">
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
<text x="42" y="166" class="kicker">PRIMARY TECH STACK</text>
${languageRows}
<text x="496" y="166" class="kicker-vision">RECENT COMMITS</text>
${recentRows}
</svg>`;

await writeGenerated('metrics.svg', svg);
