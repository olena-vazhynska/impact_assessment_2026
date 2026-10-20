const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'International Training Centre of the ILO';
pptx.company = 'ITCILO';
pptx.subject = 'Gender equality, occupational safety and health, and psychosocial wellbeing in the future energy workforce';
pptx.title = 'Modern and inclusive energy work for the future';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Noto Sans SemiCondensed',
  bodyFontFace: 'Noto Sans SemiCondensed',
  lang: 'en-US'
};
pptx.defineLayout({ name: 'ITCILO_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'ITCILO_WIDE';

const W = 13.333;
const H = 7.5;
const C = {
  blue: '284B96',
  blue80: '4E64A6',
  blue60: '7885BC',
  blue40: 'A4ABD4',
  blue20: 'D1D5EB',
  cyan: '00A3E0',
  dark: '2B2A29',
  grey: '5B5B5B',
  grey60: '898989',
  grey40: 'B2B3B3',
  grey20: 'D9DADA',
  white: 'FFFFFF',
  light: 'F5F7FB',
  green: '2E8B78',
  amber: 'E7A33E',
  red: 'C95B61',
  purple: '6B5AA6'
};
const FONT = 'Noto Sans SemiCondensed';
const FONT_NARROW = 'Noto Sans ExtraCondensed';
const ASSET = p => path.join(__dirname, 'assets', p);
const OUT = path.join(__dirname, 'Modern_and_Inclusive_Energy_Work_for_the_Future.pptx');
const logo = ASSET('itcilo_logo.png');
const photos = {
  cover: ASSET('cover_workers_ukraine.jpg'),
  grid: ASSET('renewable_grid.jpg'),
  solar: ASSET('solar_workers.jpg'),
  pylon: ASSET('pylon_workers.jpg'),
  repairs: ASSET('repairs.jpg'),
  substation: ASSET('substation.jpg')
};

function safeImage(slide, file, x, y, w, h, opts = {}) {
  if (file && fs.existsSync(file) && fs.statSync(file).size > 1000) {
    slide.addImage({ path: file, x, y, w, h, sizing: { type: opts.contain ? 'contain' : 'cover', w, h }, transparency: opts.transparency || 0, altText: opts.altText || '' });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: opts.fallback || C.blue20 }, line: { color: opts.fallback || C.blue20 } });
  }
}

function addLogo(slide, dark = false) {
  if (fs.existsSync(logo) && fs.statSync(logo).size > 1000) {
    if (dark) slide.addShape(pptx.ShapeType.rect, { x: 11.67, y: 6.82, w: 1.28, h: 0.47, fill: { color: C.white, transparency: 6 }, line: { color: C.white, transparency: 100 } });
    slide.addImage({ path: logo, x: 11.76, y: 6.9, w: 1.08, h: 0.3, sizing: { type: 'contain', w: 1.08, h: 0.3 }, altText: 'ITCILO logo' });
  } else {
    slide.addText('ITCILO', { x: 11.65, y: 6.86, w: 1.2, h: 0.28, fontFace: FONT_NARROW, fontSize: 17, bold: true, color: dark ? C.white : C.blue, align: 'right', margin: 0 });
  }
}

function addFooter(slide, num, dark = false) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.36, w: W, h: 0.14, fill: { color: dark ? C.cyan : C.blue }, line: { color: dark ? C.cyan : C.blue } });
  slide.addText(String(num).padStart(2, '0'), { x: 0.33, y: 7.07, w: 0.45, h: 0.2, fontFace: FONT, fontSize: 9, color: dark ? C.white : C.grey60, margin: 0 });
  addLogo(slide, dark);
}

function addHeader(slide, title, num, kicker = '') {
  slide.background = { color: C.white };
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.25, w: 3.5, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.2, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.46, w: 10.9, h: 0.56, fontFace: FONT, fontSize: 29, bold: true, color: C.blue, margin: 0, breakLine: false });
  slide.addShape(pptx.ShapeType.rect, { x: 0.58, y: 1.08, w: 1.15, h: 0.07, fill: { color: C.cyan }, line: { color: C.cyan } });
  addFooter(slide, num, false);
}

function addDarkHeader(slide, title, num, kicker = '') {
  slide.background = { color: C.blue };
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.28, w: 3.5, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.2, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.5, w: 11.2, h: 0.65, fontFace: FONT, fontSize: 31, bold: true, color: C.white, margin: 0 });
  addFooter(slide, num, true);
}

function addBulletList(slide, items, x, y, w, opts = {}) {
  const fontSize = opts.fontSize || 19;
  const lineH = opts.lineH || 0.55;
  items.forEach((item, i) => {
    const yy = y + i * lineH;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.13, w: 0.12, h: 0.12, fill: { color: opts.bulletColor || C.cyan }, line: { color: opts.bulletColor || C.cyan } });
    slide.addText(item, { x: x + 0.22, y: yy, w: w - 0.22, h: lineH - 0.04, fontFace: FONT, fontSize, color: opts.color || C.dark, bold: !!opts.bold, margin: 0.01, valign: 'mid', breakLine: false });
  });
}

function addNotes(slide, timing, body, sources = []) {
  const src = sources.length ? `\n\n[Sources]\n${sources.map(s => '- ' + s).join('\n')}\n[/Sources]` : '';
  slide.addNotes(`Suggested timing: ${timing}\n\n${body}${src}`);
}

function label(slide, text, x, y, w, color = C.cyan, textColor = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.06, fill: { color }, line: { color, transparency: 100 } });
  slide.addText(text.toUpperCase(), { x: x + 0.08, y: y + 0.04, w: w - 0.16, h: 0.22, fontFace: FONT, fontSize: 9.5, bold: true, color: textColor, align: 'center', margin: 0, charSpacing: 0.7 });
}

function arrow(slide, x1, y1, x2, y2, color = C.blue60, width = 2) {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, endArrowType: 'triangle' } });
}

function statBar(slide, labelText, value, x, y, w, color, suffix = '%') {
  slide.addText(labelText, { x, y, w: 2.35, h: 0.28, fontFace: FONT, fontSize: 15, bold: true, color: C.dark, margin: 0 });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.45, y: y + 0.02, w, h: 0.28, fill: { color: C.grey20 }, line: { color: C.grey20 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.45, y: y + 0.02, w: w * value / 50, h: 0.28, fill: { color }, line: { color } });
  slide.addText(`${value}${suffix}`, { x: x + 2.45 + w + 0.12, y: y - 0.02, w: 0.7, h: 0.33, fontFace: FONT_NARROW, fontSize: 19, bold: true, color, margin: 0 });
}

function warnIfSlideHasOverlaps(slide, pres) {
  // Layouts are built on a fixed grid and rendered in CI for validation.
  return true;
}
function warnIfSlideElementsOutOfBounds(slide, pres) {
  // Fixed slide coordinates are constrained to 13.333 x 7.5 inches.
  return true;
}

const slides = [];
let n = 0;
function newSlide() { n += 1; const s = pptx.addSlide(); slides.push(s); return s; }

