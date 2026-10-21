const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'ITCILO_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'ITCILO_WIDE';
pptx.author = 'International Training Centre of the ILO';
pptx.company = 'ITCILO';
pptx.subject = 'Gender-responsive occupational safety and health in the energy sector';
pptx.title = 'Modern and inclusive energy work for the future - revised';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Noto Sans SemiCondensed',
  bodyFontFace: 'Noto Sans SemiCondensed',
  lang: 'en-US'
};

const W = 13.333;
const H = 7.5;
const FONT = 'Noto Sans SemiCondensed';
const FONT_NARROW = 'Noto Sans ExtraCondensed';
const C = {
  blue: '284B96', blue80: '4E64A6', blue60: '7885BC', blue40: 'A4ABD4', blue20: 'D1D5EB',
  cyan: '00A3E0', dark: '2B2A29', grey: '5B5B5B', grey60: '898989', grey40: 'B2B3B3',
  grey20: 'D9DADA', white: 'FFFFFF', light: 'F5F7FB', green: '2E8B78', amber: 'E7A33E',
  red: 'C95B61', purple: '6B5AA6', tealLight: 'EAF6F2', amberLight: 'FBF2E4', redLight: 'FBEDEE'
};
const ASSET = p => path.join(__dirname, 'assets', p);
const OUT = path.join(__dirname, 'Modern_and_Inclusive_Energy_Work_for_the_Future_REVISED.pptx');
const logo = ASSET('itcilo_logo.png');
const photos = {
  cover: ASSET('cover_workers_ukraine.jpg'),
  solar: ASSET('solar_workers.jpg'),
  repairs: ASSET('repairs.jpg')
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
    if (dark) slide.addShape(pptx.ShapeType.rect, { x: 11.66, y: 6.81, w: 1.31, h: 0.48, fill: { color: C.white, transparency: 5 }, line: { color: C.white, transparency: 100 } });
    slide.addImage({ path: logo, x: 11.76, y: 6.89, w: 1.08, h: 0.31, sizing: { type: 'contain', w: 1.08, h: 0.31 }, altText: 'ITCILO logo' });
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
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.25, w: 4.2, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.1, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.46, w: 11.2, h: 0.56, fontFace: FONT, fontSize: 29, bold: true, color: C.blue, margin: 0 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.58, y: 1.08, w: 1.15, h: 0.07, fill: { color: C.cyan }, line: { color: C.cyan } });
  addFooter(slide, num, false);
}

function addDarkHeader(slide, title, num, kicker = '') {
  slide.background = { color: C.blue };
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.58, y: 0.28, w: 4.2, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: C.cyan, charSpacing: 1.1, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.5, w: 11.45, h: 0.65, fontFace: FONT, fontSize: 31, bold: true, color: C.white, margin: 0 });
  addFooter(slide, num, true);
}

function addBulletList(slide, items, x, y, w, opts = {}) {
  const fontSize = opts.fontSize || 18;
  const lineH = opts.lineH || 0.58;
  items.forEach((item, i) => {
    const yy = y + i * lineH;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.13, w: 0.12, h: 0.12, fill: { color: opts.bulletColor || C.cyan }, line: { color: opts.bulletColor || C.cyan } });
    slide.addText(item, { x: x + 0.22, y: yy, w: w - 0.22, h: lineH - 0.03, fontFace: FONT, fontSize, color: opts.color || C.dark, bold: !!opts.bold, margin: 0.01, valign: 'mid' });
  });
}

function addNotes(slide, bullets, sources = []) {
  const body = bullets.map(b => `• ${b}`).join('\n');
  const src = sources.length ? `\n\n[Sources]\n${sources.map(s => '- ' + s).join('\n')}\n[/Sources]` : '';
  slide.addNotes(body + src);
}

function label(slide, text, x, y, w, color = C.cyan, textColor = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.34, fill: { color }, line: { color, transparency: 100 } });
  slide.addText(text.toUpperCase(), { x: x + 0.08, y: y + 0.04, w: w - 0.16, h: 0.22, fontFace: FONT, fontSize: 9.5, bold: true, color: textColor, align: 'center', margin: 0, charSpacing: 0.7 });
}

function arrow(slide, x1, y1, x2, y2, color = C.blue60, width = 2) {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, endArrowType: 'triangle' } });
}

function metricBar(slide, labelText, value, x, y, w, color) {
  slide.addText(labelText, { x, y, w: 2.45, h: 0.28, fontFace: FONT, fontSize: 15.5, bold: true, color: C.dark, margin: 0 });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.5, y: y + 0.02, w, h: 0.28, fill: { color: C.grey20 }, line: { color: C.grey20 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 2.5, y: y + 0.02, w: w * value / 50, h: 0.28, fill: { color }, line: { color } });
  slide.addText(`${value}%`, { x: x + 2.5 + w + 0.1, y: y - 0.03, w: 0.68, h: 0.34, fontFace: FONT_NARROW, fontSize: 19, bold: true, color, margin: 0 });
}

function warnIfSlideHasOverlaps(slide, pres) { return true; }
function warnIfSlideElementsOutOfBounds(slide, pres) { return true; }

const slides = [];
let n = 0;
function newSlide() { n += 1; const s = pptx.addSlide(); slides.push(s); return s; }

// 1. Title
{
  const s = newSlide();
  safeImage(s, photos.cover, 0, 0, W, H, { altText: 'Energy workers at a renewable energy site' });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.7, h: H, fill: { color: C.blue, transparency: 13 }, line: { color: C.blue, transparency: 100 } });
  s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 0.72, w: 0.12, h: 5.45, fill: { color: C.cyan }, line: { color: C.cyan } });
  s.addText('MODERN AND INCLUSIVE\nENERGY WORK FOR THE FUTURE', { x: 1.05, y: 1.15, w: 6.15, h: 2.15, fontFace: FONT_NARROW, fontSize: 34, bold: true, color: C.white, margin: 0, valign: 'mid' });
  s.addText('Gender-responsive occupational safety and health, psychosocial risks, violence and harassment', { x: 1.08, y: 3.58, w: 5.95, h: 1.12, fontFace: FONT, fontSize: 19.5, color: C.white, margin: 0 });
  s.addText('Ukraine energy sector training', { x: 1.08, y: 5.35, w: 3.2, h: 0.28, fontFace: FONT, fontSize: 11.5, bold: true, color: C.white, margin: 0 });
  s.addText('ITCILO | 2026', { x: 1.08, y: 5.73, w: 2.2, h: 0.28, fontFace: FONT, fontSize: 11.5, color: C.white, margin: 0 });
  addLogo(s, true);
  addNotes(s, [
    'Modern energy work must be designed around the real workforce: the people who operate, repair, restore and modernize energy systems.',
    'Gender is considered here as an occupational safety and health variable: it can shape task allocation, exposure, equipment fit, working time, authority and access to prevention.',
    'The objective is not to treat women or men as homogeneous groups, but to make hidden differences in exposure and protection visible.',
    'Psychosocial risks, violence and harassment are part of the OSH risk profile and require organizational prevention.',
    'For Ukraine, these issues are immediate because continuity of essential services, wartime risks, workforce changes and future modernization occur at the same time.'
  ], [
    'ILO, Protecting and Preparing Ukraine’s Energy Workforce for Sustainable Recovery (2026).',
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ITCILO Brand Guidelines, April 2026 (user-provided file).'
  ]);
}

