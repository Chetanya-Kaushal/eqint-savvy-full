/* EQInt × Savvy — PPTX deck builder (pptxgenjs)
   Dark cinematic keynote · bento cards · glass mock windows · speaker notes */
const pptxgen = require("pptxgenjs");

const p = new pptxgen();
p.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
p.layout = "WIDE";
p.title = "EQInt Global — Meet Savvy AI";
p.author = "EQInt Global";
p.company = "EQInt Global";
p.subject = "Savvy AI product presentation";

/* palette */
const BG = "05070D", INK = "F5F7FA", INK2 = "9AA3B2", INK3 = "5E6878";
const BLUE = "4FB5FF", TEAL = "00C9A7", VIOLET = "C959DD", AMBER = "FF9004";
const CARD = "0D1220", CARD2 = "101828", LINE = "22293A";
const GREEN = "4ADE80", RED = "FF6B81";

/* ── helpers ── */
function bg(s) { s.background = { color: BG }; }
function ambient(s) {
  s.addShape(p.ShapeType.rect, { x: -1.5, y: -1.2, w: 5.5, h: 4.5, fill: { color: BLUE, transparency: 93 }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 9.2, y: -1.0, w: 5.0, h: 4.2, fill: { color: TEAL, transparency: 93 }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 8.6, y: 4.9, w: 5.2, h: 4.0, fill: { color: VIOLET, transparency: 94 }, line: { type: "none" } });
}
function eyebrow(s, text, o = {}) {
  s.addText(text, { x: o.x ?? 0.75, y: o.y ?? 0.5, w: o.w ?? 11.8, h: 0.4, fontFace: "Poppins", fontSize: 12, bold: true, charSpacing: 4, color: o.color ?? TEAL, align: o.align ?? "left" });
}
function h1(s, runs, o = {}) {
  s.addText(runs, { x: o.x ?? 0.75, y: o.y ?? 0.95, w: o.w ?? 11.8, h: o.h ?? 1.3, fontFace: "Poppins", fontSize: o.size ?? 46, bold: true, align: o.align ?? "left", lineSpacingMultiple: 1.02 });
}
function para(s, runs, o = {}) {
  s.addText(runs, { x: o.x ?? 0.75, y: o.y ?? 2.3, w: o.w ?? 11.5, h: o.h ?? 1.8, fontFace: "Inter", fontSize: o.size ?? 14, color: o.color ?? INK2, lineSpacingMultiple: 1.28, valign: "top" });
}
function chip(s, text, x, y, w) {
  s.addText(text, { shape: p.ShapeType.roundRect, rectRadius: 0.21, x, y, w, h: 0.42, fill: { color: CARD2 }, line: { color: LINE, width: 1 }, fontFace: "Inter", fontSize: 10.5, color: INK2, align: "center", valign: "middle", bold: true });
}
function statCard(s, big, label, x, y, w, h) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: CARD }, line: { color: LINE, width: 1 } });
  s.addText(big, { x, y: y + 0.14, w, h: h * 0.52, fontFace: "Poppins", fontSize: 34, bold: true, color: TEAL, align: "center", valign: "middle" });
  s.addText(label, { x, y: y + h - 0.62, w, h: 0.5, fontFace: "Inter", fontSize: 11, color: INK2, align: "center", valign: "top" });
}
function mockWindow(s, title, x, y, w, h, body) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: "0B0F1A" }, line: { color: "2A3140", width: 1 } });
  s.addShape(p.ShapeType.rect, { x: x + 0.01, y: y + 0.02, w: w - 0.02, h: 0.44, fill: { color: "141A28" }, line: { type: "none" } });
  [["FF5F57", 0.24], ["FEBC2E", 0.46], ["28C840", 0.68]].forEach(([c, dx]) => {
    s.addShape(p.ShapeType.ellipse, { x: x + dx, y: y + 0.17, w: 0.13, h: 0.13, fill: { color: c }, line: { type: "none" } });
  });
  s.addText(title, { x: x + 0.95, y: y + 0.02, w: w - 1.1, h: 0.44, fontFace: "Inter", fontSize: 10.5, color: INK3, valign: "middle", bold: true });
  body(s, x, y + 0.46, w, h - 0.46);
}
function pill(s, text, fill, txt, x, y, w) {
  s.addText(text, { shape: p.ShapeType.roundRect, rectRadius: 0.16, x, y, w, h: 0.32, fill: { color: fill }, line: { type: "none" }, fontFace: "Inter", fontSize: 9.5, bold: true, color: txt, align: "center", valign: "middle" });
}
function notes(s, t) { s.addNotes(t); }