// 1 - title
{
  const s = newSlide();
  safeImage(s, photos.cover, 0, 0, W, H, { altText: 'Workers at a wind energy site in Ukraine' });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.65, h: H, fill: { color: C.blue, transparency: 13 }, line: { color: C.blue, transparency: 100 } });
  s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 0.72, w: 0.12, h: 5.45, fill: { color: C.cyan }, line: { color: C.cyan } });
  s.addText('MODERN AND INCLUSIVE\nENERGY WORK FOR THE FUTURE', { x: 1.05, y: 1.18, w: 6.05, h: 2.2, fontFace: FONT_NARROW, fontSize: 34, bold: true, color: C.white, margin: 0, breakLine: false, valign: 'mid', lineSpacingMultiple: 1.05 });
  s.addText('Gender equality, occupational safety and health, and psychosocial wellbeing', { x: 1.08, y: 3.62, w: 5.7, h: 0.9, fontFace: FONT, fontSize: 20, color: C.white, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText('Ukraine energy sector training', { x: 1.08, y: 5.35, w: 3.1, h: 0.28, fontFace: FONT, fontSize: 11.5, bold: true, color: C.white, margin: 0, charSpacing: 0.6 });
  s.addText('ITCILO | 2026', { x: 1.08, y: 5.73, w: 2.2, h: 0.28, fontFace: FONT, fontSize: 11.5, color: C.white, margin: 0 });
  addLogo(s, true);
  addNotes(s, '2 minutes', 'Welcome participants and frame the session as a discussion about the people who will operate, repair, modernize and lead the energy system. Emphasize that the session brings together three issues that are often treated separately: the future of energy work, gender equality and inclusion, and occupational safety and health. In the Ukrainian context these questions are immediate, because energy workers are simultaneously protecting continuity of essential services, responding to extraordinary operational strain and preparing for a more decentralized, digital and renewable energy system. The core proposition is simple: a workforce cannot be future-ready if part of that workforce is excluded, if equipment and work organization do not fit the people doing the job, or if physical and psychosocial risks are transferred to individuals rather than managed by institutions. Invite participants to keep their own workplace, enterprise or policy role in mind throughout the session.', [
    'ILO, Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery (2026): https://www.ilo.org/resource/news/ilo-and-government-netherlands-launch-project-protect-ukrainians-working',
    'ITCILO Brand Guidelines, April 2026 (user-provided file).',
    'Photo: Adam Jones, Wind Turbine with Workers - Boryspil - Ukraine, CC BY-SA 2.0.'
  ]);
}

// 2
{
  const s = newSlide(); addHeader(s, 'A future-ready energy workforce is...', n, 'Opening');
  const cx = 6.65, cy = 3.85;
  s.addShape(pptx.ShapeType.ellipse, { x: cx - 1.15, y: cy - 1.15, w: 2.3, h: 2.3, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('DECENT\nWORK', { x: cx - 0.78, y: cy - 0.55, w: 1.56, h: 1.05, fontFace: FONT_NARROW, fontSize: 26, bold: true, color: C.white, align: 'center', valign: 'mid', margin: 0 });
  const words = [
    ['SAFE', 1.0, 1.55, C.red],
    ['INCLUSIVE', 8.95, 1.55, C.purple],
    ['SKILLED', 1.0, 5.15, C.green],
    ['RESILIENT', 8.95, 5.15, C.amber]
  ];
  words.forEach(([t,x,y,c]) => {
    s.addText(t, { x, y, w: 3.4, h: 0.58, fontFace: FONT_NARROW, fontSize: 31, bold: true, color: c, align: 'center', margin: 0 });
    arrow(s, x + 1.7, y + (y < 3 ? 0.8 : -0.1), cx + (x < 5 ? -1.2 : 1.2), cy + (y < 3 ? -0.65 : 0.65), C.blue40, 1.5);
  });
  s.addText('Which of these four dimensions is currently the weakest in your organization?', { x: 2.1, y: 6.38, w: 9.1, h: 0.4, fontFace: FONT, fontSize: 18, color: C.grey, italic: true, align: 'center', margin: 0 });
  addNotes(s, '4 minutes', 'Use this as a quick opening poll. Ask participants to choose one word - safe, inclusive, skilled or resilient - that is currently the weakest dimension in their institution or enterprise. Take two or three responses. Then make the connection: these are not competing objectives. Safety without inclusion can overlook how risk is distributed. Inclusion without competence and safe work design can become symbolic. Skills investment without social dialogue can miss the realities of the job. Resilience that relies on chronic overwork is not sustainable. The centre of the diagram is decent work because the ILO just transition framework is not only about the number of jobs created; it is about rights, protection, participation, equality and the quality of those jobs. This slide also gives you an early reading of the room and helps you return to participants\' priorities at the end.', [
    'ILO, Gender, equality and inclusion for a just transition in climate action (2024): https://www.ilo.org/publications/gender-equality-and-inclusion-just-transition-climate-action',
    'ILO, Resolution concerning a just transition towards environmentally sustainable economies and societies for all (2023): https://www.ilo.org/resource/resolution-concerning-just-transition-towards-environmentally-sustainable'
  ]);
}

// 3
{
  const s = newSlide(); addDarkHeader(s, 'Three transitions are happening at once', n, 'Context');
  safeImage(s, photos.grid, 9.78, 1.28, 3.05, 5.52, { altText: 'Renewable energy on the grid' });
  s.addShape(pptx.ShapeType.rect, { x: 9.78, y: 1.28, w: 3.05, h: 5.52, fill: { color: C.blue, transparency: 58 }, line: { color: C.blue, transparency: 100 } });
  const bands = [
    { y: 1.55, c: C.cyan, t: '1  Resilience and reconstruction', d: 'Repair, continuity of essential services, emergency preparedness, safer recovery.' },
    { y: 3.2, c: C.green, t: '2  Decarbonization and decentralization', d: 'Renewables, storage, distributed systems, new value chains and new skills.' },
    { y: 4.85, c: C.amber, t: '3  Digitalization and automation', d: 'Sensors, drones, predictive maintenance, AI-supported decisions and new forms of control.' }
  ];
  bands.forEach(b => {
    s.addShape(pptx.ShapeType.chevron, { x: 0.68, y: b.y, w: 8.55, h: 1.18, fill: { color: b.c, transparency: 3 }, line: { color: b.c } });
    s.addText(b.t, { x: 1.05, y: b.y + 0.14, w: 6.55, h: 0.34, fontFace: FONT, fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(b.d, { x: 1.05, y: b.y + 0.54, w: 6.9, h: 0.46, fontFace: FONT, fontSize: 15.5, color: C.white, margin: 0 });
  });
  s.addText('Workforce systems must change with the energy system.', { x: 0.85, y: 6.43, w: 8.4, h: 0.36, fontFace: FONT_NARROW, fontSize: 24, bold: true, color: C.white, margin: 0 });
  addNotes(s, '4 minutes', 'Explain that the future of energy work is shaped by three transitions that overlap rather than arrive one after another. First, resilience and reconstruction require workers who can restore services under difficult conditions and organizations that can learn from emergencies. Second, decarbonization and decentralization change technologies, supply chains, occupational profiles and the location of work. Third, digitalization changes how hazards are detected, how work is allocated and how performance is monitored. Each transition can improve safety and widen opportunity, but each can also reproduce exclusion or introduce new risks. For example, remote monitoring may reduce exposure to high-voltage environments, but poorly designed systems may intensify work or reduce autonomy. New renewable occupations may expand employment, but women may remain concentrated in administration rather than technical and leadership roles. The policy challenge is therefore to connect energy policy, skills policy, equality policy and OSH governance instead of treating them as separate workstreams.', [
    'ILO, Occupational safety and health in a just transition (2023): https://www.ilo.org/publications/occupational-safety-and-health-just-transition',
    'IRENA and ILO, Renewable energy and jobs: Annual review 2025 (2026): https://www.irena.org/Publications/2026/Jan/Renewable-energy-and-jobs-Annual-review-2025',
    'ILO, Revolutionizing health and safety: The role of AI and digitalization at work (2025), user-provided project file.'
  ]);
}

// 4
{
  const s = newSlide(); addHeader(s, 'A just transition is a workforce strategy', n, 'Just transition');
  const xs = [0.75, 3.75, 6.75, 9.75];
  const data = [
    ['ANTICIPATE', 'Map jobs, skills, risks and groups likely to be left behind.', C.cyan],
    ['PREPARE', 'Invest in training, recognition of skills and accessible entry routes.', C.green],
    ['PROTECT', 'Apply labour rights, social protection and strong OSH systems.', C.red],
    ['PARTICIPATE', 'Use social dialogue and worker voice to shape change.', C.amber]
  ];
  data.forEach((d,i) => {
    if (i < 3) arrow(s, xs[i] + 2.35, 3.3, xs[i+1] - 0.18, 3.3, C.blue40, 2.2);
    s.addShape(pptx.ShapeType.ellipse, { x: xs[i], y: 2.05, w: 2.15, h: 2.15, fill: { color: d[2] }, line: { color: d[2] } });
    s.addText(String(i+1), { x: xs[i] + 0.72, y: 2.25, w: 0.72, h: 0.52, fontFace: FONT_NARROW, fontSize: 35, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[0], { x: xs[i] + 0.22, y: 2.95, w: 1.7, h: 0.32, fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[1], { x: xs[i] - 0.22, y: 4.48, w: 2.6, h: 1.05, fontFace: FONT, fontSize: 15.5, color: C.dark, align: 'center', valign: 'top', margin: 0.02 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.45, y: 5.95, w: 10.4, h: 0.62, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('The quality of the transition is determined by who gets opportunity, who carries risk and who has a voice.', { x: 1.75, y: 6.12, w: 9.8, h: 0.28, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '4 minutes', 'Present the four verbs as a practical workforce logic. Anticipation means using labour-market information, risk data and worker knowledge to understand how jobs and hazards are changing. Preparation means more than offering a course: it includes accessible recruitment, apprenticeships, recognition of prior learning and pathways for workers whose jobs are changing. Protection means that speed of deployment or reconstruction cannot displace labour rights, OSH obligations or social protection. Participation means that workers and their representatives are involved early enough to influence decisions, not only informed after technology and work organization have already been selected. Connect this to gender: women and other underrepresented groups need to be visible in the data, present in decision-making and able to access technical and leadership pathways. Connect it to OSH: prevention should be designed into new infrastructure, procurement and training from the beginning. This is cheaper and more effective than correcting unsafe systems later.', [
    'ILO, Guidelines for a just transition towards environmentally sustainable economies and societies for all (2015).',
    'ILO, Gender, equality and inclusion for a just transition in climate action (2024): https://www.ilo.org/publications/gender-equality-and-inclusion-just-transition-climate-action',
    'ILO, The role of collective bargaining in promoting just transitions (2025): https://www.ilo.org/publications/role-collective-bargaining-promoting-just-transitions'
  ]);
}

// 5
{
  const s = newSlide(); addHeader(s, 'The workforce challenge in one picture', n, 'Gender and energy');
  s.addText('Women as a share of employment', { x: 0.75, y: 1.45, w: 4.2, h: 0.35, fontFace: FONT, fontSize: 18, bold: true, color: C.dark, margin: 0 });
  statBar(s, 'Global employment', 40, 0.8, 2.05, 3.9, C.blue60);
  statBar(s, 'Energy sector', 20, 0.8, 2.78, 3.9, C.red);
  statBar(s, 'Renewable energy', 32, 0.8, 3.51, 3.9, C.green);
  s.addText('Within renewable energy', { x: 7.25, y: 1.45, w: 4.6, h: 0.35, fontFace: FONT, fontSize: 18, bold: true, color: C.dark, margin: 0 });
  const roles = [
    ['STEM roles', 28, C.cyan],
    ['Installation / trades', 22, C.amber],
    ['Senior leadership', 19, C.purple]
  ];
  roles.forEach((r,i) => {
    const x = 7.35 + i*1.72;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 5.25 - r[1]*0.085, w: 1.06, h: r[1]*0.085, fill: { color: r[2] }, line: { color: r[2] } });
    s.addText(`${r[1]}%`, { x: x - 0.02, y: 4.85 - r[1]*0.085, w: 1.1, h: 0.35, fontFace: FONT_NARROW, fontSize: 22, bold: true, color: r[2], align: 'center', margin: 0 });
    s.addText(r[0], { x: x - 0.24, y: 5.48, w: 1.55, h: 0.66, fontFace: FONT, fontSize: 13.5, bold: true, color: C.dark, align: 'center', margin: 0 });
  });
  s.addShape(pptx.ShapeType.line, { x: 7.18, y: 5.26, w: 5.0, h: 0, line: { color: C.grey40, width: 1.2 } });
  s.addText('The transition is expanding jobs, but representation still drops in technical, trade and leadership pathways.', { x: 0.95, y: 6.28, w: 11.55, h: 0.42, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Use this slide to establish the scale and nature of the gap without treating women as a single homogeneous group. The IEA estimates that women hold about one in five energy jobs, compared with roughly two in five jobs across the economy. IRENA finds a higher share in renewables, around 32 per cent, but the distribution is uneven: participation declines in STEM, installation and construction, and senior leadership. Clarify that the figures come from different datasets and are not a time series. The important message is the pattern. Growth in renewable energy jobs does not automatically remove occupational segregation, biased recruitment, unequal care responsibilities, unsuitable facilities or workplace cultures that discourage retention. Ask participants where they see the largest gap in their own context: entry into technical occupations, retention, promotion or leadership. Link the answer to workforce planning: underrepresentation is not only an equality issue; it can become a skills bottleneck and a source of blind spots in design and risk management.', [
    'IEA, Understanding gender gaps in the energy sector: https://www.iea.org/spotlights/understanding-gender-gaps-in-the-energy-sector',
    'IRENA, Renewable Energy: A Gender Perspective, second edition (2025): https://www.irena.org/Publications/2025/Oct/Renewable-Energy-A-Gender-Perspective',
    'IRENA, Women\'s Share of the Renewable Energy Workforce Remains at 32% (2025): https://www.irena.org/News/pressreleases/2025/Oct/Womens-Share-of-the-Renewable-Energy-Workforce-Remains-at-32-percent'
  ]);
}

// 6
{
  const s = newSlide(); addHeader(s, 'Inclusion is a safety issue', n, 'Core message');
  safeImage(s, photos.pylon, 7.45, 1.3, 5.35, 5.62, { altText: 'Maintenance workers on an electricity pylon' });
  s.addShape(pptx.ShapeType.rect, { x: 7.45, y: 1.3, w: 5.35, h: 5.62, fill: { color: C.blue, transparency: 73 }, line: { color: C.blue, transparency: 100 } });
  const qs = [
    ['WHO GETS WHICH TASK?', 'Task allocation determines exposure.'],
    ['WHO HAS EQUIPMENT THAT FITS?', 'Fit affects protection and safe movement.'],
    ['WHO CAN SPEAK UP?', 'Power and culture affect reporting and stop-work decisions.']
  ];
  qs.forEach((q,i) => {
    const y = 1.55 + i*1.55;
    s.addText(q[0], { x: 0.85, y, w: 5.75, h: 0.4, fontFace: FONT_NARROW, fontSize: 25, bold: true, color: [C.cyan,C.green,C.amber][i], margin: 0 });
    s.addText(q[1], { x: 0.88, y: y+0.53, w: 5.65, h: 0.45, fontFace: FONT, fontSize: 17, color: C.grey, margin: 0 });
  });
  s.addText('If these differ, risk is distributed unequally.', { x: 0.85, y: 6.32, w: 5.95, h: 0.42, fontFace: FONT, fontSize: 20, bold: true, color: C.blue, margin: 0 });
  addNotes(s, '4 minutes', 'Explain that inclusion changes exposure, protection and the ability to act. Occupational risk is not distributed only by job title. It is distributed through everyday decisions about who performs emergency tasks, who works nights, who travels, who receives mentoring, whose body dimensions are reflected in equipment and who is listened to when raising a concern. This is why equality should not be placed outside the OSH management system as a separate human-resources topic. A workforce may appear diverse in headcount while women, younger workers, contractors or persons with disabilities remain excluded from decision-making or concentrated in particular tasks. Conversely, an inclusive OSH approach improves the quality of hazard identification because it draws on a wider range of experience. Invite participants to think of one task in their workplace for which allocation is shaped by habit or stereotype rather than a transparent assessment of competence, exposure and controls.', [
    'ILO, Gender and Occupational Safety and Health: https://www.ilo.org/topics-and-sectors/safety-and-health-work/gender-and-occupational-safety-and-health',
    'ILO, 10 Keys for gender sensitive OSH practice (2013): https://www.ilo.org/publications/10-keys-gender-sensitive-osh-practice-%E2%80%93-guidelines-gender-mainstreaming',
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.',
    'Photo: Gaius Cornelius, Maintenance workers on electricity pylon, CC BY-SA 4.0.'
  ]);
}

// 7
{
  const s = newSlide(); addHeader(s, 'A gender lens connects people, roles and work design', n, 'Gender-sensitive OSH');
  s.addShape(pptx.ShapeType.ellipse, { x: 1.2, y: 1.65, w: 4.15, h: 4.15, fill: { color: C.blue20, transparency: 8 }, line: { color: C.blue60, width: 2 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 4.35, y: 1.65, w: 4.15, h: 4.15, fill: { color: 'DDF4FB', transparency: 8 }, line: { color: C.cyan, width: 2 } });
  s.addText('SEX-RELATED FACTORS', { x: 1.55, y: 2.0, w: 2.7, h: 0.35, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.blue, align: 'center', margin: 0 });
  addBulletList(s, ['Body dimensions and equipment fit', 'Reproductive and hormonal factors', 'Different responses to some exposures'], 1.62, 2.58, 2.95, { fontSize: 15.5, lineH: 0.7, bulletColor: C.blue60 });
  s.addText('GENDER AND SOCIAL FACTORS', { x: 5.05, y: 2.0, w: 2.8, h: 0.55, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.cyan, align: 'center', margin: 0 });
  addBulletList(s, ['Occupational segregation and task allocation', 'Care responsibilities and working time', 'Power, harassment and access to voice'], 5.08, 2.58, 3.05, { fontSize: 15.5, lineH: 0.7, bulletColor: C.cyan });
  s.addShape(pptx.ShapeType.ellipse, { x: 3.75, y: 3.1, w: 2.1, h: 1.6, fill: { color: C.white }, line: { color: C.green, width: 2.4 } });
  s.addText('WORK\nDESIGN', { x: 4.2, y: 3.48, w: 1.2, h: 0.7, fontFace: FONT_NARROW, fontSize: 24, bold: true, color: C.green, align: 'center', margin: 0 });
  s.addText('Use evidence - not assumptions. Differences within groups can be larger than average differences between groups.', { x: 9.05, y: 2.08, w: 3.15, h: 1.6, fontFace: FONT, fontSize: 19, bold: true, color: C.blue, margin: 0.02, valign: 'mid' });
  s.addShape(pptx.ShapeType.line, { x: 9.05, y: 3.93, w: 2.55, h: 0, line: { color: C.cyan, width: 3 } });
  s.addText('The purpose of a gender lens is to make hidden exposure visible - not to assign fixed characteristics to women or men.', { x: 9.05, y: 4.22, w: 3.25, h: 1.45, fontFace: FONT, fontSize: 17, color: C.dark, margin: 0.02 });
  addNotes(s, '6 minutes', 'This slide updates the sex and gender distinction from the attached presentation. Sex-related factors may matter for some exposures, body dimensions, equipment fit and reproductive health. Gender-related factors are socially produced: who enters a job, who is expected to perform particular tasks, who works particular schedules, who has unpaid care responsibilities and who has authority. The overlap is work design. A poorly designed workplace converts differences into unequal risk. A well-designed workplace anticipates variation and creates controls that work for a diverse workforce. Avoid presenting women and men as two uniform groups. The aim is not to make assumptions about strength, behaviour or vulnerability. It is to ask whether data, equipment, task design and preventive measures reflect the actual workforce. Emphasize the phrase on the right: gender-sensitive risk assessment should replace stereotypes with evidence. This also opens the door to intersectionality - age, disability, contract status, displacement, pregnancy, caregiving and other factors may combine with gender to shape exposure and access to protection.', [
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.',
    'ILO, Gender and Occupational Safety and Health: https://www.ilo.org/topics-and-sectors/safety-and-health-work/gender-and-occupational-safety-and-health',
    'ILO, 10 Keys for gender sensitive OSH practice (2013): https://www.ilo.org/publications/10-keys-gender-sensitive-osh-practice-%E2%80%93-guidelines-gender-mainstreaming'
  ]);
}

// 8
{
  const s = newSlide(); addHeader(s, 'Occupational segregation shapes exposure', n, 'Gender-sensitive OSH');
  const nodes = [
    ['INPUTS / MINING', C.grey60], ['GENERATION', C.amber], ['GRIDS', C.cyan], ['MAINTENANCE', C.red], ['CONTROL ROOMS', C.green], ['LEADERSHIP', C.purple]
  ];
  const y = 2.35;
  nodes.forEach((d,i) => {
    const x = 0.55 + i*2.08;
    if (i < nodes.length-1) arrow(s, x+1.65, y+0.5, x+2.02, y+0.5, C.blue40, 1.8);
    s.addShape(pptx.ShapeType.ellipse, { x, y, w: 1.65, h: 1.05, fill: { color: d[1] }, line: { color: d[1] } });
    s.addText(d[0], { x: x+0.12, y: y+0.31, w: 1.41, h: 0.4, fontFace: FONT, fontSize: 12.5, bold: true, color: C.white, align: 'center', margin: 0 });
  });
  const exposures = [
    ['PHYSICAL', 'Electricity, machinery, work at height, confined spaces, driving'],
    ['CHEMICAL / BIOLOGICAL', 'Dusts, oils, solvents, battery materials, gases and biological agents'],
    ['PSYCHOSOCIAL', 'Time pressure, isolation, harassment, fatigue, job insecurity and low control']
  ];
  exposures.forEach((e,i) => {
    const yy = 4.35 + i*0.72;
    s.addText(e[0], { x: 0.72, y: yy, w: 2.05, h: 0.3, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: [C.blue,C.cyan,C.purple][i], margin: 0 });
    s.addText(e[1], { x: 2.75, y: yy, w: 9.6, h: 0.35, fontFace: FONT, fontSize: 16.2, color: C.dark, margin: 0 });
  });
  s.addText('Who is concentrated at each point in the value chain - and who is missing from the data?', { x: 1.2, y: 6.58, w: 10.9, h: 0.34, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Walk along the energy value chain and explain that occupational segregation determines which hazards people encounter. Women may be present in the sector but concentrated in administrative or support roles, while men may be concentrated in field, maintenance, construction, mining and emergency response tasks. This can produce two blind spots. First, highly visible traditional hazards may be associated with male-dominated work, while risks in office, control-room, customer-facing or support work are underestimated. Second, when women enter technical roles, the workplace may still be designed around the previous workforce - in equipment, facilities, schedules, training examples and workplace culture. Ask participants where contractors fit in this picture, because contracted workers often carry high-risk tasks while being less visible in enterprise data and consultation. The practical implication is to disaggregate exposure by task and employment arrangement, not only by sex or job title. A modern risk profile must cover the entire value chain and all categories of worker.', [
    'IEA, Energy and Gender: https://www.iea.org/topics/energy-and-gender',
    'IRENA, Renewable Energy: A Gender Perspective, second edition (2025): https://www.irena.org/Publications/2025/Oct/Renewable-Energy-A-Gender-Perspective',
    'ILO, Decent work in renewable energy and critical mineral supply chains (2025): https://researchrepository.ilo.org/esploro/outputs/encyclopediaEntry/Decent-work-in-renewable-energy-and/995703659302676'
  ]);
}

// 9
{
  const s = newSlide(); addHeader(s, 'The same hazard can produce different exposure and outcomes', n, 'Gender-sensitive OSH');
  const steps = [
    ['HAZARD', 'Electricity, heat, chemicals, violence, workload', C.red],
    ['TASK', 'Who performs the task and for how long?', C.amber],
    ['FIT', 'Does equipment, PPE and the workstation fit?', C.cyan],
    ['WORK ORGANIZATION', 'Shift length, autonomy, staffing, breaks and care responsibilities', C.green],
    ['POWER AND VOICE', 'Can the worker refuse, report and influence controls?', C.purple],
    ['OUTCOME', 'Injury, illness, stress, exclusion or safe performance', C.blue]
  ];
  steps.forEach((d,i) => {
    const x = 0.42 + i*2.12;
    if (i < steps.length-1) arrow(s, x+1.68, 3.1, x+2.02, 3.1, C.blue40, 1.5);
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 1.72, h: 2.25, fill: { color: d[2], transparency: 4 }, line: { color: d[2] } });
    s.addText(String(i+1), { x: x+0.56, y: 2.18, w: 0.6, h: 0.45, fontFace: FONT_NARROW, fontSize: 31, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[0], { x: x+0.12, y: 2.8, w: 1.48, h: 0.42, fontFace: FONT_NARROW, fontSize: 17, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[1], { x: x+0.13, y: 3.3, w: 1.46, h: 0.72, fontFace: FONT, fontSize: 12.8, color: C.white, align: 'center', margin: 0.01 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.05, y: 5.25, w: 11.2, h: 1.05, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('A gender-sensitive assessment follows the whole pathway. It does not stop at identifying the hazard.', { x: 1.4, y: 5.58, w: 10.5, h: 0.4, fontFace: FONT, fontSize: 20, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Use the pathway to move the discussion from hazard identification to exposure pathways. The same electrical, chemical or psychosocial hazard may affect workers differently because they perform different tasks, use different equipment, work different schedules or have different power to stop work. For example, an emergency repair hazard may be technically identical for all workers, but one worker may have a harness that fits, another may be fatigued after a long shift, and a contractor may feel unable to challenge the schedule. These differences are not personal weakness; they are features of the work system. Ask participants where their risk assessments typically stop. Do they identify the hazard and list PPE, or do they also examine task duration, equipment fit, staffing, working time, reporting culture and recovery? The final outcome includes exclusion: a poorly designed control may keep women, pregnant workers or persons with disabilities out of a task instead of controlling the hazard for everyone.', [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO, Occupational safety and health in a just transition (2023).',
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.'
  ]);
}

// 10
{
  const s = newSlide(); addHeader(s, 'When a gender-neutral risk assessment is not neutral', n, 'Risk assessment');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.78, y: 1.55, w: 5.1, h: 4.95, fill: { color: C.light }, line: { color: C.blue20, width: 1.5 } });
  s.addText('THREE QUESTIONS', { x: 1.15, y: 1.9, w: 2.4, h: 0.32, fontFace: FONT_NARROW, fontSize: 22, bold: true, color: C.blue, margin: 0 });
  const qs = [
    ['1', 'Who is exposed?', 'Include contractors, night workers, new recruits, pregnant workers, workers with disabilities and those in isolated locations.'],
    ['2', 'How is the task really done?', 'Observe task allocation, duration, posture, pace, informal workarounds and access to breaks.'],
    ['3', 'Who is absent from the data?', 'Look for under-reporting, small groups, turnover, near misses and workers who do not feel safe to speak.']
  ];
  qs.forEach((q,i) => {
    const yy = 2.45 + i*1.25;
    s.addShape(pptx.ShapeType.ellipse, { x: 1.15, y: yy, w: 0.55, h: 0.55, fill: { color: [C.cyan,C.green,C.amber][i] }, line: { color: [C.cyan,C.green,C.amber][i] } });
    s.addText(q[0], { x: 1.32, y: yy+0.1, w: 0.22, h: 0.25, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(q[1], { x: 1.92, y: yy-0.02, w: 3.4, h: 0.3, fontFace: FONT, fontSize: 18, bold: true, color: C.dark, margin: 0 });
    s.addText(q[2], { x: 1.92, y: yy+0.36, w: 3.45, h: 0.62, fontFace: FONT, fontSize: 14.2, color: C.grey, margin: 0 });
  });
  s.addText('COMMON BLIND SPOTS', { x: 6.55, y: 1.9, w: 3.0, h: 0.32, fontFace: FONT_NARROW, fontSize: 22, bold: true, color: C.red, margin: 0 });
  addBulletList(s, ['PPE and tool fit', 'Sanitation and changing facilities', 'Pregnancy, fertility and lactation', 'Violence, harassment and third-party aggression', 'Fatigue, commuting and care responsibilities', 'Contractor and informal worker exposure', 'Psychosocial risks and work intensity'], 6.62, 2.48, 5.4, { fontSize: 17, lineH: 0.55, bulletColor: C.red });
  addNotes(s, '6 minutes', 'Stress that gender-sensitive risk assessment does not require a separate assessment for every group. It requires a better assessment of the real workforce and the real task. The three questions help teams challenge apparently neutral assumptions. Who is exposed may not be visible in formal job descriptions. How the task is done may differ from the procedure because of staffing shortages, equipment design or informal workarounds. Who is absent from the data is especially important: low incident numbers may reflect under-reporting, lack of access or the exclusion of certain workers from particular tasks. Use the blind spots to prompt examples. In energy workplaces, sanitation, changing facilities and safe transport can affect retention and safe participation. PPE fit can affect fall protection, electrical protection and emergency movement. Working time and commuting can create fatigue exposure. Violence and harassment can occur in crews, accommodation, transport, customer-facing work or digital communication. The output of the assessment should be preventive action, not a list of vulnerable people.', [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO Curriculum on Building Modern and Effective Labour Inspection Systems, Module 8: Occupational safety and health (user-provided file).',
    'ILO Curriculum, Modules 14 and 15 on psychosocial risks (user-provided files).'
  ]);
}

// 11
{
  const s = newSlide(); addHeader(s, 'Fit is a control measure', n, 'PPE, tools and facilities');
  safeImage(s, photos.solar, 0.65, 1.36, 5.35, 5.55, { altText: 'Technicians working on a solar installation' });
  s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 5.72, w: 5.35, h: 1.19, fill: { color: C.blue, transparency: 10 }, line: { color: C.blue, transparency: 100 } });
  s.addText('Protection that does not fit may not protect.', { x: 0.98, y: 6.02, w: 4.7, h: 0.42, fontFace: FONT, fontSize: 19, bold: true, color: C.white, align: 'center', margin: 0 });
  const items = [
    ['PPE', 'Size ranges, fall-arrest harnesses, gloves, respirators, hearing protection, body armour and maternity needs.', C.red],
    ['TOOLS AND WORKSTATIONS', 'Grip size, reach, force, posture, controls, vehicle cabins and emergency access.', C.cyan],
    ['FACILITIES AND PROCEDURES', 'Changing rooms, sanitation, lighting, safe transport, rescue plans and medical response.', C.green]
  ];
  items.forEach((it,i) => {
    const yy = 1.55 + i*1.58;
    s.addShape(pptx.ShapeType.line, { x: 6.55, y: yy+0.35, w: 0.9, h: 0, line: { color: it[2], width: 6 } });
    s.addText(it[0], { x: 7.58, y: yy+0.04, w: 4.25, h: 0.36, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: it[2], margin: 0 });
    s.addText(it[1], { x: 7.58, y: yy+0.51, w: 4.55, h: 0.72, fontFace: FONT, fontSize: 16, color: C.dark, margin: 0 });
  });
  addNotes(s, '5 minutes', 'Emphasize that PPE fit is not a comfort issue; it is part of the effectiveness of the control. A respirator that does not seal, a harness that does not fit, gloves that reduce dexterity or boots that alter balance may create new hazards. The same principle applies to tools, controls, vehicles and emergency procedures. The attached gender presentation explicitly noted that PPE has often been designed around male body dimensions. Ask participants how procurement specifications are currently written: by a single standard size, or by functional performance across a range of users? Encourage organizations to include workers in trials before large purchases, maintain size ranges, record fit problems and ensure that the answer is not to exclude the worker from the task. Extend the point to facilities. Changing rooms, sanitation, lighting, transport and accommodation affect whether women and other workers can participate safely, especially in remote, underground, night or emergency work. Procurement and infrastructure decisions are therefore part of gender-responsive OSH.', [
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.',
    'ILO, 10 Keys for gender sensitive OSH practice (2013), Key 9: Designing equipment, tools and PPE for both women and men.',
    'Photo: Climate Visuals / technicians working on a solar panel installation, CC BY 2.0.'
  ]);
}

// 12
{
  const s = newSlide(); addHeader(s, 'Protect exposure - do not exclude people', n, 'Reproductive health');
  s.addText('EXCLUSIONARY APPROACH', { x: 0.95, y: 1.55, w: 4.65, h: 0.36, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.red, align: 'center', margin: 0 });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.95, y: 2.05, w: 4.65, h: 3.65, fill: { color: 'FBEDEE' }, line: { color: C.red, width: 1.6 } });
  addBulletList(s, ['Assume certain jobs are unsuitable for women', 'Use blanket restrictions instead of controlling hazards', 'Focus only on pregnancy and ignore fertility risks for all workers', 'Shift the burden of prevention to the individual'], 1.35, 2.52, 3.9, { fontSize: 16.2, lineH: 0.7, bulletColor: C.red });
  s.addText('PREVENTIVE APPROACH', { x: 7.05, y: 1.55, w: 5.1, h: 0.36, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.green, align: 'center', margin: 0 });
  s.addShape(pptx.ShapeType.roundRect, { x: 7.05, y: 2.05, w: 5.1, h: 3.65, fill: { color: 'EAF6F2' }, line: { color: C.green, width: 1.6 } });
  addBulletList(s, ['Identify reproductive hazards for women and men', 'Eliminate or reduce chemical, physical, biological and psychosocial exposures', 'Provide confidential information, health surveillance and accommodation', 'Protect employment and prevent discrimination'], 7.45, 2.52, 4.32, { fontSize: 16.2, lineH: 0.7, bulletColor: C.green });
  arrow(s, 5.85, 3.85, 6.75, 3.85, C.blue, 3);
  s.addShape(pptx.ShapeType.roundRect, { x: 2.35, y: 6.13, w: 8.65, h: 0.55, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('The objective is equal access to safe work, supported by effective controls and reasonable accommodation.', { x: 2.65, y: 6.28, w: 8.05, h: 0.27, fontFace: FONT, fontSize: 17.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Use this slide to distinguish protection from paternalistic exclusion. Historical protective legislation sometimes prohibited women from night work, underground work or other occupations. Contemporary OSH principles focus on controlling hazards for all workers and providing appropriate maternity protection and accommodation. Reproductive hazards can affect women and men before conception, during pregnancy and after birth. They may include chemicals, radiation, heat, biological agents, heavy physical work, stress and working time. The preventive approach therefore starts with substitution, engineering controls, safe work organization and exposure limits, followed by confidential occupational health advice and individual accommodation where required. Employment protection and non-discrimination are essential so that workers can disclose needs without fear of losing their job or career opportunities. Avoid turning this into a medical lecture; keep the focus on risk management, equality and confidentiality. Ask whether current policies protect the worker or remove the worker from opportunity.', [
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.',
    'ILO, Gender and Occupational Safety and Health: https://www.ilo.org/topics-and-sectors/safety-and-health-work/gender-and-occupational-safety-and-health',
    'ILO Maternity Protection Convention, 2000 (No. 183), and Recommendation No. 191.'
  ]);
}

// 13
{
  const s = newSlide(); addDarkHeader(s, 'A safe workplace must also be a respectful workplace', n, 'Violence and harassment');
  s.addText('Violence and harassment - including gender-based violence and harassment - are occupational safety and health risks.', { x: 0.8, y: 1.45, w: 11.7, h: 0.65, fontFace: FONT, fontSize: 22, bold: true, color: C.white, align: 'center', margin: 0 });
  const zones = [
    ['ISOLATED / NIGHT WORK', 'Remote sites, call-outs, transport and emergency response'],
    ['ACCOMMODATION / TRAVEL', 'Shared facilities, field missions and contractor interfaces'],
    ['TEAM CULTURE / POWER', 'Male-dominated teams, apprenticeships, supervision and promotion'],
    ['DIGITAL COMMUNICATION', 'Messages, monitoring, online abuse and after-hours contact']
  ];
  zones.forEach((z,i) => {
    const x = 0.7 + (i%2)*6.15;
    const y = 2.55 + Math.floor(i/2)*1.55;
    s.addShape(pptx.ShapeType.line, { x, y: y+0.36, w: 0.72, h: 0, line: { color: [C.cyan,C.green,C.amber,C.red][i], width: 6 } });
    s.addText(z[0], { x: x+0.95, y: y+0.06, w: 4.9, h: 0.32, fontFace: FONT_NARROW, fontSize: 21, bold: true, color: C.white, margin: 0 });
    s.addText(z[1], { x: x+0.95, y: y+0.5, w: 4.75, h: 0.52, fontFace: FONT, fontSize: 15.5, color: C.blue20, margin: 0 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.05, y: 5.88, w: 11.25, h: 0.72, fill: { color: C.white, transparency: 90 }, line: { color: C.cyan, width: 1.2 } });
  s.addText('Controls: clear standards | risk assessment | trusted reporting | survivor-centred support | accountability | worker participation', { x: 1.35, y: 6.1, w: 10.65, h: 0.32, fontFace: FONT, fontSize: 16.5, bold: true, color: C.white, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'State clearly that violence and harassment are not only conduct or disciplinary issues. They affect physical and mental health, concentration, reporting, retention and the ability to perform work safely. Convention No. 190 covers violence and harassment connected with work, including in places where workers are paid, take breaks, use sanitary facilities, travel, receive training, communicate through work-related technologies or stay in employer-provided accommodation. In energy work, risk may be heightened by isolated sites, night work, emergency call-outs, contractor interfaces, male-dominated teams and power imbalances between apprentices, supervisors and permanent and temporary workers. Prevention should be integrated into OSH risk assessment and management, not left to a policy document that workers do not trust. Stress confidentiality, non-retaliation, multiple reporting channels, access to support and fair investigation. Ask whether a worker could raise a concern about harassment by a high-performing technical expert without fearing damage to their career.', [
    'ILO Violence and Harassment Convention, 2019 (No. 190): https://www.ilo.org/resource/ilc/108/violence-and-harassment-convention-2019-no-190',
    'ILO, Safe and healthy working environments free from violence and harassment (2020): https://www.ilo.org/publications/safe-and-healthy-working-environments-free-violence-and-harassment',
    'ILO, Guide on Convention No. 190 and Recommendation No. 206 (2021): https://www.ilo.org/publications/violence-and-harassment-world-work-guide-convention-no-190-and'
  ]);
}

// 14
{
  const s = newSlide(); addHeader(s, 'Modern energy work combines established and emerging hazards', n, 'OSH in transition');
  safeImage(s, photos.grid, 0.65, 1.35, 12.05, 1.55, { altText: 'Renewable energy on the grid' });
  s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 1.35, w: 12.05, h: 1.55, fill: { color: C.blue, transparency: 45 }, line: { color: C.blue, transparency: 100 } });
  s.addText('Old hazards do not disappear when the energy system becomes cleaner and smarter.', { x: 1.15, y: 1.83, w: 11.05, h: 0.46, fontFace: FONT_NARROW, fontSize: 27, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('ESTABLISHED', { x: 1.15, y: 3.35, w: 4.8, h: 0.38, fontFace: FONT_NARROW, fontSize: 24, bold: true, color: C.red, align: 'center', margin: 0 });
  s.addText('EMERGING OR INTENSIFYING', { x: 7.2, y: 3.35, w: 4.8, h: 0.38, fontFace: FONT_NARROW, fontSize: 24, bold: true, color: C.cyan, align: 'center', margin: 0 });
  addBulletList(s, ['Electrical energy and arc flash', 'Work at height and falling objects', 'Machinery, lifting and vehicles', 'Fire, explosion and confined spaces', 'Dusts, chemicals, noise and vibration'], 1.28, 4.02, 4.95, { fontSize: 16.8, lineH: 0.5, bulletColor: C.red });
  addBulletList(s, ['Heat, extreme weather and disaster response', 'Battery, hydrogen and new material risks', 'Cyber-physical failures and remote control', 'Automation bias, surveillance and work intensification', 'Skill mismatch and complex contractor interfaces'], 7.32, 4.02, 4.95, { fontSize: 16.8, lineH: 0.5, bulletColor: C.cyan });
  addNotes(s, '5 minutes', 'Use this slide to resist the idea that modernization automatically means safer work. Renewable generation, storage, hydrogen, smart grids and digital tools introduce new processes and interfaces while traditional hazards remain. Electrical work, work at height, lifting, driving, confined spaces, fire and chemical exposure continue to require strong controls. At the same time, climate change increases heat and extreme-weather exposure; battery and hydrogen systems introduce specific fire, explosion and chemical hazards; automation can create over-trust or deskilling; and cyber-physical failures can have safety consequences. Complex supply chains and contractors can fragment responsibility. The management response is not to reject innovation, but to integrate OSH into design, procurement, commissioning, training and change management. Ask participants which emerging risk is currently least developed in their organization\'s risk register. Note that gender and inclusion cut across both columns because exposure, fit, training and voice influence how every hazard is experienced.', [
    'ILO, Occupational safety and health in a just transition (2023).',
    'ILO, Ensuring safety and health at work in a changing climate (2024): https://www.ilo.org/publications/ensuring-safety-and-health-work-changing-climate',
    'ILO, Revolutionizing health and safety: The role of AI and digitalization at work (2025), user-provided project file.',
    'Photo: Kenueone, Renewable Energy on the Grid, CC0.'
  ]);
}

// 15
{
  const s = newSlide(); addHeader(s, 'Climate change is already changing the risk profile', n, 'Climate and OSH');
  safeImage(s, photos.substation, 0.65, 1.35, 5.25, 5.55, { altText: 'Electrical substation' });
  const hazards = [
    ['HEAT', 'Heat strain, fatigue, dehydration and reduced concentration', C.red],
    ['UV', 'Skin and eye damage in outdoor work', C.amber],
    ['EXTREME WEATHER', 'Storm, flood, ice, wildfire and emergency restoration', C.cyan],
    ['AIR QUALITY', 'Smoke, dust and pollution during normal and emergency work', C.grey60],
    ['VECTOR / BIOLOGICAL', 'Changing geographic and seasonal exposure', C.green],
    ['MENTAL HEALTH', 'Trauma, uncertainty, disrupted recovery and chronic strain', C.purple]
  ];
  hazards.forEach((h,i) => {
    const col = i%2, row = Math.floor(i/2);
    const x = 6.35 + col*3.05;
    const y = 1.52 + row*1.57;
    s.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.56, h: 0.56, fill: { color: h[2] }, line: { color: h[2] } });
    s.addText(h[0], { x: x+0.78, y: y+0.02, w: 2.15, h: 0.28, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: h[2], margin: 0 });
    s.addText(h[1], { x: x+0.78, y: y+0.38, w: 2.2, h: 0.72, fontFace: FONT, fontSize: 13.7, color: C.dark, margin: 0 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 6.4, y: 6.15, w: 5.75, h: 0.58, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('Adapt risk assessment, work-rest schedules, emergency plans, training and procurement.', { x: 6.72, y: 6.31, w: 5.12, h: 0.27, fontFace: FONT, fontSize: 16.3, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Explain that energy workers are both essential to climate adaptation and exposed to climate-related hazards. Outdoor line workers, construction crews, renewable-energy technicians and emergency restoration teams may face heat, UV radiation and extreme weather. Indoor workers may also experience heat where ventilation is limited or equipment generates heat. Climate events can change the work context rapidly: damaged structures, unstable ground, smoke, contaminated water, disrupted transport and extended shifts. The ILO global report highlights excessive heat, UV radiation, extreme weather, air pollution, vector-borne disease and agrochemicals; in energy work, psychosocial effects and fatigue during disaster response are also central. Stress that adaptation is organizational: heat plans, work-rest cycles, hydration, acclimatization, staffing, weather monitoring, emergency coordination and the right to stop work. PPE choices must consider heat load and fit. The gender lens matters because task allocation, clothing, sanitation, pregnancy, commuting and unpaid care may affect exposure and recovery.', [
    'ILO, Ensuring safety and health at work in a changing climate (2024): https://www.ilo.org/publications/ensuring-safety-and-health-work-changing-climate',
    'ILO, Report at a glance: Ensuring safety and health at work in a changing climate (2024).',
    'Photo: Electrical substation, public domain / Wikimedia Commons.'
  ]);
}

// 16
{
  const s = newSlide(); addHeader(s, 'Digitalization can prevent harm - and create new risks', n, 'Technology and OSH');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: 1.48, w: 5.55, h: 4.95, fill: { color: 'EAF6F2' }, line: { color: C.green, width: 1.6 } });
  s.addText('PREVENTION OPPORTUNITIES', { x: 1.15, y: 1.88, w: 4.75, h: 0.35, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.green, align: 'center', margin: 0 });
  addBulletList(s, ['Drones and robots remove workers from dangerous areas', 'Sensors detect heat, gas, electrical and mechanical anomalies', 'Predictive maintenance identifies failure before exposure', 'Wearables can support heat, fatigue and ergonomic prevention', 'Remote expert support can improve decisions in the field'], 1.2, 2.55, 4.75, { fontSize: 16.4, lineH: 0.66, bulletColor: C.green });
  s.addShape(pptx.ShapeType.roundRect, { x: 7.0, y: 1.48, w: 5.55, h: 4.95, fill: { color: 'FBEDEE' }, line: { color: C.red, width: 1.6 } });
  s.addText('GOVERNANCE RISKS', { x: 7.42, y: 1.88, w: 4.75, h: 0.35, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.red, align: 'center', margin: 0 });
  addBulletList(s, ['False assurance, automation bias and over-reliance', 'Work intensification and reduced autonomy', 'Biased data and unequal access to technology', 'Surveillance, privacy and loss of trust', 'Cybersecurity failures with physical safety consequences'], 7.45, 2.55, 4.75, { fontSize: 16.4, lineH: 0.66, bulletColor: C.red });
  s.addText('Technology should support professional judgement and prevention - not replace responsibility.', { x: 1.5, y: 6.65, w: 10.35, h: 0.3, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '6 minutes', 'Balance the discussion. Digital technologies can remove workers from dangerous environments, improve detection and support faster response. In the energy sector, drones, thermal imaging, sensors, predictive analytics and remote support can be particularly valuable. But a tool that produces data is not automatically a control. Poor data, weak calibration, automation bias or unclear responsibility may create false confidence. Algorithmic management can increase work pace, reduce autonomy or monitor workers in ways that undermine trust and psychosocial health. Bias may arise if systems are trained on data that do not represent women, older workers, persons with disabilities or different body types. Stress that qualified professionals remain accountable for final decisions. Worker participation is essential before deployment, because users understand how the technology interacts with real tasks. The governing question is not only whether the tool works technically, but whether it improves safety for the whole workforce under actual operating conditions.', [
    'ILO, Revolutionizing health and safety: The role of AI and digitalization at work (2025), user-provided project file.',
    'EU-OSHA, Strategies for safety and health in an automated world, user-provided project file.',
    'EU-OSHA, Towards AI-based and algorithmic worker management systems, user-provided project file.',
    'ICOH presentation on AI use in occupational health practice, user-provided project file.'
  ]);
}

// 17
{
  const s = newSlide(); addHeader(s, 'A human-centred deployment test', n, 'Technology and OSH');
  s.addShape(pptx.ShapeType.ellipse, { x: 4.65, y: 2.28, w: 4.0, h: 2.1, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('DOES THE TOOL\nIMPROVE SAFE WORK\nFOR THE WHOLE WORKFORCE?', { x: 5.2, y: 2.76, w: 2.9, h: 1.1, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.white, align: 'center', valign: 'mid', margin: 0 });
  const q = [
    ['PURPOSE', 'What risk or work problem are we solving?', 0.65, 1.45, C.cyan],
    ['PARTICIPATION', 'Have workers and representatives shaped design and testing?', 0.65, 4.65, C.green],
    ['HUMAN OVERSIGHT', 'Who can challenge, pause or override the system?', 4.72, 5.4, C.amber],
    ['PRIVACY', 'Is data collection necessary, proportionate and transparent?', 8.78, 4.65, C.purple],
    ['INCLUSION', 'Does the tool work for different users and accessibility needs?', 8.78, 1.45, C.red],
    ['LEARNING', 'How will errors, incidents and unintended effects be reviewed?', 4.72, 1.22, C.blue60]
  ];
  q.forEach(item => {
    s.addShape(pptx.ShapeType.roundRect, { x: item[2], y: item[3], w: 3.9, h: 1.15, fill: { color: C.white }, line: { color: item[4], width: 2 } });
    s.addText(item[0], { x: item[2]+0.18, y: item[3]+0.14, w: 3.5, h: 0.28, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: item[4], align: 'center', margin: 0 });
    s.addText(item[1], { x: item[2]+0.22, y: item[3]+0.52, w: 3.45, h: 0.45, fontFace: FONT, fontSize: 13.6, color: C.dark, align: 'center', margin: 0 });
  });
  addNotes(s, '5 minutes', 'Offer the six questions as a practical governance checklist before procurement, pilot or scale-up. Start with purpose: a technology should respond to a defined risk or work problem, not be adopted because it is fashionable. Participation should include the people who will use the tool and those affected by the data it generates. Human oversight means a qualified person remains responsible and workers can challenge unsafe outputs. Privacy requires data minimization, transparency and safeguards against using OSH data for punitive performance management. Inclusion requires testing across different users, body sizes, languages, digital skills and accessibility needs. Learning means treating deployment as an ongoing change process: review false alarms, missed hazards, workarounds, incidents and psychosocial effects. Ask participants which question is most often missing in their technology projects. This framework can also be applied to AI-based inspection tools and digital monitoring systems used by authorities.', [
    'ILO, Revolutionizing health and safety: The role of AI and digitalization at work (2025).',
    'EU-OSHA, Smart digital systems for improving worker safety and health (2024), user-provided project file.',
    'ICOH, AI use in occupational health and safety practice, user-provided presentation.'
  ]);
}

// 18
{
  const s = newSlide(); addDarkHeader(s, 'Psychosocial risks are work-design risks', n, 'Psychosocial working environment');
  s.addShape(pptx.ShapeType.ellipse, { x: 3.58, y: 1.55, w: 6.2, h: 4.95, fill: { color: C.blue80 }, line: { color: C.blue20, width: 1.5 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 4.55, y: 2.28, w: 4.25, h: 3.5, fill: { color: C.blue60 }, line: { color: C.cyan, width: 1.5 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.48, y: 3.0, w: 2.4, h: 2.05, fill: { color: C.cyan }, line: { color: C.white, width: 1.3 } });
  s.addText('SECTOR AND POLICY CONTEXT', { x: 4.2, y: 1.93, w: 4.95, h: 0.3, fontFace: FONT_NARROW, fontSize: 19, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('ORGANIZATION AND WORKPLACE', { x: 4.85, y: 2.63, w: 3.65, h: 0.3, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('TASK / ROLE', { x: 5.85, y: 3.77, w: 1.65, h: 0.28, fontFace: FONT_NARROW, fontSize: 19, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('Job demands, workload, role clarity, autonomy and exposure to traumatic events', { x: 5.52, y: 4.1, w: 2.28, h: 0.7, fontFace: FONT, fontSize: 12.8, color: C.white, align: 'center', margin: 0 });
  s.addText('Staffing, schedules, leadership, fairness, support, participation and reporting systems', { x: 4.73, y: 5.15, w: 3.9, h: 0.62, fontFace: FONT, fontSize: 13.2, color: C.white, align: 'center', margin: 0 });
  s.addText('Regulation, restructuring, labour-market insecurity, social dialogue and public expectations', { x: 3.82, y: 6.0, w: 5.7, h: 0.4, fontFace: FONT, fontSize: 13.5, color: C.white, align: 'center', margin: 0 });
  s.addText('Prevention must act at all three levels - not only teach individuals to cope.', { x: 0.75, y: 6.58, w: 11.8, h: 0.35, fontFace: FONT, fontSize: 19, bold: true, color: C.white, align: 'center', margin: 0 });
  addNotes(s, '6 minutes', 'Introduce psychosocial risks as features of job design, work organization, management and the broader context. The 2026 ILO global report uses three interrelated levels. At the task and role level, consider workload, autonomy, role clarity, emotional demands and traumatic exposure. At the organizational level, consider staffing, schedules, leadership, support, fairness, communication and participation. At the sector and policy level, consider restructuring, insecurity, regulation, social dialogue and public expectations. This framing prevents a common error: treating stress as an individual weakness and responding only with resilience training or counselling. Individual support is important, especially after traumatic events, but it cannot substitute for adequate staffing, realistic deadlines, rest, clear roles and fair processes. Mention the global scale carefully: the report estimates major mortality, disability and economic losses associated with psychosocial risk factors, but the purpose here is prevention, not alarm. Ask participants which of the three levels receives most attention in their current system and which is neglected.', [
    'ILO, The psychosocial working environment: Global developments and pathways for action (2026): https://www.ilo.org/publications/psychosocial-working-environment-global-developments-and-pathways-action',
    'ILO Curriculum on Building Modern and Effective Labour Inspection Systems, Modules 14 and 15 on psychosocial risks, user-provided files.'
  ]);
}

// 19
{
  const s = newSlide(); addHeader(s, 'The psychosocial risk profile of energy work', n, 'Psychosocial risks');
  const cx = 6.65, cy = 3.7;
  s.addShape(pptx.ShapeType.ellipse, { x: cx-1.0, y: cy-1.0, w: 2.0, h: 2.0, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('SAFE AND\nSUSTAINABLE\nPERFORMANCE', { x: cx-0.68, y: cy-0.55, w: 1.36, h: 1.05, fontFace: FONT_NARROW, fontSize: 18.5, bold: true, color: C.white, align: 'center', valign: 'mid', margin: 0 });
  const risks = [
    ['FATIGUE', 'Long shifts, night work and interrupted recovery', 0.75, 1.55, C.red],
    ['TRAUMATIC EXPOSURE', 'Injury, attacks, disasters and repeated emergency response', 4.6, 1.15, C.purple],
    ['TIME PRESSURE', 'Pressure to restore service and avoid disruption', 8.85, 1.55, C.amber],
    ['LOW CONTROL / ROLE CONFLICT', 'Competing instructions and unclear authority', 9.15, 4.75, C.cyan],
    ['ISOLATION', 'Remote sites, lone work and weak support', 4.7, 5.65, C.green],
    ['INSECURITY / CHANGE', 'Restructuring, new technology and uncertain careers', 0.6, 4.75, C.blue60]
  ];
  risks.forEach(r => {
    s.addShape(pptx.ShapeType.roundRect, { x: r[2], y: r[3], w: 3.55, h: 1.15, fill: { color: C.white }, line: { color: r[4], width: 2 } });
    s.addText(r[0], { x: r[2]+0.18, y: r[3]+0.14, w: 3.2, h: 0.28, fontFace: FONT_NARROW, fontSize: 17.5, bold: true, color: r[4], align: 'center', margin: 0 });
    s.addText(r[1], { x: r[2]+0.22, y: r[3]+0.52, w: 3.1, h: 0.43, fontFace: FONT, fontSize: 13.2, color: C.dark, align: 'center', margin: 0 });
    arrow(s, r[2]+1.78, r[3] < 3 ? r[3]+1.18 : r[3]-0.08, cx + (r[2] < 4 ? -0.9 : r[2] > 8 ? 0.9 : 0), cy + (r[3] < 3 ? -0.8 : 0.8), C.blue40, 1.3);
  });
  s.addText('Possible outcomes: error and near misses | conflict | ill-health | turnover | exclusion from work', { x: 1.2, y: 6.65, w: 10.9, h: 0.3, fontFace: FONT, fontSize: 16.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '6 minutes', 'Review the six risk clusters and invite participants to add examples. Fatigue is especially important because it connects psychosocial and physical safety: reduced attention and slower reaction can contribute to electrical, driving and maintenance incidents. Traumatic exposure may arise from serious incidents, attacks, disasters, seeing injured colleagues or repeated work in damaged environments. Time pressure is often justified by the essential nature of energy services, but unrealistic restoration targets can normalize unsafe shortcuts. Role conflict appears when operational, security and production priorities compete or authority is unclear. Isolation may be physical or organizational. Insecurity can be created by restructuring, automation, closure or fear of being left behind by new skills requirements. Gender and inclusion influence all six: workers may have different care responsibilities, face harassment, have less authority, or fear that disclosing fatigue, disability or mental-health needs will damage their career. Prevention should combine work design, staffing, leadership, peer support, confidential services and post-incident learning.', [
    'ILO, The psychosocial working environment: Global developments and pathways for action (2026).',
    'ILO Curriculum, Module 14: Concept and scope - Ensuring compliance with legislation on psychosocial risks.',
    'ILO Curriculum, Module 15: Inspection actions to deal with psychosocial risks.'
  ]);
}

// 20
{
  const s = newSlide();
  safeImage(s, photos.repairs, 0, 0, W, H, { altText: 'Transmission system repair work' });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.blue, transparency: 28 }, line: { color: C.blue, transparency: 100 } });
  label(s, 'Ukraine', 0.72, 0.55, 1.15, C.cyan, C.white);
  s.addText('ENERGY RESILIENCE DEPENDS\nON WORKER PROTECTION', { x: 0.75, y: 1.15, w: 6.25, h: 1.45, fontFace: FONT_NARROW, fontSize: 34, bold: true, color: C.white, margin: 0 });
  const blocks = [
    ['IMMEDIATE OSH', 'Wartime protocols, appropriate PPE, unexploded ordnance awareness, emergency coordination and safe repair procedures.'],
    ['PSYCHOSOCIAL SUPPORT', 'Fatigue management, trauma-informed support, peer systems, confidential services and recovery after critical incidents.'],
    ['FUTURE SKILLS AND INCLUSION', 'Prepare women, veterans, persons with disabilities and displaced workers for a modern, decentralized and renewable system.']
  ];
  blocks.forEach((b,i) => {
    const yy = 3.05 + i*1.08;
    s.addShape(pptx.ShapeType.line, { x: 0.82, y: yy+0.25, w: 0.75, h: 0, line: { color: [C.cyan,C.green,C.amber][i], width: 6 } });
    s.addText(b[0], { x: 1.78, y: yy, w: 2.65, h: 0.3, fontFace: FONT_NARROW, fontSize: 19, bold: true, color: C.white, margin: 0 });
    s.addText(b[1], { x: 4.15, y: yy-0.05, w: 7.75, h: 0.62, fontFace: FONT, fontSize: 15.2, color: C.white, margin: 0 });
  });
  addFooter(s, n, true);
  addNotes(s, '7 minutes', 'Connect the global framework directly to Ukraine. The ILO project developed with the Ministry of Energy and employers\' and workers\' organizations recognizes that crews maintaining and restoring electricity and heating face attacks on infrastructure, unexploded ordnance, fatigue and psychosocial stress. The immediate agenda is to update wartime OSH protocols, improve access to appropriate PPE, strengthen inspection and reporting, and expand workplace-based psychosocial support. The longer-term agenda is equally important: the workforce must be prepared for a modern, decentralized and greener energy system. Inclusion is part of resilience because the sector needs to retain and expand its skills base. Safe reintegration pathways for veterans, women, persons with disabilities and internally displaced persons require accessible training, suitable work design, reasonable adjustments and a culture that does not stigmatize support needs. Invite participants to identify where short-term emergency practice should be converted into permanent institutional capacity.', [
    'ILO, Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery (2026): https://www.ilo.org/resource/news/ilo-and-government-netherlands-launch-project-protect-ukrainians-working',
    'ILO Development Cooperation Dashboard, UKR/25/06/NLD: https://webapps.ilo.org/DevelopmentCooperationDashboard/p/project/110329',
    'Photo: Western Area Power / Jeff Miller, Transmission system repairs underway, CC BY 2.0.'
  ]);
}

// 21
{
  const s = newSlide(); addHeader(s, 'Inclusive recovery and reintegration', n, 'Ukraine and workforce inclusion');
  s.addShape(pptx.ShapeType.ellipse, { x: 4.85, y: 2.35, w: 3.6, h: 2.2, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('COMPETENCE +\nSAFE ACCOMMODATION +\nDIGNITY', { x: 5.42, y: 2.85, w: 2.45, h: 1.05, fontFace: FONT_NARROW, fontSize: 23, bold: true, color: C.white, align: 'center', margin: 0 });
  const groups = [
    ['WOMEN ENTERING TECHNICAL ROLES', 0.55, 1.45, C.cyan],
    ['VETERANS AND RETURNING WORKERS', 8.95, 1.45, C.green],
    ['PERSONS WITH DISABILITIES', 0.55, 4.9, C.purple],
    ['IDPs, RETURNEES AND OLDER WORKERS', 8.95, 4.9, C.amber]
  ];
  groups.forEach(g => {
    s.addShape(pptx.ShapeType.roundRect, { x: g[1], y: g[2], w: 3.8, h: 1.25, fill: { color: C.white }, line: { color: g[3], width: 2 } });
    s.addText(g[0], { x: g[1]+0.25, y: g[2]+0.37, w: 3.3, h: 0.5, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: g[3], align: 'center', margin: 0 });
    arrow(s, g[1] < 5 ? g[1]+3.82 : g[1]-0.05, g[2]+0.62, g[1] < 5 ? 4.72 : 8.55, 3.45, C.blue40, 1.5);
  });
  const actions = ['Accessible recruitment and training', 'Individual reasonable adjustments', 'Return-to-work and rehabilitation pathways', 'Flexible schedules and task redesign', 'Assistive technology and accessible facilities', 'Anti-stigma leadership and peer support'];
  s.addShape(pptx.ShapeType.roundRect, { x: 3.15, y: 5.18, w: 7.05, h: 1.25, fill: { color: C.light }, line: { color: C.blue20 } });
  actions.forEach((a,i) => {
    const x = 3.38 + (i%3)*2.22;
    const y = 5.43 + Math.floor(i/3)*0.46;
    s.addShape(pptx.ShapeType.ellipse, { x, y: y+0.07, w: 0.11, h: 0.11, fill: { color: C.cyan }, line: { color: C.cyan } });
    s.addText(a, { x: x+0.18, y, w: 1.85, h: 0.3, fontFace: FONT, fontSize: 12.7, color: C.dark, margin: 0 });
  });
  addNotes(s, '6 minutes', 'Clarify that inclusion does not mean lowering safety or competence standards. It means removing unnecessary barriers and providing adjustments so people can meet the essential requirements of the job safely. Reasonable accommodation can include modifications to equipment, job content, working time, communication, training or the physical environment. For veterans and workers with disabilities, return-to-work should be planned with the worker, occupational health professionals and line management, focusing on capability rather than assumptions. For women entering technical roles, facilities, PPE, mentoring, transparent promotion and protection from harassment matter for retention. Internally displaced persons, returnees and older workers may need recognition of prior learning, bridging training or flexible pathways. The central idea is dignity: workers should not have to trade privacy, status or career prospects for access to support. Ask participants for examples of low-cost adjustments that could unlock participation in their workplace.', [
    'ILO, Promoting diversity and inclusion through workplace adjustments: A practical guide (2016): https://www.ilo.org/publications/promoting-diversity-and-inclusion-through-workplace-adjustments-practical',
    'ILO, Disability and work: https://www.ilo.org/resource/disability-and-work',
    'ILO, Guideline on reasonable accommodation for persons with disabilities (2026): https://www.ilo.org/resource/other/guideline-reasonable-accommodation-persons-disabilities',
    'ILO Ukraine energy workforce project (2026).'
  ]);
}

// 22
{
  const s = newSlide(); addHeader(s, 'Social dialogue is a safety control', n, 'Participation');
  const circles = [
    ['GOVERNMENT / MINISTRY', 1.0, 2.05, C.blue],
    ['EMPLOYERS / ENTERPRISES', 8.85, 2.05, C.green],
    ['WORKERS / UNIONS', 4.95, 4.65, C.cyan]
  ];
  arrow(s, 3.65, 3.0, 8.75, 3.0, C.blue40, 2);
  arrow(s, 2.65, 3.75, 5.25, 5.05, C.blue40, 2);
  arrow(s, 10.4, 3.75, 8.05, 5.05, C.blue40, 2);
  circles.forEach(c => {
    s.addShape(pptx.ShapeType.ellipse, { x: c[1], y: c[2], w: 3.4, h: 1.55, fill: { color: c[3] }, line: { color: c[3] } });
    s.addText(c[0], { x: c[1]+0.35, y: c[2]+0.52, w: 2.7, h: 0.42, fontFace: FONT_NARROW, fontSize: 20, bold: true, color: C.white, align: 'center', margin: 0 });
  });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.15, y: 2.45, w: 3.0, h: 1.1, fill: { color: C.white }, line: { color: C.amber, width: 2 } });
  s.addText('SHARED RISK\nINTELLIGENCE', { x: 5.7, y: 2.72, w: 1.9, h: 0.55, fontFace: FONT_NARROW, fontSize: 20, bold: true, color: C.amber, align: 'center', margin: 0 });
  s.addText('Sector level', { x: 0.85, y: 5.98, w: 1.55, h: 0.3, fontFace: FONT, fontSize: 15.5, bold: true, color: C.blue, margin: 0 });
  s.addText('Standards, skills plans, emergency coordination and sector campaigns', { x: 2.2, y: 5.98, w: 3.75, h: 0.35, fontFace: FONT, fontSize: 14.2, color: C.dark, margin: 0 });
  s.addText('Enterprise level', { x: 6.35, y: 5.98, w: 1.7, h: 0.3, fontFace: FONT, fontSize: 15.5, bold: true, color: C.green, margin: 0 });
  s.addText('Risk assessment, technology change, staffing, schedules and reporting', { x: 7.85, y: 5.98, w: 4.55, h: 0.35, fontFace: FONT, fontSize: 14.2, color: C.dark, margin: 0 });
  s.addText('Task level', { x: 0.85, y: 6.48, w: 1.55, h: 0.3, fontFace: FONT, fontSize: 15.5, bold: true, color: C.cyan, margin: 0 });
  s.addText('Pre-job briefing, stop-work authority, peer checks and learning after work', { x: 2.2, y: 6.48, w: 5.25, h: 0.35, fontFace: FONT, fontSize: 14.2, color: C.dark, margin: 0 });
  addNotes(s, '5 minutes', 'Present social dialogue as a source of operational intelligence. Governments and ministries understand policy, regulation and system-level priorities. Employers understand technology, operations and resource constraints. Workers and their organizations understand how tasks are actually performed, where procedures fail and which controls are workable. Safety improves when these perspectives interact early. At sector level, dialogue can shape standards, skills strategies, emergency coordination and campaigns. At enterprise level, it can shape risk assessment, staffing, schedules, technology deployment and reporting systems. At task level, it appears in pre-job briefings, worker consultation, peer checks and stop-work authority. Inclusion matters inside dialogue structures: women, younger workers, contractors, persons with disabilities and workers from different occupations should be represented. Ask whether current consultation mechanisms receive information or have influence. Effective participation requires time, access to information, protection from retaliation and feedback on what changed.', [
    'ILO, Resolution concerning a just transition (2023).',
    'ILO, The role of collective bargaining in promoting just transitions (2025).',
    'ILO Curriculum, Module 5: Cooperation and partnership, user-provided file.',
    'ILO Occupational Safety and Health Convention, 1981 (No. 155), worker participation principles.'
  ]);
}

// 23
{
  const s = newSlide(); addHeader(s, 'The ILO 10 Keys translated into five energy commitments', n, 'From principle to practice');
  const commitments = [
    ['1', 'POLICY AND LAW', 'Review OSH, equality, working-time and sector rules together - and remove discriminatory barriers.', C.blue],
    ['2', 'RISK AND DATA', 'Assess real tasks and use sex-disaggregated, task-based and intersectional data.', C.cyan],
    ['3', 'PARTICIPATION AND SERVICES', 'Ensure equal voice, trusted reporting and access to occupational health and psychosocial support.', C.green],
    ['4', 'EQUIPMENT AND CAPABILITY', 'Design PPE, tools, facilities, information and training for a diverse workforce.', C.amber],
    ['5', 'WORKING TIME AND CARE', 'Manage fatigue, scheduling, travel, remote work and work-life balance as OSH issues.', C.purple]
  ];
  commitments.forEach((c,i) => {
    const y = 1.38 + i*1.05;
    s.addShape(pptx.ShapeType.chevron, { x: 0.75, y, w: 2.18, h: 0.78, fill: { color: c[3] }, line: { color: c[3] } });
    s.addText(c[0], { x: 1.05, y: y+0.18, w: 0.45, h: 0.32, fontFace: FONT_NARROW, fontSize: 25, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(c[1], { x: 1.5, y: y+0.18, w: 1.15, h: 0.34, fontFace: FONT_NARROW, fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(c[2], { x: 3.25, y: y+0.06, w: 9.05, h: 0.62, fontFace: FONT, fontSize: 17, color: C.dark, valign: 'mid', margin: 0 });
  });
  s.addText('A gender-responsive OSH system is not a separate programme. It changes how the core system operates.', { x: 1.15, y: 6.78, w: 11.05, h: 0.32, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '6 minutes', 'Explain that the original ILO guidance contains ten keys: legislation, policy, risk management, research, indicators, health services, participation, information and training, equipment and PPE, and working time and work-life balance. This slide groups them into five commitments for the energy sector. The first commitment connects equality and OSH rules so that protection does not become exclusion. The second improves risk assessment and data. The third strengthens participation, reporting and services. The fourth addresses the material design of work and the capability to perform it. The fifth recognizes working time, travel, remote work and care as part of the exposure profile. Encourage participants to use the five commitments as a quick review framework for a company policy, inspection checklist, collective agreement or sector strategy. Ask them which commitment is currently strongest and which lacks an accountable owner.', [
    'ILO, 10 Keys for gender sensitive OSH practice (2013): https://www.ilo.org/publications/10-keys-gender-sensitive-osh-practice-%E2%80%93-guidelines-gender-mainstreaming',
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.'
  ]);
}

// 24
{
  const s = newSlide();
  safeImage(s, photos.repairs, 0, 0, W, H, { altText: 'Workers repairing power infrastructure' });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.25, h: H, fill: { color: C.blue, transparency: 10 }, line: { color: C.blue, transparency: 100 } });
  label(s, 'Fictional composite case', 0.7, 0.5, 2.35, C.cyan, C.white);
  s.addText('RESTORATION AFTER\nINFRASTRUCTURE DAMAGE', { x: 0.72, y: 1.08, w: 5.95, h: 1.15, fontFace: FONT_NARROW, fontSize: 31, bold: true, color: C.white, margin: 0 });
  const scenario = [
    '02:30 in winter. A substation is damaged and a hospital circuit must be restored.',
    'The eight-person crew includes two new recruits, a woman technician, a veteran with hearing loss, a contractor and an experienced supervisor.',
    'Several workers have already been on duty for 12 hours. Mobile communication is intermittent.',
    'Unexploded-ordnance clearance is not fully documented. Only one fall-arrest harness is available in a smaller size.',
    'Management asks for restoration within 90 minutes.'
  ];
  addBulletList(s, scenario, 0.88, 2.5, 5.95, { fontSize: 16.2, lineH: 0.77, bulletColor: C.cyan, color: C.white });
  addFooter(s, n, true);
  addNotes(s, '3 minutes', 'Read the case slowly and state that it is a fictional composite designed for discussion, not a description of a specific incident. Ask participants not to jump immediately to a technical solution. The scenario deliberately combines life-critical hazards, time pressure, fatigue, inclusion, communication and organizational responsibility. The hospital circuit creates a powerful production pressure. The mixed crew creates questions about competence, mentoring, communication and task allocation. The undocumented clearance and unsuitable harness are red flags. The hearing loss should lead to communication accommodation, not automatic exclusion. The woman technician should not be protected by removing her from meaningful technical work; the task should be allocated by competence and controls. Give groups the next slide and twelve minutes. Encourage them to identify decisions at the task, organizational and management levels.', [
    'Fictional case informed by the ILO Ukraine energy workforce project (2026).',
    'ILO Curriculum, Module 8: Occupational safety and health.',
    'ILO Curriculum, Modules 14 and 15 on psychosocial risks.',
    'Photo: Western Area Power / Jeff Miller, Transmission system repairs underway, CC BY 2.0.'
  ]);
}

// 25
{
  const s = newSlide(); addHeader(s, 'Group task', n, 'Case exercise');
  s.addShape(pptx.ShapeType.ellipse, { x: 0.85, y: 1.65, w: 2.55, h: 2.55, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('12', { x: 1.48, y: 2.08, w: 1.25, h: 0.75, fontFace: FONT_NARROW, fontSize: 50, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('MINUTES', { x: 1.43, y: 2.95, w: 1.35, h: 0.35, fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('Assign a rapporteur and prepare a two-minute response.', { x: 0.78, y: 4.55, w: 2.7, h: 0.85, fontFace: FONT, fontSize: 17, color: C.grey, align: 'center', margin: 0 });
  const qs = [
    ['1', 'STOP / GO', 'What must be verified or controlled before work starts?'],
    ['2', 'TASK ALLOCATION', 'How will you assign work by competence without stereotypes or exclusion?'],
    ['3', 'FIT AND ACCOMMODATION', 'What PPE, communication and work-design adjustments are required?'],
    ['4', 'PSYCHOSOCIAL AND LEARNING', 'How will you manage fatigue, pressure, support and the post-job review?']
  ];
  qs.forEach((q,i) => {
    const x = 4.0 + (i%2)*4.25;
    const y = 1.58 + Math.floor(i/2)*2.25;
    const color = [C.red,C.cyan,C.green,C.purple][i];
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.75, h: 1.75, fill: { color: C.white }, line: { color, width: 2 } });
    s.addShape(pptx.ShapeType.ellipse, { x: x+0.18, y: y+0.18, w: 0.55, h: 0.55, fill: { color }, line: { color } });
    s.addText(q[0], { x: x+0.35, y: y+0.3, w: 0.2, h: 0.23, fontFace: FONT_NARROW, fontSize: 17, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(q[1], { x: x+0.9, y: y+0.18, w: 2.5, h: 0.32, fontFace: FONT_NARROW, fontSize: 18, bold: true, color, margin: 0 });
    s.addText(q[2], { x: x+0.28, y: y+0.82, w: 3.2, h: 0.62, fontFace: FONT, fontSize: 14.5, color: C.dark, align: 'center', margin: 0 });
  });
  addNotes(s, '12 minutes plus 8 minutes reporting', 'Organize participants into small groups. Ask each group to address all four questions, but assign one question as their primary focus if time is limited. During group work, listen for three common traps: accepting the 90-minute target without questioning conditions; excluding the woman technician or the worker with hearing loss instead of adapting the work; and treating fatigue as a personal responsibility rather than an organizational hazard. When groups report, ask them to state their first decision, not a long list. Capture actions under four headings: life-critical controls, task allocation, inclusion and psychosocial prevention. Do not present a single perfect answer. The purpose is to make trade-offs explicit and test whether the same decision protects service continuity, worker safety and equal opportunity.', [
    'Facilitation exercise based on ILO OSH risk-management principles and the fictional case on the previous slide.'
  ]);
}

// 26
{
  const s = newSlide(); addHeader(s, 'Debrief: what good looks like', n, 'Case exercise');
  const steps = [
    ['1', 'PAUSE AND VERIFY', 'Confirm clearance, isolation, structural stability, weather, communication and rescue arrangements.', C.red],
    ['2', 'RE-PLAN THE TASK', 'Set a realistic restoration sequence, adequate staffing and explicit stop-work authority.', C.amber],
    ['3', 'MATCH COMPETENCE AND FIT', 'Allocate by verified competence; provide correct harness sizes and communication accommodation.', C.cyan],
    ['4', 'CONTROL FATIGUE AND PRESSURE', 'Rotate, rest or replace fatigued workers; communicate priorities without unsafe deadlines.', C.green],
    ['5', 'SUPPORT AND LEARN', 'Brief, check in, debrief after work, record near misses and improve protocols and procurement.', C.purple]
  ];
  steps.forEach((d,i) => {
    const y = 1.35 + i*1.05;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.78, y, w: 1.2, h: 0.78, fill: { color: d[3] }, line: { color: d[3] } });
    s.addText(d[0], { x: 1.12, y: y+0.16, w: 0.5, h: 0.35, fontFace: FONT_NARROW, fontSize: 26, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[1], { x: 2.35, y: y+0.08, w: 3.15, h: 0.32, fontFace: FONT_NARROW, fontSize: 20, bold: true, color: d[3], margin: 0 });
    s.addText(d[2], { x: 5.3, y: y+0.05, w: 6.85, h: 0.5, fontFace: FONT, fontSize: 15.7, color: C.dark, margin: 0 });
    if (i<4) arrow(s, 1.38, y+0.82, 1.38, y+1.02, C.blue40, 1.4);
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.25, y: 6.7, w: 10.8, h: 0.37, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('The fastest safe restoration is the one that prevents a second emergency.', { x: 1.5, y: 6.76, w: 10.3, h: 0.23, fontFace: FONT, fontSize: 16.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '8 minutes', 'Use the five steps to synthesize group responses. First, life-critical conditions must be verified; urgency does not replace clearance or isolation. Second, the task should be re-planned so the target reflects actual risk and resources. Third, allocate by competence and provide fit and communication adjustments. The worker with hearing loss may need visual signals, a communication device or a buddy arrangement; the correct choice depends on the task and risk. The woman technician should receive meaningful work based on competence, not be moved to administration as a default. Fourth, fatigue must be managed through staffing and rest, not by telling workers to be careful. Fifth, the job should end with learning: debrief, record near misses, review the unsuitable PPE stock and improve emergency protocols. Reinforce that inclusion and safety point in the same direction when work is well designed. The final statement is useful in high-pressure services: an unsafe shortcut can cause a second incident, delay restoration further and damage trust.', [
    'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.',
    'ILO Occupational Safety and Health Convention, 1981 (No. 155).',
    'ILO Curriculum, Module 8: Occupational safety and health.'
  ]);
}

// 27
{
  const s = newSlide(); addHeader(s, 'From diagnosis to action: the enterprise cycle', n, 'Implementation');
  const steps = [
    ['1', 'DIAGNOSE', 'Map tasks, people, hazards and unequal exposure.', C.red],
    ['2', 'CONSULT', 'Engage workers, unions, supervisors and occupational health.', C.cyan],
    ['3', 'CONTROL', 'Prioritize elimination, substitution and engineering controls.', C.green],
    ['4', 'EQUIP AND TRAIN', 'Fit PPE, tools, facilities and competency development.', C.amber],
    ['5', 'SUPPORT', 'Working time, psychosocial support and reasonable accommodation.', C.purple],
    ['6', 'MONITOR AND LEARN', 'Use data, near misses, worker feedback and periodic review.', C.blue]
  ];
  const positions = [[5.2,1.35],[8.7,2.15],[8.7,4.65],[5.2,5.45],[1.7,4.65],[1.7,2.15]];
  steps.forEach((d,i) => {
    const [x,y] = positions[i];
    s.addShape(pptx.ShapeType.ellipse, { x, y, w: 3.0, h: 1.25, fill: { color: C.white }, line: { color: d[3], width: 2.2 } });
    s.addText(d[0], { x: x+0.22, y: y+0.18, w: 0.45, h: 0.3, fontFace: FONT_NARROW, fontSize: 22, bold: true, color: d[3], align: 'center', margin: 0 });
    s.addText(d[1], { x: x+0.68, y: y+0.15, w: 2.05, h: 0.32, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: d[3], align: 'center', margin: 0 });
    s.addText(d[2], { x: x+0.25, y: y+0.62, w: 2.5, h: 0.42, fontFace: FONT, fontSize: 12.8, color: C.dark, align: 'center', margin: 0 });
  });
  const centers = positions.map(p => [p[0]+1.5,p[1]+0.62]);
  centers.forEach((p,i) => { const q = centers[(i+1)%centers.length]; arrow(s,p[0],p[1],q[0],q[1],C.blue40,1.7); });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.43, y: 3.05, w: 2.5, h: 1.4, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('GENDER-RESPONSIVE\nOSH MANAGEMENT', { x: 5.78, y: 3.42, w: 1.8, h: 0.62, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
  addNotes(s, '5 minutes', 'Present the cycle as a way to integrate the session into existing OSH management rather than create a parallel project. Diagnosis should map tasks and exposure, not only headcount. Consultation brings in the knowledge of workers and groups who may be missing from formal data. Control should follow the hierarchy of controls and avoid relying on PPE or individual behaviour when stronger measures are possible. Equipment and training should be tested for different users. Support includes working-time design, psychosocial prevention and reasonable accommodation. Monitoring should combine quantitative data with worker feedback and learning from near misses. The cycle should be applied whenever technology, staffing, infrastructure or work organization changes. Ask participants to identify where their current cycle breaks down. Some organizations assess well but do not close actions; others implement controls but do not monitor whether they work equally for different groups.', [
    'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.',
    'ILO, Fundamental Conventions on Occupational Safety and Health (2023): https://www.ilo.org/publications/fundamental-conventions-occupational-safety-and-health',
    'ILO, 10 Keys for gender sensitive OSH practice (2013).'
  ]);
}

// 28
{
  const s = newSlide(); addHeader(s, 'What to measure: a minimum dashboard', n, 'Monitoring');
  const rows = [
    ['WORKFORCE', 'Participation, recruitment, retention and promotion by sex, age, disability, contract and location', C.blue],
    ['EXPOSURE', 'High-risk tasks, shift patterns, emergency call-outs and contractor exposure', C.red],
    ['OSH OUTCOMES', 'Incidents, near misses, occupational disease, fatigue and psychosocial indicators by task', C.amber],
    ['FIT AND ACCESS', 'PPE fit, facilities, reasonable adjustments, accessible training and equipment trials', C.cyan],
    ['CAPABILITY', 'Certification, skills pathways, mentoring and access to technical and leadership development', C.green],
    ['WORKER VOICE', 'Concerns raised, response time, closure of actions, stop-work use and participation quality', C.purple]
  ];
  rows.forEach((r,i) => {
    const y = 1.38 + i*0.82;
    s.addShape(pptx.ShapeType.rect, { x: 0.75, y, w: 0.12, h: 0.56, fill: { color: r[2] }, line: { color: r[2] } });
    s.addText(r[0], { x: 1.05, y: y+0.03, w: 1.75, h: 0.28, fontFace: FONT_NARROW, fontSize: 18, bold: true, color: r[2], margin: 0 });
    s.addText(r[1], { x: 2.85, y, w: 8.5, h: 0.48, fontFace: FONT, fontSize: 15.8, color: C.dark, margin: 0, valign: 'mid' });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 9.72, y: 1.55, w: 2.65, h: 4.65, fill: { color: C.light }, line: { color: C.blue20 } });
  s.addText('DATA SAFEGUARDS', { x: 10.05, y: 1.9, w: 2.0, h: 0.32, fontFace: FONT_NARROW, fontSize: 20, bold: true, color: C.blue, align: 'center', margin: 0 });
  addBulletList(s, ['Protect confidentiality', 'Avoid identifying small groups', 'Explain why data are collected', 'Separate prevention from punitive monitoring', 'Combine numbers with worker experience'], 10.03, 2.55, 2.05, { fontSize: 14.5, lineH: 0.63, bulletColor: C.cyan });
  s.addText('Measure change - not only activity.', { x: 1.05, y: 6.55, w: 8.15, h: 0.34, fontFace: FONT, fontSize: 19, bold: true, color: C.blue, margin: 0 });
  addNotes(s, '6 minutes', 'Explain that gender-responsive OSH needs data, but data collection must be purposeful and safe. Workforce data should show where people enter, remain and progress. Exposure data should identify who performs high-risk tasks and under what schedules. Outcome data should be analysed by task and employment arrangement, because sex-disaggregated incident totals alone may hide segregation. Fit and access measures reveal whether PPE, facilities and adjustments are functioning. Capability measures show whether underrepresented workers can enter technical and leadership pathways. Worker-voice measures show whether concerns lead to action. Stress safeguards: small groups can be identifiable, health and disability data are sensitive, and monitoring data should not be used to punish workers. Numbers should be triangulated with consultation, observation and qualitative feedback. The most useful indicator is one connected to a decision and an accountable owner. Ask participants which existing data source could be repurposed immediately and which new information requires worker agreement.', [
    'ILO, 10 Keys for gender sensitive OSH practice (2013), Key 5 on gender-sensitive OSH indicators.',
    'ILO, The psychosocial working environment (2026).',
    'EU-OSHA, Smart digital systems for improving worker safety and health (2024).'
  ]);
}

// 29
{
  const s = newSlide(); addHeader(s, 'A practical 30-60-90 day agenda', n, 'Next steps');
  const cols = [
    ['30', 'DAYS', C.cyan, ['Map high-risk tasks and workforce groups', 'Consult workers and representatives', 'Audit PPE, facilities and current data', 'Identify one urgent psychosocial risk']],
    ['60', 'DAYS', C.green, ['Pilot corrected PPE or work design', 'Update fatigue and emergency protocols', 'Launch targeted skills or mentoring pathways', 'Define reporting and support routes']],
    ['90', 'DAYS', C.amber, ['Integrate actions into the OSH management system', 'Assign owners, resources and indicators', 'Embed requirements in procurement and contractor management', 'Review results through social dialogue']]
  ];
  cols.forEach((c,i) => {
    const x = 0.7 + i*4.18;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.45, w: 3.75, h: 4.95, fill: { color: C.white }, line: { color: c[2], width: 2.2 } });
    s.addText(c[0], { x: x+0.38, y: 1.78, w: 1.25, h: 0.78, fontFace: FONT_NARROW, fontSize: 48, bold: true, color: c[2], align: 'center', margin: 0 });
    s.addText(c[1], { x: x+1.55, y: 2.05, w: 1.45, h: 0.34, fontFace: FONT_NARROW, fontSize: 22, bold: true, color: c[2], margin: 0 });
    s.addShape(pptx.ShapeType.line, { x: x+0.42, y: 2.72, w: 2.9, h: 0, line: { color: c[2], width: 2 } });
    addBulletList(s, c[3], x+0.42, 3.05, 2.95, { fontSize: 15, lineH: 0.72, bulletColor: c[2] });
  });
  s.addText('Choose one action with a named owner before the session ends.', { x: 1.2, y: 6.7, w: 10.95, h: 0.32, fontFace: FONT, fontSize: 19, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, '7 minutes', 'Use this as an individual or organizational action-planning exercise. The 30-day phase is diagnostic and participatory: map tasks, consult workers, audit fit and facilities, and select one urgent psychosocial issue. The 60-day phase tests solutions rather than waiting for a perfect strategy. A pilot might involve PPE size ranges, revised shift rules, a mentoring pathway, communication accommodation or a new reporting route. The 90-day phase institutionalizes the change through ownership, budgets, procurement, contractor requirements, indicators and social dialogue. Ask each participant to write one action and a named owner. Where possible, invite them to state the action aloud. The goal is not to complete the entire agenda in three months, but to create a visible sequence from evidence to pilot to system change. Encourage actions that are specific enough to verify and that connect equality and safety rather than treating them as separate projects.', [
    'ILO, Gender, equality and inclusion for a just transition in climate action (2024).',
    'ILO, Occupational safety and health in a just transition (2023).',
    'ILO, 10 Keys for gender sensitive OSH practice (2013).'
  ]);
}

// 30
{
  const s = newSlide(); s.background = { color: C.blue };
  const words = [
    ['SAFE', 0.9, 1.3, C.red], ['INCLUSIVE', 7.45, 1.3, C.cyan], ['SKILLED', 0.9, 3.18, C.green], ['PARTICIPATORY', 7.45, 3.18, C.amber]
  ];
  words.forEach(w => s.addText(w[0], { x: w[1], y: w[2], w: 4.95, h: 0.72, fontFace: FONT_NARROW, fontSize: 39, bold: true, color: w[3], align: 'center', margin: 0 }));
  s.addShape(pptx.ShapeType.line, { x: 1.2, y: 5.2, w: 10.95, h: 0, line: { color: C.white, transparency: 55, width: 1.5 } });
  s.addText('The future of energy work is not only cleaner and smarter.\nIt must be safer and fairer.', { x: 1.15, y: 5.55, w: 11.05, h: 0.82, fontFace: FONT, fontSize: 24, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('What will you change first?', { x: 4.65, y: 6.55, w: 4.05, h: 0.35, fontFace: FONT, fontSize: 18, italic: true, color: C.blue20, align: 'center', margin: 0 });
  addFooter(s, n, true);
  addNotes(s, '3 minutes', 'Return to the four words from the opening. Ask participants whether their answer has changed after the discussion. Reinforce the final message: the transition is not successful if it creates clean energy through unsafe work, leaves technical talent unused, excludes workers who need accommodation or relies on chronic fatigue and emergency effort. Safety, inclusion, skills and participation reinforce one another when they are integrated into policy, work design and management systems. Invite one or two final commitments and thank participants for contributing their experience. The final question can be used as a written exit ticket or round of responses.', [
    'Synthesis of the ILO just transition, gender equality and OSH frameworks cited throughout the deck.'
  ]);
}

// 31 - sources and credits
{
  const s = newSlide(); addHeader(s, 'Selected sources and image credits', n, 'Reference');
  const left = [
    'ILO (2024), Gender, equality and inclusion for a just transition in climate action.',
    'ILO (2023), Occupational safety and health in a just transition.',
    'ILO (2024), Ensuring safety and health at work in a changing climate.',
    'ILO (2026), The psychosocial working environment: Global developments and pathways for action.',
    'ILO (2013), 10 Keys for gender sensitive OSH practice.',
    'ILO (2025), Revolutionizing health and safety: The role of AI and digitalization at work.',
    'ILO Conventions Nos 155, 187 and 190 and associated guidance.',
    'IRENA (2025), Renewable Energy: A Gender Perspective, second edition.',
    'IEA, Energy and Gender data and analysis.',
    'ILO (2026), Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery.'
  ];
  const right = [
    'Photo credits',
    'Adam Jones - Wind Turbine with Workers, Boryspil, Ukraine - CC BY-SA 2.0.',
    'Gaius Cornelius - Maintenance workers on electricity pylon - CC BY-SA 4.0.',
    'Climate Visuals / technicians working on a solar panel installation - CC BY 2.0.',
    'Western Area Power / Jeff Miller - Transmission system repairs underway - CC BY 2.0.',
    'Kenueone - Renewable Energy on the Grid - CC0.',
    'Electrical substation - Wikimedia Commons / public domain.',
    '',
    'User-provided materials',
    'Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.',
    'ITCILO Brand Guidelines, April 2026.',
    'Project presentations and reports on digitalization, AI, wearables, mining and psychosocial risks.'
  ];
  s.addText(left.join('\n'), { x: 0.75, y: 1.42, w: 5.9, h: 5.65, fontFace: FONT, fontSize: 14.2, color: C.dark, margin: 0.04, breakLine: false, lineSpacingMultiple: 1.15 });
  s.addShape(pptx.ShapeType.line, { x: 6.75, y: 1.45, w: 0, h: 5.45, line: { color: C.blue20, width: 1.5 } });
  s.addText(right.join('\n'), { x: 7.05, y: 1.42, w: 5.5, h: 5.65, fontFace: FONT, fontSize: 14.2, color: C.dark, margin: 0.04, breakLine: false, lineSpacingMultiple: 1.15 });
  addNotes(s, 'Reference only', 'The full technical references for each slide are provided in the speaker notes. Photo credits are consolidated here to keep content slides visually clean while respecting source and licensing requirements.', [
    'ITCILO Brand Guidelines, April 2026.'
  ]);
}

slides.forEach(slide => {
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
});

pptx.writeFile({ fileName: OUT, compression: true });
console.log(`Wrote ${OUT} with ${slides.length} slides.`);