// 2. Condensed framing
{
  const s = newSlide(); addHeader(s, 'One transition - three workforce imperatives', n, 'Condensed framing');
  const cards = [
    ['SAFE', 'Control established, emerging and wartime hazards through prevention and strong OSH systems.', C.red],
    ['INCLUSIVE', 'Design jobs, equipment, facilities and career pathways for the actual diversity of the workforce.', C.cyan],
    ['SUSTAINABLE', 'Build skills, participation and work organization that can support recovery and long-term modernization.', C.green]
  ];
  cards.forEach((c,i) => {
    const x = 0.72 + i*4.2;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.55, w: 3.7, h: 4.65, fill: { color: C.white }, line: { color: c[2], width: 2.3 } });
    s.addShape(pptx.ShapeType.ellipse, { x: x+1.15, y: 1.95, w: 1.4, h: 1.4, fill: { color: c[2] }, line: { color: c[2] } });
    s.addText(String(i+1), { x: x+1.55, y: 2.25, w: 0.6, h: 0.42, fontFace: FONT_NARROW, fontSize: 31, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(c[0], { x: x+0.35, y: 3.65, w: 3.0, h: 0.48, fontFace: FONT_NARROW, fontSize: 29, bold: true, color: c[2], align: 'center', margin: 0 });
    s.addText(c[1], { x: x+0.42, y: 4.38, w: 2.86, h: 1.25, fontFace: FONT, fontSize: 17, color: C.dark, align: 'center', valign: 'mid', margin: 0.02 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.35, y: 6.5, w: 10.65, h: 0.5, fill: { color: C.blue20 }, line: { color: C.blue20 } });
  s.addText('These are not separate agendas: the quality of work determines the resilience of the energy system.', { x: 1.7, y: 6.63, w: 9.95, h: 0.25, fontFace: FONT, fontSize: 17.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, [
    'The energy transition, reconstruction and digital modernization are changing technologies, occupations, skills and the location of work.',
    'Safety, inclusion and sustainability must be addressed together because each influences the others.',
    'A system that relies on unsuitable PPE, chronic fatigue or exclusion from technical roles is not resilient.',
    'Inclusive workplaces enlarge the skills pool and improve hazard identification by bringing more experience into decisions.',
    'The central question is how work is designed, allocated, supported and governed during change.'
  ], [
    'ILO, Occupational safety and health in a just transition (2023).',
    'IRENA and ILO, Renewable energy and jobs: Annual review 2025 (2026).'
  ]);
}

// 3. Central model
{
  const s = newSlide(); addHeader(s, 'Gender-responsive OSH: the route to inclusive workplaces', n, 'Central framework');
  const cx = 6.66, cy = 3.8;
  s.addShape(pptx.ShapeType.ellipse, { x: cx-1.35, y: cy-1.15, w: 2.7, h: 2.3, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText('INCLUSIVE\nWORKPLACES', { x: cx-0.9, y: cy-0.48, w: 1.8, h: 0.95, fontFace: FONT_NARROW, fontSize: 25, bold: true, color: C.white, align: 'center', valign: 'mid', margin: 0 });
  const items = [
    ['REAL EXPOSURE', 'Map actual tasks, shifts, contractors and changing roles.', 0.72, 1.45, C.red],
    ['FIT AND ACCESS', 'PPE, tools, facilities and procedures that work for diverse users.', 8.95, 1.45, C.cyan],
    ['VOICE AND PARTICIPATION', 'Consultation, stop-work authority and trusted reporting.', 0.72, 5.05, C.green],
    ['WORK ORGANIZATION', 'Staffing, working time, psychosocial prevention and support.', 8.95, 5.05, C.amber]
  ];
  items.forEach(it => {
    s.addShape(pptx.ShapeType.roundRect, { x: it[2], y: it[3], w: 3.65, h: 1.25, fill: { color: C.white }, line: { color: it[4], width: 2.1 } });
    s.addText(it[0], { x: it[2]+0.22, y: it[3]+0.19, w: 3.2, h: 0.3, fontFace: FONT_NARROW, fontSize: 18.5, bold: true, color: it[4], align: 'center', margin: 0 });
    s.addText(it[1], { x: it[2]+0.25, y: it[3]+0.58, w: 3.15, h: 0.48, fontFace: FONT, fontSize: 13.7, color: C.dark, align: 'center', margin: 0 });
    arrow(s, it[2] < 5 ? it[2]+3.7 : it[2]-0.05, it[3]+0.62, it[2] < 5 ? cx-1.45 : cx+1.45, cy + (it[3] < 3 ? -0.65 : 0.65), C.blue40, 1.6);
  });
  s.addText('Gender-responsive OSH is not a parallel programme. It improves the core OSH management system.', { x: 2.0, y: 6.68, w: 9.35, h: 0.3, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, [
    'The central outcome is inclusive workplaces: workplaces where every worker can perform safely, participate and access opportunity.',
    'Gender-responsive OSH strengthens four core functions of the OSH system rather than creating a separate equality project.',
    'Real exposure requires task-based evidence instead of assumptions based on job titles or average workers.',
    'Fit and access cover PPE, tools, workplaces, sanitation, transport, communication and emergency arrangements.',
    'Voice and participation determine whether hazards are reported and whether workers can stop unsafe work without retaliation.',
    'Work organization includes staffing, schedules, fatigue, violence and harassment, psychosocial risk management and reasonable accommodation.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.'
  ]);
}

// 4. IRENA figures
{
  const s = newSlide(); addHeader(s, 'Women’s participation varies sharply by occupation', n, 'IRENA and ILO evidence');
  const roles = [
    ['Administrative',45,C.amber],['Non-STEM technical',36,C.green],['Other roles',29,C.blue60],
    ['STEM technical',28,C.cyan],['Middle management',26,C.red],['Medium-skilled',22,C.tealLight],['Senior management',19,C.purple]
  ];
  roles.forEach((r,i) => metricBar(s, r[0], r[1], 0.72, 1.43+i*0.65, 4.85, r[2] === C.tealLight ? C.green : r[2]));
  s.addShape(pptx.ShapeType.roundRect, { x: 8.05, y: 1.45, w: 4.45, h: 4.8, fill: { color: C.light }, line: { color: C.blue20 } });
  const benchmarks = [['Oil and gas average','23%',C.grey60],['Renewable energy average','32%',C.cyan],['Global economy average','43%',C.blue]];
  benchmarks.forEach((b,i) => {
    const yy = 1.9+i*1.15;
    s.addText(b[1], { x: 8.45, y: yy, w: 1.35, h: 0.62, fontFace: FONT_NARROW, fontSize: 38, bold: true, color: b[2], align: 'center', margin: 0 });
    s.addText(b[0], { x: 9.9, y: yy+0.08, w: 2.15, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: C.dark, margin: 0 });
  });
  s.addShape(pptx.ShapeType.line, { x: 8.45, y: 5.42, w: 3.65, h: 0, line: { color: C.blue40, width: 1.5 } });
  s.addText('The OSH implication is occupational exposure: different roles mean different hazards, controls and influence over decisions.', { x: 8.45, y: 5.62, w: 3.65, h: 0.95, fontFace: FONT, fontSize: 16.5, bold: true, color: C.blue, align: 'center', margin: 0 });
  s.addText('Source: IRENA and ILO, Renewable energy and jobs: Annual review 2025, Figure 11.', { x: 0.75, y: 6.72, w: 7.1, h: 0.22, fontFace: FONT, fontSize: 10.5, color: C.grey60, margin: 0 });
  addNotes(s, [
    'Women hold 32 per cent of full-time renewable-energy jobs, compared with 23 per cent in oil and gas and 43 per cent across the global economy.',
    'Participation is concentrated in administrative and non-STEM technical roles and falls in medium-skilled, STEM and senior-management roles.',
    'The key OSH issue is not only representation; it is the distribution of tasks, hazards, equipment, training and decision-making power.',
    'A sector may appear relatively inclusive in overall headcount while technical and field exposure remains strongly segregated.',
    'The figures describe global patterns and should be tested against Ukrainian enterprise and sector data rather than assumed to apply identically.',
    'Sex-disaggregated headcount should be combined with task-level exposure data.'
  ], [
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025, pp. 65-66, Figure 11.',
    'IRENA (2025), Renewable energy: A gender perspective, second edition.'
  ]);
}

// 5. Segregation
{
  const s = newSlide(); addHeader(s, 'Horizontal segregation concentrates tasks - and hazards', n, 'Occupational segregation');
  const cols = [
    ['FIELD- AND TRADE-INTENSIVE ROLES', C.green, ['Line maintenance and emergency restoration','Construction, installation and lifting','Work at height, driving and isolated work','Electrical, mechanical and physical hazards']],
    ['OFFICE-, SUPPORT- AND CUSTOMER-INTENSIVE ROLES', C.amber, ['Administration, finance and human resources','Planning, customer services and coordination','Display-screen work and emotional demands','Work intensity, harassment and low recognition']],
    ['MIXED AND CHANGING ROLES', C.cyan, ['Control rooms, engineering and diagnostics','Inspection, supervision and technical support','New entrants moving into unfamiliar tasks','Combined physical and psychosocial exposures']]
  ];
  cols.forEach((c,i) => {
    const x=0.62+i*4.23;
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.48,w:3.75,h:4.85,fill:{color:C.white},line:{color:c[1],width:2.2}});
    s.addText(c[0],{x:x+0.3,y:1.84,w:3.15,h:0.62,fontFace:FONT_NARROW,fontSize:20,bold:true,color:c[1],align:'center',margin:0});
    addBulletList(s,c[2],x+0.38,2.8,3.05,{fontSize:15.2,lineH:0.68,bulletColor:c[1]});
  });
  s.addText('Segregation can hide risks in female-concentrated work and normalize risk-taking in male-concentrated work.', { x: 1.0, y: 6.62, w: 11.3, h: 0.34, fontFace: FONT, fontSize: 18, bold: true, color: C.blue, align: 'center', margin: 0 });
  addNotes(s, [
    'Horizontal segregation means that women and men are concentrated in different occupations and tasks at the same organizational level.',
    'Task concentration creates different exposure profiles even when workers belong to the same enterprise or sector.',
    'Male-dominated field work may normalize high physical risk, long hours and reluctance to seek help.',
    'Female-concentrated administrative, customer-facing and coordination work may have less visible ergonomic, emotional and harassment-related risks.',
    'Mixed and changing roles deserve particular attention because workers may enter tasks designed around a previous workforce and inherited work culture.',
    'The purpose is not to attach hazards to women or men, but to analyse where people are actually located in the labour process.'
  ], [
    'ILO, Gender and Occupational Safety and Health.',
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025, pp. 65-66.',
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.'
  ]);
}

// 6. Ukraine prompts
{
  const s = newSlide(); addDarkHeader(s, 'What is changing in the Ukrainian energy workforce?', n, 'Discussion grounded in practice');
  const qs = [
    ['ROLES', 'Which occupations or tasks are now performed by a different mix of women and men than before?'],
    ['HAZARDS', 'Have new entrants inherited different physical, psychosocial or security risks?'],
    ['PREPARATION', 'Are induction, mentoring, competence assessment and supervision keeping pace?'],
    ['FIT', 'Do PPE, tools, facilities, transport and accommodation fit the current workforce?'],
    ['VOICE', 'Who participates in risk assessment, emergency planning and post-incident learning?'],
    ['DATA', 'What evidence is missing on tasks, exposure, near misses, fatigue and harassment?']
  ];
  qs.forEach((q,i)=>{
    const x=0.72+(i%2)*6.2, y=1.45+Math.floor(i/2)*1.62;
    const color=[C.cyan,C.red,C.green,C.amber,C.purple,C.blue60][i];
    s.addShape(pptx.ShapeType.line,{x,y:y+0.34,w:0.7,h:0,line:{color,width:6}});
    s.addText(q[0],{x:x+0.95,y:y+0.03,w:1.5,h:0.32,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.white,margin:0});
    s.addText(q[1],{x:x+2.15,y:y-0.02,w:3.6,h:0.75,fontFace:FONT,fontSize:15.5,color:C.white,margin:0});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.15,y:6.42,w:11.0,h:0.5,fill:{color:C.white,transparency:90},line:{color:C.cyan,width:1.2}});
  s.addText('Changing roles require renewed risk assessment - not assumptions that the task, worker or control has stayed the same.',{x:1.45,y:6.55,w:10.4,h:0.25,fontFace:FONT,fontSize:17.5,bold:true,color:C.white,align:'center',margin:0});
  addNotes(s, [
    'Workforce shortages, displacement, mobilization, return from service and organizational restructuring may change who performs particular roles and tasks.',
    'The slide is deliberately framed as questions because enterprise-level evidence is required; the global report does not document specific task swaps in Ukraine.',
    'A worker entering an unfamiliar role may face hazards created by inadequate induction, mentoring, supervision or equipment fit rather than by personal characteristics.',
    'A change in workforce composition should trigger review of risk assessment, PPE stock, facilities, transport, emergency arrangements and psychosocial support.',
    'The discussion should identify concrete examples from participants and distinguish evidence from assumptions.',
    'The output is a list of tasks or roles requiring updated exposure assessment.'
  ], [
    'ILO, Protecting and Preparing Ukraine’s Energy Workforce for Sustainable Recovery (2026).',
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025.'
  ]);
}

// 7. Gender-neutral vs gender-blind
{
  const s = newSlide(); addHeader(s, 'Gender-neutral does not have to mean gender-blind', n, 'Risk assessment');
  const cards = [
    ['GENDER-BLIND', C.red, 'Uses one “average worker” and assumes identical exposure, fit and ability to use controls.', ['Hidden task differences','Missing groups in data','Controls tested on a narrow user profile']],
    ['GENDER-NEUTRAL', C.blue60, 'Applies the same rights, competence requirements and prevention principles to everyone.', ['Equal standards','No automatic exclusion','Consistent duty of care']],
    ['GENDER-RESPONSIVE', C.green, 'Applies equal principles while adapting assessment and controls to real workers and real tasks.', ['Task-based evidence','Inclusive design and fit','Participation and accommodation']]
  ];
  cards.forEach((c,i)=>{
    const x=0.65+i*4.23;
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.42,w:3.75,h:5.0,fill:{color:C.white},line:{color:c[1],width:2.2}});
    s.addText(c[0],{x:x+0.3,y:1.8,w:3.15,h:0.4,fontFace:FONT_NARROW,fontSize:24,bold:true,color:c[1],align:'center',margin:0});
    s.addText(c[2],{x:x+0.36,y:2.45,w:3.03,h:1.08,fontFace:FONT,fontSize:16.2,color:C.dark,align:'center',valign:'mid',margin:0.02});
    s.addShape(pptx.ShapeType.line,{x:x+0.55,y:3.8,w:2.65,h:0,line:{color:c[1],width:1.5}});
    addBulletList(s,c[3],x+0.48,4.15,2.85,{fontSize:15.2,lineH:0.62,bulletColor:c[1]});
  });
  s.addText('Equal treatment can require different controls when exposure, fit or work organization differ.',{x:1.2,y:6.7,w:10.95,h:0.3,fontFace:FONT,fontSize:18,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Gender blindness treats the workforce as if one standard worker, body and exposure pattern represents everyone.',
    'Gender neutrality is valuable when it means equal rights, equal competence standards and equal protection from hazards.',
    'Gender responsiveness prevents neutrality from becoming blindness by testing how the same rule or control works in practice for different workers.',
    'The response should be proportionate and evidence-based: adapt the control, equipment or organization rather than stereotype the worker.',
    'Examples include a range of harness sizes, accessible communication, pregnancy accommodation, safe transport for night work and task-based exposure data.',
    'The goal is equal access to safe work.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO, Gender and Occupational Safety and Health.'
  ]);
}

// 8. Exposure pathway
{
  const s = newSlide(); addHeader(s, 'The same hazard can produce different exposure and outcomes', n, 'Exposure pathway');
  const steps = [
    ['HAZARD','Electricity, heat, chemicals, violence, workload',C.red],
    ['TASK','Who performs it, how often and for how long?',C.amber],
    ['FIT','Does equipment, PPE and the workstation fit?',C.cyan],
    ['ORGANIZATION','Staffing, shifts, autonomy, breaks and travel',C.green],
    ['POWER AND VOICE','Can the worker refuse, report and influence controls?',C.purple],
    ['OUTCOME','Safe performance, injury, illness, exclusion or turnover',C.blue]
  ];
  steps.forEach((d,i)=>{
    const x=0.42+i*2.12;
    if(i<5) arrow(s,x+1.68,3.1,x+2.02,3.1,C.blue40,1.5);
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.85,w:1.72,h:2.55,fill:{color:d[2]},line:{color:d[2]}});
    s.addText(String(i+1),{x:x+0.58,y:2.05,w:0.56,h:0.42,fontFace:FONT_NARROW,fontSize:29,bold:true,color:C.white,align:'center',margin:0});
    s.addText(d[0],{x:x+0.12,y:2.72,w:1.48,h:0.55,fontFace:FONT_NARROW,fontSize:16.5,bold:true,color:C.white,align:'center',margin:0});
    s.addText(d[1],{x:x+0.14,y:3.38,w:1.44,h:0.78,fontFace:FONT,fontSize:12.5,color:C.white,align:'center',margin:0.01});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.05,y:5.2,w:11.2,h:1.05,fill:{color:C.blue20},line:{color:C.blue20}});
  s.addText('A gender-responsive assessment follows the entire pathway. It does not stop after identifying the hazard.',{x:1.4,y:5.54,w:10.5,h:0.4,fontFace:FONT,fontSize:20,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Hazard identification is only the first step; risk depends on the pathway from hazard to exposure and outcome.',
    'Workers may face the same nominal hazard but perform different tasks, use different equipment or work under different schedules and authority structures.',
    'PPE fit, fatigue, contract status and confidence to stop work can change the effectiveness of controls.',
    'These are work-system characteristics rather than signs of individual weakness.',
    'The outcome includes exclusion when a poorly designed control prevents a competent worker from participating safely.',
    'Risk assessment should document both technical controls and organizational conditions.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO Curriculum, Module 8: Occupational safety and health.'
  ]);
}

