import { escapeXml, FONT_MONO, FONT_SANS, writeGenerated } from './utils.mjs';

const PROJECTS = [
  {
    id: 'production-meter-reading',
    category: 'COMPUTER VISION · OCR',
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
    title: 'Homestead Rental Management',
    line1: 'Desktop operations system managing leases, billing automation,',
    line2: 'and tenant services with embedded computer vision for utility meters.',
    proofLabel: 'ENGINEERING EVIDENCE',
    proofValue: '15+ screen desktop UI · REST API & auth · Automated billing bridge',
    stack: 'C# · .NET 8 · WPF · ASP.NET Core · MySQL · Python'
  }
];

function renderCard(p) {
  const badgeWidth = Math.round(p.category.length * 6.2 + 30);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="210" viewBox="0 0 460 210" role="img" aria-label="${escapeXml(p.title)}">
<style>
  text { font-family: ${FONT_SANS}; }
  .mono { font-family: ${FONT_MONO}; }
  .badge { font-family: ${FONT_MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; fill: #1d4ed8; }
  .title { font-family: ${FONT_SANS}; font-size: 16.5px; font-weight: 700; fill: #0f172a; }
  .desc { font-family: ${FONT_SANS}; font-size: 11.5px; fill: #475569; }
  .proof-label { font-family: ${FONT_MONO}; font-size: 9.5px; font-weight: 700; fill: #64748b; letter-spacing: 0.8px; }
  .proof-value { font-family: ${FONT_SANS}; font-size: 11.5px; font-weight: 600; fill: #0f172a; }
  .stack { font-family: ${FONT_MONO}; font-size: 10px; fill: #334155; font-weight: 500; }
</style>

<!-- Outer Backdrop & Elevated Card Shell -->
<rect width="460" height="210" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.2"/>

<!-- Category Badge (High Contrast Pill) -->
<rect x="20" y="18" width="${badgeWidth}" height="22" rx="5" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
<circle cx="31" cy="29" r="2.5" fill="#2563eb"/>
<text x="40" y="32.5" class="badge">${escapeXml(p.category)}</text>

<!-- Subdued Link Arrow Pill -->
<g transform="translate(420, 18)">
  <rect width="22" height="22" rx="5" fill="#f8fafc" stroke="#d0d7de" stroke-width="1"/>
  <path d="M7 15 L15 7 M15 7 L9 7 M15 7 L15 13" stroke="#0969da" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</g>

<!-- Title -->
<text x="20" y="65" class="title">${escapeXml(p.title)}</text>

<!-- Description -->
<text x="20" y="84" class="desc">${escapeXml(p.line1)}</text>
<text x="20" y="100" class="desc">${escapeXml(p.line2)}</text>

<!-- Subtle Divider -->
<line x1="20" y1="114" x2="440" y2="114" stroke="#e2e8f0" stroke-width="1"/>

<!-- Signal / Proof -->
<text x="20" y="130" class="proof-label">${escapeXml(p.proofLabel)}</text>
<g transform="translate(20, 147)">
  <path d="M0 2 L4 5.5 L0 9" stroke="#0969da" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="12" y="7.5" class="proof-value">${escapeXml(p.proofValue)}</text>
</g>

<!-- Stack Pill (High Contrast Inset) -->
<rect x="20" y="161" width="420" height="26" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
<text x="32" y="178" class="stack">${escapeXml(p.stack)}</text>
</svg>`;
}

for (const project of PROJECTS) {
  const svg = renderCard(project);
  await writeGenerated(`selected-work/${project.id}.svg`, svg);
}
console.log(`Successfully generated ${PROJECTS.length} high-contrast selected work cards.`);
