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

const languageRows = langs.map(([name, count], i) => {
  const y = 188 + i * 29;
  return `<text x="44" y="${y}" class="label">${escapeXml(name)}</text>
  <rect x="150" y="${y - 12}" width="180" height="8" rx="4" class="track"/>
  <rect x="150" y="${y - 12}" width="${bar(count, maxLang)}" height="8" rx="4" class="fill"/>
  <text x="342" y="${y}" class="muted">${count} repos</text>`;
}).join('\n');

const recentRows = recent.map((repo, i) => {
  const y = 188 + i * 45;
  const date = String(repo.pushed_at ?? '').slice(0, 10);
  return `<circle cx="490" cy="${y - 5}" r="4" class="node"/>
  <line x1="490" y1="${y}" x2="490" y2="${y + 40}" class="trace"/>
  <text x="510" y="${y}" class="repo">${escapeXml(repo.name)}</text>
  <text x="510" y="${y + 18}" class="muted">push ${escapeXml(date)}</text>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="380" viewBox="0 0 960 380" role="img" aria-label="Live GitHub telemetry">
<style>
  :root{color-scheme:dark}.bg{fill:#071018}.panel{fill:#0a141d;stroke:#1d3343}.kicker{font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:2px;fill:#64d8ff}.title{font:700 23px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:#edf8ff}.metric{font:700 27px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#f7fcff}.label{font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#c9e6f5}.repo{font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#e7f6ff}.muted{font:500 11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#6f8b9d}.track{fill:#132432}.fill{fill:#47c7f2}.node{fill:#75e6ff}.trace{stroke:#234459;stroke-width:1}.scan{fill:url(#scan);opacity:.22;animation:scan 5s linear infinite}@keyframes scan{from{transform:translateY(-70px)}to{transform:translateY(430px)}}
</style>
<defs><linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5ee3ff" stop-opacity="0"/><stop offset=".5" stop-color="#5ee3ff" stop-opacity=".45"/><stop offset="1" stop-color="#5ee3ff" stop-opacity="0"/></linearGradient></defs>
<rect width="960" height="380" rx="20" class="bg"/><rect x="18" y="18" width="924" height="344" rx="16" class="panel"/>
<text x="42" y="55" class="kicker">LIVE SYSTEM TELEMETRY</text><text x="42" y="84" class="title">GitHub activity snapshot</text><text x="765" y="56" class="muted">UPDATED ${updated}</text>
<g transform="translate(42 105)"><text y="22" class="metric">${data.stats.publicRepos}</text><text y="43" class="muted">PUBLIC REPOS</text><g transform="translate(112 0)"><text y="22" class="metric">${data.stats.recentlyUpdated}</text><text y="43" class="muted">ACTIVE / 30D</text></g><g transform="translate(230 0)"><text y="22" class="metric">${data.stats.stars}</text><text y="43" class="muted">TOTAL STARS</text></g><g transform="translate(332 0)"><text y="22" class="metric">${data.stats.forks}</text><text y="43" class="muted">FORKS</text></g></g>
<text x="42" y="164" class="kicker">PRIMARY LANGUAGES</text>${languageRows}
<text x="470" y="164" class="kicker">RECENTLY PUSHED</text>${recentRows}
<rect x="0" y="-70" width="960" height="70" class="scan"/>
</svg>`;

await writeGenerated('metrics.svg', svg);