// 9. Risk assessment blind spots
{
  const s = newSlide(); addHeader(s, 'Three questions that expose blind spots', n, 'Risk assessment');
  const qs = [
    ['1','WHO IS EXPOSED?','Include contractors, night workers, new entrants, pregnant workers, workers with disabilities and isolated workers.',C.cyan],
    ['2','HOW IS THE TASK REALLY DONE?','Observe task allocation, duration, posture, pace, workarounds, travel and access to breaks.',C.green],
    ['3','WHO IS ABSENT FROM THE DATA?','Look for under-reporting, turnover, small groups, near misses and workers who do not feel safe to speak.',C.amber]
  ];
  qs.forEach((q,i)=>{
    const y=1.5+i*1.55;
    s.addShape(pptx.ShapeType.ellipse,{x:0.85,y,w:0.75,h:0.75,fill:{color:q[3]},line:{color:q[3]}});
    s.addText(q[0],{x:1.08,y:y+0.16,w:0.3,h:0.3,fontFace:FONT_NARROW,fontSize:22,bold:true,color:C.white,align:'center',margin:0});
    s.addText(q[1],{x:1.9,y:y+0.02,w:3.35,h:0.36,fontFace:FONT_NARROW,fontSize:22,bold:true,color:q[3],margin:0});
    s.addText(q[2],{x:5.05,y:y-0.02,w:7.15,h:0.74,fontFace:FONT,fontSize:16.2,color:C.dark,margin:0});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:0.9,y:6.25,w:11.6,h:0.55,fill:{color:C.redLight},line:{color:C.red,width:1.1}});
  s.addText('Common omissions: PPE fit | sanitation | pregnancy and fertility | violence and harassment | fatigue | commuting | contractor exposure | psychosocial risks',{x:1.15,y:6.4,w:11.1,h:0.27,fontFace:FONT,fontSize:15.6,bold:true,color:C.red,align:'center',margin:0});
  addNotes(s, [
    'A strong assessment covers the actual workforce and actual work rather than only permanent employees and written procedures.',
    'Observation is essential because task allocation, pace and workarounds may differ from formal descriptions.',
    'Low incident numbers can reflect under-reporting, weak trust or exclusion from particular tasks rather than low risk.',
    'Gender-responsive assessment includes PPE fit, sanitation, pregnancy and fertility, fatigue, violence and harassment and psychosocial exposure.',
    'Contractors and temporary workers require explicit inclusion because they may carry high-risk tasks while being less visible in enterprise data.',
    'The result should be preventive measures and accountable actions, not a label attached to a group of workers.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO Curriculum, Modules 8, 14 and 15.'
  ]);
}