/* ── 1 · COVER ── */
{
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, "EQINT GLOBAL  ·  EQINTGLOBAL.COM");
  h1(s, [{ text: "Meet ", options: { color: INK } }, { text: "Savvy.", options: { color: BLUE } }], { size: 60, y: 1.05 });
  h1(s, "The AI teammate we built for Oracle HCM.", { size: 28, y: 2.3, color: INK2, w: 11.5, h: 0.7 });
  para(s, "This is our company, and this is our AI — made for the Oracle work you do every day. No jargon ahead: just what it does, and why it feels like magic.", { y: 3.4, w: 8.6, h: 1.2 });
  chip(s, "🔗  eqintglobal.com — this is my company", 0.75, 4.95, 4.35);
  chip(s, "✨  Savvy AI — our creation", 5.3, 4.95, 3.1);
  [[11.5, 1.0, 1.5, BLUE], [10.5, 4.8, 1.1, TEAL], [12.2, 3.0, 0.7, VIOLET]].forEach(([x, y, d, c]) => {
    s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: c, transparency: 80 }, line: { color: c, width: 1, transparency: 50 } });
  });
  notes(s, "Welcome. Quick framing: EQInt Global is my company — an Oracle Fusion Cloud partner. Today I'm showing you Savvy, the AI teammate we built for Oracle HCM. Three working tools today, more coming.");
}

/* ── 2 · COMPANY ── */
{
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, "01 — THE COMPANY");
  h1(s, [{ text: "This is ", options: { color: INK } }, { text: "my company.", options: { color: TEAL } }], { size: 44 });
  para(s, "EQInt Global is a premier Oracle Fusion Cloud implementation partner. In plain words: when big organisations run their people, payroll, supply chain and finance on Oracle — we set it up, connect it, and keep it healthy, 24/7.", { y: 2.25, h: 1.15 });
  statCard(s, "15+", "Years of Oracle experience", 0.75, 3.7, 3.7, 1.55);
  statCard(s, "10+", "Countries served", 4.82, 3.7, 3.7, 1.55);
  statCard(s, "50+", "Expert consultants & team", 8.89, 3.7, 3.7, 1.55);
  [["HCM — People & Payroll", 0.75, 2.42], ["SCM — Supply Chain", 3.32, 2.42], ["Finance — Financials", 5.89, 2.42],
   ["EPM — Planning", 8.46, 2.42], ["OCI — Infrastructure", 0.75, 2.42], ["24/7 Support", 3.32, 1.9], ["AI Consulting", 5.42, 2.1]]
    .forEach(([t, x, w], i) => chip(s, t, x, i < 5 ? 5.7 : 6.25, w));
  notes(s, "Positioning: end-to-end Oracle Fusion Cloud services across HCM, SCM, Finance, EPM, PaaS, OCI. 15+ years, 10+ countries, 50+ team. Differentiator: AI built on deep Oracle bench.");
}

