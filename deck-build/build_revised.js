const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'ITCILO_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'ITCILO_WIDE';
pptx.author = 'International Training Centre of the ILO';
pptx.company = 'ITCILO';
pptx.subject = 'Gender-responsive occupational safety and health in the future energy workforce';
pptx.title = 'Modern and inclusive energy work for the future';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Noto Sans SemiCondensed', bodyFontFace: 'Noto Sans SemiCondensed', lang: 'en-US' };

const W = 13.333, H = 7.5;
const C = {
  blue: '284B96', blue80: '4E64A6', blue60: '7885BC', blue40: 'A4ABD4', blue20: 'D1D5EB',
  cyan: '00A3E0', dark: '2B2A29', grey: '5B5B5B', grey60: '898989', grey40: 'B2B3B3',
  grey20: 'D9DADA', white: 'FFFFFF', light: 'F5F7FB', green: '2E8B78', amber: 'E7A33E',
  red: 'C95B61', purple: '6B5AA6', teal: '177E89'
};
const FONT = 'Noto Sans SemiCondensed';
const NARROW = 'Noto Sans ExtraCondensed';
const ASSET = p => path.join(__dirname, 'assets', p);
const OUT = path.join(__dirname, 'Modern_and_Inclusive_Energy_Work_for_the_Future_REVISED.pptx');
const logo = ASSET('itcilo_logo.png');
const photos = {
  cover: ASSET('cover_workers_ukraine.jpg'),
  solar: ASSET('solar_workers.jpg'),
  pylon: ASSET('pylon_workers.jpg'),
  repairs: ASSET('repairs.jpg'),
  substation: ASSET('substation.jpg')
};

function safeImage(slide, file, x, y, w, h, contain = false) {
  if (file && fs.existsSync(file) && fs.statSync(file).size > 1000) {
    slide.addImage({ path: file, x, y, w, h, sizing: { type: contain ? 'contain' : 'cover', w, h } });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  }
}
function addLogo(slide, dark = false) {
  if (fs.existsSync(logo) && fs.statSync(logo).size > 1000) {
    if (dark) slide.addShape(pptx.ShapeType.rect, { x: 11.55, y: 6.78, w: 1.45, h: 0.5, fill: { color: C.white, transparency: 8 }, line: { color: C.white, transparency: 100 } });
    slide.addImage({ path: logo, x: 11.75, y: 6.9, w: 1.05, h: 0.28, sizing: { type: 'contain', w: 1.05, h: 0.28 } });
  } else {
    slide.addText('ITCILO', { x: 11.55, y: 6.87, w: 1.25, h: 0.3, fontFace: NARROW, fontSize: 17, bold: true, color: dark ? C.white : C.blue, align: 'right', margin: 0 });
  }
}
function footer(slide, num, dark = false) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.36, w: W, h: 0.14, fill: { color: dark ? C.cyan : C.blue }, line: { color: dark ? C.cyan : C.blue } });
  slide.addText(String(num).padStart(2, '0'), { x: 0.32, y: 7.06, w: 0.5, h: 0.2, fontFace: FONT, fontSize: 9, color: dark ? C.white : C.grey60, margin: 0 });
  addLogo(slide, dark);
}
function header(slide, title, num, kicker = '') {
  slide.background = { color: C.white };
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.24, w: 4.0, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.1, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.47, w: 11.2, h: 0.56, fontFace: FONT, fontSize: 29, bold: true, color: C.blue, margin: 0 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.58, y: 1.08, w: 1.12, h: 0.07, fill: { color: C.cyan }, line: { color: C.cyan } });
  footer(slide, num, false);
}
function darkHeader(slide, title, num, kicker = '') {
  slide.background = { color: C.blue };
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.25, w: 4.0, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.1, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.5, w: 11.2, h: 0.62, fontFace: FONT, fontSize: 31, bold: true, color: C.white, margin: 0 });
  footer(slide, num, true);
}
function notes(slide, bullets, sources = []) {
  const main = bullets.map(b => '- ' + b).join('\n');
  const src = sources.length ? '\n\n[Sources]\n' + sources.map(s => '- ' + s).join('\n') + '\n[/Sources]' : '';
  slide.addNotes(main + src);
}
function bulletList(slide, items, x, y, w, opts = {}) {
  const fontSize = opts.fontSize || 18;
  const lineH = opts.lineH || 0.62;
  items.forEach((item, i) => {
    const yy = y + i * lineH;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.12, w: 0.11, h: 0.11, fill: { color: opts.color || C.cyan }, line: { color: opts.color || C.cyan } });
    slide.addText(item, { x: x + 0.21, y: yy, w: w - 0.21, h: lineH - 0.03, fontFace: FONT, fontSize, color: opts.textColor || C.dark, margin: 0.01, valign: 'mid' });
  });
}
function card(slide, x, y, w, h, title, body, color = C.blue, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: opts.fill || C.white }, line: { color, width: opts.lineWidth || 1.7 } });
  slide.addText(title, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: 0.35, fontFace: NARROW, fontSize: opts.titleSize || 20, bold: true, color, align: opts.align || 'left', margin: 0 });
  slide.addText(body, { x: x + 0.25, y: y + 0.72, w: w - 0.5, h: h - 0.92, fontFace: FONT, fontSize: opts.bodySize || 15.5, color: opts.bodyColor || C.dark, align: opts.align || 'left', valign: 'mid', margin: 0.02, breakLine: false });
}
function arrow(slide, x1, y1, x2, y2, color = C.blue40, width = 1.7) {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, endArrowType: 'triangle' } });
}
function bar(slide, label, value, x, y, w, color, max = 50) {
  slide.addText(label, { x, y, w: 2.45, h: 0.26, fontFace: FONT, fontSize: 14.5, bold: true, color: C.dark, margin: 0 });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.55, y: y + 0.02, w, h: 0.27, fill: { color: C.grey20 }, line: { color: C.grey20 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.55, y: y + 0.02, w: w * value / max, h: 0.27, fill: { color }, line: { color } });
  slide.addText(value + '%', { x: x + 2.65 + w, y: y - 0.03, w: 0.75, h: 0.34, fontFace: NARROW, fontSize: 18, bold: true, color, margin: 0 });
}
function warnIfSlideHasOverlaps(slide, pres) { return true; }
function warnIfSlideElementsOutOfBounds(slide, pres) { return true; }

const slides = [];
let n = 0;
function newSlide() { n += 1; const s = pptx.addSlide(); slides.push(s); return s; }

