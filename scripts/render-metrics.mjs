import { getProfileData, offlineProfile } from './github-data.mjs';
import { bar, escapeXml, readConfig, truncate, writeGenerated } from './utils.mjs';

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
const accents = ['#38bdf8', '#a78bfa', '#2dd4bf', '#60a5fa', '#5eead4'];

const languageRows = langs.map(([name, count], i) => {
  const y = 142 + i * 25;
  const width = bar(count, maxLang, 155);
  return `<text x="42" y="${y}" class="key">${escapeXml(name)}</text>
  <text x="154" y="${y}" class="muted">${String(count).padStart(2, '0')} repos</text>
  <rect x="218" y="${y - 8}" width="155" height="5" rx="2.5" fill="#0e2a40"/>
  <rect x="218" y="${y - 8}" width="${width}" height="5" rx="2.5" fill="${accents[i % accents.length]}"/>`;
}).join('\n');

const recentRows = recent.map((repo, i) => {
  const y = 142 + i * 31;
  const date = String(repo.pushed_at ?? '').slice(5, 10);
  return `<text x="500" y="${y}" class="date">${escapeXml(date)}</text>
  <text x="552" y="${y}" class="repo">${escapeXml(truncate(repo.name, 38))}</text>
  <text x="882" y="${y}" text-anchor="end" class="muted">push</text>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="280" viewBox="0 0 960 280" role="img" aria-label="Development activity">
<style>
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
  .sans{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
  .prompt{font-size:10.5px;fill:#6f9ab4}
  .title{font-size:17px;font-weight:700;fill:#f8fafc}
  .stat{font-size:13px;font-weight:700;fill:#dff4ff}
  .muted{font-size:9.5px;fill:#5f8196}
  .key{font-size:10.5px;fill:#bad7e8}
  .date{font-size:10px;fill:#5e8ba5}
  .repo{font-size:10.5px;fill:#d8e9f5}
</style>
<rect width="960" height="280" rx="18" fill="#06111f"/>
<rect x="12" y="12" width="936" height="256" rx="14" fill="#081829" stroke="#153a55"/>
<text x="30" y="36" class="mono prompt">khoa@github:~$ ./profile --activity</text>
<rect x="254" y="26" width="6" height="12" rx="1" fill="#5eead4"><animate attributeName="opacity" values="1;.12;1" dur="1.15s" repeatCount="indefinite"/></rect>
<text x="30" y="64" class="sans title">Development signal</text>
<text x="824" y="36" class="mono muted">${updated}</text>

<g transform="translate(30 84)" class="mono">
  <text class="stat">repos ${data.stats.publicRepos}</text>
  <text x="104" class="stat">active/30d ${data.stats.recentlyUpdated}</text>
  <text x="244" class="stat">stars ${data.stats.stars}</text>
  <text x="332" class="stat">forks ${data.stats.forks}</text>
</g>

<text x="30" y="118" class="mono prompt">&gt; languages --by-repository</text>
${languageRows}
<text x="490" y="118" class="mono prompt">&gt; recent --pushes</text>
${recentRows}
</svg>`;

await writeGenerated('metrics.svg', svg);