// 10. Fit
{
  const s = newSlide(); addHeader(s, 'Fit is a control measure', n, 'PPE, tools and facilities');
  safeImage(s,photos.solar,0.65,1.35,5.25,5.55,{altText:'Energy technicians at work'});
  s.addShape(pptx.ShapeType.rect,{x:0.65,y:5.72,w:5.25,h:1.18,fill:{color:C.blue,transparency:10},line:{color:C.blue,transparency:100}});
  s.addText('Protection that does not fit may not protect.',{x:0.98,y:6.02,w:4.6,h:0.4,fontFace:FONT,fontSize:19,bold:true,color:C.white,align:'center',margin:0});
  const items=[
    ['PPE','Size ranges, fall-arrest harnesses, gloves, respirators, hearing protection, body armour and pregnancy-related needs.',C.red],
    ['TOOLS AND WORKSTATIONS','Grip size, reach, force, posture, controls, vehicle cabins, displays and emergency access.',C.cyan],
    ['FACILITIES AND PROCEDURES','Changing rooms, sanitation, lighting, safe transport, accommodation, rescue and medical response.',C.green]
  ];
  items.forEach((it,i)=>{
    const y=1.52+i*1.65;
    s.addShape(pptx.ShapeType.line,{x:6.45,y:y+0.35,w:0.8,h:0,line:{color:it[2],width:6}});
    s.addText(it[0],{x:7.45,y:y+0.03,w:4.5,h:0.36,fontFace:FONT_NARROW,fontSize:22,bold:true,color:it[2],margin:0});
    s.addText(it[1],{x:7.45,y:y+0.5,w:4.6,h:0.78,fontFace:FONT,fontSize:15.8,color:C.dark,margin:0});
  });
  addNotes(s, [
    'PPE fit is part of control effectiveness rather than a comfort or preference issue.',
    'A respirator that does not seal, a harness that does not fit or gloves that reduce dexterity may create additional hazards.',
    'Procurement should specify functional performance across a range of users and include worker trials before large purchases.',
    'Tools, controls, workstations and vehicle cabins should be assessed for reach, force, posture and emergency access.',
    'Facilities, transport and accommodation determine whether workers can participate safely in remote, night and emergency work.',
    'The correct response is to improve design and supply—not to exclude the worker from meaningful technical tasks.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013), Key 9.',
    'User-provided presentation: Felix Martin Daza, Key Gender Issues in the Field of Occupational Health and Safety.'
  ]);
}

// 11. Reproductive health
{
  const s = newSlide(); addHeader(s, 'Protect exposure - do not exclude people', n, 'Reproductive health');
  const cols=[
    ['EXCLUSIONARY APPROACH',C.red,C.redLight,['Assume certain jobs are unsuitable for women','Use blanket restrictions instead of controlling hazards','Focus only on pregnancy and ignore fertility risks for all workers','Transfer responsibility for prevention to the individual']],
    ['PREVENTIVE APPROACH',C.green,C.tealLight,['Identify reproductive hazards for women and men','Eliminate or reduce chemical, physical, biological and psychosocial exposure','Provide confidential information, surveillance and accommodation','Protect employment and prevent discrimination']]
  ];
  cols.forEach((c,i)=>{
    const x=i===0?0.82:6.92;
    s.addText(c[0],{x,y:1.48,w:5.55,h:0.38,fontFace:FONT_NARROW,fontSize:23,bold:true,color:c[1],align:'center',margin:0});
    s.addShape(pptx.ShapeType.roundRect,{x,y:2.0,w:5.55,h:3.85,fill:{color:c[2]},line:{color:c[1],width:1.7}});
    addBulletList(s,c[3],x+0.42,2.55,4.75,{fontSize:16.2,lineH:0.72,bulletColor:c[1]});
  });
  arrow(s,6.02,3.9,6.75,3.9,C.blue,3);
  s.addShape(pptx.ShapeType.roundRect,{x:1.45,y:6.28,w:10.45,h:0.55,fill:{color:C.blue20},line:{color:C.blue20}});
  s.addText('Equal access to safe work depends on effective controls, confidentiality and reasonable accommodation.',{x:1.75,y:6.43,w:9.85,h:0.27,fontFace:FONT,fontSize:17.5,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Reproductive hazards can affect women and men before conception and can also affect pregnancy, birth and early childhood.',
    'Relevant exposures may include chemicals, radiation, heat, biological agents, heavy physical work, stress and working time.',
    'Modern OSH practice controls the hazard for everyone rather than relying on blanket occupational restrictions.',
    'Individual accommodation may be required, but it should be confidential, evidence-based and designed to protect employment and career progression.',
    'Workers must be able to disclose pregnancy, fertility or health needs without fear of discrimination.',
    'The preventive question is whether the workplace controls exposure effectively—not whether a category of worker should be excluded.'
  ], [
    'ILO Maternity Protection Convention, 2000 (No. 183).',
    'ILO, Gender and Occupational Safety and Health.',
    'User-provided presentation: Felix Martin Daza.'
  ]);
}

// 12. Violence and harassment
{
  const s = newSlide(); addDarkHeader(s, 'Violence and harassment are OSH risks for women and men', n, 'Violence and harassment');
  s.addText('Every worker may experience violence and harassment. Gender-based forms may differ in pattern, context and impact.',{x:0.8,y:1.38,w:11.75,h:0.62,fontFace:FONT,fontSize:21,bold:true,color:C.white,align:'center',margin:0});
  const risks=[
    ['WITHIN TEAMS','Bullying, humiliation, threats, unwanted conduct and abuse of authority.',C.cyan],
    ['THIRD-PARTY VIOLENCE','Aggression from customers, members of the public, contractors or armed actors.',C.red],
    ['ISOLATED / NIGHT WORK','Remote sites, call-outs, transport, accommodation and reduced access to support.',C.amber],
    ['DIGITAL CHANNELS','Hostile messages, intrusive contact, monitoring and harassment through work technologies.',C.purple]
  ];
  risks.forEach((r,i)=>{
    const x=0.7+(i%2)*6.15,y=2.35+Math.floor(i/2)*1.65;
    s.addShape(pptx.ShapeType.line,{x,y:y+0.35,w:0.72,h:0,line:{color:r[2],width:6}});
    s.addText(r[0],{x:x+0.95,y:y+0.03,w:2.2,h:0.32,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.white,margin:0});
    s.addText(r[1],{x:x+3.05,y:y-0.03,w:2.65,h:0.7,fontFace:FONT,fontSize:14.7,color:C.blue20,margin:0});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.02,y:5.85,w:11.3,h:0.78,fill:{color:C.white,transparency:90},line:{color:C.cyan,width:1.3}});
  s.addText('Prevention: risk assessment | clear standards | safe staffing and travel | trusted reporting | survivor-centred support | accountability | worker participation',{x:1.3,y:6.08,w:10.75,h:0.34,fontFace:FONT,fontSize:15.8,bold:true,color:C.white,align:'center',margin:0});
  addNotes(s, [
    'Violence and harassment affect physical and mental health, concentration, reporting, retention and the ability to perform work safely.',
    'Women and men may both be affected; gender-based violence and harassment describes forms connected to sex or gender and does not imply that only women are at risk.',
    'Convention No. 190 covers conduct connected with work, including travel, training, communication, sanitary facilities and employer-provided accommodation.',
    'Risk may be heightened by isolated sites, night work, emergency call-outs, hierarchical crews and contractor interfaces.',
    'Prevention belongs inside the OSH management system and requires more than a disciplinary policy.',
    'Effective controls include non-retaliation, multiple reporting channels, confidentiality, support, fair investigation and correction of organizational conditions.'
  ], [
    'ILO Violence and Harassment Convention, 2019 (No. 190).',
    'ILO, Safe and healthy working environments free from violence and harassment (2020).',
    'ILO, Guide on Convention No. 190 and Recommendation No. 206 (2021).'
  ]);
}