/* ── 3 · WHAT IS SAVVY ── */
{
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, "02 — THE PRODUCT");
  h1(s, [{ text: "So… what exactly is ", options: { color: INK } }, { text: "Savvy AI?", options: { color: VIOLET } }], { size: 42 });
  para(s, "Think of Savvy as a brilliant colleague who has memorised your entire Oracle system. You ask in plain English — \u201Chow many employees joined last month?\u201D, \u201Cfind payroll mismatches\u201D, \u201Ccreate this department\u201D — and Savvy simply does it. No menus. No training course. No tickets.", { y: 2.25, h: 1.45 });
  const cards = [
    ["💬", "Ask, don't navigate", "A chat window that understands business language and answers with real data from Oracle."],
    ["👁", "Sees your screen", "Reads whatever Oracle page you have open — and explains or checks it for you, live."],
    ["∑", "Checks the numbers", "Compares thousands of records across systems and flags anything that doesn't add up."],
  ];
  cards.forEach(([ic, t, d], i) => {
    const x = 0.75 + i * 4.07;
    s.addShape(p.ShapeType.roundRect, { x, y: 3.9, w: 3.72, h: 2.3, rectRadius: 0.14, fill: { color: CARD }, line: { color: LINE, width: 1 } });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.28, y: 4.16, w: 0.52, h: 0.52, rectRadius: 0.12, fill: { color: "12203A" }, line: { color: "1E3A5F", width: 1 } });
    s.addText(ic, { x: x + 0.28, y: 4.16, w: 0.52, h: 0.52, fontSize: 16, align: "center", valign: "middle" });
    s.addText(t, { x: x + 0.28, y: 4.82, w: 3.2, h: 0.4, fontFace: "Poppins", fontSize: 15, bold: true, color: INK });
    s.addText(d, { x: x + 0.28, y: 5.22, w: 3.2, h: 0.9, fontFace: "Inter", fontSize: 10.5, color: INK2, lineSpacingMultiple: 1.22 });
  });
  para(s, "It lives as a floating glass assistant on your desktop — Apple-grade design, zero installation drama. Three tools you can use today →", { y: 6.45, h: 0.55, size: 12.5, color: INK3 });
  notes(s, "Core promise: plain-English in, Oracle-work out. For non-technical audiences: 'like a colleague, not software'. Segue: let me show you the three tools working today.");
}

/* ── shared tool slide builder ── */
function toolSlide(num, titleRuns, nightmare, does, chipsArr, mockTitle, mockBody, noteTxt) {
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, num);
  h1(s, titleRuns, { size: 40, y: 0.95, w: 6.6, h: 1.15 });
  para(s, nightmare, { y: 2.2, w: 6.45, h: 1.55 });
  para(s, does, { y: 3.8, w: 6.45, h: 1.75 });
  chipsArr.forEach(([t], i) => chip(s, t, 0.75 + (i % 2) * 3.3, 5.65 + Math.floor(i / 2) * 0.55, 3.1));
  mockWindow(s, mockTitle, 7.55, 1.1, 5.05, 5.35, mockBody);
  notes(s, noteTxt);
}