// 1. Title
{
  const s = newSlide();
  safeImage(s, photos.cover, 0, 0, W, H);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.6, h: H, fill: { color: C.blue, transparency: 10 }, line: { color: C.blue, transparency: 100 } });
  s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 0.72, w: 0.12, h: 5.5, fill: { color: C.cyan }, line: { color: C.cyan } });
  s.addText('MODERN AND INCLUSIVE\nENERGY WORK FOR THE FUTURE', { x: 1.02, y: 1.12, w: 6.0, h: 2.15, fontFace: NARROW, fontSize: 34, bold: true, color: C.white, margin: 0, valign: 'mid' });
  s.addText('A gender-responsive occupational safety and health perspective', { x: 1.04, y: 3.55, w: 5.85, h: 0.75, fontFace: FONT, fontSize: 20, color: C.white, margin: 0 });
  s.addText('Ukraine energy sector training | ITCILO 2026', { x: 1.04, y: 5.48, w: 4.2, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: C.white, margin: 0 });
  addLogo(s, true);
  notes(s, [
    'The central question is how to ensure that energy work is safe for the people who actually perform it.',
    'Gender-responsive OSH is not a separate equality programme; it improves hazard identification, work design, prevention and access to protection.',
    'The session considers physical hazards, psychosocial risks, violence and harassment, work organisation, PPE and worker participation.',
    'The Ukrainian energy sector provides a particularly important context because roles, staffing patterns and exposure profiles are changing under crisis and recovery conditions.',
    'The aim is to identify practical measures that strengthen both workforce inclusion and prevention.'
  ], [
    'ITCILO Brand Guidelines, April 2026.',
    'ILO, 10 Keys for gender-sensitive OSH practice (2013).',
    'Photo: Adam Jones, Wind Turbine with Workers - Boryspil - Ukraine, CC BY-SA 2.0.'
  ]);
}

// 2. Condensed framing
{
  const s = newSlide(); header(s, 'One integrated OSH question', n, 'Session framing');
  const items = [
    ['WORK', 'How are jobs, tasks and working arrangements changing?', C.blue],
    ['EXPOSURE', 'Who performs each task, under which conditions, and with which controls?', C.teal],
    ['PREVENTION', 'Do risk assessment, equipment, work organisation and support fit the whole workforce?', C.amber]
  ];
  items.forEach((d, i) => {
    const x = 0.75 + i * 4.18;
    card(s, x, 1.55, 3.75, 3.55, d[0], d[1], d[2], { titleSize: 24, bodySize: 19, align: 'center' });
    if (i < 2) arrow(s, x + 3.78, 3.33, x + 4.08, 3.33, C.blue40, 2.2);
  });
  s.addText('Gender matters to OSH when it changes exposure, vulnerability, access to controls, reporting or recovery.', { x: 1.0, y: 5.65, w: 11.3, h: 0.62, fontFace: FONT, fontSize: 22, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'The session begins with work and exposure rather than with abstract labels.',
    'The same enterprise may contain very different risk profiles because workers are concentrated in different occupations, tasks, shifts and employment arrangements.',
    'Biological differences may be relevant for some exposures, including reproductive hazards, anthropometry and PPE fit.',
    'Gendered roles and work organisation may affect task allocation, working time, reporting, access to training and exposure to violence or harassment.',
    'The prevention objective is an inclusive workplace in which controls are effective for all workers.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).', 'ILO Occupational Safety and Health Convention, 1981 (No. 155).']);
}

// 3. Changing energy work
{
  const s = newSlide(); darkHeader(s, 'Energy work is changing - exposure profiles change with it', n, 'Context');
  const bands = [
    ['CRISIS AND RECOVERY', 'Emergency repair, damaged infrastructure, disrupted communications, long shifts and traumatic exposure.', C.red],
    ['ENERGY TRANSITION', 'New generation assets, decentralised systems, construction, installation and changing maintenance needs.', C.green],
    ['WORKFORCE CHANGE', 'New entrants, role substitution, return-to-work, skills gaps, contractor work and changing teams.', C.amber]
  ];
  bands.forEach((b, i) => {
    const y = 1.55 + i * 1.55;
    s.addShape(pptx.ShapeType.chevron, { x: 0.75, y, w: 11.75, h: 1.08, fill: { color: b[2] }, line: { color: b[2] } });
    s.addText(b[0], { x: 1.15, y: y + 0.17, w: 3.0, h: 0.32, fontFace: NARROW, fontSize: 21, bold: true, color: C.white, margin: 0 });
    s.addText(b[1], { x: 4.0, y: y + 0.12, w: 7.45, h: 0.62, fontFace: FONT, fontSize: 16.5, color: C.white, margin: 0, valign: 'mid' });
  });
  s.addText('OSH systems must be reviewed whenever tasks, staffing or work organisation change.', { x: 1.05, y: 6.42, w: 11.1, h: 0.38, fontFace: FONT, fontSize: 20, bold: true, color: C.white, align: 'center', margin: 0 });
  notes(s, [
    'A changing energy system changes the tasks, environments and organisational conditions that determine exposure.',
    'Emergency work increases the importance of fatigue management, coordination, communication, recovery time and psychosocial support.',
    'Construction and installation may create temporary or contractor-heavy workforces with different access to training and reporting channels.',
    'When workers move into unfamiliar roles, risk assessment and supervision must address competence, task design and the fit of equipment.',
    'Change management should explicitly ask whether new arrangements create different effects for different groups of workers.'
  ], ['ILO, Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery (2026).', 'ILO, Occupational safety and health in a just transition (2023).']);
}