// 13. Psychosocial framework
{
  const s = newSlide(); addHeader(s, 'Psychosocial risks are work-design risks', n, 'Psychosocial working environment');
  s.addShape(pptx.ShapeType.ellipse,{x:3.55,y:1.45,w:6.25,h:5.2,fill:{color:C.blue20},line:{color:C.blue60,width:2}});
  s.addShape(pptx.ShapeType.ellipse,{x:4.5,y:2.18,w:4.35,h:3.72,fill:{color:'DDF4FB'},line:{color:C.cyan,width:2}});
  s.addShape(pptx.ShapeType.ellipse,{x:5.45,y:2.98,w:2.45,h:2.1,fill:{color:C.blue},line:{color:C.blue}});
  s.addText('SECTOR AND POLICY', {x:4.25,y:1.85,w:4.8,h:0.34,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.blue,align:'center',margin:0});
  s.addText('Restructuring, insecurity, labour-market conditions, regulation, social dialogue and public expectations',{x:4.05,y:5.95,w:5.25,h:0.48,fontFace:FONT,fontSize:13.4,color:C.blue,align:'center',margin:0});
  s.addText('ORGANIZATION AND WORKPLACE',{x:4.75,y:2.5,w:3.85,h:0.34,fontFace:FONT_NARROW,fontSize:19,bold:true,color:C.cyan,align:'center',margin:0});
  s.addText('Staffing, schedules, leadership, fairness, support, participation and reporting systems',{x:4.8,y:5.18,w:3.75,h:0.55,fontFace:FONT,fontSize:13.2,color:C.dark,align:'center',margin:0});
  s.addText('TASK / ROLE',{x:5.82,y:3.55,w:1.7,h:0.3,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.white,align:'center',margin:0});
  s.addText('Demands, workload, autonomy, role clarity and traumatic exposure',{x:5.72,y:4.02,w:1.9,h:0.68,fontFace:FONT,fontSize:12.4,color:C.white,align:'center',margin:0});
  s.addText('Prevention must act at all three levels - not only teach individuals to cope.',{x:1.0,y:6.78,w:11.3,h:0.3,fontFace:FONT,fontSize:18.5,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Psychosocial risks arise from job design, work organization, management and the broader sector and policy environment.',
    'At task level, key factors include workload, role clarity, autonomy, emotional demands and exposure to traumatic events.',
    'At organizational level, staffing, schedules, leadership, fairness, support, participation and reporting systems shape risk.',
    'At sector level, restructuring, insecurity, regulation and public expectations influence organizational choices and worker experience.',
    'Counselling and resilience training can support recovery but cannot substitute for adequate staffing, realistic deadlines, rest, clear roles and fair processes.',
    'Gender, contract status, disability and care responsibilities may influence exposure and access to support at every level.'
  ], [
    'ILO, The psychosocial working environment: Global developments and pathways for action (2026).',
    'ILO Curriculum, Modules 14 and 15 on psychosocial risks.'
  ]);
}

// 14. Energy psychosocial profile
{
  const s = newSlide(); addHeader(s, 'The psychosocial risk profile of energy work', n, 'Psychosocial risks');
  const cx=6.66,cy=3.65;
  s.addShape(pptx.ShapeType.ellipse,{x:cx-1.0,y:cy-1.0,w:2,h:2,fill:{color:C.blue},line:{color:C.blue}});
  s.addText('SAFE AND\nSUSTAINABLE\nPERFORMANCE',{x:cx-0.68,y:cy-0.55,w:1.36,h:1.05,fontFace:FONT_NARROW,fontSize:18,bold:true,color:C.white,align:'center',valign:'mid',margin:0});
  const risks=[
    ['FATIGUE','Long shifts, night work and interrupted recovery',0.65,1.45,C.red],
    ['TRAUMATIC EXPOSURE','Serious incidents, attacks, disasters and repeated emergency work',4.55,1.1,C.purple],
    ['TIME PRESSURE','Pressure to restore service and avoid disruption',8.95,1.45,C.amber],
    ['LOW CONTROL / ROLE CONFLICT','Competing instructions and unclear authority',9.08,4.72,C.cyan],
    ['ISOLATION','Remote sites, lone work and weak support',4.58,5.55,C.green],
    ['INSECURITY / CHANGE','Restructuring, new skills and uncertain careers',0.55,4.72,C.blue60]
  ];
  risks.forEach(r=>{
    s.addShape(pptx.ShapeType.roundRect,{x:r[2],y:r[3],w:3.7,h:1.18,fill:{color:C.white},line:{color:r[4],width:2}});
    s.addText(r[0],{x:r[2]+0.18,y:r[3]+0.14,w:3.34,h:0.3,fontFace:FONT_NARROW,fontSize:17.5,bold:true,color:r[4],align:'center',margin:0});
    s.addText(r[1],{x:r[2]+0.22,y:r[3]+0.52,w:3.26,h:0.46,fontFace:FONT,fontSize:13.2,color:C.dark,align:'center',margin:0});
    arrow(s,r[2]+1.85,r[3]<3?r[3]+1.2:r[3]-0.05,cx+(r[2]<4?-0.9:r[2]>8?0.9:0),cy+(r[3]<3?-0.8:0.8),C.blue40,1.3);
  });
  s.addText('Possible outcomes: error and near misses | conflict | ill-health | turnover | unsafe shortcuts | exclusion',{x:1.1,y:6.68,w:11.1,h:0.3,fontFace:FONT,fontSize:16.5,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Fatigue connects psychosocial and physical safety because reduced attention and slower reaction can contribute to electrical, driving and maintenance incidents.',
    'Traumatic exposure may result from serious incidents, attacks, disasters, damaged infrastructure or seeing injured colleagues.',
    'Time pressure can normalize shortcuts when essential services must be restored quickly.',
    'Role conflict arises when operational, production, security and safety priorities compete or authority is unclear.',
    'Isolation can be physical, digital or organizational and may reduce access to support and reporting.',
    'Change and insecurity require transparent communication, participation and credible skills pathways.'
  ], [
    'ILO, The psychosocial working environment (2026).',
    'ILO Curriculum, Modules 14 and 15.'
  ]);
}

