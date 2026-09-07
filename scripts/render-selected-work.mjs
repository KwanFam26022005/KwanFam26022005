import { escapeXml, FONT_MONO, FONT_SANS, writeGenerated } from './utils.mjs';

const PROJECTS = [
  {
    id: 'production-meter-reading',
    category: 'COMPUTER VISION · OCR',
    accent: '#38bdf8',
    title: 'Production Meter Reading',
    line1: 'Two-stage pipeline: mobile capture isolates LCD meter register;',
    line2: 'PP-OCRv6 extracts readings with strict validation gates.',
    proofLabel: 'ENGINEERING EVIDENCE',
    proofValue: 'Controlled localization → OCR → review pipeline · Fail-closed',
    stack: 'Python · PP-OCRv6 · FastAPI · OpenCV · PyTorch'
  },
  {
    id: 'koa-agentic-rag',
    category: 'RESEARCH PROTOTYPE · AGENTIC-RAG',
    accent: '#a78bfa',
    title: 'KOA Agentic-RAG',
    line1: 'Bilingual clinical guideline QA with atomic evidence verification,',
    line2: 'corrective retrieval, and abstention on unsupported queries.',
    proofLabel: 'ENGINEERING EVIDENCE',
    proofValue: 'Evidence-grounded claims · Corrective retrieval · Source alignment',
    stack: 'Hybrid Retrieval · Reranking · Evidence Verification · LangChain'
  },
  {
    id: 'tdtu-handbook-rag',
    category: 'DOMAIN RAG · QLoRA',
    accent: '#2dd4bf',
    title: 'TDTU Student Handbook Chatbot',
    line1: 'Vietnamese institutional QA combining hybrid BM25 + dense retrieval,',
    line2: 'cross-encoder reranking, and domain-adapted QLoRA fine-tuning.',
    proofLabel: 'ENGINEERING EVIDENCE',
    proofValue: 'Recall@5: 86.0% · Best BERTScore F1: 77.93 · Domain-adapted LLM',
    stack: 'BGE-M3 · QLoRA · FAISS · BM25 · PyTorch · FastAPI'
  },
  {
    id: 'homestead-ai',
    category: 'FULL-STACK · APPLIED AI',
    accent: '#60a5fa',
    title: 'Homestead Rental Management',
    line1: 'Desktop operations system managing leases, billing automation,',
    line2: 'and tenant services with embedded computer vision for utility meters.',
    proofLabel: 'ENGINEERING EVIDENCE',
    proofValue: '15+ screen desktop UI · REST API & auth · Automated billing bridge',
    stack: 'C# · .NET 8 · WPF · ASP.NET Core · MySQL · Python'
  }
];

function renderCard(p) {
  const badgeWidth = Math.round(p.category.length * 6.5 + 18);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="210" viewBox="0 0 460 210" role="img" aria-label="${escapeXml(p.title)}">
<style>
  text { font-family: ${FONT_SANS}; }
  .mono { font-family: ${FONT_MONO}; }
  .badge { font-family: ${FONT_MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.6px; }
  .title { font-family: ${FONT_SANS}; font-size: 16.5px; font-weight: 700; fill: #f8fafc; }
  .desc { font-family: ${FONT_SANS}; font-size: 11.5px; fill: #94a3b8; }
  .proof-label { font-family: ${FONT_MONO}; font-size: 9.5px; font-weight: 700; fill: #52758d; letter-spacing: 0.8px; }
  .proof-value { font-family: ${FONT_SANS}; font-size: 11.5px; font-weight: 600; }
  .stack { font-family: ${FONT_MONO}; font-size: 10px; fill: #8eaec4; }
</style>
<rect width="460" height="210" rx="14" fill="#06111f"/>
<rect x="10" y="10" width="440" height="190" rx="10" fill="#081829" stroke="#153a55" stroke-width="1"/>
<rect x="10" y="10" width="440" height="3" rx="1.5" fill="${p.accent}" opacity="0.85"/>

<!-- Category Badge -->
<rect x="24" y="22" width="${badgeWidth}" height="20" rx="4" fill="${p.accent}" fill-opacity="0.12" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="0.8"/>
<text x="${24 + badgeWidth / 2}" y="36" text-anchor="middle" class="badge" fill="${p.accent}">${escapeXml(p.category)}</text>

<!-- Arrow Icon -->
<path d="M418 26 L428 26 L428 36 M428 26 L420 34" stroke="${p.accent}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.75"/>

<!-- Title -->
<text x="24" y="64" class="title">${escapeXml(p.title)}</text>

<!-- Description -->
<text x="24" y="84" class="desc">${escapeXml(p.line1)}</text>
<text x="24" y="101" class="desc">${escapeXml(p.line2)}</text>

<!-- Divider -->
<line x1="24" y1="115" x2="436" y2="115" stroke="#13344d" stroke-width="0.75"/>

<!-- Signal / Proof -->
<text x="24" y="130" class="proof-label">${escapeXml(p.proofLabel)}</text>
<text x="24" y="147" class="proof-value" fill="${p.accent}">${escapeXml(p.proofValue)}</text>

<!-- Stack Pill -->
<rect x="24" y="162" width="412" height="26" rx="4" fill="#0b1f33" stroke="#15364f" stroke-width="0.6"/>
<text x="34" y="179" class="stack">${escapeXml(p.stack)}</text>
</svg>`;
}

for (const project of PROJECTS) {
  const svg = renderCard(project);
  await writeGenerated(`selected-work/${project.id}.svg`, svg);
}
console.log(`Successfully generated ${PROJECTS.length} selected work cards.`);