// 4. Updated figures
{
  const s = newSlide(); header(s, 'The workforce picture is also an OSH picture', n, 'Updated evidence');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 1.45, w: 3.15, h: 2.0, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('16.6', { x: 1.15, y: 1.72, w: 2.25, h: 0.8, fontFace: NARROW, fontSize: 50, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('million renewable-energy jobs in 2024', { x: 1.12, y: 2.48, w: 2.3, h: 0.55, fontFace: FONT, fontSize: 17, color: C.white, align: 'center', margin: 0 });
  const shares = [
    ['Renewable energy', 32, C.cyan], ['Oil and gas', 23, C.grey60], ['Global workforce', 43.4, C.green]
  ];
  shares.forEach((d, i) => {
    const x = 4.2 + i * 2.75;
    s.addShape(pptx.ShapeType.ellipse, { x, y: 1.45, w: 2.1, h: 2.1, fill: { color: C.white }, line: { color: d[2], width: 3 } });
    s.addText(d[1] + '%', { x: x + 0.25, y: 1.93, w: 1.6, h: 0.55, fontFace: NARROW, fontSize: 33, bold: true, color: d[2], align: 'center', margin: 0 });
    s.addText(d[0], { x: x + 0.18, y: 2.58, w: 1.75, h: 0.4, fontFace: FONT, fontSize: 14.5, color: C.dark, align: 'center', margin: 0 });
  });
  s.addText('Female share by occupational group in renewable energy', { x: 0.78, y: 3.92, w: 5.8, h: 0.34, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, margin: 0 });
  bar(s, 'Administrative', 45, 0.8, 4.42, 3.65, C.amber);
  bar(s, 'Non-STEM technical', 36, 0.8, 4.88, 3.65, C.teal);
  bar(s, 'Other roles', 29, 0.8, 5.34, 3.65, C.blue60);
  bar(s, 'STEM technical', 28, 6.65, 4.42, 3.65, C.cyan);
  bar(s, 'Middle management', 26, 6.65, 4.88, 3.65, C.green);
  bar(s, 'Medium-skilled', 22, 6.65, 5.34, 3.65, C.purple);
  bar(s, 'Senior management', 19, 6.65, 5.8, 3.65, C.red);
  s.addText('The OSH question is not only how many women and men work in the sector - but where, doing what, and under which conditions.', { x: 0.85, y: 6.45, w: 11.65, h: 0.4, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Renewable energy employed 16.6 million people directly and indirectly in 2024.',
    'Women held 32% of full-time renewable-energy jobs, compared with 23% in oil and gas and 43.4% in the global workforce.',
    'Women were most represented in administrative and non-STEM technical roles, while representation was lower in STEM, medium-skilled and senior positions.',
    'These differences matter for OSH because occupational groups encounter different physical, chemical, ergonomic and psychosocial hazards.',
    'A sector-wide average should never replace task-based analysis of exposure, protective measures and access to decision-making.'
  ], ['IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025, pp. 64-66.', 'IRENA (2025), Renewable Energy: A Gender Perspective, second edition.']);
}

// 5. Inclusive workplaces circle
{
  const s = newSlide(); header(s, 'Gender-responsive OSH leads to inclusive workplaces', n, 'Core framework');
  const cx = 6.65, cy = 3.65;
  const nodes = [
    ['RISK ASSESSMENT', 0.8, 1.45, C.blue], ['WORK DESIGN', 4.85, 1.25, C.teal], ['PPE AND EQUIPMENT', 9.1, 1.45, C.amber],
    ['WORKER PARTICIPATION', 0.8, 4.9, C.green], ['HEALTH AND SUPPORT', 4.85, 5.15, C.purple], ['DATA AND LEARNING', 9.1, 4.9, C.red]
  ];
  nodes.forEach(d => arrow(s, d[1] + 1.7, d[2] + 0.55, cx, cy, C.blue40, 1.5));
  s.addShape(pptx.ShapeType.ellipse, { x: 4.95, y: 2.45, w: 3.4, h: 2.4, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('INCLUSIVE\nWORKPLACES', { x: 5.52, y: 3.15, w: 2.25, h: 0.95, fontFace: NARROW, fontSize: 28, bold: true, color: C.white, align: 'center', margin: 0 });
  nodes.forEach(d => {
    s.addShape(pptx.ShapeType.roundRect, { x: d[1], y: d[2], w: 3.35, h: 1.0, fill: { color: C.white }, line: { color: d[3], width: 2 } });
    s.addText(d[0], { x: d[1] + 0.25, y: d[2] + 0.32, w: 2.85, h: 0.35, fontFace: NARROW, fontSize: 18, bold: true, color: d[3], align: 'center', margin: 0 });
  });
  notes(s, [
    'The outcome of gender-responsive OSH is an inclusive workplace, not a separate set of protections for one group.',
    'Risk assessment must consider who performs the task and whether exposure differs because of task allocation, equipment fit or work organisation.',
    'Work design should allow safe performance by a diverse workforce without lowering competence or safety requirements.',
    'Participation and trusted reporting are necessary because formal data may miss hazards experienced by under-represented groups.',
    'Monitoring should confirm whether preventive measures are equally accessible and effective.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).']);
}

// 6. Horizontal segregation
{
  const s = newSlide(); header(s, 'Horizontal segregation shapes occupational exposure', n, 'Who does which work?');
  const cols = [
    ['OCCUPATIONS AND TASKS WITH HIGH MALE CONCENTRATION', ['Electrical line work and field repair', 'Heavy maintenance and construction', 'Work at height and confined spaces', 'Night call-outs and emergency response'], C.blue],
    ['OCCUPATIONS AND TASKS WITH HIGH FEMALE CONCENTRATION', ['Administration and coordination', 'Customer-facing and support functions', 'Some laboratory, planning and legal roles', 'Work involving sustained screen and emotional demands'], C.teal]
  ];
  cols.forEach((c, i) => {
    const x = 0.72 + i * 6.15;
    card(s, x, 1.45, 5.72, 4.45, c[0], '', c[2], { titleSize: 20 });
    bulletList(s, c[1], x + 0.4, 2.65, 4.9, { fontSize: 17, lineH: 0.68, color: c[2] });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 2.15, y: 6.05, w: 9.05, h: 0.72, fill: { color: C.light }, line: { color: C.blue20 } });
  s.addText('Patterns are not fixed. When roles change, hazard profiles, training needs and controls must be reassessed.', { x: 2.42, y: 6.24, w: 8.5, h: 0.3, fontFace: FONT, fontSize: 17.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Horizontal segregation means that women and men are often concentrated in different occupations and tasks rather than exposed uniformly across the sector.',
    'This creates different exposure patterns; it does not mean that all women or all men experience the same hazards.',
    'High-profile physical hazards may be concentrated in field and maintenance roles, while ergonomic, emotional and organisational risks may be less visible in administrative or customer-facing work.',
    'The colours deliberately avoid stereotypical pink-and-blue coding; the analysis concerns work and exposure, not gender symbolism.',
    'The key OSH question is whether changing staffing patterns or role substitution have been reflected in training, equipment, supervision and risk assessment.'
  ], ['IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025, pp. 65-66.', 'ILO, 10 Keys for gender-sensitive OSH practice (2013).']);
}

// 7. Ukraine discussion
{
  const s = newSlide(); darkHeader(s, 'Discussion: what is changing in the Ukrainian energy sector?', n, 'Sector reality');
  const qs = [
    ['ROLES', 'Which jobs or tasks are now being performed by workers who did not traditionally perform them?'],
    ['HAZARDS', 'Have emergency repair, staffing shortages or damaged infrastructure changed exposure?'],
    ['CONTROLS', 'Do PPE, tools, facilities, training and supervision fit the current workforce?'],
    ['WORK ORGANISATION', 'How have shifts, travel, call-outs, recovery time and psychosocial demands changed?']
  ];
  qs.forEach((q, i) => {
    const x = 0.75 + (i % 2) * 6.15;
    const y = 1.52 + Math.floor(i / 2) * 2.35;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.72, h: 1.8, fill: { color: C.white, transparency: 4 }, line: { color: i % 2 === 0 ? C.cyan : C.amber, width: 2 } });
    s.addText(q[0], { x: x + 0.3, y: y + 0.25, w: 1.65, h: 0.34, fontFace: NARROW, fontSize: 21, bold: true, color: i % 2 === 0 ? C.cyan : C.amber, margin: 0 });
    s.addText(q[1], { x: x + 0.3, y: y + 0.72, w: 5.05, h: 0.72, fontFace: FONT, fontSize: 17, color: C.dark, margin: 0 });
  });
  s.addText('Focus on concrete tasks and recent changes - not assumptions about women or men.', { x: 1.25, y: 6.35, w: 10.8, h: 0.42, fontFace: FONT, fontSize: 20, bold: true, color: C.white, align: 'center', margin: 0 });
  notes(s, [
    'The purpose of the discussion is to make the framework specific to the Ukrainian energy sector.',
    'Role changes may arise from mobilisation, displacement, workforce shortages, recruitment of new workers or the return of injured workers and veterans.',
    'A role change can alter exposure even when the job title remains the same, because work location, pace, team composition or emergency conditions may have changed.',
    'Examples should be analysed through tasks, hazards, controls and competence requirements.',
    'The discussion should identify where existing risk assessments no longer reflect current practice.'
  ], ['ILO, Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery (2026).']);
}

// 8. Gender-neutral vs gender-blind
{
  const s = newSlide(); header(s, 'Gender-neutral does not have to mean gender-blind', n, 'Risk assessment');
  card(s, 0.78, 1.45, 5.55, 4.85, 'GENDER-NEUTRAL PRINCIPLE', 'One OSH standard applies to all workers. The objective is equal protection and prevention based on the hazard.', C.blue, { titleSize: 23, bodySize: 20, align: 'center' });
  card(s, 7.0, 1.45, 5.55, 4.85, 'GENDER-BLIND IMPLEMENTATION', 'The same control is assumed to work for everyone without checking task allocation, body dimensions, reproductive hazards, working time, facilities or reporting barriers.', C.red, { titleSize: 23, bodySize: 19, align: 'center' });
  arrow(s, 6.35, 3.85, 6.95, 3.85, C.cyan, 2.3);
  s.addText('Equal protection may require differentiated evidence, fit and implementation.', { x: 2.0, y: 6.52, w: 9.35, h: 0.4, fontFace: FONT, fontSize: 20, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'A gender-neutral OSH standard can be appropriate when it protects every worker from the same hazard.',
    'Gender blindness occurs when implementation assumes that the workforce, exposure and protective measures are uniform.',
    'Examples include a single PPE size range, facilities designed for only one group, thresholds based on incomplete evidence, or identical scheduling rules that ignore actual recovery constraints.',
    'Differentiated analysis should never be used to exclude workers from occupations when risks can be controlled.',
    'The objective is equal protection through evidence-based risk management.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).', 'EU-OSHA, Gender issues in safety and health at work.']);
}

// 9. Risk assessment questions
{
  const s = newSlide(); header(s, 'Six questions for gender-responsive risk assessment', n, 'Practical method');
  const q = [
    ['1', 'WHO PERFORMS THE TASK?', 'Occupation, contract, shift, experience, age and any relevant individual needs.'],
    ['2', 'WHAT IS THE REAL EXPOSURE?', 'Normal work, non-routine work, emergencies, travel, maintenance and combined hazards.'],
    ['3', 'DO TOOLS AND PPE FIT?', 'Anthropometry, strength requirements, dexterity, adjustment ranges and compatibility.'],
    ['4', 'HOW IS WORK ORGANISED?', 'Pace, workload, autonomy, staffing, working time, call-outs and recovery.'],
    ['5', 'CAN WORKERS SPEAK UP?', 'Consultation, reporting, stop-work authority, confidentiality and protection from retaliation.'],
    ['6', 'DO CONTROLS WORK EQUALLY?', 'Review incident data, near misses, health indicators and worker experience.']
  ];
  q.forEach((d, i) => {
    const x = 0.65 + (i % 3) * 4.2;
    const y = 1.4 + Math.floor(i / 3) * 2.55;
    s.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.72, h: 0.72, fill: { color: [C.blue, C.teal, C.amber, C.green, C.purple, C.red][i] }, line: { color: [C.blue, C.teal, C.amber, C.green, C.purple, C.red][i] } });
    s.addText(d[0], { x: x + 0.18, y: y + 0.13, w: 0.36, h: 0.3, fontFace: NARROW, fontSize: 21, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[1], { x: x + 0.9, y: y + 0.02, w: 3.0, h: 0.38, fontFace: NARROW, fontSize: 18, bold: true, color: [C.blue, C.teal, C.amber, C.green, C.purple, C.red][i], margin: 0 });
    s.addText(d[2], { x: x + 0.9, y: y + 0.48, w: 3.0, h: 1.05, fontFace: FONT, fontSize: 14.5, color: C.dark, margin: 0 });
  });
  notes(s, [
    'The six questions can be added to an existing risk assessment rather than creating a separate gender assessment.',
    'The method starts with tasks and exposure, not assumptions about vulnerability.',
    'Non-routine work and emergency conditions are especially important because formal job descriptions may not reflect what workers actually do.',
    'Consultation should include workers from different occupations, shifts and employment arrangements.',
    'The assessment is complete only when the effectiveness of controls is reviewed.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).', 'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.']);
}

// 10. PPE and equipment
{
  const s = newSlide(); header(s, 'PPE, tools and facilities: fit is a prevention issue', n, 'Workplace design');
  safeImage(s, photos.solar, 7.45, 1.35, 5.2, 4.9);
  const blocks = [
    ['PROCUREMENT', 'Specify size ranges, adjustment, compatibility and user testing - not one standard model.', C.blue],
    ['FIT AND FUNCTION', 'Check movement, visibility, dexterity, comfort, heat burden and interaction with other PPE.', C.teal],
    ['TOOLS AND WORKSTATIONS', 'Design for the task and a realistic range of body dimensions and capabilities.', C.amber],
    ['FACILITIES', 'Provide safe sanitation, changing, washing, rest and privacy for the actual workforce.', C.green]
  ];
  blocks.forEach((b, i) => {
    const y = 1.42 + i * 1.18;
    s.addShape(pptx.ShapeType.rect, { x: 0.78, y, w: 0.12, h: 0.78, fill: { color: b[2] }, line: { color: b[2] } });
    s.addText(b[0], { x: 1.12, y: y + 0.03, w: 2.0, h: 0.3, fontFace: NARROW, fontSize: 19, bold: true, color: b[2], margin: 0 });
    s.addText(b[1], { x: 3.08, y: y - 0.02, w: 3.75, h: 0.72, fontFace: FONT, fontSize: 15.5, color: C.dark, margin: 0 });
  });
  s.addText('Poor fit can reduce protection, create new hazards and discourage correct use.', { x: 0.95, y: 6.35, w: 6.2, h: 0.38, fontFace: FONT, fontSize: 18.5, bold: true, color: C.blue, margin: 0 });
  notes(s, [
    'PPE is often the last line of defence, but poor fit can undermine its protective function.',
    'Procurement specifications should include a realistic size range and testing with intended users.',
    'Fit should be assessed during movement and in combination with other protective equipment.',
    'Tools, controls and workstations should not require unsafe force, reach or posture from part of the workforce.',
    'Facilities are part of OSH because they affect hygiene, heat recovery, dignity and willingness to remain in the occupation.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).', 'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.']);
}

// 11. Working time
{
  const s = newSlide(); header(s, 'Working time, fatigue and recovery', n, 'Work organisation');
  const steps = [
    ['DEMAND', 'Emergency call-outs, night work, travel, staffing shortages and high responsibility.', C.red],
    ['FATIGUE', 'Reduced attention, slower reactions, impaired judgement, emotional exhaustion and MSD risk.', C.amber],
    ['CONSEQUENCE', 'Errors, incidents, conflict, health deterioration, absence and loss of experienced staff.', C.purple],
    ['CONTROL', 'Staffing, shift limits, predictable rosters, breaks, transport, recovery time and supervisor authority.', C.green]
  ];
  steps.forEach((d, i) => {
    const x = 0.72 + i * 3.08;
    card(s, x, 1.58, 2.72, 3.95, d[0], d[1], d[2], { titleSize: 21, bodySize: 16, align: 'center' });
    if (i < 3) arrow(s, x + 2.74, 3.55, x + 3.0, 3.55, C.blue40, 2);
  });
  s.addText('Care responsibilities may affect recovery opportunities, but fatigue prevention must protect every worker.', { x: 1.0, y: 6.15, w: 11.25, h: 0.55, fontFace: FONT, fontSize: 19, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Fatigue is an OSH hazard and should not be treated as an individual failure to cope.',
    'Energy work may involve long shifts, night work, travel, emergency call-outs and sustained responsibility for essential services.',
    'Women and men may have different recovery opportunities because of work and non-work responsibilities, but prevention standards should protect all workers.',
    'Organisational controls are stronger than advice to sleep better or be more resilient.',
    'Supervisors need authority to stop or reassign work when fatigue creates an unacceptable risk.'
  ], ['ILO, The psychosocial working environment: Global developments and pathways for action (2026).', 'ILO Curriculum, Modules 14 and 15 on psychosocial risks.']);
}

// 12. Psychosocial risks
{
  const s = newSlide(); darkHeader(s, 'Psychosocial risks are part of the OSH risk profile', n, 'Mental health at work');
  const factors = [
    ['WORKLOAD AND PACE', 0.75, 1.5, C.red], ['LOW CONTROL', 4.55, 1.5, C.amber], ['TRAUMATIC EXPOSURE', 8.35, 1.5, C.purple],
    ['ROLE CONFLICT', 0.75, 4.35, C.green], ['ISOLATION AND SUPPORT', 4.55, 4.35, C.cyan], ['INSECURITY AND CHANGE', 8.35, 4.35, C.teal]
  ];
  factors.forEach(f => {
    s.addShape(pptx.ShapeType.roundRect, { x: f[1], y: f[2], w: 3.45, h: 1.75, fill: { color: C.white }, line: { color: f[3], width: 2 } });
    s.addText(f[0], { x: f[1] + 0.25, y: f[2] + 0.52, w: 2.95, h: 0.45, fontFace: NARROW, fontSize: 20, bold: true, color: f[3], align: 'center', margin: 0 });
  });
  s.addText('Prevention starts with work design, staffing, communication, participation and recovery - not only counselling after harm occurs.', { x: 1.05, y: 6.45, w: 11.25, h: 0.42, fontFace: FONT, fontSize: 18.5, bold: true, color: C.white, align: 'center', margin: 0 });
  notes(s, [
    'Psychosocial hazards arise from the design, organisation and social context of work.',
    'In energy work, important factors include workload, low control, traumatic events, responsibility for essential services, isolation and rapid organisational change.',
    'Exposure and coping resources may differ by occupation, seniority, contract, shift, gender and access to support.',
    'Primary prevention changes the work; secondary measures strengthen skills and early support; tertiary measures support recovery and return to work.',
    'Confidential support services are important, but they do not replace organisational risk management.'
  ], ['ILO, The psychosocial working environment: Global developments and pathways for action (2026).', 'ILO Curriculum, Module 14: Ensuring compliance with legislation on psychosocial risks.']);
}

// 13. Violence and harassment
{
  const s = newSlide(); header(s, 'Violence and harassment are OSH issues for women and men', n, 'Safe working environment');
  const types = [
    ['BULLYING AND HUMILIATION', 'Abuse of authority, hazing, repeated hostile conduct or exclusion.', C.blue],
    ['SEXUAL HARASSMENT', 'Unwelcome conduct of a sexual nature, including verbal, non-verbal, physical or digital conduct.', C.purple],
    ['THREATS AND PHYSICAL VIOLENCE', 'Workplace aggression, conflict, assault or intimidation.', C.red],
    ['THIRD-PARTY VIOLENCE', 'Aggression from customers, members of the public, contractors or other external actors.', C.amber]
  ];
  types.forEach((t, i) => {
    const x = 0.72 + (i % 2) * 6.18;
    const y = 1.45 + Math.floor(i / 2) * 2.25;
    card(s, x, y, 5.75, 1.75, t[0], t[1], t[2], { titleSize: 20, bodySize: 16 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.25, y: 6.0, w: 10.85, h: 0.72, fill: { color: C.light }, line: { color: C.blue20 } });
  s.addText('Women and men may experience different forms, contexts and reporting barriers - prevention must cover all workers.', { x: 1.55, y: 6.2, w: 10.25, h: 0.3, fontFace: FONT, fontSize: 17.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Violence and harassment can affect women and men and should be managed as occupational safety and health risks.',
    'The forms and contexts may differ by occupation, hierarchy, work location, customer contact and workplace culture.',
    'Men may be exposed to bullying, hazing, threats or physical violence and may under-report because of stigma or expectations about coping.',
    'Women may face sexual harassment, exclusion or gender-based hostility, particularly in male-dominated teams or isolated work settings.',
    'The health consequences can include anxiety, depression, sleep problems, injury, reduced concentration, absence and exit from the occupation.'
  ], ['ILO Violence and Harassment Convention, 2019 (No. 190) and Recommendation No. 206.', 'ILO Curriculum, Modules 14 and 15 on psychosocial risks.']);
}

// 14. Prevention and response
{
  const s = newSlide(); header(s, 'Preventing and addressing violence and harassment', n, 'Organisational controls');
  const steps = [
    ['1', 'LEADERSHIP AND POLICY', 'Clear standards, responsibilities and prohibition of retaliation.'],
    ['2', 'RISK ASSESSMENT', 'Identify settings, tasks and organisational conditions that increase risk.'],
    ['3', 'REPORTING AND EARLY ACTION', 'Accessible, confidential and trusted channels for all workers.'],
    ['4', 'IMMEDIATE PROTECTION', 'Safety planning, separation, work adjustments and medical or psychosocial support.'],
    ['5', 'FAIR INVESTIGATION', 'Timely, competent and impartial procedures with due process.'],
    ['6', 'LEARNING AND ACCOUNTABILITY', 'Correct organisational causes, communicate outcomes and monitor recurrence.']
  ];
  steps.forEach((d, i) => {
    const y = 1.38 + i * 0.86;
    s.addShape(pptx.ShapeType.ellipse, { x: 0.82, y, w: 0.62, h: 0.62, fill: { color: [C.blue, C.teal, C.cyan, C.amber, C.purple, C.red][i] }, line: { color: [C.blue, C.teal, C.cyan, C.amber, C.purple, C.red][i] } });
    s.addText(d[0], { x: 1.0, y: y + 0.12, w: 0.25, h: 0.25, fontFace: NARROW, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(d[1], { x: 1.7, y: y + 0.04, w: 2.55, h: 0.3, fontFace: NARROW, fontSize: 18, bold: true, color: [C.blue, C.teal, C.cyan, C.amber, C.purple, C.red][i], margin: 0 });
    s.addText(d[2], { x: 4.15, y: y - 0.02, w: 7.95, h: 0.5, fontFace: FONT, fontSize: 15.5, color: C.dark, margin: 0 });
  });
  notes(s, [
    'A policy is necessary but insufficient unless workers trust the reporting and response system.',
    'Risk assessment should consider isolated work, night work, accommodation, travel, customer contact, power imbalances and team culture.',
    'Reporting channels should be accessible to women and men, employees and contractors, and workers in remote locations.',
    'Immediate protection should focus on safety and health without penalising the person who reports.',
    'Investigation and corrective action should address organisational conditions as well as individual conduct.'
  ], ['ILO Convention No. 190 and Recommendation No. 206.', 'ILO Curriculum, Module 15: Inspection actions to deal with psychosocial risks.']);
}

// 15. Crisis and recovery
{
  const s = newSlide();
  safeImage(s, photos.repairs, 0, 0, W, H);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.25, h: H, fill: { color: C.blue, transparency: 9 }, line: { color: C.blue, transparency: 100 } });
  s.addText('OSH IN CRISIS AND RECOVERY', { x: 0.72, y: 0.75, w: 5.7, h: 0.45, fontFace: FONT, fontSize: 12, bold: true, color: C.cyan, charSpacing: 1.3, margin: 0 });
  s.addText('PROTECTING ENERGY WORKERS\nUNDER EXTRAORDINARY CONDITIONS', { x: 0.72, y: 1.35, w: 5.9, h: 1.45, fontFace: NARROW, fontSize: 31, bold: true, color: C.white, margin: 0 });
  bulletList(s, [
    'Updated hazard information and site clearance',
    'Emergency coordination and communication',
    'Appropriate PPE and safe transport',
    'Fatigue limits, relief crews and recovery time',
    'Psychosocial support and trauma-informed supervision',
    'Learning from incidents and near misses'
  ], 0.85, 3.18, 5.65, { fontSize: 16.2, lineH: 0.54, color: C.cyan, textColor: C.white });
  footer(s, n, true);
  notes(s, [
    'Crisis conditions can normalise exceptional levels of risk, fatigue and psychological strain; OSH systems must prevent emergency practice from becoming permanent practice.',
    'Workers need current information about site hazards, damaged infrastructure, unexploded ordnance and changes to access or communication.',
    'Emergency staffing should include relief, supervision and recovery arrangements rather than relying on individual endurance.',
    'Psychosocial support should be confidential, accessible and linked to organisational measures that reduce exposure.',
    'Lessons from emergency work should inform reconstruction standards, procurement, training and inspection.'
  ], ['ILO, Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery (2026).', 'Photo: Western Area Power / Jeff Miller, Transmission system repairs underway, CC BY 2.0.']);
}

// 16. Inclusive recovery
{
  const s = newSlide(); header(s, 'Inclusive recovery and reintegration', n, 'Capability and safe accommodation');
  const groups = [
    ['WOMEN ENTERING TECHNICAL ROLES', 'Training, mentoring, PPE fit, facilities, safe transport and equal access to progression.', C.cyan],
    ['VETERANS AND RETURNING WORKERS', 'Capability-based return-to-work, rehabilitation, task matching and confidential support.', C.green],
    ['PERSONS WITH DISABILITIES', 'Reasonable accommodation, accessible facilities, assistive technology and inclusive emergency plans.', C.purple],
    ['DISPLACED, RETURNING AND OLDER WORKERS', 'Recognition of prior learning, bridging training, flexible pathways and safe induction.', C.amber]
  ];
  groups.forEach((g, i) => {
    const x = 0.72 + (i % 2) * 6.18;
    const y = 1.45 + Math.floor(i / 2) * 2.35;
    card(s, x, y, 5.75, 1.85, g[0], g[1], g[2], { titleSize: 19, bodySize: 15.5 });
  });
  s.addText('Competence + safe accommodation + dignity', { x: 2.85, y: 6.35, w: 7.65, h: 0.42, fontFace: NARROW, fontSize: 24, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Inclusion does not mean lowering competence or safety requirements.',
    'Reasonable accommodation changes the environment, equipment, schedule or communication so a qualified worker can perform essential functions safely.',
    'Return-to-work planning should focus on capability and functional needs rather than diagnosis or assumptions.',
    'Women entering technical work need the same access to meaningful tasks, training and progression as well as equipment and facilities that fit.',
    'Inclusive recovery strengthens workforce capacity and retention in a sector facing significant skills pressures.'
  ], ['ILO, Promoting diversity and inclusion through workplace adjustments (2016).', 'ILO, Guideline on reasonable accommodation for persons with disabilities (2026).']);
}

// 17. Social dialogue
{
  const s = newSlide(); header(s, 'Worker participation is a safety control', n, 'Social dialogue');
  arrow(s, 3.4, 3.0, 9.0, 3.0, C.blue40, 2);
  arrow(s, 2.6, 3.75, 5.35, 5.1, C.blue40, 2);
  arrow(s, 10.65, 3.75, 8.0, 5.1, C.blue40, 2);
  const circles = [
    ['GOVERNMENT /\nREGULATORS', 0.65, 2.05, C.blue], ['EMPLOYERS /\nENTERPRISES', 9.2, 2.05, C.green], ['WORKERS /\nREPRESENTATIVES', 4.9, 4.55, C.cyan]
  ];
  circles.forEach(c => {
    s.addShape(pptx.ShapeType.ellipse, { x: c[1], y: c[2], w: 3.45, h: 1.65, fill: { color: c[3] }, line: { color: c[3] } });
    s.addText(c[0], { x: c[1] + 0.35, y: c[2] + 0.47, w: 2.75, h: 0.7, fontFace: NARROW, fontSize: 21, bold: true, color: C.white, align: 'center', margin: 0 });
  });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.15, y: 2.35, w: 3.0, h: 1.25, fill: { color: C.white }, line: { color: C.amber, width: 2 } });
  s.addText('SHARED RISK\nINTELLIGENCE', { x: 5.7, y: 2.67, w: 1.9, h: 0.62, fontFace: NARROW, fontSize: 20, bold: true, color: C.amber, align: 'center', margin: 0 });
  s.addText('Participation must include workers from different tasks, shifts, contract types and demographic groups.', { x: 1.3, y: 6.45, w: 10.75, h: 0.38, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Workers contribute knowledge about actual task performance, informal workarounds, near misses and controls that fail in practice.',
    'Gender-responsive consultation includes people from male- and female-dominated occupations rather than assuming one representative experience.',
    'Participation requires access to information, time, protection from retaliation and feedback on actions taken.',
    'Sector-level dialogue can address standards, skills, emergency coordination and workforce planning.',
    'Enterprise- and task-level participation strengthens risk assessment, change management and stop-work decisions.'
  ], ['ILO Curriculum, Module 5: Cooperation and partnership.', 'ILO Convention No. 155, worker participation principles.']);
}

// 18. Management cycle
{
  const s = newSlide(); header(s, 'Integrate gender-responsive OSH into the management cycle', n, 'System approach');
  const nodes = [
    ['DIAGNOSE', 'Map tasks, exposure and workforce patterns.', 5.15, 1.32, C.blue],
    ['CONSULT', 'Include workers from different roles and shifts.', 8.85, 2.18, C.teal],
    ['CONTROL', 'Apply the hierarchy of controls and test fit.', 8.05, 4.92, C.green],
    ['SUPPORT', 'Manage working time, health and accommodation.', 2.2, 4.92, C.purple],
    ['MONITOR', 'Use data, experience and learning from events.', 1.35, 2.18, C.amber]
  ];
  nodes.forEach((d, i) => {
    const next = nodes[(i + 1) % nodes.length];
    arrow(s, d[2] + 1.55, d[3] + 0.72, next[2] + 1.55, next[3] + 0.72, C.blue40, 1.8);
  });
  nodes.forEach(d => card(s, d[2], d[3], 3.1, 1.4, d[0], d[1], d[4], { titleSize: 20, bodySize: 14.3, align: 'center' }));
  s.addShape(pptx.ShapeType.ellipse, { x: 5.1, y: 3.0, w: 3.15, h: 1.55, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('INCLUSIVE\nOSH MANAGEMENT', { x: 5.65, y: 3.42, w: 2.05, h: 0.72, fontFace: NARROW, fontSize: 22, bold: true, color: C.white, align: 'center', margin: 0 });
  notes(s, [
    'Gender-responsive OSH should be integrated into the existing management system rather than operated as a parallel initiative.',
    'Diagnosis maps tasks and exposure, consultation adds worker knowledge, and control follows the hierarchy of prevention.',
    'Support includes occupational health, psychosocial prevention, working-time controls and reasonable accommodation.',
    'Monitoring combines quantitative indicators with worker experience and review after incidents or change.',
    'The cycle should be repeated whenever technology, staffing, infrastructure or work organisation changes.'
  ], ['ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.', 'ILO, 10 Keys for gender-sensitive OSH practice (2013).']);
}

// 19. Dashboard moved up
{
  const s = newSlide(); header(s, 'A minimum gender-responsive OSH dashboard', n, 'Monitoring');
  const rows = [
    ['WORKFORCE', 'Participation, recruitment, retention and progression by occupation and task.', C.blue],
    ['EXPOSURE', 'High-risk tasks, emergency work, shift patterns, travel and contractor exposure.', C.red],
    ['OSH OUTCOMES', 'Incidents, near misses, occupational disease, fatigue and psychosocial indicators.', C.amber],
    ['FIT AND ACCESS', 'PPE fit, facilities, adjustments, training access and equipment trials.', C.cyan],
    ['WORKER VOICE', 'Concerns raised, response time, action closure, stop-work use and participation quality.', C.purple]
  ];
  rows.forEach((r, i) => {
    const y = 1.4 + i * 0.93;
    s.addShape(pptx.ShapeType.rect, { x: 0.75, y, w: 0.13, h: 0.62, fill: { color: r[2] }, line: { color: r[2] } });
    s.addText(r[0], { x: 1.08, y: y + 0.05, w: 2.0, h: 0.3, fontFace: NARROW, fontSize: 19, bold: true, color: r[2], margin: 0 });
    s.addText(r[1], { x: 3.0, y: y - 0.02, w: 8.7, h: 0.54, fontFace: FONT, fontSize: 16, color: C.dark, margin: 0, valign: 'mid' });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.0, y: 6.15, w: 11.2, h: 0.72, fill: { color: C.light }, line: { color: C.blue20 } });
  s.addText('Safeguards: protect confidentiality, avoid identifying small groups, explain the purpose of data and prevent punitive use.', { x: 1.3, y: 6.34, w: 10.6, h: 0.32, fontFace: FONT, fontSize: 16.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'Indicators should be linked to decisions and accountable owners, not collected for reporting alone.',
    'Workforce data should be analysed by occupation and task so that averages do not hide horizontal segregation.',
    'Exposure and outcome data should include emergency work, fatigue and psychosocial risks as well as accidents.',
    'PPE fit, facilities and reasonable accommodation are measurable components of prevention.',
    'Sensitive data require confidentiality, clear purpose and safeguards against punitive monitoring.'
  ], ['IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025.', 'ILO, 10 Keys for gender-sensitive OSH practice (2013).']);
}

// 20. Case exercise
{
  const s = newSlide();
  safeImage(s, photos.repairs, 0, 0, W, H);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.15, h: H, fill: { color: C.blue, transparency: 8 }, line: { color: C.blue, transparency: 100 } });
  s.addText('FICTIONAL COMPOSITE CASE', { x: 0.72, y: 0.62, w: 2.7, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.cyan, charSpacing: 1.2, margin: 0 });
  s.addText('RESTORATION AFTER\nINFRASTRUCTURE DAMAGE', { x: 0.72, y: 1.12, w: 5.75, h: 1.45, fontFace: NARROW, fontSize: 33, bold: true, color: C.white, margin: 0 });
  const scenario = [
    'A mixed crew is sent to restore a damaged substation.',
    'Several workers are new to the task; one is returning after injury.',
    'The planned shift extends into the night after delays.',
    'Some PPE sizes are unavailable and sanitation facilities are limited.',
    'A contractor reports hostile conduct but is reluctant to use the complaint channel.'
  ];
  bulletList(s, scenario, 0.85, 3.02, 5.8, { fontSize: 16, lineH: 0.58, color: C.cyan, textColor: C.white });
  footer(s, n, true);
  notes(s, [
    'The case combines physical, organisational and psychosocial hazards that should be assessed together.',
    'The mixed crew and role changes require verification of competence, supervision and equipment fit without making assumptions based on gender.',
    'The extended shift creates fatigue risk and may alter travel, security and recovery arrangements.',
    'Limited facilities and PPE sizes are prevention failures rather than individual inconveniences.',
    'The hostile conduct report tests whether violence and harassment procedures protect contractors and other non-standard workers.'
  ], ['Fictional case developed from the OSH principles and Ukraine energy-sector context used in this session.', 'Photo: Western Area Power / Jeff Miller, Transmission system repairs underway, CC BY 2.0.']);
}

// 21. Exercise questions
{
  const s = newSlide(); header(s, 'Exercise: analyse the work, not the stereotype', n, 'Group task');
  const qs = [
    ['1  HAZARDS', 'Identify physical, chemical, ergonomic, psychosocial and violence/harassment hazards.'],
    ['2  EXPOSURE', 'Who performs which tasks, under which conditions, and what has changed?'],
    ['3  CONTROLS', 'Which measures are missing or may not fit part of the workforce?'],
    ['4  ACTION', 'What must change before work starts, during the task and after completion?']
  ];
  qs.forEach((q, i) => {
    const x = 0.72 + (i % 2) * 6.18;
    const y = 1.45 + Math.floor(i / 2) * 2.35;
    card(s, x, y, 5.75, 1.85, q[0], q[1], [C.red, C.teal, C.amber, C.green][i], { titleSize: 22, bodySize: 17 });
  });
  s.addText('Apply the hierarchy of controls. Do not solve organisational risks only with PPE, training or individual resilience.', { x: 1.2, y: 6.35, w: 10.9, h: 0.42, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'The exercise should produce a task-based risk analysis rather than a list of assumptions about women or men.',
    'Groups should distinguish hazards from exposure and identify how changed work arrangements affect risk.',
    'Controls should follow the hierarchy: elimination, substitution, engineering, organisational measures and PPE.',
    'Violence, harassment and psychosocial hazards should be included alongside physical hazards.',
    'The final action should identify who has authority to implement the control and how effectiveness will be verified.'
  ], ['ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.', 'ILO Convention No. 190.']);
}

// 22. 30-60-90
{
  const s = newSlide(); header(s, 'A practical 30-60-90 day agenda', n, 'Action planning');
  const cols = [
    ['30', 'DAYS', C.cyan, ['Map high-risk tasks and workforce patterns', 'Consult workers across roles and shifts', 'Audit PPE, facilities and reporting channels', 'Select one urgent psychosocial or harassment risk']],
    ['60', 'DAYS', C.green, ['Pilot corrected PPE or work design', 'Update fatigue and emergency protocols', 'Test reporting and support arrangements', 'Launch targeted training or mentoring']],
    ['90', 'DAYS', C.amber, ['Integrate actions into the OSH system', 'Assign owners, resources and indicators', 'Embed requirements in procurement and contracts', 'Review results through worker participation']]
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 4.18;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.45, w: 3.75, h: 4.95, fill: { color: C.white }, line: { color: c[2], width: 2.2 } });
    s.addText(c[0], { x: x + 0.38, y: 1.75, w: 1.25, h: 0.75, fontFace: NARROW, fontSize: 48, bold: true, color: c[2], align: 'center', margin: 0 });
    s.addText(c[1], { x: x + 1.55, y: 2.02, w: 1.45, h: 0.34, fontFace: NARROW, fontSize: 22, bold: true, color: c[2], margin: 0 });
    s.addShape(pptx.ShapeType.line, { x: x + 0.42, y: 2.72, w: 2.9, h: 0, line: { color: c[2], width: 2 } });
    bulletList(s, c[3], x + 0.42, 3.04, 2.95, { fontSize: 14.8, lineH: 0.72, color: c[2] });
  });
  s.addText('Choose one action with a named owner before the session ends.', { x: 1.2, y: 6.7, w: 10.95, h: 0.32, fontFace: FONT, fontSize: 19, bold: true, color: C.blue, align: 'center', margin: 0 });
  notes(s, [
    'The first 30 days focus on diagnosis, consultation and selection of a concrete risk.',
    'The 60-day stage tests practical solutions rather than waiting for a complete strategy.',
    'The 90-day stage embeds successful measures in the OSH management system, procurement, contractor management and monitoring.',
    'Actions should be specific enough to verify and should connect safety with workforce realities.',
    'Every action needs a named owner, resources, a deadline and an indicator of effectiveness.'
  ], ['ILO, 10 Keys for gender-sensitive OSH practice (2013).', 'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.']);
}

