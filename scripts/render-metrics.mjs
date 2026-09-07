import { getProfileData, offlineProfile } from './github-data.mjs';
import { bar, escapeXml, FONT_MONO, FONT_SANS, readConfig, truncate, writeGenerated } from './utils.mjs';

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
const accents = ['#5e83a4', '#4e708f', '#405e7a', '#344e66', '#2b4054'];

const languageRows = langs.map(([name, count], i) => {
  const y = 142 + i * 25;
  const width = bar(count, maxLang, 155);
  return `<text x="42" y="${y}" class="key">${escapeXml(name)}</text>
  <text x="154" y="${y}" class="muted">${String(count).padStart(2, '0')} repos</text>
  <rect x="218" y="${y - 8}" width="155" height="5" rx="2.5" fill="#0d1b28"/>
  <rect x="218" y="${y - 8}" width="${width}" height="5" rx="2.5" fill="${accents[i % accents.length]}"/>`;
}).join('\n');

const recentRows = recent.map((repo, i) => {
  const y = 142 + i * 31;
  const date = String(repo.pushed_at ?? '').slice(5, 10);
  return `<text x="500" y="${y}" class="date">${escapeXml(date)}</text>
  <text x="552" y="${y}" class="repo">${escapeXml(truncate(repo.name, 38))}</text>
  <text x="882" y="${y}" text-anchor="end" class="muted">push</text>`;
}).join('\n');

const statItems = [
  { label: 'repos', value: data.stats.publicRepos },
  { label: 'active/30d', value: data.stats.recentlyUpdated }
];
if (data.stats.stars > 0) {
  statItems.push({ label: 'stars', value: data.stats.stars });
}
if (data.stats.forks > 0) {
  statItems.push({ label: 'forks', value: data.stats.forks });
}

let curStatX = 0;
const statElements = statItems.map(item => {
  const text = `${item.label} ${item.value}`;
  const el = `<text x="${curStatX}" class="stat">${escapeXml(text)}</text>`;
  curStatX += Math.round(text.length * 8.8 + 24);
  return el;
}).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="280" viewBox="0 0 960 280" role="img" aria-label="Development activity">
<style>
  text { font-family: ${FONT_MONO}; }
  .mono { font-family: ${FONT_MONO}; }
  .sans { font-family: ${FONT_SANS}; }
  .prompt { font-family: ${FONT_MONO}; font-size: 10.5px; fill: #5b7994; }
  .title { font-family: ${FONT_SANS}; font-size: 17px; font-weight: 700; fill: #edf2f7; }
  .stat { font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; fill: #d6e3ed; }
  .muted { font-family: ${FONT_MONO}; font-size: 9.5px; fill: #526f87; }
  .key { font-family: ${FONT_MONO}; font-size: 10.5px; fill: #97b3ca; }
  .date { font-family: ${FONT_MONO}; font-size: 10px; fill: #557591; }
  .repo { font-family: ${FONT_MONO}; font-size: 10.5px; fill: #c7d9e8; }
</style>
<rect width="960" height="280" rx="18" fill="#06111f"/>
<rect x="12" y="12" width="936" height="256" rx="14" fill="#081829" stroke="#153a55"/>
<text x="30" y="36" class="mono prompt">khoa@github:~$ ./profile --activity</text>
<rect x="254" y="26" width="6" height="12" rx="1" fill="#6b93b5"><animate attributeName="opacity" values="1;.12;1" dur="1.15s" repeatCount="indefinite"/></rect>
<text x="30" y="64" class="sans title">Development signal</text>
<text x="824" y="36" class="mono muted">${updated}</text>

<g transform="translate(30 84)" class="mono">
  ${statElements}
</g>

<text x="30" y="118" class="mono prompt">&gt; languages --by-repository</text>
<g class="mono">
${languageRows}
</g>
<text x="490" y="118" class="mono prompt">&gt; recent --pushes</text>
<g class="mono">
${recentRows}
</g>
</svg>`;

await writeGenerated('metrics.svg', svg);
