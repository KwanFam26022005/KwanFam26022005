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
  const badgeWidth = Math.round(p.category.length * 6.2 + 28);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="210" viewBox="0 0 460 210" role="img" aria-label="${escapeXml(p.title)}">
<style>
  text { font-family: ${FONT_SANS}; }
  .mono { font-family: ${FONT_MONO}; }
  .badge { font-family: ${FONT_MONO}; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; fill: #8ca4bc; }
  .title { font-family: ${FONT_SANS}; font-size: 16.5px; font-weight: 700; fill: #edf2f7; }
  .desc { font-family: ${FONT_SANS}; font-size: 11.5px; fill: #7d91a3; }
  .proof-label { font-family: ${FONT_MONO}; font-size: 9.5px; font-weight: 700; fill: #50677c; letter-spacing: 0.8px; }
  .proof-value { font-family: ${FONT_SANS}; font-size: 11.5px; font-weight: 600; fill: #d6e2eb; }
  .stack { font-family: ${FONT_MONO}; font-size: 10px; fill: #728a9e; }
</style>
<rect width="460" height="210" rx="12" fill="#080d15"/>
<rect x="8" y="8" width="444" height="194" rx="10" fill="#0b121c" stroke="#1c293a" stroke-width="1"/>

<!-- Category Badge (Calm Matte Slate) -->
<rect x="22" y="20" width="${badgeWidth}" height="20" rx="4" fill="#121b27" stroke="#223347" stroke-width="0.75"/>
<circle cx="31" cy="30" r="2.2" fill="#5a7d9b"/>
<text x="39" y="33.5" class="badge">${escapeXml(p.category)}</text>

<!-- Subdued Link Arrow -->
<path d="M422 24 L430 24 L430 32 M430 24 L423 31" stroke="#486177" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

<!-- Title -->
<text x="22" y="62" class="title">${escapeXml(p.title)}</text>

<!-- Description -->
<text x="22" y="81" class="desc">${escapeXml(p.line1)}</text>
<text x="22" y="97" class="desc">${escapeXml(p.line2)}</text>

<!-- Subtle Divider -->
<line x1="22" y1="111" x2="438" y2="111" stroke="#162230" stroke-width="0.75"/>

<!-- Signal / Proof (Clean White-Slate, No Neon) -->
<text x="22" y="127" class="proof-label">${escapeXml(p.proofLabel)}</text>
<text x="22" y="144" class="proof-value">${escapeXml(p.proofValue)}</text>

<!-- Stack Pill (Understated Inset) -->
<rect x="22" y="158" width="416" height="26" rx="4" fill="#0e1622" stroke="#1a2736" stroke-width="0.75"/>
<text x="32" y="175" class="stack">${escapeXml(p.stack)}</text>
</svg>`;
}

for (const project of PROJECTS) {
  const svg = renderCard(project);
  await writeGenerated(`selected-work/${project.id}.svg`, svg);
}
console.log(`Successfully generated ${PROJECTS.length} calm selected work cards.`);