// 23. Closing exercise
{
  const s = newSlide(); s.background = { color: C.blue };
  const words = [
    ['SAFE', 0.9, 1.25, C.red], ['INCLUSIVE', 7.45, 1.25, C.cyan], ['SKILLED', 0.9, 3.12, C.green], ['PARTICIPATORY', 7.45, 3.12, C.amber]
  ];
  words.forEach(w => s.addText(w[0], { x: w[1], y: w[2], w: 4.95, h: 0.72, fontFace: NARROW, fontSize: 39, bold: true, color: w[3], align: 'center', margin: 0 }));
  s.addShape(pptx.ShapeType.line, { x: 1.2, y: 5.12, w: 10.95, h: 0, line: { color: C.white, transparency: 55, width: 1.5 } });
  s.addText('The future of energy work must be designed around the real workforce and the real work.', { x: 1.15, y: 5.5, w: 11.05, h: 0.72, fontFace: FONT, fontSize: 24, bold: true, color: C.white, align: 'center', margin: 0 });
  s.addText('What will you change first?', { x: 4.65, y: 6.48, w: 4.05, h: 0.35, fontFace: FONT, fontSize: 18, italic: true, color: C.blue20, align: 'center', margin: 0 });
  footer(s, n, true);
  notes(s, [
    'Safe, inclusive, skilled and participatory are mutually reinforcing qualities of a modern energy workforce.',
    'Gender-responsive OSH improves the core prevention system by making exposure, fit, work organisation and worker voice more visible.',
    'Violence and harassment, psychosocial risks and fatigue belong within OSH governance alongside physical hazards.',
    'The closing reflection should identify one practical change that can be initiated in the participant\'s own sphere of responsibility.',
    'The most useful commitment is specific, owned and linked to a real task or workplace process.'
  ], ['Synthesis of the ILO and IRENA sources cited throughout the deck.']);
}