/* ── 4 · TOOL 1: PAYROLL RECONCILIATION ── */
toolSlide(
  "03 — WORKING TOOL № 1",
  [{ text: "Payroll ", options: { color: INK } }, { text: "Reconciliation", options: { color: BLUE } }],
  [{ text: "The nightmare it kills: ", options: { bold: true, color: INK } },
   { text: "before payday, someone must prove that every salary, deduction and bank total in Oracle matches the payroll bureau — usually hours of staring at spreadsheets.", options: {} }],
  [{ text: "What Savvy does: ", options: { bold: true, color: INK } },
   { text: "you press one button. It pulls both sides, compares thousands of rows — salaries, deductions, headcount, totals — and shows a simple verdict: everything matches, or exactly which lines broke and why. Minutes, not hours.", options: {} }],
  [["✓  Auto-matches thousands of rows"], ["✓  Explains every difference"], ["✓  Audit-ready report"]],
  "Savvy — Payroll Reconciliation",
  (s, x, y, w, h) => {
    const rows = [
      ["Gross salaries", "1,240 rows", "MATCHED", GREEN, "12321E", "2E5A3A"],
      ["Deductions", "986 rows", "MATCHED", GREEN, "12321E", "2E5A3A"],
      ["Employer costs", "412 rows", "MATCHED", GREEN, "12321E", "2E5A3A"],
      ["Bank transfer total", "1 row", "CHECKING…", BLUE, "10233B", "2C4E77"],
    ];
    rows.forEach(([nm, ct, bd, c1, c2, c3], i) => {
      const ry = y + 0.25 + i * 0.62;
      s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: ry, w: w - 0.6, h: 0.5, rectRadius: 0.09, fill: { color: "111726" }, line: { color: "1F2739", width: 1 } });
      s.addText(nm, { x: x + 0.5, y: ry, w: 2.2, h: 0.5, fontFace: "Inter", fontSize: 11, bold: true, color: INK, valign: "middle" });
      s.addText(ct, { x: x + 2.6, y: ry, w: 1.2, h: 0.5, fontFace: "Inter", fontSize: 10, color: INK2, valign: "middle" });
      pill(s, bd, c2, c1, x + w - 1.85, ry + 0.09, 1.35);
    });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: y + 2.85, w: w - 0.6, h: 0.14, rectRadius: 0.07, fill: { color: "1A2130" }, line: { type: "none" } });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: y + 2.85, w: (w - 0.6) * 0.93, h: 0.14, rectRadius: 0.07, fill: { color: "0E7490" }, line: { type: "none" } });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: y + 2.85, w: (w - 0.6) * 0.7, h: 0.14, rectRadius: 0.07, fill: { color: TEAL }, line: { type: "none" } });
    s.addText("Reconciliation 96% complete — 2,639 of 2,639 rows pulled, verdict in seconds", { x: x + 0.3, y: y + 3.08, w: w - 0.6, h: 0.35, fontFace: "Inter", fontSize: 9.5, color: INK3, italic: true });
  },
  "Killer detail: it doesn't just flag mismatches — it explains them. Finance teams go from hours of spreadsheet archaeology to a one-button verdict. Emphasise: working today, in production."
);

/* ── 5 · TOOL 2: OCR SCREEN READER ── */
toolSlide(
  "04 — WORKING TOOL № 2",
  [{ text: "OCR ", options: { color: INK } }, { text: "Screen Reader", options: { color: TEAL } }],
  [{ text: "The nightmare it kills: ", options: { bold: true, color: INK } },
   { text: "Oracle screens are dense. \u201CWhat am I even looking at?\u201D — and the documentation is somewhere else entirely.", options: {} }],
  [{ text: "What Savvy does: ", options: { bold: true, color: INK } },
   { text: "click \u201CScreen Guide\u201D and Savvy literally reads your screen with its eyes — OCR over the live window. It identifies what page you're on, what each field means in business terms, and guides you step-by-step through whatever you were trying to do.", options: {} }],
  [["👁  Reads any Oracle page live"], ["🧭  Explains every field simply"], ["🪜  Guides you step by step"]],
  "Savvy — Screen Guide (live OCR)",
  (s, x, y, w, h) => {
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 1.7, rectRadius: 0.1, fill: { color: "0E1524" }, line: { color: "1F2739", width: 1 } });
    const tls = [[0.9, "2E4C77", true], [0.62, "222B3D", false], [0.8, "2E4C77", true], [0.5, "1B2436", false]];
    tls.forEach(([fr, c, hot], i) => {
      s.addShape(p.ShapeType.roundRect, { x: x + 0.55, y: y + 0.5 + i * 0.33, w: (w - 1.1) * fr, h: 0.13, rectRadius: 0.06, fill: { color: hot ? BLUE : c, transparency: hot ? 25 : 0 }, line: { type: "none" } });
    });
    const fields = [["PAGE", "Person Management"], ["FIELD", "Effective Date"], ["NEXT STEP", "Review Salary"]];
    fields.forEach(([lab, val], i) => {
      const fx = x + 0.3 + i * ((w - 0.6 - 0.3) / 3 + 0.075);
      const fw = (w - 0.6 - 0.3) / 3 - 0.05;
      s.addShape(p.ShapeType.roundRect, { x: fx, y: y + 2.2, w: fw, h: 0.85, rectRadius: 0.09, fill: { color: "111726" }, line: { color: "1F2739", width: 1 } });
      s.addText(lab, { x: fx + 0.12, y: y + 2.28, w: fw - 0.2, h: 0.25, fontFace: "Inter", fontSize: 8, bold: true, color: INK3, charSpacing: 2 });
      s.addText(val, { x: fx + 0.12, y: y + 2.52, w: fw - 0.2, h: 0.45, fontFace: "Inter", fontSize: 10.5, bold: true, color: INK });
    });
    s.addText("\u201CYou're on Person Management. Effective Date defaults to today — change it only for backdated hires. Next: Review Salary.\u201D", { x: x + 0.3, y: y + 3.3, w: w - 0.6, h: 0.75, fontFace: "Inter", fontSize: 10.5, color: TEAL, italic: true, lineSpacingMultiple: 1.25 });
  },
  "Demo moment: have Savvy read a real Oracle page live if possible. The point for non-technical viewers: the AI has eyes — it meets users where they are, no integration project required."
);