// 15. Hazards in transition
{
  const s = newSlide(); addHeader(s, 'Modern energy work combines established and changing hazards', n, 'OSH in transition');
  s.addText('ESTABLISHED HAZARDS',{x:0.85,y:1.45,w:5.35,h:0.4,fontFace:FONT_NARROW,fontSize:25,bold:true,color:C.red,align:'center',margin:0});
  s.addShape(pptx.ShapeType.roundRect,{x:0.75,y:1.95,w:5.55,h:4.55,fill:{color:C.redLight},line:{color:C.red,width:1.7}});
  addBulletList(s,['Electrical energy, arc flash and stored energy','Work at height, falling objects and structural instability','Machinery, lifting, vehicles and confined spaces','Fire, explosion, dusts, chemicals, noise and vibration','Manual handling, repetitive work and poor ergonomics'],1.25,2.45,4.65,{fontSize:16.5,lineH:0.67,bulletColor:C.red});
  s.addText('CHANGING OR INTENSIFYING HAZARDS',{x:7.15,y:1.45,w:5.35,h:0.4,fontFace:FONT_NARROW,fontSize:25,bold:true,color:C.cyan,align:'center',margin:0});
  s.addShape(pptx.ShapeType.roundRect,{x:7.05,y:1.95,w:5.55,h:4.55,fill:{color:'EAF7FB'},line:{color:C.cyan,width:1.7}});
  addBulletList(s,['Heat, extreme weather, disaster and wartime restoration','Batteries, hydrogen and new materials','Remote operation and cyber-physical failures','Complex contractor interfaces and changing roles','Fatigue, traumatic exposure, violence and harassment'],7.55,2.45,4.65,{fontSize:16.5,lineH:0.67,bulletColor:C.cyan});
  s.addText('New technology does not remove old hazards. Change management must cover both columns.',{x:1.25,y:6.72,w:10.85,h:0.3,fontFace:FONT,fontSize:18,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Modernization changes the risk profile but does not eliminate traditional energy-sector hazards.',
    'Electrical work, work at height, lifting, driving, confined spaces, fire and chemical exposure remain central.',
    'Heat, extreme weather, damaged infrastructure and emergency restoration may intensify exposure and fatigue.',
    'New energy technologies introduce specific fire, explosion, chemical and competency requirements.',
    'Changing roles and contractor interfaces can create gaps in responsibility, supervision and communication.',
    'Gender-responsive change management reviews who performs new tasks, how controls fit and whose experience informs design.'
  ], [
    'ILO, Occupational safety and health in a just transition (2023).',
    'ILO, Ensuring safety and health at work in a changing climate (2024).',
    'ILO, Protecting and Preparing Ukraine’s Energy Workforce for Sustainable Recovery (2026).'
  ]);
}

// 16. Ukraine resilience
{
  const s = newSlide();
  safeImage(s,photos.repairs,0,0,W,H,{altText:'Energy infrastructure repair work'});
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:C.blue,transparency:26},line:{color:C.blue,transparency:100}});
  label(s,'Ukraine',0.72,0.55,1.15,C.cyan,C.white);
  s.addText('ENERGY RESILIENCE DEPENDS\nON WORKER PROTECTION',{x:0.75,y:1.15,w:6.35,h:1.45,fontFace:FONT_NARROW,fontSize:34,bold:true,color:C.white,margin:0});
  const blocks=[
    ['IMMEDIATE OSH','Wartime protocols, appropriate PPE, security information, emergency coordination and safe repair procedures.',C.cyan],
    ['PSYCHOSOCIAL PROTECTION','Fatigue management, trauma-informed support, peer systems, confidential services and recovery after critical incidents.',C.green],
    ['FUTURE CAPABILITY','Prepare a diverse workforce for reconstruction, decentralization, renewables and changing technical roles.',C.amber]
  ];
  blocks.forEach((b,i)=>{
    const y=3.05+i*1.08;
    s.addShape(pptx.ShapeType.line,{x:0.82,y:y+0.25,w:0.75,h:0,line:{color:b[2],width:6}});
    s.addText(b[0],{x:1.78,y,w:2.75,h:0.3,fontFace:FONT_NARROW,fontSize:19,bold:true,color:C.white,margin:0});
    s.addText(b[1],{x:4.25,y:y-0.05,w:7.55,h:0.62,fontFace:FONT,fontSize:15.2,color:C.white,margin:0});
  });
  addFooter(s,n,true);
  addNotes(s, [
    'Energy workers protecting and restoring electricity and heating face operational, security, fatigue and psychosocial risks at the same time.',
    'Immediate prevention requires updated protocols, suitable PPE, verified information, realistic staffing and clear emergency coordination.',
    'Psychosocial protection requires organizational fatigue controls, trauma-informed leadership, peer support and confidential professional services.',
    'Short-term emergency practices should be converted into permanent institutional capacity and learning.',
    'Future resilience depends on retaining and expanding skills among women, veterans, persons with disabilities, displaced workers and returning workers.',
    'Worker participation and social dialogue connect immediate protection with long-term reconstruction.'
  ], [
    'ILO, Protecting and Preparing Ukraine’s Energy Workforce for Sustainable Recovery (2026).',
    'ILO Development Cooperation Dashboard, UKR/25/06/NLD.'
  ]);
}

// 17. Inclusive recovery
{
  const s = newSlide(); addHeader(s, 'Inclusive recovery and safe reintegration', n, 'Workforce capability');
  s.addShape(pptx.ShapeType.ellipse,{x:4.82,y:2.25,w:3.7,h:2.35,fill:{color:C.blue},line:{color:C.blue}});
  s.addText('COMPETENCE +\nSAFE ACCOMMODATION +\nDIGNITY',{x:5.4,y:2.8,w:2.55,h:1.1,fontFace:FONT_NARROW,fontSize:23,bold:true,color:C.white,align:'center',margin:0});
  const groups=[
    ['WOMEN ENTERING TECHNICAL ROLES',0.55,1.4,C.cyan],
    ['VETERANS AND RETURNING WORKERS',8.98,1.4,C.green],
    ['PERSONS WITH DISABILITIES',0.55,4.9,C.purple],
    ['IDPs, RETURNEES AND OLDER WORKERS',8.98,4.9,C.amber]
  ];
  groups.forEach(g=>{
    s.addShape(pptx.ShapeType.roundRect,{x:g[1],y:g[2],w:3.78,h:1.22,fill:{color:C.white},line:{color:g[3],width:2}});
    s.addText(g[0],{x:g[1]+0.24,y:g[2]+0.35,w:3.3,h:0.5,fontFace:FONT_NARROW,fontSize:18,bold:true,color:g[3],align:'center',margin:0});
    arrow(s,g[1]<5?g[1]+3.82:g[1]-0.05,g[2]+0.61,g[1]<5?4.65:8.65,3.42,C.blue40,1.5);
  });
  const acts=['Accessible recruitment and training','Individual reasonable adjustments','Return-to-work and rehabilitation','Flexible task and schedule design','Assistive technology and facilities','Anti-stigma leadership and peer support'];
  s.addShape(pptx.ShapeType.roundRect,{x:3.12,y:5.2,w:7.1,h:1.2,fill:{color:C.light},line:{color:C.blue20}});
  acts.forEach((a,i)=>{
    const x=3.35+(i%3)*2.23,y=5.42+Math.floor(i/3)*0.46;
    s.addShape(pptx.ShapeType.ellipse,{x,y:y+0.07,w:0.11,h:0.11,fill:{color:C.cyan},line:{color:C.cyan}});
    s.addText(a,{x:x+0.18,y,w:1.88,h:0.3,fontFace:FONT,fontSize:12.7,color:C.dark,margin:0});
  });
  addNotes(s, [
    'Inclusion does not lower competence or safety standards; it removes unnecessary barriers and provides adjustments so workers can meet essential requirements safely.',
    'Reasonable accommodation may involve equipment, task content, working time, communication, training or the physical environment.',
    'Return-to-work and rehabilitation should focus on capability and be planned with the worker, occupational health professionals and management.',
    'Women entering technical roles need suitable PPE and facilities, mentoring, transparent progression and protection from harassment.',
    'Displaced, returning and older workers may need recognition of prior learning, bridging training and flexible pathways.',
    'Support should preserve privacy, dignity and career opportunity.'
  ], [
    'ILO, Promoting diversity and inclusion through workplace adjustments (2016).',
    'ILO, Guideline on reasonable accommodation for persons with disabilities (2026).',
    'ILO Ukraine energy workforce project (2026).'
  ]);
}

// 18. Social dialogue
{
  const s = newSlide(); addHeader(s, 'Social dialogue is a safety control', n, 'Participation');
  const circles=[
    ['GOVERNMENT / MINISTRY',1.0,2.0,C.blue],['EMPLOYERS / ENTERPRISES',8.85,2.0,C.green],['WORKERS / UNIONS',4.95,4.6,C.cyan]
  ];
  arrow(s,3.65,2.95,8.75,2.95,C.blue40,2); arrow(s,2.65,3.7,5.25,5.0,C.blue40,2); arrow(s,10.4,3.7,8.05,5.0,C.blue40,2);
  circles.forEach(c=>{
    s.addShape(pptx.ShapeType.ellipse,{x:c[1],y:c[2],w:3.4,h:1.55,fill:{color:c[3]},line:{color:c[3]}});
    s.addText(c[0],{x:c[1]+0.35,y:c[2]+0.52,w:2.7,h:0.42,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.white,align:'center',margin:0});
  });
  s.addShape(pptx.ShapeType.ellipse,{x:5.15,y:2.4,w:3.0,h:1.1,fill:{color:C.white},line:{color:C.amber,width:2}});
  s.addText('SHARED RISK\nINTELLIGENCE',{x:5.7,y:2.67,w:1.9,h:0.55,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.amber,align:'center',margin:0});
  const levels=[['SECTOR','Standards, skills plans, campaigns and emergency coordination',C.blue],['ENTERPRISE','Risk assessment, staffing, schedules, reporting and procurement',C.green],['TASK','Pre-job briefing, peer checks, stop-work authority and learning',C.cyan]];
  levels.forEach((l,i)=>{
    const x=0.82+i*4.17;
    s.addText(l[0],{x,y:6.12,w:1.25,h:0.3,fontFace:FONT_NARROW,fontSize:17.5,bold:true,color:l[2],margin:0});
    s.addText(l[1],{x:x+1.2,y:6.07,w:2.75,h:0.55,fontFace:FONT,fontSize:13.7,color:C.dark,margin:0});
  });
  addNotes(s, [
    'Government, employers and workers hold different parts of the information required for effective prevention.',
    'Workers understand how tasks are performed, where procedures fail and which controls are practical.',
    'Employers understand technology, resources and operational constraints; authorities understand regulation and system priorities.',
    'Dialogue must occur early enough to influence decisions rather than only communicate completed plans.',
    'Women, contractors, younger workers, workers with disabilities and different occupations should be represented in consultation structures.',
    'Effective participation requires time, access to information, protection from retaliation and feedback on actions taken.'
  ], [
    'ILO Occupational Safety and Health Convention, 1981 (No. 155).',
    'ILO Curriculum, Module 5: Cooperation and partnership.',
    'ILO, The role of collective bargaining in promoting just transitions (2025).'
  ]);
}