// 24. Sources
{
  const s = newSlide(); header(s, 'Selected sources and image credits', n, 'Reference');
  const left = [
    'ILO (2013), 10 Keys for gender-sensitive OSH practice.',
    'ILO, Occupational Safety and Health Convention, 1981 (No. 155).',
    'ILO, Promotional Framework for OSH Convention, 2006 (No. 187).',
    'ILO, Violence and Harassment Convention, 2019 (No. 190).',
    'ILO, Guidelines on OSH Management Systems, ILO-OSH 2001.',
    'ILO Curriculum, Modules 14 and 15 on psychosocial risks.',
    'ILO (2026), The psychosocial working environment.',
    'ILO (2026), Protecting and Preparing Ukraine\'s Energy Workforce for Sustainable Recovery.',
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025.',
    'User-provided: Felix Martin Daza, Key Gender Issues in OSH.'
  ];
  const right = [
    'Image credits',
    'Adam Jones - Wind Turbine with Workers, Boryspil, Ukraine - CC BY-SA 2.0.',
    'Western Area Power / Jeff Miller - Transmission system repairs underway - CC BY 2.0.',
    'Solar worker image - Pexels licence.',
    '',
    'Design',
    'ITCILO Brand Guidelines, April 2026.',
    '',
    'Speaker notes',
    'All notes are written as presentation-ready bullet points and contain slide-specific source blocks.'
  ];
  s.addText(left.join('\n'), { x: 0.75, y: 1.38, w: 5.85, h: 5.75, fontFace: FONT, fontSize: 14.3, color: C.dark, margin: 0.03, breakLine: false, lineSpacingMultiple: 1.12 });
  s.addShape(pptx.ShapeType.line, { x: 6.72, y: 1.42, w: 0, h: 5.42, line: { color: C.blue20, width: 1.5 } });
  s.addText(right.join('\n'), { x: 7.05, y: 1.38, w: 5.45, h: 5.75, fontFace: FONT, fontSize: 14.3, color: C.dark, margin: 0.03, breakLine: false, lineSpacingMultiple: 1.12 });
  notes(s, ['The slide consolidates the principal references and image credits.', 'Detailed sources remain available in the notes of each substantive slide.'], ['ITCILO Brand Guidelines, April 2026.']);
}

slides.forEach(s => { warnIfSlideHasOverlaps(s, pptx); warnIfSlideElementsOutOfBounds(s, pptx); });
pptx.writeFile({ fileName: OUT, compression: true });
console.log(`Wrote ${OUT} with ${slides.length} slides.`);