/* ── 6 · TOOL 3: DASHBOARD ── */
toolSlide(
  "05 — WORKING TOOL № 3",
  [{ text: "The ", options: { color: INK } }, { text: "Dashboard", options: { color: VIOLET } }],
  [{ text: "The nightmare it kills: ", options: { bold: true, color: INK } },
   { text: "workforce questions come from everywhere — headcount, absences, positions, locations — and each answer is a separate Oracle report, exported and formatted by hand.", options: {} }],
  [{ text: "What Savvy does: ", options: { bold: true, color: INK } },
   { text: "opens one live, Apple-style dashboard over your Oracle data — every headcount and org chart drawn fresh, every chart animated, every system status visible. Your HR command centre, always current, zero exports.", options: {} }],
  [["📊  8 live KPIs · 13 animated charts"], ["🔄  Always current — no exports"], ["🧊  Liquid Glass design"]],
  "Savvy — Workforce Dashboard",
  (s, x, y, w, h) => {
    const kpis = [["HEADCOUNT", "1,240", "▲ 3.2%", GREEN], ["ABSENCES", "86", "▼ 1.4%", RED], ["POSITIONS", "312", "▲ 0.8%", GREEN]];
    kpis.forEach(([lab, val, delta, dc], i) => {
      const kx = x + 0.3 + i * ((w - 0.6 - 0.3) / 3 + 0.075);
      const kw = (w - 0.6 - 0.3) / 3 - 0.05;
      s.addShape(p.ShapeType.roundRect, { x: kx, y: y + 0.25, w: kw, h: 0.95, rectRadius: 0.1, fill: { color: "111726" }, line: { color: "1F2739", width: 1 } });
      s.addText(lab, { x: kx + 0.14, y: y + 0.33, w: kw - 0.24, h: 0.24, fontFace: "Inter", fontSize: 8, bold: true, color: INK3, charSpacing: 2 });
      s.addText([{ text: val, options: { fontSize: 19, bold: true, color: INK } }, { text: "  " + delta, options: { fontSize: 9.5, bold: true, color: dc } }],
        { x: kx + 0.14, y: y + 0.58, w: kw - 0.24, h: 0.5, fontFace: "Poppins", valign: "middle" });
    });
    const bars = [42, 58, 47, 72, 64, 88, 70];
    const bw = (w - 0.6 - 0.13 * 6) / 7;
    bars.forEach((pct, i) => {
      const bx = x + 0.3 + i * (bw + 0.13);
      const bh = 1.45 * (pct / 100);
      s.addShape(p.ShapeType.roundRect, { x: bx, y: y + 1.55 + (1.45 - bh), w: bw, h: bh, rectRadius: 0.06, fill: { color: i === 5 ? TEAL : "1668B8" }, line: { type: "none" } });
    });
    s.addText("Headcount by month — live from Oracle HCM", { x: x + 0.3, y: y + 3.12, w: w - 0.6, h: 0.3, fontFace: "Inter", fontSize: 9.5, color: INK3, italic: true });
  },
  "For executives: one glance answers the questions that used to take five reports. Stress 'always current' — it draws straight from Oracle, so there is nothing to refresh, export or reconcile by hand."
);