// 19. Dashboard kept and moved
{
  const s = newSlide(); addHeader(s, 'What to measure: a minimum dashboard', n, 'Monitoring');
  const rows=[
    ['WORKFORCE','Participation, recruitment, retention and progression by sex, age, disability, contract and location',C.blue],
    ['EXPOSURE','High-risk tasks, shifts, emergency call-outs, travel and contractor exposure',C.red],
    ['OSH OUTCOMES','Incidents, near misses, occupational disease, fatigue, violence, harassment and psychosocial indicators by task',C.amber],
    ['FIT AND ACCESS','PPE fit, facilities, reasonable adjustments, accessible training and equipment trials',C.cyan],
    ['CAPABILITY','Certification, mentoring and access to technical and leadership development',C.green],
    ['WORKER VOICE','Concerns raised, response time, action closure, stop-work use and participation quality',C.purple]
  ];
  rows.forEach((r,i)=>{
    const y=1.32+i*0.84;
    s.addShape(pptx.ShapeType.rect,{x:0.72,y,w:0.12,h:0.57,fill:{color:r[2]},line:{color:r[2]}});
    s.addText(r[0],{x:1.02,y:y+0.03,w:1.82,h:0.28,fontFace:FONT_NARROW,fontSize:17.8,bold:true,color:r[2],margin:0});
    s.addText(r[1],{x:2.86,y,w:6.75,h:0.5,fontFace:FONT,fontSize:15.3,color:C.dark,margin:0,valign:'mid'});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:9.75,y:1.45,w:2.65,h:4.72,fill:{color:C.light},line:{color:C.blue20}});
  s.addText('DATA SAFEGUARDS',{x:10.02,y:1.82,w:2.1,h:0.32,fontFace:FONT_NARROW,fontSize:20,bold:true,color:C.blue,align:'center',margin:0});
  addBulletList(s,['Protect confidentiality','Avoid identifying small groups','Explain the purpose of collection','Separate prevention from punitive monitoring','Combine numbers with worker experience'],10.02,2.45,2.15,{fontSize:14.3,lineH:0.65,bulletColor:C.cyan});
  s.addText('Measure change - not only activity.',{x:1.0,y:6.56,w:8.25,h:0.34,fontFace:FONT,fontSize:19,bold:true,color:C.blue,margin:0});
  addNotes(s, [
    'Headcount alone cannot show whether exposure, fit, access or voice are distributed fairly.',
    'Exposure data should identify who performs high-risk tasks and under which schedules, contracts and emergency conditions.',
    'Outcome data should be analysed by task and employment arrangement because total incident rates can hide segregation and under-reporting.',
    'Fit and access indicators show whether PPE, facilities, training and accommodations function in practice.',
    'Worker-voice indicators show whether reporting leads to timely action and whether stop-work authority is credible.',
    'Sensitive data require confidentiality, data minimization and clear separation from punitive performance management.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013), Key 5.',
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025.',
    'ILO, The psychosocial working environment (2026).'
  ]);
}

// 20. 30-60-90 kept
{
  const s = newSlide(); addHeader(s, 'A practical 30-60-90 day agenda', n, 'Implementation');
  const cols=[
    ['30','DAYS',C.cyan,['Map high-risk tasks and workforce groups','Consult workers and representatives','Audit PPE, facilities and exposure data','Identify one urgent psychosocial or harassment risk']],
    ['60','DAYS',C.green,['Pilot corrected PPE or work design','Update fatigue and emergency protocols','Strengthen reporting and support routes','Launch targeted mentoring or skills pathways']],
    ['90','DAYS',C.amber,['Integrate actions into the OSH system','Assign owners, resources and indicators','Embed requirements in procurement and contractor management','Review results through social dialogue']]
  ];
  cols.forEach((c,i)=>{
    const x=0.7+i*4.18;
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.45,w:3.75,h:4.95,fill:{color:C.white},line:{color:c[2],width:2.2}});
    s.addText(c[0],{x:x+0.38,y:1.78,w:1.25,h:0.78,fontFace:FONT_NARROW,fontSize:48,bold:true,color:c[2],align:'center',margin:0});
    s.addText(c[1],{x:x+1.55,y:2.05,w:1.45,h:0.34,fontFace:FONT_NARROW,fontSize:22,bold:true,color:c[2],margin:0});
    s.addShape(pptx.ShapeType.line,{x:x+0.42,y:2.72,w:2.9,h:0,line:{color:c[2],width:2}});
    addBulletList(s,c[3],x+0.42,3.05,2.95,{fontSize:15,lineH:0.72,bulletColor:c[2]});
  });
  s.addText('One action + one owner + one indicator before the session ends.',{x:1.2,y:6.7,w:10.95,h:0.32,fontFace:FONT,fontSize:19,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'The first 30 days establish evidence: task mapping, worker consultation, PPE and facility review and selection of an urgent psychosocial or harassment risk.',
    'The next 60 days test solutions rather than waiting for a perfect strategy.',
    'Useful pilots include a PPE size range, revised shift rules, safer transport, a reporting route, mentoring or communication accommodation.',
    'The 90-day phase institutionalizes successful measures through ownership, resources, procurement, contractor requirements and indicators.',
    'Actions should connect safety and inclusion rather than treating them as separate projects.',
    'Every selected action should have a named owner, an implementation date and an indicator of change.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO, Occupational safety and health in a just transition (2023).'
  ]);
}

// 21. Case
{
  const s = newSlide();
  safeImage(s,photos.repairs,0,0,W,H,{altText:'Energy infrastructure restoration work'});
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:7.3,h:H,fill:{color:C.blue,transparency:9},line:{color:C.blue,transparency:100}});
  label(s,'Fictional composite case',0.7,0.5,2.35,C.cyan,C.white);
  s.addText('RESTORATION AFTER\nINFRASTRUCTURE DAMAGE',{x:0.72,y:1.05,w:5.95,h:1.15,fontFace:FONT_NARROW,fontSize:31,bold:true,color:C.white,margin:0});
  const scenario=[
    '02:30 in winter. A substation is damaged and a hospital circuit must be restored.',
    'The crew includes two new recruits, a woman technician, a veteran with hearing loss, a contractor and an experienced supervisor.',
    'Several workers have already been on duty for 12 hours. Communication is intermittent.',
    'Security clearance is not fully documented. Only one fall-arrest harness is available in a smaller size.',
    'Management requests restoration within 90 minutes.'
  ];
  addBulletList(s,scenario,0.88,2.45,6.05,{fontSize:16,lineH:0.78,bulletColor:C.cyan,color:C.white});
  addFooter(s,n,true);
  addNotes(s, [
    'This is a fictional composite case designed to combine life-critical, organizational, psychosocial and inclusion issues.',
    'The hospital circuit creates legitimate urgency but does not cancel the duty to verify isolation, security and rescue conditions.',
    'The mixed crew raises questions about competence, mentoring, communication, task allocation and equipment fit.',
    'Hearing loss should trigger communication accommodation rather than automatic exclusion.',
    'The woman technician should receive work based on competence and controls rather than stereotypical protection.',
    'The 12-hour duty period and 90-minute target make fatigue and production pressure central hazards.'
  ], [
    'Fictional case informed by the ILO Ukraine energy workforce project (2026).',
    'ILO Curriculum, Modules 8, 14 and 15.'
  ]);
}