/* ── 7 · ROADMAP ── */
{
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, "06 — WHAT'S NEXT");
  h1(s, [{ text: "The ", options: { color: INK } }, { text: "future roadmap.", options: { color: AMBER } }], { size: 44 });
  para(s, "Savvy already has three working tools. Here's what our team is wiring in next — each one already in active development:", { y: 2.25, h: 0.7 });
  const items = [
    ["1", "Computer Use Agent", "Savvy won't just see your screen — it will operate it: clicking through Oracle flows, filling forms and completing multi-step tasks on your instruction, while you watch."],
    ["2", "BIP Report Generator", "Describe the report you need in one sentence — Savvy writes, runs and schedules the BI Publisher report for you. Reporting without the report writer."],
    ["3", "Policy Parser", "Drop in any HR policy document. Savvy reads it, turns it into clean structured rules, and enforces them inside Oracle — compliance on autopilot."],
  ];
  items.forEach(([n, t, d], i) => {
    const y = 3.15 + i * 1.32;
    s.addShape(p.ShapeType.ellipse, { x: 0.95, y: y + 0.18, w: 0.5, h: 0.5, fill: { color: i === 0 ? BLUE : i === 1 ? TEAL : AMBER }, line: { type: "none" } });
    s.addText(n, { x: 0.95, y: y + 0.18, w: 0.5, h: 0.5, fontFace: "Poppins", fontSize: 15, bold: true, color: "04121F", align: "center", valign: "middle" });
    s.addShape(p.ShapeType.roundRect, { x: 1.75, y, w: 10.8, h: 1.12, rectRadius: 0.12, fill: { color: CARD }, line: { color: LINE, width: 1 } });
    pill(s, "IN DEVELOPMENT", "2A2410", AMBER, 2.05, y + 0.16, 1.55);
    s.addText(t, { x: 3.85, y: y + 0.1, w: 8.4, h: 0.4, fontFace: "Poppins", fontSize: 15, bold: true, color: INK });
    s.addText(d, { x: 3.85, y: y + 0.5, w: 8.4, h: 0.58, fontFace: "Inter", fontSize: 10.5, color: INK2, lineSpacingMultiple: 1.15 });
  });
  notes(s, "Honesty builds trust: these are in active development, not vaporware. Computer Use is the headline — the assistant goes from advising to acting.");
}

/* ── 8 · CLOSE ── */
{
  const s = p.addSlide(); bg(s); ambient(s);
  eyebrow(s, "EQINT GLOBAL  ·  EQINTGLOBAL.COM", { align: "center", y: 1.5 });
  h1(s, [{ text: "Work should feel ", options: { color: INK } }, { text: "this easy.", options: { color: TEAL } }], { size: 54, y: 2.1, align: "center", h: 1.2 });
  para(s, "Savvy AI is live in Oracle HCM today — payroll you can trust, screens that explain themselves, and a dashboard that never sleeps. Built by EQInt Global, your Oracle Fusion Cloud partner.",
    { x: 2.4, y: 3.6, w: 8.5, h: 1.0, align: "center" });
  chip(s, "🔗  eqintglobal.com — this is my company", 4.4, 4.9, 4.5);
  s.addText("Thank you — questions welcome.", { x: 0.75, y: 6.1, w: 11.8, h: 0.4, fontFace: "Inter", fontSize: 12, color: INK3, align: "center" });
  notes(s, "Close with the three-word version: trusted payroll, self-explaining screens, live dashboard. Invite a live demo.");
}

p.writeFile({ fileName: "EQInt-Savvy-AI-Deck.pptx" }).then(f => console.log("WROTE:", f));