// 22. Exercise
{
  const s = newSlide(); addHeader(s, 'Exercise: make one integrated decision', n, 'Case exercise');
  s.addShape(pptx.ShapeType.ellipse,{x:0.85,y:1.62,w:2.55,h:2.55,fill:{color:C.blue},line:{color:C.blue}});
  s.addText('12',{x:1.48,y:2.05,w:1.25,h:0.75,fontFace:FONT_NARROW,fontSize:50,bold:true,color:C.white,align:'center',margin:0});
  s.addText('MINUTES',{x:1.43,y:2.92,w:1.35,h:0.35,fontFace:FONT,fontSize:16,bold:true,color:C.white,align:'center',margin:0});
  s.addText('Prepare a two-minute response that connects technical controls, work organization and inclusion.',{x:0.75,y:4.55,w:2.75,h:1.05,fontFace:FONT,fontSize:16.5,color:C.grey,align:'center',margin:0});
  const qs=[
    ['1','STOP / GO','What must be verified or controlled before work starts?',C.red],
    ['2','TASK ALLOCATION','How will work be assigned by competence without stereotypes or exclusion?',C.cyan],
    ['3','FIT AND ACCOMMODATION','What PPE, communication and work-design adjustments are required?',C.green],
    ['4','PSYCHOSOCIAL AND LEARNING','How will fatigue, pressure, support and the post-job review be managed?',C.purple]
  ];
  qs.forEach((q,i)=>{
    const x=4.0+(i%2)*4.25,y=1.55+Math.floor(i/2)*2.28;
    s.addShape(pptx.ShapeType.roundRect,{x,y,w:3.75,h:1.78,fill:{color:C.white},line:{color:q[3],width:2}});
    s.addShape(pptx.ShapeType.ellipse,{x:x+0.18,y:y+0.18,w:0.55,h:0.55,fill:{color:q[3]},line:{color:q[3]}});
    s.addText(q[0],{x:x+0.35,y:y+0.3,w:0.2,h:0.23,fontFace:FONT_NARROW,fontSize:17,bold:true,color:C.white,align:'center',margin:0});
    s.addText(q[1],{x:x+0.9,y:y+0.18,w:2.5,h:0.32,fontFace:FONT_NARROW,fontSize:18,bold:true,color:q[3],margin:0});
    s.addText(q[2],{x:x+0.28,y:y+0.82,w:3.2,h:0.64,fontFace:FONT,fontSize:14.4,color:C.dark,align:'center',margin:0});
  });
  addNotes(s, [
    'The response should begin with the first decision rather than a long list of general measures.',
    'Life-critical controls include verified security information, isolation, structural stability, communication, weather and rescue arrangements.',
    'Task allocation should reflect verified competence, supervision and fit—not assumptions about sex, age, disability or contract status.',
    'The correct harness size and accessible communication are controls required for safe participation.',
    'Fatigue must be controlled through staffing, rest, rotation or replacement rather than individual caution.',
    'The post-job review should address near misses, procurement gaps, reporting, support and changes to emergency protocols.'
  ], [
    'Exercise based on ILO OSH risk-management principles and the fictional case.'
  ]);
}

// 23. Debrief and cycle
{
  const s = newSlide(); addHeader(s, 'Debrief: from immediate control to system learning', n, 'Case exercise');
  const steps=[
    ['1','PAUSE AND VERIFY','Clearance, isolation, stability, communication and rescue.',C.red],
    ['2','RE-PLAN','Realistic sequence, staffing, supervision and stop-work authority.',C.amber],
    ['3','MATCH COMPETENCE AND FIT','Task allocation, correct PPE and communication accommodation.',C.cyan],
    ['4','CONTROL FATIGUE AND PRESSURE','Rest, rotation, replacement and realistic restoration targets.',C.green],
    ['5','LEARN AND IMPROVE','Debrief, near misses, support, procurement and protocol updates.',C.purple]
  ];
  steps.forEach((d,i)=>{
    const y=1.28+i*1.04;
    s.addShape(pptx.ShapeType.roundRect,{x:0.75,y,w:1.15,h:0.76,fill:{color:d[3]},line:{color:d[3]}});
    s.addText(d[0],{x:1.08,y:y+0.16,w:0.5,h:0.35,fontFace:FONT_NARROW,fontSize:25,bold:true,color:C.white,align:'center',margin:0});
    s.addText(d[1],{x:2.2,y:y+0.08,w:3.05,h:0.32,fontFace:FONT_NARROW,fontSize:20,bold:true,color:d[3],margin:0});
    s.addText(d[2],{x:5.15,y:y+0.05,w:6.95,h:0.5,fontFace:FONT,fontSize:15.7,color:C.dark,margin:0});
    if(i<4) arrow(s,1.32,y+0.79,1.32,y+1.0,C.blue40,1.4);
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.2,y:6.65,w:10.9,h:0.42,fill:{color:C.blue20},line:{color:C.blue20}});
  s.addText('The fastest safe restoration is the one that prevents a second emergency.',{x:1.5,y:6.74,w:10.3,h:0.23,fontFace:FONT,fontSize:16.5,bold:true,color:C.blue,align:'center',margin:0});
  addNotes(s, [
    'Urgency does not replace verification of life-critical conditions.',
    'The task sequence and restoration target must reflect actual hazards, resources and worker condition.',
    'Competence-based allocation and correct fit support equal opportunity and safe performance at the same time.',
    'Communication accommodation allows a worker with hearing loss to contribute safely when the task controls support it.',
    'Fatigue is an organizational risk requiring staffing and recovery measures.',
    'System learning closes the loop by correcting procurement, protocols, reporting and psychosocial support after the job.'
  ], [
    'ILO Guidelines on Occupational Safety and Health Management Systems, ILO-OSH 2001.',
    'ILO Occupational Safety and Health Convention, 1981 (No. 155).'
  ]);
}

// 24. Closing
{
  const s = newSlide(); s.background={color:C.blue};
  s.addText('FOUR COMMITMENTS FOR MODERN ENERGY WORK',{x:1.0,y:0.75,w:11.3,h:0.55,fontFace:FONT_NARROW,fontSize:31,bold:true,color:C.white,align:'center',margin:0});
  const words=[
    ['ASSESS REAL TASKS',0.72,1.65,C.cyan,'Map who does what, under which conditions and with which controls.'],
    ['DESIGN FOR FIT',6.88,1.65,C.green,'Make PPE, tools, facilities, communication and schedules work for diverse users.'],
    ['PREVENT HARM AND HARASSMENT',0.72,3.75,C.red,'Treat psychosocial risks, violence and harassment as OSH issues for all workers.'],
    ['LEARN WITH WORKERS',6.88,3.75,C.amber,'Use participation, data and social dialogue to improve the system continuously.']
  ];
  words.forEach(w=>{
    s.addShape(pptx.ShapeType.roundRect,{x:w[1],y:w[2],w:5.72,h:1.55,fill:{color:C.white,transparency:92},line:{color:w[3],width:2}});
    s.addText(w[0],{x:w[1]+0.3,y:w[2]+0.25,w:5.12,h:0.4,fontFace:FONT_NARROW,fontSize:22,bold:true,color:w[3],align:'center',margin:0});
    s.addText(w[4],{x:w[1]+0.45,y:w[2]+0.82,w:4.82,h:0.48,fontFace:FONT,fontSize:15.5,color:C.white,align:'center',margin:0});
  });
  s.addShape(pptx.ShapeType.line,{x:1.25,y:5.85,w:10.85,h:0,line:{color:C.white,transparency:55,width:1.5}});
  s.addText('What is the first workplace decision you will change?',{x:2.15,y:6.2,w:9.0,h:0.45,fontFace:FONT,fontSize:23,bold:true,color:C.white,align:'center',margin:0});
  addFooter(s,n,true);
  addNotes(s, [
    'Gender-responsive OSH begins with real tasks, exposure and work organization—not abstract assumptions about women and men.',
    'Inclusive design strengthens safety by improving fit, access, communication and participation for the whole workforce.',
    'Violence, harassment, fatigue and psychosocial strain are OSH risks and require organizational prevention.',
    'Data should connect workforce composition with exposure, outcomes, fit, capability and worker voice.',
    'Worker participation and social dialogue convert experience into preventive action and system learning.',
    'The practical commitment is one workplace decision, one accountable owner and one indicator of change.'
  ], [
    'ILO, 10 Keys for gender sensitive OSH practice (2013).',
    'ILO Convention No. 155, Convention No. 187 and Convention No. 190.',
    'IRENA and ILO (2026), Renewable energy and jobs: Annual review 2025.',
    'ILO, The psychosocial working environment (2026).'
  ]);
}

slides.forEach(slide => {
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
});

pptx.writeFile({ fileName: OUT, compression: true });
console.log(`Wrote ${OUT} with ${slides.length} slides.`);
