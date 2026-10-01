/* Country Evidence Dossier — shell (Build step 1)
 *
 * One country, one data model. Every station reads from and writes to the same
 * participant record. This shell provides the data model, the dossier home, the
 * Evidence Map, station navigation, save/export/import, and the Amrosea sample.
 * Stations S0–S12 and the facilitator view are added in later build steps.
 *
 * Persistence: the active record autosaves to localStorage (per browser) and
 * exports/imports as JSON. The facilitator cohort view (built last) reads
 * exported JSON files read-only.
 */
(function () {
  "use strict";
  var MOUNT = document.getElementById("dossier-app");
  if (!MOUNT) return;

  var LS_KEY = "evidence-dossier-A9718853";
  var SCHEMA = window.DOSSIER_SCHEMA_VERSION || 1;

  /* ---------- Configuration ---------- */
  var LEVELS = [
    { id: "input", label: "Inputs & activities" },
    { id: "output", label: "Outputs" },
    { id: "outcome", label: "Outcomes" },
    { id: "impact", label: "Impacts" }
  ];
  var METHODS = [
    { id: "admin", label: "Admin data" },
    { id: "survey", label: "Household survey" },
    { id: "microsim", label: "Microsimulation" },
    { id: "ie", label: "Impact evaluation" },
    { id: "distribution", label: "Distributional" },
    { id: "qual", label: "Qualitative" }
  ];
  var STATUS = {
    green: { label: "Evidence exists" },
    amber: { label: "Partial / proposed" },
    red: { label: "Gap" },
    grey: { label: "Not yet assessed" }
  };
  var STATUS_ORDER = ["grey", "red", "amber", "green"];

  var STAKE_TYPES = [
    { id: "MoF", label: "Ministry of Finance" },
    { id: "MoL", label: "Ministry of Labour" },
    { id: "NSO", label: "National Statistics Office" },
    { id: "social_partner", label: "Social partner" },
    { id: "donor", label: "Development partner / donor" },
    { id: "civil_society", label: "Civil society" },
    { id: "other", label: "Other" }
  ];
  function stakeLabel(t) { for (var i = 0; i < STAKE_TYPES.length; i++) if (STAKE_TYPES[i].id === t) return STAKE_TYPES[i].label; return t || "Other"; }

  // Impact domains for S1 (Impact explorer). Each has a hue for its card accent.
  var DOMAINS = [
    { id: "consumption", label: "Consumption & food security", hue: 145 },
    { id: "education", label: "Education", hue: 210 },
    { id: "health", label: "Health", hue: 350 },
    { id: "labour", label: "Labour market", hue: 25 },
    { id: "local_economy", label: "Local economy", hue: 275 },
    { id: "gender", label: "Gender & empowerment", hue: 320 },
    { id: "cohesion", label: "Social cohesion", hue: 190 },
    { id: "resilience", label: "Resilience to shocks", hue: 95 },
    { id: "wellbeing", label: "Psychosocial wellbeing", hue: 50 }
  ];
  function domain(id) { for (var i = 0; i < DOMAINS.length; i++) if (DOMAINS[i].id === id) return DOMAINS[i]; return null; }
  function domainLabel(id) { var d = domain(id); return d ? d.label : (id || "Other"); }
  function domainHue(id) { var d = domain(id); return d ? d.hue : 220; }
  var RELEVANCE = [
    { v: 3, label: "Critical", short: "Critical" },
    { v: 2, label: "Important", short: "Important" },
    { v: 1, label: "Nice to have", short: "Nice to have" }
  ];

  // Life-cycle social protection functions (S2 matrix, S4 chart).
  var FUNCTIONS = [
    { id: "children", label: "Children & family" },
    { id: "maternity", label: "Maternity" },
    { id: "sickness", label: "Sickness" },
    { id: "health", label: "Health care" },
    { id: "unemployment", label: "Unemployment" },
    { id: "employment_injury", label: "Employment injury" },
    { id: "disability", label: "Disability" },
    { id: "old_age", label: "Old age" },
    { id: "survivors", label: "Survivors" },
    { id: "general_assistance", label: "General assistance" }
  ];
  function funcLabel(id) { for (var i = 0; i < FUNCTIONS.length; i++) if (FUNCTIONS[i].id === id) return FUNCTIONS[i].label; return id || "—"; }
  var SCHEME_TYPES = [{ id: "contributory", label: "Contributory" }, { id: "non_contributory", label: "Non-contributory" }, { id: "mixed", label: "Mixed" }];
  var BENEFIT_TYPES = [{ id: "cash", label: "Cash" }, { id: "in_kind", label: "In-kind" }];
  var TOC_LEVELS = [
    { id: "input", label: "Inputs & activities" },
    { id: "output", label: "Outputs" },
    { id: "outcome", label: "Outcomes" },
    { id: "impact", label: "Impacts" }
  ];
  // IE decision tree → method, with its key assumption and main threats.
  var IE_TREE = [
    { q: "Can assignment to the programme be randomised?", method: "RCT" },
    { q: "Is there an eligibility cut-off (a score, age or income threshold)?", method: "RDD" },
    { q: "Was roll-out phased, with data before and after for both groups?", method: "DiD" },
    { q: "Is rich baseline data available on treated and comparison groups?", method: "Matching" },
    { q: "Is there a valid instrument for programme participation?", method: "IV" }
  ];
  var IE_METHODS = {
    RCT: { label: "Randomized controlled trial", assumption: "Randomisation balances observed and unobserved characteristics", threats: ["Spillovers to the comparison group", "Attrition", "Non-compliance"] },
    RDD: { label: "Regression discontinuity", assumption: "Units just above and below the cut-off are comparable", threats: ["Manipulation of the score", "Limited external validity away from the cut-off"] },
    DiD: { label: "Difference-in-differences", assumption: "Treated and comparison groups would have moved in parallel without the programme", threats: ["Differential (non-parallel) trends", "Compositional changes over time"] },
    Matching: { label: "Matching / propensity scores", assumption: "Selection is on observed characteristics (no unobserved confounders)", threats: ["Hidden bias from unobservables", "Poor common support"] },
    IV: { label: "Instrumental variables", assumption: "The instrument affects the outcome only through programme participation", threats: ["Weak instrument", "Violation of the exclusion restriction"] },
    None: { label: "No clear quasi-experimental design", assumption: "—", threats: ["Consider a descriptive or mixed-methods design, or collect baseline data first"] }
  };
  var QUAL_METHODS = ["Focus groups", "Key informant interviews", "Life histories", "Participatory methods", "Observation"];
  var QUAL_ETHICS = ["Informed consent", "Anonymity and confidentiality", "Safe interview settings", "Data protection", "Ethics review / approval"];
  var ACTION_TYPES = ["New study", "Routine data change", "Better disaggregation", "Coordination", "Own-organisation change"];
  var COST_BANDS = [{ id: "low", label: "Low" }, { id: "medium", label: "Medium" }, { id: "high", label: "High" }];

  // Fields driving the S0 forms.
  var PARTICIPANT_FIELDS = [
    { k: "name", label: "Your name", type: "text", ph: "" },
    { k: "organisation", label: "Organisation", type: "text", ph: "" },
    { k: "role", label: "Role", type: "text", ph: "e.g. Social protection analyst" }
  ];
  var COUNTRY_FIELDS = [
    { k: "name", label: "Country name", type: "text", ph: "e.g. Amrosea", req: true },
    { k: "region", label: "Region", type: "text", ph: "" },
    { k: "population", label: "Population", type: "number", ph: "" },
    { k: "currency", label: "Currency", type: "text", ph: "e.g. AMD" },
    { k: "poverty_line", label: "National poverty line (per month)", type: "number", ph: "" },
    { k: "poverty_rate", label: "Poverty rate (%)", type: "number", ph: "" },
    { k: "gdp", label: "GDP", type: "text", ph: "e.g. 62bn AMD" },
    { k: "avg_wage", label: "Average wage (per month)", type: "number", ph: "" },
    { k: "data_year", label: "Data year", type: "number", ph: "e.g. 2024" }
  ];

  // Station metadata drives navigation, progress and the "what this feeds" notes.
  // writes[] names the record keys a station owns; col is the Evidence Map column it fills.
  var STATIONS = [
    { id: "S0", title: "Country passport", week: 0, tag: "Welcome", q: "Which country will you build the dossier for, and what are its key figures?", reads: [], writes: ["country", "participant", "stakeholders"], col: null },
    { id: "S1", title: "Impact explorer", week: 1, tag: "Forum 1", q: "Which impacts of social protection matter most here, and to whom?", reads: ["stakeholders"], writes: ["impacts"], col: null },
    { id: "S2", title: "System map", week: 1, tag: "Assignment 1", q: "What social protection schemes exist, and where are the coverage gaps?", reads: [], writes: ["schemes"], col: null },
    { id: "S3", title: "Theory of change builder", week: 2, tag: "Forum 2", q: "How does one scheme lead from inputs to impacts?", reads: ["schemes", "impacts"], writes: ["toc"], col: null },
    { id: "S4", title: "Indicator calculator", week: 2, tag: "Assignment 2", q: "What are the coverage and adequacy rates?", reads: ["schemes", "toc"], writes: ["indicators"], col: "admin" },
    { id: "S5", title: "Survey scanner", week: 3, tag: "Assignment 3", q: "Can the household survey measure these impacts?", reads: ["schemes"], writes: ["survey"], col: "survey" },
    { id: "S6", title: "Microsimulation sandbox", week: 3, tag: "Forum 3", q: "What might a benefit change do to poverty and inequality?", reads: ["country", "schemes"], writes: ["microsim"], col: "microsim" },
    { id: "S7", title: "Impact evaluation design studio", week: 4, tag: "Assignment 4", q: "How could we credibly estimate a causal impact?", reads: ["schemes", "toc"], writes: ["ie_design"], col: "ie" },
    { id: "S8", title: "Who gets what", week: 4, tag: "Forum 4", q: "How are benefits distributed across the population?", reads: ["schemes"], writes: ["distribution"], col: "distribution" },
    { id: "S9", title: "Qualitative design", week: 5, tag: "Assignment 5", q: "How will we understand the 'why' behind the numbers?", reads: ["toc"], writes: ["qual_design"], col: "qual" },
    { id: "S10", title: "Evidence priorities", week: 5, tag: "Forum 5", q: "Given the Evidence Map, what are the top three actions?", reads: ["evidence_map"], writes: ["priorities"], col: null },
    { id: "S11", title: "Situation Room", week: 6, tag: "Team", q: "As a team, which reform for Novaria, and what does it need from your own plan?", reads: ["priorities"], writes: ["situation_room"], col: null },
    { id: "S12", title: "National plan", week: 7, tag: "Final", q: "What is your national plan for impact assessment?", reads: ["schemes", "toc", "indicators", "survey", "microsim", "ie_design", "distribution", "qual_design", "priorities"], writes: ["final"], col: null }
  ];
  function station(id) { for (var i = 0; i < STATIONS.length; i++) if (STATIONS[i].id === id) return STATIONS[i]; return null; }

  // All user-facing strings in one object, ready for fr/es variants later.
  var UI = {
    home: "Dossier home", stationsWord: "Stations", evidenceMap: "Evidence Map",
    nextStation: "Next station", open: "Open", back: "Back to dossier home",
    illustrative: "Illustrative — based on your inputs, not an official estimate",
    feedsNext: "What this feeds next", reads: "Reads", writes: "Writes",
    notStarted: "Not started", inProgress: "In progress", done: "Done",
    comingSoon: "This station opens in the next build step. For now you can set its status and edit the Evidence Map from the dossier home.",
    editCell: "Edit evidence", status: "Status", note: "Note (short)", save: "Save", cancel: "Cancel",
    loadSample: "Load Amrosea sample", newRecord: "New (blank)", exportJson: "Export JSON", importJson: "Import JSON",
    confirmNew: "Start a new blank dossier? Export first if you want to keep the current one."
  };

  var WEEKS = (window.COURSE && window.COURSE.weeks) || [];

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(p) { return (p || "id") + "-" + Math.random().toString(36).slice(2, 8); }
  function num(n) { return typeof n === "number" ? n.toLocaleString("en") : esc(n); }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "application/json" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function slug(s) { return String(s || "dossier").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dossier"; }
  function getPath(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setPath(obj, path, val) {
    var keys = path.split("."), o = obj;
    for (var i = 0; i < keys.length - 1; i++) { if (o[keys[i]] == null) o[keys[i]] = {}; o = o[keys[i]]; }
    o[keys[keys.length - 1]] = val;
  }

  /* ---------- Data model ---------- */
  function blank() {
    return {
      _schema: SCHEMA,
      participant: { name: "", organisation: "", role: "" },
      country: { name: "", region: "", population: null, currency: "", poverty_line: null, poverty_rate: null, gdp: "", avg_wage: null, data_year: null },
      stakeholders: [],
      impacts: [],
      schemes: [],
      toc: { scheme_id: null, nodes: [], links: [] },
      indicators: [],
      survey: { name: "", year: null, agency: "", welfare_measure: "", poverty_line_type: "", sp_questions: [], gap_score: null },
      microsim: { params: {}, results: {}, interpretation: "" },
      ie_design: { scheme_id: null, question: "", method: "", key_assumption: "", counterfactual: "", data: "", sample: "", threats: [], ethics: "", toc_node_ids: [] },
      distribution: { questions: [], incidence: [], methods: [] },
      qual_design: { outcomes: [], ethics: "" },
      evidence_map: { cells: [] },
      forum: {},
      priorities: [],
      situation_room: { team: "", first_choice: "", second_choice: "", rationale: "", link_to_own_country: "" },
      final: { slide_outline: [], memo_outline: [], self_assessment: { mastery: 0, analysis: 0, clarity: 0, compliance: 0 }, commitment: "" },
      progress: (function () { var p = { updated_at: null }; STATIONS.forEach(function (s) { p[s.id] = "not_started"; }); return p; })()
    };
  }
  // Fill any keys missing from an older/partial record without dropping data.
  function coerce(rec) {
    var b = blank();
    if (!rec || typeof rec !== "object") return b;
    Object.keys(b).forEach(function (k) {
      if (rec[k] == null) { rec[k] = b[k]; return; }
      if (!Array.isArray(b[k]) && typeof b[k] === "object") {
        Object.keys(b[k]).forEach(function (kk) { if (rec[k][kk] == null) rec[k][kk] = b[k][kk]; });
      }
    });
    STATIONS.forEach(function (s) { if (!rec.progress[s.id]) rec.progress[s.id] = "not_started"; });
    rec._schema = SCHEMA;
    return rec;
  }

  var rec = load() || coerce(deepCopy(sample())) ;
  var view = { screen: "home", station: null };
  var editing = null; // {level, method}

  function sample() { return (window.SAMPLE_RECORDS && window.SAMPLE_RECORDS.amrosea) || blank(); }
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
  function load() { try { var r = JSON.parse(localStorage.getItem(LS_KEY)); return r ? coerce(r) : null; } catch (e) { return null; } }
  function save() {
    rec.progress.updated_at = new Date().toISOString();
    try { localStorage.setItem(LS_KEY, JSON.stringify(rec)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- Evidence Map ---------- */
  function cell(level, method) {
    var cells = rec.evidence_map.cells;
    for (var i = 0; i < cells.length; i++) if (cells[i].level === level && cells[i].method === method) return cells[i];
    return null;
  }
  function setCell(level, method, status, text) {
    var c = cell(level, method);
    if (!c) { c = { level: level, method: method, text: "", status: "grey" }; rec.evidence_map.cells.push(c); }
    if (status != null) c.status = status;
    if (text != null) c.text = text;
    save();
  }

  /* ---------- Progress ---------- */
  var WEEK_GROUPS = [
    { key: "setup", label: "Setup", weeks: [0] },
    { key: "w1", label: "Week 1", weeks: [1] },
    { key: "w2", label: "Week 2", weeks: [2] },
    { key: "w3", label: "Week 3", weeks: [3] },
    { key: "w4", label: "Week 4", weeks: [4] },
    { key: "w5", label: "Week 5", weeks: [5] },
    { key: "w6", label: "Week 6", weeks: [6] },
    { key: "w7", label: "Week 7", weeks: [7] }
  ];
  function groupStations(g) { return STATIONS.filter(function (s) { return g.weeks.indexOf(s.week) >= 0; }); }
  function pctDone(list) {
    if (!list.length) return 0;
    var d = list.filter(function (s) { return rec.progress[s.id] === "done"; }).length;
    return Math.round((d / list.length) * 100);
  }
  function nextStation() {
    for (var i = 0; i < STATIONS.length; i++) if (rec.progress[STATIONS[i].id] !== "done") return STATIONS[i];
    return null;
  }
  function weekDates(n) {
    for (var i = 0; i < WEEKS.length; i++) if (WEEKS[i].n === n) return WEEKS[i].range;
    return n === 0 ? "Before Week 1" : "";
  }

  /* ---------- Rendering ---------- */
  function ring(pct, label, sub) {
    var r = 22, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<div class="dos-ring"><svg viewBox="0 0 56 56" aria-hidden="true">' +
      '<circle cx="28" cy="28" r="' + r + '" class="ring-bg"></circle>' +
      '<circle cx="28" cy="28" r="' + r + '" class="ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"></circle>' +
      '<text x="28" y="32" text-anchor="middle" class="ring-txt">' + pct + '%</text></svg>' +
      '<div class="dos-ring-label"><b>' + esc(label) + "</b>" + (sub ? "<span>" + esc(sub) + "</span>" : "") + "</div></div>";
  }

  function renderHome() {
    STATIONS.forEach(function (s) { rec.progress[s.id] = computeProgress(s.id); });
    var c = rec.country;
    var facts = [
      ["Region", c.region], ["Population", c.population ? num(c.population) : "—"],
      ["Poverty rate", c.poverty_rate != null ? c.poverty_rate + "%" : "—"],
      ["Poverty line", c.poverty_line != null ? num(c.poverty_line) + " " + esc(c.currency || "") : "—"],
      ["Avg wage", c.avg_wage != null ? num(c.avg_wage) + " " + esc(c.currency || "") : "—"],
      ["Data year", c.data_year || "—"]
    ];
    var overall = pctDone(STATIONS);
    var nx = nextStation();

    var html =
      '<div class="dos-country"><div><p class="eyebrow">Country evidence dossier</p>' +
        "<h2>" + (c.name ? esc(c.name) : "Choose your country (Station S0)") + "</h2>" +
        '<p class="muted" style="margin:.25rem 0 0">' +
          (rec.participant.name ? esc(rec.participant.name) + (rec.participant.organisation ? " · " + esc(rec.participant.organisation) : "") : "Add your name in Station S0") + "</p>" +
        '<dl class="dos-facts">' + facts.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + (f[1] ? esc(f[1]) : "—") + "</dd></div>"; }).join("") + "</dl></div>" +
        '<div class="dos-overall">' + ring(overall, overall === 100 ? "Complete" : "Overall", overall + "% of 13 stations") + "</div>" +
      "</div>";

    // Progress by week
    html += '<div class="dos-progress">' + WEEK_GROUPS.map(function (g) {
      var list = groupStations(g); if (!list.length) return "";
      var done = list.filter(function (s) { return rec.progress[s.id] === "done"; }).length;
      return ring(pctDone(list), g.label, done + "/" + list.length);
    }).join("") + "</div>";

    // Next station card
    if (nx) {
      html += '<div class="dos-next"><div><span class="eyebrow">' + UI.nextStation + " · " + esc(nx.tag) + " · " + esc(weekDates(nx.week)) + "</span>" +
        "<h3>" + esc(nx.id) + " — " + esc(nx.title) + "</h3><p class=\"muted\" style=\"margin:0\">" + esc(nx.q) + "</p></div>" +
        '<button class="btn" data-open="' + nx.id + '">' + UI.open + "</button></div>";
    }

    // Evidence Map
    html += '<h3 class="dos-h">' + UI.evidenceMap + '</h3><p class="muted">Rows are theory-of-change levels; columns are methods. Click a cell to set its status and note. Method stations fill these automatically in later build steps.</p>';
    html += '<div class="dos-map-wrap"><table class="dos-map"><thead><tr><th scope="col">Level</th>' +
      METHODS.map(function (m) { return '<th scope="col">' + esc(m.label) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      LEVELS.map(function (lv) {
        return "<tr><th scope=\"row\">" + esc(lv.label) + "</th>" + METHODS.map(function (m) {
          var cc = cell(lv.id, m.id) || { status: "grey", text: "" };
          var st = STATUS[cc.status] || STATUS.grey;
          return '<td><button class="dos-cell st-' + esc(cc.status) + '" data-cell="' + lv.id + "|" + m.id + '" ' +
            'aria-label="' + esc(lv.label + ", " + m.label + ": " + st.label + (cc.text ? ". " + cc.text : "")) + '">' +
            '<span class="dos-dot" aria-hidden="true"></span><span class="dos-st">' + esc(st.label) + "</span>" +
            (cc.text ? '<span class="dos-cell-txt">' + esc(cc.text) + "</span>" : "") + "</button></td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    html += '<p class="dos-legend">' + STATUS_ORDER.map(function (k) {
      return '<span class="dos-leg st-' + k + '"><span class="dos-dot" aria-hidden="true"></span>' + esc(STATUS[k].label) + "</span>";
    }).join("") + "</p>";

    // Station list
    html += '<h3 class="dos-h">' + UI.stationsWord + '</h3><div class="dos-stations">' + STATIONS.map(function (s) {
      var stt = rec.progress[s.id] || "not_started";
      return '<button class="dos-station s-' + stt + '" data-open="' + s.id + '">' +
        '<span class="dos-station-id">' + esc(s.id) + '</span><span class="dos-station-main"><b>' + esc(s.title) + "</b>" +
        '<span class="muted">' + esc(s.tag) + " · " + esc(weekDates(s.week)) + "</span></span>" +
        '<span class="dos-pill p-' + stt + '">' + esc(UI[stt === "not_started" ? "notStarted" : stt === "in_progress" ? "inProgress" : "done"]) + "</span></button>";
    }).join("") + "</div>";

    return html;
  }

  function stationHead(s) {
    var readNames = s.reads.length ? s.reads.join(", ") : "—";
    var writeNames = s.writes.length ? s.writes.join(", ") : "—";
    var colNote = s.col ? "Fills the <b>" + esc((METHODS.filter(function (m) { return m.id === s.col; })[0] || {}).label || s.col) + "</b> column of the Evidence Map." : "Does not write directly to the Evidence Map.";
    return '<button class="btn ghost dos-back" data-open="home">&larr; ' + UI.back + "</button>" +
      '<div class="dos-station-head"><span class="eyebrow">' + esc(s.id) + " · " + esc(s.tag) + " · " + esc(weekDates(s.week)) + "</span>" +
      "<h2>" + esc(s.title) + "</h2><p class=\"dos-q\">" + esc(s.q) + "</p></div>" +
      '<div class="dos-io card"><div><span class="eyebrow">' + UI.reads + "</span><p>" + esc(readNames) + "</p></div>" +
      '<div><span class="eyebrow">' + UI.writes + "</span><p>" + esc(writeNames) + "</p></div>" +
      '<div><span class="eyebrow">' + UI.feedsNext + '</span><p>' + colNote + "</p></div></div>";
  }

  function renderStation(id) {
    var s = station(id); if (!s) return renderHome();
    if (id === "S0") return stationHead(s) + renderS0();
    if (id === "S1") return stationHead(s) + renderS1();
    if (id === "S2") return stationHead(s) + renderS2();
    if (id === "S3") return stationHead(s) + renderS3();
    if (id === "S4") return stationHead(s) + renderS4();
    if (id === "S5") return stationHead(s) + renderS5();
    if (id === "S6") return stationHead(s) + renderS6();
    if (id === "S7") return stationHead(s) + renderS7();
    if (id === "S8") return stationHead(s) + renderS8();
    if (id === "S9") return stationHead(s) + renderS9();
    if (id === "S10") return stationHead(s) + renderS10();
    if (id === "S11") return stationHead(s) + renderS11();
    if (id === "S12") return stationHead(s) + renderS12();
    var stt = rec.progress[id] || "not_started";
    return stationHead(s) +
      '<div class="card dos-soon"><p>' + esc(UI.comingSoon) + "</p>" +
      '<label class="dos-status-set">' + UI.status + ": <select data-set-status=\"" + esc(id) + "\">" +
        ["not_started", "in_progress", "done"].map(function (v) {
          return '<option value="' + v + '"' + (stt === v ? " selected" : "") + ">" + esc(UI[v === "not_started" ? "notStarted" : v === "in_progress" ? "inProgress" : "done"]) + "</option>";
        }).join("") + "</select></label></div>";
  }

  /* ---------- Station S0: Country passport ---------- */
  function field(group, f) {
    var v = getPath(rec, group + "." + f.k);
    if (v == null) v = "";
    return '<label class="dos-field">' + esc(f.label) + (f.req ? ' <span class="dos-req">*</span>' : "") +
      '<input type="' + f.type + '" data-model="' + group + "." + f.k + '"' + (f.type === "number" ? ' inputmode="decimal"' : "") +
      (f.ph ? ' placeholder="' + esc(f.ph) + '"' : "") + ' value="' + esc(v) + '"></label>';
  }
  function stakeChip(s) {
    var typeTxt = stakeLabel(s.type);
    var showType = typeTxt && typeTxt.toLowerCase() !== String(s.name || "").toLowerCase();
    return '<span class="dos-chip"><b>' + esc(s.name || "(unnamed)") + "</b>" +
      (showType ? "<span>" + esc(typeTxt) + "</span>" : "") +
      (s.interests ? '<em>' + esc(s.interests) + "</em>" : "") +
      '<button type="button" class="dos-chip-x" data-stake-remove="' + esc(s.id) + '" aria-label="Remove ' + esc(s.name || "stakeholder") + '">&times;</button></span>';
  }
  function renderStakeChips() {
    return rec.stakeholders.length
      ? rec.stakeholders.map(stakeChip).join("")
      : '<p class="muted" style="margin:0">No stakeholders yet. Add the actors who care about impact evidence in your country.</p>';
  }
  function s0Progress() {
    var c = rec.country, p = rec.participant;
    var filled = [c.name, c.region, c.population, c.currency, c.poverty_rate, c.data_year, p.name].filter(function (x) { return x != null && x !== ""; }).length;
    if (c.name && p.name) return "done";
    if (filled > 0) return "in_progress";
    return "not_started";
  }
  function s0PillHtml() {
    var st = rec.progress.S0;
    var label = st === "done" ? UI.done : st === "in_progress" ? UI.inProgress : UI.notStarted;
    return '<span class="dos-pill p-' + st + '" id="s0-pill">' + esc(label) + "</span>";
  }
  function renderS0() {
    return '<div class="dos-s0">' +
      '<section class="card"><div class="dos-card-head"><h3>Your details</h3>' + s0PillHtml() + "</div>" +
        '<div class="dos-grid">' + PARTICIPANT_FIELDS.map(function (f) { return field("participant", f); }).join("") + "</div></section>" +
      '<section class="card"><h3>Country passport</h3>' +
        '<p class="muted">Enter the figures once here. Every later station reads them from this record — you never type them again.</p>' +
        '<div class="dos-grid">' + COUNTRY_FIELDS.map(function (f) { return field("country", f); }).join("") + "</div></section>" +
      '<section class="card"><h3>Stakeholders</h3>' +
        '<p class="muted">Who cares about the impact of social protection here? These chips feed Station S1 (Impact explorer).</p>' +
        '<div class="dos-chips" id="dos-stake-chips">' + renderStakeChips() + "</div>" +
        '<div class="dos-stake-add">' +
          '<input type="text" id="stake-name" placeholder="Name, e.g. Ministry of Finance" aria-label="Stakeholder name">' +
          '<select id="stake-type" aria-label="Stakeholder type">' + STAKE_TYPES.map(function (t) { return '<option value="' + t.id + '">' + esc(t.label) + "</option>"; }).join("") + "</select>" +
          '<input type="text" id="stake-interests" placeholder="Their interest (optional)" aria-label="Stakeholder interest">' +
          '<button type="button" class="btn" id="stake-add">Add</button>' +
        "</div>" +
        '<div class="dos-quick"><span class="muted">Quick add:</span>' + STAKE_TYPES.map(function (t) {
          return '<button type="button" class="dos-quick-btn" data-stake-quick="' + t.id + '">+ ' + esc(t.label) + "</button>";
        }).join("") + "</div></section>" +
      '<p class="muted dos-feeds">What this feeds next: the country figures power the indicator and microsimulation stations; the stakeholders appear in the Impact explorer (S1).</p>' +
      "</div>";
  }
  function coerceNum(v) { if (v === "" || v == null) return null; var n = Number(v); return isNaN(n) ? v : n; }
  function refreshS0Pill() {
    rec.progress.S0 = s0Progress();
    var pill = document.getElementById("s0-pill");
    if (pill) { var st = rec.progress.S0; pill.className = "dos-pill p-" + st; pill.textContent = st === "done" ? UI.done : st === "in_progress" ? UI.inProgress : UI.notStarted; }
  }
  function addStakeholder(type, name, interests) {
    rec.stakeholders.push({ id: uid("st"), name: (name || "").trim(), type: type || "other", interests: (interests || "").trim() });
    save();
    var box = document.getElementById("dos-stake-chips");
    if (box) box.innerHTML = renderStakeChips();
  }
  function wireS0() {
    var addBtn = document.getElementById("stake-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var nm = document.getElementById("stake-name");
      var ty = document.getElementById("stake-type");
      var it = document.getElementById("stake-interests");
      if (!nm.value.trim()) { nm.focus(); return; }
      addStakeholder(ty.value, nm.value, it.value);
      nm.value = ""; it.value = ""; nm.focus();
    });
  }

  /* ---------- Station S1: Impact explorer ---------- */
  function impact(id) { for (var i = 0; i < rec.impacts.length; i++) if (rec.impacts[i].id === id) return rec.impacts[i]; return null; }
  function relLabel(v) { for (var i = 0; i < RELEVANCE.length; i++) if (RELEVANCE[i].v === v) return RELEVANCE[i].label; return "Important"; }

  function s1Progress() {
    if (!rec.impacts.length) return "not_started";
    var priority = rec.impacts.some(function (i) { return i.relevance === 3 || i.evidence_wanted; });
    return priority ? "done" : "in_progress";
  }
  function s1Pill() {
    var st = rec.progress.S1;
    return '<span class="dos-pill p-' + st + '" id="s1-pill">' + esc(st === "done" ? UI.done : st === "in_progress" ? UI.inProgress : UI.notStarted) + "</span>";
  }

  function impactCard(im) {
    var stakes = rec.stakeholders.length
      ? rec.stakeholders.map(function (s) {
          var on = im.stakeholder_ids.indexOf(s.id) >= 0;
          return '<button type="button" class="imp-stake" data-imp="' + im.id + '" data-stake="' + s.id + '" aria-pressed="' + on + '">' + esc(s.name || stakeLabel(s.type)) + "</button>";
        }).join("")
      : '<span class="muted" style="font-size:12px">Add stakeholders in S0 to tag who cares.</span>';
    return '<div class="imp-card" data-impact="' + im.id + '" draggable="true" style="--imp-hue:' + domainHue(im.domain) + '">' +
      '<div class="imp-top"><span class="imp-dot" aria-hidden="true"></span><span class="imp-domain">' + esc(domainLabel(im.domain)) + "</span>" +
      '<button type="button" class="imp-x" data-imp-remove="' + im.id + '" aria-label="Remove impact">&times;</button></div>' +
      '<p class="imp-label">' + esc(im.label) + "</p>" +
      '<div class="imp-stakes">' + stakes + "</div>" +
      '<div class="imp-flags">' +
        '<label class="imp-rel">Relevance <select data-imp-rel="' + im.id + '">' +
          RELEVANCE.map(function (r) { return '<option value="' + r.v + '"' + (im.relevance === r.v ? " selected" : "") + ">" + esc(r.label) + "</option>"; }).join("") + "</select></label>" +
        '<button type="button" class="imp-flag' + (im.missed_in_video ? " on" : "") + '" data-imp-missed="' + im.id + '" aria-pressed="' + !!im.missed_in_video + '">Missed by the video</button>' +
        '<button type="button" class="imp-flag' + (im.evidence_wanted ? " on" : "") + '" data-imp-evidence="' + im.id + '" aria-pressed="' + !!im.evidence_wanted + '">Want evidence</button>' +
      "</div></div>";
  }

  function s1Grid() {
    if (!rec.impacts.length) {
      return '<div class="empty"><p><b>No impacts yet.</b></p><p>Pick a domain, name an impact and add it. Then set how relevant it is and tag which stakeholders care.</p></div>';
    }
    return '<div class="rel-grid">' + RELEVANCE.map(function (r) {
      var cards = rec.impacts.filter(function (i) { return i.relevance === r.v; });
      return '<div class="rel-col"><h4 class="rel-head rel-' + r.v + '">' + esc(r.label) + ' <span>' + cards.length + "</span></h4>" +
        '<div class="rel-zone" data-relzone="' + r.v + '" aria-label="' + esc(r.label) + ' impacts. Use each card\'s relevance menu to move it here.">' +
        (cards.length ? cards.map(impactCard).join("") : '<p class="rel-empty muted">Drag a card here, or set a card\'s relevance to ' + esc(r.label) + ".</p>") +
        "</div></div>";
    }).join("") + "</div>";
  }

  function s1Bullets() {
    var order = { 3: 0, 2: 1, 1: 2 };
    var sorted = rec.impacts.slice().sort(function (a, b) { return (order[a.relevance] - order[b.relevance]) || 0; });
    return sorted.slice(0, 5).map(function (im) {
      var who = im.stakeholder_ids.map(function (id) { var s = stakeholderById(id); return s ? (s.name || stakeLabel(s.type)) : null; }).filter(Boolean);
      return domainLabel(im.domain) + " — " + im.label + " (" + relLabel(im.relevance) +
        (who.length ? "; matters to " + who.join(", ") : "") +
        (im.missed_in_video ? "; not shown in the video" : "") + ")";
    });
  }
  function stakeholderById(id) { for (var i = 0; i < rec.stakeholders.length; i++) if (rec.stakeholders[i].id === id) return rec.stakeholders[i]; return null; }
  function s1Question() { return (rec.forum.S1 && rec.forum.S1.question) || "Which of these impacts would you prioritise for evidence in " + (rec.country.name || "your country") + ", and why?"; }
  function s1PostText() {
    return "Impact explorer — " + (rec.country.name || "my country") + "\n\n" +
      s1Bullets().map(function (b) { return "• " + b; }).join("\n") + "\n\n" + s1Question();
  }
  function wordCount(t) { var m = String(t).trim().match(/\S+/g); return m ? m.length : 0; }

  function s1Forum() {
    var bullets = s1Bullets();
    var wc = wordCount(s1PostText());
    var band = wc >= 150 && wc <= 300 ? "ok" : "off";
    return '<div class="dos-card-head"><h3>Forum 1 post</h3><span class="wc-pill wc-' + band + '" id="s1-wordcount">' + wc + " words</span></div>" +
      '<p class="muted">A ready-to-paste draft built from your impacts. Aim for 150–300 words — expand the bullets and question before posting.</p>' +
      (bullets.length ? '<ul class="forum-bullets">' + bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" : '<p class="muted">Add impacts to generate the draft.</p>') +
      '<label class="dos-field" style="font-size:14px">Open question for peers' +
        '<textarea id="s1-question" rows="2">' + esc(s1Question()) + "</textarea></label>" +
      '<div class="form-actions"><button type="button" class="btn" data-s1-copy>Copy post</button>' +
      '<button type="button" class="btn ghost" data-s1-png>Download image (PNG)</button></div>';
  }

  function renderS1() {
    var readNote = rec.stakeholders.length
      ? '<p class="muted">Reading ' + rec.stakeholders.length + ' stakeholder' + (rec.stakeholders.length === 1 ? "" : "s") + ' from S0. Tag each impact with who cares.</p>'
      : '<p class="muted">Tip: add stakeholders in Station S0 to tag who cares about each impact.</p>';
    return '<div class="dos-card-head" style="margin-bottom:6px"><span></span>' + s1Pill() + "</div>" + readNote +
      '<section class="card" id="s1-add"><h3>Add an impact</h3>' +
        '<div class="s1-add-row"><select id="s1-domain" aria-label="Impact domain">' +
          DOMAINS.map(function (d) { return '<option value="' + d.id + '">' + esc(d.label) + "</option>"; }).join("") + "</select>" +
          '<input type="text" id="s1-label" placeholder="Name the impact, e.g. higher school attendance" aria-label="Impact description">' +
          '<button type="button" class="btn" data-s1-add>Add</button></div></section>' +
      '<h3 class="dos-h">Priority grid</h3><p class="muted">Each column is a relevance level. Drag a card between columns, or use a card\'s Relevance menu (keyboard-friendly).</p>' +
      '<div id="s1-grid">' + s1Grid() + "</div>" +
      '<section class="card forum-card" id="s1-forum">' + s1Forum() + "</section>" +
      '<p class="muted dos-feeds">What this feeds next: these priority impacts pre-load into the theory-of-change builder (S3) and guide which evidence you seek across the later stations.</p>';
  }

  function refreshS1() {
    rec.progress.S1 = s1Progress();
    var g = document.getElementById("s1-grid"); if (g) g.innerHTML = s1Grid();
    var f = document.getElementById("s1-forum"); if (f) f.innerHTML = s1Forum();
    var p = document.getElementById("s1-pill");
    if (p) { var st = rec.progress.S1; p.className = "dos-pill p-" + st; p.textContent = st === "done" ? UI.done : st === "in_progress" ? UI.inProgress : UI.notStarted; }
  }

  function s1SvgAndPng() {
    var pad = 20, colW = 300, headH = 70, rowH = 30, gap = 16;
    var cols = RELEVANCE.map(function (r) { return { r: r, items: rec.impacts.filter(function (i) { return i.relevance === r.v; }) }; });
    var maxRows = Math.max.apply(null, cols.map(function (c) { return c.items.length; }).concat([1]));
    var w = pad * 2 + colW * 3 + gap * 2, h = headH + maxRows * rowH + pad * 2 + 20;
    function xml(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" font-family="Arial, sans-serif">';
    svg += '<rect width="' + w + '" height="' + h + '" fill="#ffffff"/>';
    svg += '<text x="' + pad + '" y="30" font-size="18" font-weight="700" fill="#00558c">Impact explorer — ' + xml(rec.country.name || "my country") + "</text>";
    cols.forEach(function (c, ci) {
      var x = pad + ci * (colW + gap);
      svg += '<rect x="' + x + '" y="' + (headH - 26) + '" width="' + colW + '" height="26" rx="5" fill="#eef4f9"/>';
      svg += '<text x="' + (x + 10) + '" y="' + (headH - 8) + '" font-size="13" font-weight="700" fill="#13213b">' + xml(c.r.label) + " (" + c.items.length + ")</text>";
      c.items.forEach(function (im, ri) {
        var y = headH + ri * rowH;
        svg += '<rect x="' + x + '" y="' + (y + 4) + '" width="' + colW + '" height="' + (rowH - 6) + '" rx="5" fill="#f7fafc" stroke="#d9e2ef"/>';
        svg += '<circle cx="' + (x + 12) + '" cy="' + (y + 4 + (rowH - 6) / 2) + '" r="5" fill="hsl(' + domainHue(im.domain) + ',55%,45%)"/>';
        var txt = im.label.length > 40 ? im.label.slice(0, 39) + "…" : im.label;
        svg += '<text x="' + (x + 24) + '" y="' + (y + 4 + (rowH - 6) / 2 + 4) + '" font-size="12" fill="#13213b">' + xml(txt) + "</text>";
      });
    });
    svg += "</svg>";
    exportPng(svg, "impact-explorer-" + slug(rec.country.name) + ".png", w, h);
  }
  function exportPng(svgString, filename, w, h) {
    try {
      var img = new Image();
      var url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }));
      img.onload = function () {
        var canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (b) { if (b) download(filename, b, "image/png"); }, "image/png");
      };
      img.onerror = function () { URL.revokeObjectURL(url); alert("Could not render the image in this browser."); };
      img.src = url;
    } catch (e) { alert("Image export is not available in this browser."); }
  }

  function copyText(t, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); alert(okMsg); } catch (e) { alert("Copy failed — select the text manually."); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { alert(okMsg); }, fallback);
    } else fallback();
  }

  function wireS1() {
    var add = document.getElementById("s1-label");
    if (add) add.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); s1AddImpact(); } });
  }
  function s1AddImpact() {
    var d = document.getElementById("s1-domain"), l = document.getElementById("s1-label");
    if (!l || !l.value.trim()) { if (l) l.focus(); return; }
    rec.impacts.push({ id: uid("im"), domain: d.value, label: l.value.trim(), stakeholder_ids: [], relevance: 2, evidence_wanted: false, missed_in_video: false });
    save(); l.value = ""; refreshS1(); l.focus();
  }

  /* ---------- Shared station helpers ---------- */
  function computeProgress(id) {
    switch (id) {
      case "S0": return s0Progress();
      case "S1": return s1Progress();
      case "S2": return rec.schemes.length >= 3 ? "done" : rec.schemes.length ? "in_progress" : "not_started";
      case "S3": return (rec.toc.scheme_id && rec.toc.nodes.length >= 4) ? "done" : (rec.toc.nodes.length ? "in_progress" : "not_started");
      case "S4": return rec.indicators.length >= 3 ? "done" : rec.indicators.length ? "in_progress" : "not_started";
      case "S5": { var ans = (rec.survey.sp_questions || []).filter(function (q) { return q.present; }).length; return (rec.survey.name && ans >= 5) ? "done" : (rec.survey.name ? "in_progress" : "not_started"); }
      case "S6": return (rec.microsim.results && rec.microsim.results.headcount_after != null) ? "done" : "not_started";
      case "S7": return rec.ie_design.method ? "done" : (rec.ie_design.question ? "in_progress" : "not_started");
      case "S8": return rec.distribution.incidence.length >= 2 ? "done" : (rec.distribution.incidence.length ? "in_progress" : "not_started");
      case "S9": return rec.qual_design.outcomes.length >= 3 ? "done" : (rec.qual_design.outcomes.length ? "in_progress" : "not_started");
      case "S10": return rec.priorities.length >= 3 ? "done" : (rec.priorities.length ? "in_progress" : "not_started");
      case "S11": return rec.situation_room.first_choice ? "done" : (rec.situation_room.team ? "in_progress" : "not_started");
      case "S12": return rec.final.commitment ? "done" : ((rec.final.slide_outline && rec.final.slide_outline.length) ? "in_progress" : "not_started");
    }
    return rec.progress[id] || "not_started";
  }
  function progLabel(st) { return st === "done" ? UI.done : st === "in_progress" ? UI.inProgress : UI.notStarted; }
  function pillHtml(id) { var st = rec.progress[id]; return '<span class="dos-pill p-' + st + '" id="' + id + '-pill">' + esc(progLabel(st)) + "</span>"; }
  function setPill(id) {
    rec.progress[id] = computeProgress(id);
    var p = document.getElementById(id + "-pill");
    if (p) { var st = rec.progress[id]; p.className = "dos-pill p-" + st; p.textContent = progLabel(st); }
  }
  function headPill(id) { return '<div class="dos-card-head" style="margin-bottom:6px"><span></span>' + pillHtml(id) + "</div>"; }
  function selOpts(list, val, idKey, labelKey) {
    return list.map(function (o) { var v = idKey ? o[idKey] : o; var l = labelKey ? o[labelKey] : o; return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("");
  }

  // Generic forum card (used by S3, S6, S8, S10). S1 has its own.
  var FORUM_CTX = {};
  function forumStore(id) { if (!rec.forum[id]) rec.forum[id] = {}; return rec.forum[id]; }
  function forumQ(id, def) { var q = forumStore(id).question; return (q != null && q !== "") ? q : def; }
  function forumPost(id) { var c = FORUM_CTX[id] || { title: id, bullets: [], def: "" }; return c.title + "\n\n" + c.bullets.map(function (b) { return "• " + b; }).join("\n") + "\n\n" + forumQ(id, c.def); }
  function forumCard(id, title, bullets, def) {
    FORUM_CTX[id] = { title: title, bullets: bullets, def: def };
    var wc = wordCount(forumPost(id)), band = wc >= 150 && wc <= 300 ? "ok" : "off";
    return '<section class="card forum-card" id="' + id + '-forum"><div class="dos-card-head"><h3>' + esc(title) + '</h3><span class="wc-pill wc-' + band + '" id="' + id + '-wc">' + wc + " words</span></div>" +
      '<p class="muted">A ready-to-paste draft built from your work. Aim for 150–300 words — expand before posting.</p>' +
      (bullets.length ? '<ul class="forum-bullets">' + bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" : "") +
      '<label class="dos-field" style="font-size:14px">Open question / notes for peers<textarea data-forumq="' + id + '" rows="2">' + esc(forumQ(id, def)) + "</textarea></label>" +
      '<div class="form-actions"><button type="button" class="btn" data-forum-copy="' + id + '">Copy post</button></div></section>';
  }
  function updateForumWc(id) {
    var el = document.getElementById(id + "-wc"); if (!el) return;
    var wc = wordCount(forumPost(id)), band = wc >= 150 && wc <= 300 ? "ok" : "off";
    el.className = "wc-pill wc-" + band; el.textContent = wc + " words";
  }

  // CSV helpers (S2).
  function toCsv(rows) {
    return rows.map(function (r) { return r.map(function (c) { var s = c == null ? "" : String(c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(","); }).join("\r\n");
  }
  function parseCsv(text) {
    var rows = [], row = [], cur = "", q = false, i, ch;
    for (i = 0; i < text.length; i++) {
      ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (ch !== "\r") cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ""; }); });
  }

  // Inverse normal CDF (Acklam) for the microsimulation.
  function invNorm(p) {
    if (p <= 0) return -6; if (p >= 1) return 6;
    var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
    var b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
    var c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
    var d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
    var pl = 0.02425, ph = 1 - pl, qv, r;
    if (p < pl) { qv = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * qv + c[1]) * qv + c[2]) * qv + c[3]) * qv + c[4]) * qv + c[5]) / ((((d[0] * qv + d[1]) * qv + d[2]) * qv + d[3]) * qv + 1); }
    if (p <= ph) { qv = p - 0.5; r = qv * qv; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * qv / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    qv = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * qv + c[1]) * qv + c[2]) * qv + c[3]) * qv + c[4]) * qv + c[5]) / ((((d[0] * qv + d[1]) * qv + d[2]) * qv + d[3]) * qv + 1);
  }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gini(arr) {
    var a = arr.slice().sort(function (x, y) { return x - y; }), n = a.length, s = 0, cum = 0, tot = 0, i;
    for (i = 0; i < n; i++) tot += a[i];
    if (tot <= 0) return 0;
    for (i = 0; i < n; i++) { cum += a[i]; s += cum; }
    return Math.max(0, Math.min(1, (n + 1 - 2 * (s / tot)) / n));
  }

  /* ---------- Station S2: System map ---------- */
  function schemeRow(sc, i) {
    return '<div class="sch-row" data-scheme="' + sc.id + '">' +
      '<input type="text" data-model="schemes.' + i + '.name" value="' + esc(sc.name) + '" placeholder="Scheme name" aria-label="Scheme name">' +
      '<select data-model="schemes.' + i + '.function" aria-label="Function">' + selOpts(FUNCTIONS, sc.function, "id", "label") + "</select>" +
      '<select data-model="schemes.' + i + '.type" aria-label="Financing">' + selOpts(SCHEME_TYPES, sc.type, "id", "label") + "</select>" +
      '<input type="number" data-model="schemes.' + i + '.beneficiaries" value="' + (sc.beneficiaries == null ? "" : sc.beneficiaries) + '" placeholder="Beneficiaries" aria-label="Beneficiaries" inputmode="numeric">' +
      '<button type="button" class="imp-x" data-scheme-remove="' + sc.id + '" aria-label="Remove scheme">&times;</button></div>';
  }
  function s2Matrix() {
    var cols = [{ id: "contributory", label: "Contributory" }, { id: "non_contributory", label: "Non-contributory" }];
    return '<table class="dos-map s2-matrix"><thead><tr><th scope="col">Function</th>' + cols.map(function (c) { return '<th scope="col">' + c.label + "</th>"; }).join("") + "</tr></thead><tbody>" +
      FUNCTIONS.map(function (f) {
        var anywhere = rec.schemes.some(function (s) { return s.function === f.id; });
        return '<tr' + (anywhere ? "" : ' class="s2-gap-row"') + '><th scope="row">' + esc(f.label) + "</th>" + cols.map(function (c) {
          var list = rec.schemes.filter(function (s) { return s.function === f.id && (s.type === c.id || s.type === "mixed"); });
          return "<td" + (list.length ? "" : ' class="s2-gap"') + ">" + (list.length ? list.map(function (s) { return '<span class="chip">' + esc(s.name) + "</span>"; }).join(" ") : '<span class="s2-gaptxt">coverage gap</span>') + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
  }
  function renderS2() {
    return headPill("S2") +
      '<p class="muted">Inventory of social protection schemes, mirroring the ILO Social Security Inquiry. Empty life-cycle functions are flagged as coverage gaps.</p>' +
      '<section class="card"><div class="dos-card-head"><h3>Scheme inventory <span class="muted" style="font-weight:400">(' + rec.schemes.length + ')</span></h3>' +
        '<div class="dos-actions"><button type="button" class="btn ghost" data-s2-csv>Export CSV</button><label class="btn ghost dos-import">Import CSV<input type="file" accept=".csv,text/csv" hidden data-s2-import></label></div></div>' +
        '<div class="sch-head"><span>Name</span><span>Function</span><span>Financing</span><span>Beneficiaries</span><span></span></div>' +
        '<div id="s2-list">' + (rec.schemes.length ? rec.schemes.map(schemeRow).join("") : '<p class="muted">No schemes yet — add one below or import a CSV.</p>') + "</div>" +
        '<button type="button" class="btn" data-s2-add style="margin-top:10px">+ Add scheme</button></section>' +
      '<h3 class="dos-h">Life-cycle coverage matrix</h3><div class="dos-map-wrap" id="s2-matrix">' + s2Matrix() + "</div>" +
      '<p class="muted dos-feeds">What this feeds next: these schemes are selectable in the theory-of-change builder (S3), the indicator calculator (S4) and every later station.</p>';
  }
  function refreshS2() { var m = document.getElementById("s2-matrix"); if (m) m.innerHTML = s2Matrix(); setPill("S2"); }
  function refreshS2List() { var l = document.getElementById("s2-list"); if (l) l.innerHTML = rec.schemes.length ? rec.schemes.map(schemeRow).join("") : '<p class="muted">No schemes yet — add one below or import a CSV.</p>'; refreshS2(); }
  function s2AddScheme() { rec.schemes.push({ id: uid("sc"), name: "", function: "children", type: "non_contributory", benefit_type: "cash", beneficiaries: null, benefit_amount: null, frequency: "monthly", administrator: "", legal_basis: "", eligibility: "", year: rec.country.data_year || null, source: "" }); save(); refreshS2List(); }
  var S2_CSV_COLS = ["id", "name", "function", "type", "benefit_type", "beneficiaries", "benefit_amount", "frequency", "administrator", "legal_basis", "eligibility", "year", "source"];
  function s2ExportCsv() {
    var rows = [S2_CSV_COLS].concat(rec.schemes.map(function (s) { return S2_CSV_COLS.map(function (c) { return s[c]; }); }));
    download("schemes-" + slug(rec.country.name) + ".csv", toCsv(rows), "text/csv");
  }
  function s2ImportCsv(text) {
    var rows = parseCsv(text); if (!rows.length) return;
    var head = rows[0].map(function (h) { return h.trim(); }), idx = {};
    S2_CSV_COLS.forEach(function (c) { idx[c] = head.indexOf(c); });
    var out = rows.slice(1).map(function (r) {
      var o = { id: uid("sc") };
      S2_CSV_COLS.forEach(function (c) { if (idx[c] >= 0) { var v = r[idx[c]]; o[c] = (c === "beneficiaries" || c === "benefit_amount" || c === "year") ? (v === "" || v == null ? null : Number(v)) : v; } });
      if (!o.id) o.id = uid("sc");
      return o;
    });
    if (out.length) { rec.schemes = out; save(); refreshS2List(); }
  }

  /* ---------- Station S3: Theory of change builder ---------- */
  function tocNodeCard(nd, i) {
    return '<div class="toc-node" data-node="' + nd.id + '">' +
      '<div class="toc-node-top"><input type="text" data-model="toc.nodes.' + i + '.label" value="' + esc(nd.label) + '" placeholder="Describe this step" aria-label="Node label">' +
      '<button type="button" class="imp-x" data-node-remove="' + nd.id + '" aria-label="Remove node">&times;</button></div>' +
      '<input type="text" class="toc-sub" data-model="toc.nodes.' + i + '.indicator" value="' + esc(nd.indicator || "") + '" placeholder="Indicator" aria-label="Indicator">' +
      '<input type="text" class="toc-sub" data-model="toc.nodes.' + i + '.data_source" value="' + esc(nd.data_source || "") + '" placeholder="Data source" aria-label="Data source"></div>';
  }
  function s3Columns() {
    return '<div class="toc-grid">' + TOC_LEVELS.map(function (lv) {
      var nodes = rec.toc.nodes.map(function (n, i) { return { n: n, i: i }; }).filter(function (x) { return x.n.level === lv.id; });
      return '<div class="toc-col"><div class="toc-col-head">' + esc(lv.label) + "</div>" +
        nodes.map(function (x) { return tocNodeCard(x.n, x.i); }).join("") +
        '<button type="button" class="btn ghost toc-add" data-toc-add="' + lv.id + '">+ Add</button></div>';
    }).join("") + "</div>";
  }
  function s3Links() {
    if (!rec.toc.links.length) return '<p class="muted" style="margin:0">No links yet. Connect nodes to show the pathway.</p>';
    var byId = {}; rec.toc.nodes.forEach(function (n) { byId[n.id] = n; });
    return rec.toc.links.map(function (l, i) {
      var a = byId[l.from], b = byId[l.to];
      return '<span class="toc-link">' + esc(a ? a.label || "?" : "?") + " → " + esc(b ? b.label || "?" : "?") +
        '<button type="button" class="dos-chip-x" data-link-remove="' + i + '" aria-label="Remove link">&times;</button></span>';
    }).join("");
  }
  function s3Bullets() {
    var sc = schemeById(rec.toc.scheme_id);
    var out = [];
    if (sc) out.push("Scheme: " + sc.name + " (" + funcLabel(sc.function) + ")");
    TOC_LEVELS.forEach(function (lv) {
      var ns = rec.toc.nodes.filter(function (n) { return n.level === lv.id; });
      if (ns.length) out.push(lv.label + ": " + ns.map(function (n) { return n.label || "(unnamed)"; }).join("; "));
    });
    var srcs = rec.toc.nodes.map(function (n) { return n.data_source; }).filter(Boolean);
    if (srcs.length) out.push("Key data sources: " + srcs.filter(function (v, i, s) { return s.indexOf(v) === i; }).join(", "));
    return out;
  }
  function schemeById(id) { for (var i = 0; i < rec.schemes.length; i++) if (rec.schemes[i].id === id) return rec.schemes[i]; return null; }
  function renderS3() {
    var nodeOpts = rec.toc.nodes.map(function (n) { return '<option value="' + n.id + '">' + esc((n.label || "(unnamed)").slice(0, 30)) + "</option>"; }).join("");
    var hasImpactNodes = rec.toc.nodes.some(function (n) { return n.level === "impact"; });
    return headPill("S3") +
      '<section class="card"><h3>Choose a scheme</h3><div class="s1-add-row">' +
        '<select data-model="toc.scheme_id" aria-label="Scheme"><option value="">Choose a scheme…</option>' +
        rec.schemes.map(function (s) { return '<option value="' + s.id + '"' + (rec.toc.scheme_id === s.id ? " selected" : "") + ">" + esc(s.name) + "</option>"; }).join("") + "</select>" +
        (rec.impacts.length && !hasImpactNodes ? '<button type="button" class="btn ghost" data-s3-preload>Pre-load priority impacts from S1</button>' : "") + "</div></section>" +
      '<h3 class="dos-h">Pathway</h3><p class="muted">Add nodes in each column; give each an indicator and a data source. Then link them to show the pathway.</p>' +
      '<div id="s3-grid">' + s3Columns() + "</div>" +
      '<section class="card" style="margin-top:14px"><h3>Links</h3><div class="s1-add-row"><select id="s3-from" aria-label="Link from">' + nodeOpts + "</select>" +
        '<span aria-hidden="true">→</span><select id="s3-to" aria-label="Link to">' + nodeOpts + '</select><button type="button" class="btn" data-s3-addlink>Add link</button></div>' +
        '<div class="toc-links" id="s3-links">' + s3Links() + "</div></section>" +
      '<div class="form-actions"><button type="button" class="btn ghost" data-s3-png>Download theory of change (PNG)</button></div>' +
      forumCard("S3", "Forum 2 post — theory of change", s3Bullets(), "Which sources of data will be most useful for measuring the outputs, outcomes and impacts of " + (schemeById(rec.toc.scheme_id) ? schemeById(rec.toc.scheme_id).name : "this scheme") + "?") +
      '<p class="muted dos-feeds">What this feeds next: outcome nodes drive the qualitative design (S9); the whole pathway anchors the national plan (S12).</p>';
  }
  function refreshS3Grid() { var g = document.getElementById("s3-grid"); if (g) g.innerHTML = s3Columns(); refreshS3Links(); refreshS3Forum(); setPill("S3"); }
  function refreshS3Links() { var l = document.getElementById("s3-links"); if (l) l.innerHTML = s3Links(); }
  function refreshS3Forum() { var f = document.getElementById("S3-forum"); if (f) f.outerHTML = forumCard("S3", "Forum 2 post — theory of change", s3Bullets(), forumQ("S3", "")); }
  function s3AddNode(level) { rec.toc.nodes.push({ id: uid("n"), level: level, label: "", indicator: "", data_source: "" }); save(); refreshS3Grid(); }
  function s3Preload() {
    var order = { 3: 0, 2: 1, 1: 2 };
    rec.impacts.slice().sort(function (a, b) { return order[a.relevance] - order[b.relevance]; }).forEach(function (im) {
      rec.toc.nodes.push({ id: uid("n"), level: "impact", label: im.label, indicator: "", data_source: "", impact_id: im.id });
    });
    save(); go("station", "S3");
  }
  function s3Png() {
    var pad = 20, colW = 220, gap = 14, headH = 60, rowH = 44;
    var cols = TOC_LEVELS.map(function (lv) { return { lv: lv, items: rec.toc.nodes.filter(function (n) { return n.level === lv.id; }) }; });
    var maxRows = Math.max.apply(null, cols.map(function (c) { return c.items.length; }).concat([1]));
    var w = pad * 2 + colW * 4 + gap * 3, h = headH + maxRows * rowH + pad * 2 + 10;
    function xe(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" font-family="Arial, sans-serif"><rect width="' + w + '" height="' + h + '" fill="#ffffff"/>';
    var sc = schemeById(rec.toc.scheme_id);
    svg += '<text x="' + pad + '" y="28" font-size="17" font-weight="700" fill="#00558c">Theory of change — ' + xe(sc ? sc.name : rec.country.name || "") + "</text>";
    cols.forEach(function (c, ci) {
      var x = pad + ci * (colW + gap);
      svg += '<rect x="' + x + '" y="' + (headH - 24) + '" width="' + colW + '" height="24" rx="5" fill="#00558c"/><text x="' + (x + 10) + '" y="' + (headH - 7) + '" font-size="12" font-weight="700" fill="#ffffff">' + xe(c.lv.label) + "</text>";
      c.items.forEach(function (n, ri) {
        var y = headH + ri * rowH;
        svg += '<rect x="' + x + '" y="' + (y + 4) + '" width="' + colW + '" height="' + (rowH - 8) + '" rx="6" fill="#eef4f9" stroke="#d9e2ef"/>';
        var t = (n.label || "").slice(0, 30);
        svg += '<text x="' + (x + 8) + '" y="' + (y + 22) + '" font-size="11" fill="#13213b">' + xe(t) + "</text>";
        if (n.data_source) svg += '<text x="' + (x + 8) + '" y="' + (y + 34) + '" font-size="9" fill="#5b6a82">' + xe(n.data_source.slice(0, 34)) + "</text>";
      });
    });
    svg += "</svg>";
    exportPng(svg, "theory-of-change-" + slug(rec.country.name) + ".png", w, h);
  }

  /* ---------- Station S4: Indicator calculator ---------- */
  function indRate(ind) { if (ind.denominator == null || ind.denominator === 0 || ind.numerator == null) return null; return Math.round(ind.numerator / ind.denominator * 1000) / 10; }
  function indRow(ind, i) {
    var r = indRate(ind);
    var flag = ind.denominator == null || ind.denominator === "" ? "no denominator" : (r != null && r > 100 ? "rate > 100%" : "");
    return '<div class="ind-row" data-ind="' + ind.id + '">' +
      '<input type="text" data-model="indicators.' + i + '.name" value="' + esc(ind.name) + '" placeholder="Indicator name" aria-label="Indicator name">' +
      '<select data-model="indicators.' + i + '.type" aria-label="Type">' + selOpts([{ id: "coverage", label: "Coverage" }, { id: "adequacy", label: "Adequacy" }, { id: "other", label: "Other" }], ind.type, "id", "label") + "</select>" +
      '<input type="number" data-model="indicators.' + i + '.numerator" value="' + (ind.numerator == null ? "" : ind.numerator) + '" placeholder="Numerator" aria-label="Numerator" inputmode="numeric">' +
      '<input type="number" data-model="indicators.' + i + '.denominator" value="' + (ind.denominator == null ? "" : ind.denominator) + '" placeholder="Denominator" aria-label="Denominator" inputmode="numeric">' +
      '<span class="ind-rate" id="ind-rate-' + ind.id + '">' + (r == null ? "—" : r + "%") + (flag ? ' <b class="ind-flag">' + flag + "</b>" : "") + "</span>" +
      '<button type="button" class="imp-x" data-ind-remove="' + ind.id + '" aria-label="Remove indicator">&times;</button></div>';
  }
  function s4Chart() {
    var cov = rec.indicators.filter(function (i) { return i.type === "coverage" && indRate(i) != null; });
    if (!cov.length) return '<p class="muted">Add coverage indicators to see the chart.</p>';
    var bench = 100;
    return '<div class="s4-bars">' + cov.map(function (i) {
      var r = Math.min(100, indRate(i));
      return '<div class="hbar"><span class="hbar-label" title="' + esc(i.name) + '">' + esc(i.name) + '</span><span class="hbar-track"><i style="width:' + r + '%"></i></span><span class="hbar-val">' + indRate(i) + "%</span></div>";
    }).join("") + '<div class="s4-bench">Benchmark line at ' + bench + "%</div></div>";
  }
  function renderS4() {
    return headPill("S4") +
      '<p class="muted">Compute coverage and adequacy rates. Coverage = beneficiaries ÷ reference population; adequacy = benefit ÷ poverty line or average wage.</p>' +
      '<section class="card"><div class="sch-head ind-head"><span>Indicator</span><span>Type</span><span>Numerator</span><span>Denominator</span><span>Rate</span><span></span></div>' +
        '<div id="s4-list">' + (rec.indicators.length ? rec.indicators.map(indRow).join("") : '<p class="muted">No indicators yet — add one below.</p>') + "</div>" +
        '<button type="button" class="btn" data-s4-add style="margin-top:10px">+ Add indicator</button></section>' +
      '<h3 class="dos-h">Coverage by indicator</h3><div class="card" id="s4-chart">' + s4Chart() + "</div>" +
      '<div class="form-actions"><button type="button" class="btn ghost" data-s4-png>Download chart (PNG)</button></div>' +
      '<p class="muted dos-feeds">What this feeds next: these rates fill the <b>Admin data</b> column of the Evidence Map and anchor "what we know" in the national plan (S12).</p>';
  }
  function refreshS4() {
    rec.indicators.forEach(function (ind) {
      var el = document.getElementById("ind-rate-" + ind.id);
      if (el) { var r = indRate(ind); var flag = ind.denominator == null || ind.denominator === "" ? "no denominator" : (r != null && r > 100 ? "rate > 100%" : ""); el.innerHTML = (r == null ? "—" : r + "%") + (flag ? ' <b class="ind-flag">' + flag + "</b>" : ""); }
    });
    var c = document.getElementById("s4-chart"); if (c) c.innerHTML = s4Chart();
    s4WriteEvidence(); setPill("S4");
  }
  function refreshS4List() { var l = document.getElementById("s4-list"); if (l) l.innerHTML = rec.indicators.length ? rec.indicators.map(indRow).join("") : '<p class="muted">No indicators yet — add one below.</p>'; refreshS4(); }
  function s4AddIndicator() { rec.indicators.push({ id: uid("ind"), name: "", scheme_ids: [], numerator: null, denominator: null, denominator_label: "", rate: null, type: "coverage", benchmark: 100, source: "", year: rec.country.data_year || null }); save(); refreshS4List(); }
  function s4WriteEvidence() {
    var cov = rec.indicators.filter(function (i) { return i.type === "coverage" && indRate(i) != null; });
    if (cov.length) setCell("output", "admin", "green", cov.length + " coverage indicator" + (cov.length === 1 ? "" : "s") + " computed (admin data)");
    var agg = rec.indicators.filter(function (i) { return /aggregate|1\.3\.1|at least one/i.test(i.name) && indRate(i) != null; })[0];
    if (agg) setCell("outcome", "admin", "green", "Effective coverage; SDG 1.3.1 = " + indRate(agg) + "%");
  }
  function s4Png() {
    var cov = rec.indicators.filter(function (i) { return i.type === "coverage" && indRate(i) != null; });
    var pad = 20, rowH = 26, labelW = 250, barW = 360, w = pad * 2 + labelW + barW + 60, h = pad * 2 + 30 + Math.max(1, cov.length) * rowH;
    function xe(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" font-family="Arial, sans-serif"><rect width="' + w + '" height="' + h + '" fill="#ffffff"/>';
    svg += '<text x="' + pad + '" y="24" font-size="15" font-weight="700" fill="#00558c">Coverage by indicator — ' + xe(rec.country.name || "") + "</text>";
    cov.forEach(function (i, ri) {
      var y = pad + 34 + ri * rowH, r = Math.min(100, indRate(i));
      svg += '<text x="' + pad + '" y="' + (y + 12) + '" font-size="11" fill="#13213b">' + xe(i.name.slice(0, 38)) + "</text>";
      svg += '<rect x="' + (pad + labelW) + '" y="' + y + '" width="' + barW + '" height="15" rx="3" fill="#eef4f9"/>';
      svg += '<rect x="' + (pad + labelW) + '" y="' + y + '" width="' + (barW * r / 100) + '" height="15" rx="3" fill="#00558c"/>';
      svg += '<text x="' + (pad + labelW + barW + 6) + '" y="' + (y + 12) + '" font-size="11" fill="#13213b">' + indRate(i) + "%</text>";
    });
    svg += '<line x1="' + (pad + labelW + barW) + '" y1="' + (pad + 30) + '" x2="' + (pad + labelW + barW) + '" y2="' + (h - pad) + '" stroke="#d24a38" stroke-dasharray="3 3"/></svg>';
    exportPng(svg, "coverage-" + slug(rec.country.name) + ".png", w, h);
  }

  /* ---------- Station S5: Survey scanner ---------- */
  var SURVEY_TOPICS = ["Receipt by scheme", "Amount received", "Contributions paid", "Informal work", "Disability", "Shocks", "Access barriers"];
  function ensureSurveyTopics() {
    if (!Array.isArray(rec.survey.sp_questions)) rec.survey.sp_questions = [];
    SURVEY_TOPICS.forEach(function (t) {
      if (!rec.survey.sp_questions.some(function (q) { return q.topic === t; })) rec.survey.sp_questions.push({ topic: t, present: "", note: "" });
    });
  }
  function s5GapScore() { return rec.survey.sp_questions.filter(function (q) { return q.present && q.present !== "yes"; }).length; }
  function renderS5() {
    ensureSurveyTopics();
    var presOpts = [{ id: "", label: "—" }, { id: "yes", label: "Yes" }, { id: "partial", label: "Partial" }, { id: "no", label: "No" }];
    return headPill("S5") +
      '<p class="muted">Assess whether the national household survey can measure social protection impacts.</p>' +
      '<section class="card"><h3>Survey metadata</h3><div class="dos-grid">' +
        '<label class="dos-field">Survey name<input type="text" data-model="survey.name" value="' + esc(rec.survey.name || "") + '"></label>' +
        '<label class="dos-field">Year<input type="number" data-model="survey.year" value="' + (rec.survey.year == null ? "" : rec.survey.year) + '"></label>' +
        '<label class="dos-field">Agency<input type="text" data-model="survey.agency" value="' + esc(rec.survey.agency || "") + '"></label>' +
        '<label class="dos-field">Welfare measure<select data-model="survey.welfare_measure">' + selOpts([{ id: "", label: "—" }, { id: "consumption", label: "Consumption" }, { id: "income", label: "Income" }], rec.survey.welfare_measure, "id", "label") + "</select></label>" +
        '<label class="dos-field">Poverty line type<input type="text" data-model="survey.poverty_line_type" value="' + esc(rec.survey.poverty_line_type || "") + '" placeholder="national / international"></label>' +
      "</div></section>" +
      '<section class="card"><div class="dos-card-head"><h3>Social-protection question checklist</h3><span class="dos-pill" id="s5-gap">Gap score: ' + s5GapScore() + "</span></div>" +
        '<div class="s5-checklist">' + rec.survey.sp_questions.map(function (q, i) {
          return '<div class="s5-q"><span class="s5-topic">' + esc(q.topic) + "</span>" +
            '<select data-model="survey.sp_questions.' + i + '.present" data-s5-present aria-label="' + esc(q.topic) + ' present">' + selOpts(presOpts, q.present, "id", "label") + "</select>" +
            '<input type="text" data-model="survey.sp_questions.' + i + '.note" value="' + esc(q.note || "") + '" placeholder="Note" aria-label="Note"></div>';
        }).join("") + "</div></section>" +
      '<section class="card"><h3>Poverty measurement note</h3><textarea class="dos-full" data-model="survey.poverty_note" rows="3" placeholder="How does the survey measure poverty? Welfare aggregate, equivalence scale, poverty line…">' + esc(rec.survey.poverty_note || "") + "</textarea></section>" +
      '<p class="muted dos-feeds">What this feeds next: the gap score and notes fill the <b>Household survey</b> column of the Evidence Map and the survey proposal in S12.</p>';
  }
  function s5WriteEvidence() {
    if (!rec.survey.name) return;
    var gap = s5GapScore();
    var st = gap === 0 ? "green" : gap <= 3 ? "amber" : "red";
    setCell("outcome", "survey", st, rec.survey.name + (rec.survey.year ? " " + rec.survey.year : "") + " — " + gap + " question gap" + (gap === 1 ? "" : "s"));
  }
  function refreshS5() {
    var g = document.getElementById("s5-gap"); if (g) g.textContent = "Gap score: " + s5GapScore();
    s5WriteEvidence(); setPill("S5");
  }

  /* ---------- Station S6: Microsimulation sandbox ---------- */
  function simDefaults() {
    var p = rec.microsim.params || {};
    return {
      child_benefit: p.child_benefit != null && p.child_benefit <= 100 ? p.child_benefit : 40,
      pension: p.pension != null && p.pension <= 100 ? p.pension : 80,
      disability: p.disability != null && p.disability <= 100 ? p.disability : 50,
      child_cov: p.child_cov != null ? p.child_cov : 66,
      pension_cov: p.pension_cov != null ? p.pension_cov : 85,
      disab_cov: p.disab_cov != null ? p.disab_cov : 66,
      seed: p.seed || 12345
    };
  }
  function runSim() {
    var N = 2000, p = simDefaults();
    var pr = Math.max(0.01, Math.min(0.9, (rec.country.poverty_rate || 20) / 100));
    var sigma = 0.6, mu = -sigma * invNorm(pr); // line = 1.0, baseline headcount ≈ pr
    var rnd = mulberry32(p.seed), z, inc, before = [], after = [], totT = 0, totInc = 0;
    for (var k = 0; k < N; k++) {
      z = invNorm(rnd());
      inc = Math.exp(mu + sigma * z);
      var hasChild = rnd() < 0.45, hasEld = rnd() < 0.18, hasDis = rnd() < 0.06;
      var t = 0;
      if (hasChild && rnd() < p.child_cov / 100) t += p.child_benefit / 100;
      if (hasEld && rnd() < p.pension_cov / 100) t += p.pension / 100;
      if (hasDis && rnd() < p.disab_cov / 100) t += p.disability / 100;
      before.push(inc); after.push(inc + t); totT += t; totInc += inc;
    }
    function headcount(a) { return a.filter(function (x) { return x < 1; }).length / a.length * 100; }
    function gap(a) { var s = 0; a.forEach(function (x) { if (x < 1) s += (1 - x); }); return s / a.length * 100; }
    var res = {
      headcount_before: Math.round(headcount(before) * 10) / 10, headcount_after: Math.round(headcount(after) * 10) / 10,
      gap_before: Math.round(gap(before) * 10) / 10, gap_after: Math.round(gap(after) * 10) / 10,
      gini_before: Math.round(gini(before) * 1000) / 1000, gini_after: Math.round(gini(after) * 1000) / 1000,
      cost_pct_gdp: Math.round((totT / totInc) * 60 * 10) / 10
    };
    rec.microsim.params = p; rec.microsim.results = res;
    save();
    return res;
  }
  function s6Results() {
    var r = rec.microsim.results || {};
    var rows = [
      ["Poverty headcount", r.headcount_before + "%", r.headcount_after + "%"],
      ["Poverty gap", r.gap_before + "%", r.gap_after + "%"],
      ["Gini", r.gini_before, r.gini_after],
      ["Cost (illustrative)", "", r.cost_pct_gdp + "% of GDP"]
    ];
    return '<table class="sim-table"><thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead><tbody>' +
      rows.map(function (x) { return "<tr><th scope=\"row\">" + x[0] + "</th><td>" + x[1] + "</td><td><b>" + x[2] + "</b></td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="sim-illus">' + esc(UI.illustrative) + "</p>";
  }
  function slider(key, label, min, max, unit) {
    var p = simDefaults();
    return '<label class="sim-slider">' + esc(label) + ' <b id="sim-' + key + '-v">' + p[key] + esc(unit) + "</b>" +
      '<input type="range" min="' + min + '" max="' + max + '" value="' + p[key] + '" data-sim="' + key + '"></label>';
  }
  function renderS6() {
    if (!rec.microsim.results || rec.microsim.results.headcount_after == null) runSim();
    return headPill("S6") +
      '<p class="muted">A stylised model of 2,000 households, calibrated to your poverty rate (' + (rec.country.poverty_rate || "—") + '%). Move the sliders to see the effect of benefit changes.</p>' +
      '<div class="sim-grid"><section class="card"><h3>Benefit parameters</h3>' +
        '<p class="muted" style="font-size:13px">Benefit levels as % of the poverty line; coverage as % of the eligible group.</p>' +
        slider("child_benefit", "Child benefit level", 0, 100, "%") + slider("child_cov", "Child benefit coverage", 0, 100, "%") +
        slider("pension", "Old-age pension level", 0, 100, "%") + slider("pension_cov", "Pension coverage", 0, 100, "%") +
        slider("disability", "Disability benefit level", 0, 100, "%") + slider("disab_cov", "Disability coverage", 0, 100, "%") +
        '<button type="button" class="btn ghost" data-s6-regen style="margin-top:8px">Regenerate population</button></section>' +
      '<section class="card"><h3>Results</h3><div id="s6-results">' + s6Results() + "</div>" +
        '<p class="muted" style="font-size:13px;margin-top:8px">For a richer Asia-Pacific model, try the <a href="https://www.unescap.org/kp/2021/social-protection-simulator" target="_blank" rel="noopener">UN ESCAP simulation tool ↗</a>.</p></section></div>' +
      '<section class="card"><h3>Interpretation</h3><textarea class="dos-full" data-model="microsim.interpretation" rows="3" placeholder="What drives the result? What would a dynamic model add?">' + esc(rec.microsim.interpretation || "") + "</textarea></section>" +
      forumCard("S6", "Forum 3 post — microsimulation", s6Bullets(), "What would you like to explore with a more dynamic microsimulation?") +
      '<p class="muted dos-feeds">What this feeds next: the headcount change fills the <b>Microsimulation</b> column of the Evidence Map and the microsimulation proposal in S12.</p>';
  }
  function s6Bullets() {
    var r = rec.microsim.results || {};
    return [
      "Simulated package: child, old-age and disability benefits on a stylised 2,000-household population.",
      "Poverty headcount moves from " + r.headcount_before + "% to " + r.headcount_after + "% (illustrative).",
      "Gini moves from " + r.gini_before + " to " + r.gini_after + "; cost about " + r.cost_pct_gdp + "% of GDP.",
      "Note: illustrative — based on your inputs, not an official estimate."
    ];
  }
  function refreshS6() {
    var r = runSim();
    var box = document.getElementById("s6-results"); if (box) box.innerHTML = s6Results();
    setCell("impact", "microsim", "amber", "Illustrative microsim: headcount " + r.headcount_before + "% → " + r.headcount_after + "%");
    refreshS6Forum(); setPill("S6");
  }
  function refreshS6Forum() { var f = document.getElementById("S6-forum"); if (f) f.outerHTML = forumCard("S6", "Forum 3 post — microsimulation", s6Bullets(), forumQ("S6", "")); }

  /* ---------- Station S7: IE design studio ---------- */
  function ie() { return rec.ie_design; }
  function s7Recommend() {
    var tree = ie().tree || {};
    for (var i = 0; i < IE_TREE.length; i++) { if (tree[i] === "yes") return IE_TREE[i].method; }
    var anyAnswered = IE_TREE.some(function (_, i) { return tree[i]; });
    return anyAnswered ? "None" : null;
  }
  function s7RecoCard() {
    var m = s7Recommend();
    if (!m) return '<p class="muted">Answer the questions to get a recommended method.</p>';
    var info = IE_METHODS[m];
    return '<div class="reco"><div class="reco-top"><span class="reco-badge">Recommended</span><b>' + esc(info.label) + "</b>" +
      (m !== "None" ? '<button type="button" class="btn ghost" data-ie-use="' + m + '">Use this method</button>' : "") + "</div>" +
      "<p><b>Key assumption:</b> " + esc(info.assumption) + "</p>" +
      "<p><b>Main threats:</b> " + esc(info.threats.join("; ")) + "</p></div>";
  }
  function renderS7() {
    var tree = ie().tree || {};
    var yn = [{ id: "", label: "—" }, { id: "yes", label: "Yes" }, { id: "no", label: "No" }];
    var nodes = rec.toc.nodes.filter(function (n) { return n.level === "outcome" || n.level === "impact"; });
    return headPill("S7") +
      '<section class="card"><h3>Which scheme?</h3><select data-model="ie_design.scheme_id" aria-label="Scheme"><option value="">Choose a scheme…</option>' +
        rec.schemes.map(function (s) { return '<option value="' + s.id + '"' + (ie().scheme_id === s.id ? " selected" : "") + ">" + esc(s.name) + "</option>"; }).join("") + "</select></section>" +
      '<section class="card"><h3>Decision tree</h3>' + IE_TREE.map(function (q, i) {
        return '<div class="ie-q"><span>' + esc(q.q) + '</span><select data-model="ie_design.tree.' + i + '" data-ie-tree aria-label="' + esc(q.q) + '">' + selOpts(yn, tree[i], "id", "label") + "</select></div>";
      }).join("") + '<div id="s7-reco">' + s7RecoCard() + "</div></section>" +
      '<section class="card"><h3>Design canvas</h3><div class="dos-grid">' +
        '<label class="dos-field">Research question<input type="text" data-model="ie_design.question" value="' + esc(ie().question || "") + '"></label>' +
        '<label class="dos-field">Counterfactual<input type="text" data-model="ie_design.counterfactual" value="' + esc(ie().counterfactual || "") + '"></label>' +
        '<label class="dos-field">Data<input type="text" data-model="ie_design.data" value="' + esc(ie().data || "") + '"></label>' +
        '<label class="dos-field">Sample<input type="text" data-model="ie_design.sample" value="' + esc(ie().sample || "") + '"></label>' +
      "</div>" +
        '<label class="dos-field" style="margin-top:10px">Key assumption<input type="text" data-model="ie_design.key_assumption" value="' + esc(ie().key_assumption || "") + '"></label>' +
        '<label class="dos-field" style="margin-top:10px">Ethics<input type="text" data-model="ie_design.ethics" value="' + esc(ie().ethics || "") + '"></label>' +
        '<div class="ie-nodes"><span class="muted">Link to theory-of-change nodes:</span>' +
          (nodes.length ? nodes.map(function (n) { var on = (ie().toc_node_ids || []).indexOf(n.id) >= 0; return '<button type="button" class="imp-stake" data-ie-node="' + n.id + '" aria-pressed="' + on + '">' + esc((n.label || "node").slice(0, 28)) + "</button>"; }).join("") : '<span class="muted"> build a theory of change in S3 first.</span>') +
        "</div></section>" +
      '<p class="muted dos-feeds">What this feeds next: the chosen method fills the <b>Impact evaluation</b> column of the Evidence Map and the IE proposal in S12.</p>';
  }
  function refreshS7() {
    var r = document.getElementById("s7-reco"); if (r) r.innerHTML = s7RecoCard();
    if (ie().method) setCell("impact", "ie", "amber", "IE design: " + (IE_METHODS[ie().method] ? IE_METHODS[ie().method].label : ie().method) + " proposed");
    setPill("S7");
  }

  /* ---------- Station S8: Who gets what ---------- */
  var S8_QUESTIONS = ["Who receives the largest share of benefits?", "How progressive is each scheme?", "How do benefits, taxes and contributions net out by group?", "Which groups are under-covered relative to their need?"];
  var S8_METHODS = ["Benefit incidence analysis", "Fiscal incidence (CEQ) analysis", "Marginal incidence analysis", "Concentration curves"];
  function s8Chart() {
    var inc = rec.distribution.incidence;
    if (!inc.length) return '<p class="muted">Add incidence rows to see the chart.</p>';
    return '<div class="s8-bars">' + inc.map(function (d) {
      var b = Math.max(0, Math.min(100, d.share_of_benefits || 0)), p = Math.max(0, Math.min(100, d.share_of_population || 0));
      return '<div class="s8-row"><span class="s8-g">' + esc(d.group || "") + "</span>" +
        '<span class="s8-pair"><span class="s8-bar b"><i style="width:' + b + '%"></i></span><span class="s8-bar p"><i style="width:' + p + '%"></i></span></span>' +
        '<span class="s8-val">' + b + "% / " + p + "%</span></div>";
    }).join("") + '<p class="s8-legend"><span class="s8-key b"></span> share of benefits &nbsp; <span class="s8-key p"></span> share of population</p></div>';
  }
  function incRow(d, i) {
    return '<div class="inc-row" data-inc="' + i + '"><input type="text" data-model="distribution.incidence.' + i + '.group" value="' + esc(d.group || "") + '" placeholder="Group" aria-label="Group">' +
      '<input type="number" data-model="distribution.incidence.' + i + '.share_of_benefits" value="' + (d.share_of_benefits == null ? "" : d.share_of_benefits) + '" placeholder="% benefits" aria-label="Share of benefits">' +
      '<input type="number" data-model="distribution.incidence.' + i + '.share_of_population" value="' + (d.share_of_population == null ? "" : d.share_of_population) + '" placeholder="% population" aria-label="Share of population">' +
      '<button type="button" class="imp-x" data-inc-remove="' + i + '" aria-label="Remove row">&times;</button></div>';
  }
  function renderS8() {
    return headPill("S8") +
      '<p class="muted">Who gets what: the share of benefits versus the share of the population, by group.</p>' +
      '<section class="card"><div class="dos-card-head"><h3>Incidence table</h3><div class="dos-actions">' +
        '<button type="button" class="btn ghost" data-s8-preset="quintile">+ Quintiles</button><button type="button" class="btn ghost" data-s8-preset="sex">+ Sex</button><button type="button" class="btn ghost" data-s8-preset="area">+ Urban/rural</button></div></div>' +
        '<div class="sch-head inc-head"><span>Group</span><span>% benefits</span><span>% population</span><span></span></div>' +
        '<div id="s8-list">' + (rec.distribution.incidence.length ? rec.distribution.incidence.map(incRow).join("") : '<p class="muted">No rows yet — add a preset above or a single row below.</p>') + "</div>" +
        '<button type="button" class="btn" data-s8-addrow style="margin-top:10px">+ Add row</button></section>' +
      '<div class="card" id="s8-chart">' + s8Chart() + "</div>" +
      '<section class="card"><h3>Question bank</h3><div class="q-bank">' + S8_QUESTIONS.map(function (q) {
        var on = (rec.distribution.questions || []).indexOf(q) >= 0; return '<button type="button" class="imp-flag' + (on ? " on" : "") + '" data-s8-q="' + esc(q) + '" aria-pressed="' + on + '">' + esc(q) + "</button>";
      }).join("") + "</div></section>" +
      '<section class="card"><h3>Methods</h3><div class="q-bank">' + S8_METHODS.map(function (m) {
        var on = (rec.distribution.methods || []).indexOf(m) >= 0; return '<button type="button" class="imp-flag' + (on ? " on" : "") + '" data-s8-method="' + esc(m) + '" aria-pressed="' + on + '">' + esc(m) + "</button>";
      }).join("") + "</div></section>" +
      forumCard("S8", "Forum 4 post — distributional impact", s8Bullets(), "What methods or data would you use to understand who gets what in " + (rec.country.name || "your country") + "?") +
      '<p class="muted dos-feeds">What this feeds next: the incidence table fills the <b>Distributional</b> column of the Evidence Map.</p>';
  }
  function s8Bullets() {
    var inc = rec.distribution.incidence, out = [];
    if (inc.length) { var poor = inc[0]; out.push("Incidence: " + (poor.group || "top group") + " receives " + (poor.share_of_benefits || 0) + "% of benefits."); }
    (rec.distribution.questions || []).slice(0, 2).forEach(function (q) { out.push("Question: " + q); });
    if ((rec.distribution.methods || []).length) out.push("Methods: " + rec.distribution.methods.join(", ") + ".");
    return out;
  }
  function refreshS8() { var c = document.getElementById("s8-chart"); if (c) c.innerHTML = s8Chart(); if (rec.distribution.incidence.length) setCell("outcome", "distribution", "green", "Incidence table (" + rec.distribution.incidence.length + " rows)"); refreshS8Forum(); setPill("S8"); }
  function refreshS8List() { var l = document.getElementById("s8-list"); if (l) l.innerHTML = rec.distribution.incidence.length ? rec.distribution.incidence.map(incRow).join("") : '<p class="muted">No rows yet — add a preset above or a single row below.</p>'; refreshS8(); }
  function refreshS8Forum() { var f = document.getElementById("S8-forum"); if (f) f.outerHTML = forumCard("S8", "Forum 4 post — distributional impact", s8Bullets(), forumQ("S8", "")); }
  function s8AddPreset(kind) {
    var groups = kind === "quintile" ? ["Poorest quintile", "Quintile 2", "Quintile 3", "Quintile 4", "Richest quintile"] : kind === "sex" ? ["Female", "Male"] : ["Urban", "Rural"];
    groups.forEach(function (g) { rec.distribution.incidence.push({ group: g, share_of_benefits: null, share_of_population: null }); });
    save(); refreshS8List();
  }

  /* ---------- Station S9: Qualitative design ---------- */
  function qualOutcome(nodeId) { for (var i = 0; i < rec.qual_design.outcomes.length; i++) if (rec.qual_design.outcomes[i].toc_node_id === nodeId) return i; return -1; }
  function renderS9() {
    var nodes = rec.toc.nodes.filter(function (n) { return n.level === "outcome" || n.level === "impact"; });
    var chosen = new Set(rec.qual_design.outcomes.map(function (o) { return o.toc_node_id; }));
    var ethicsSel = String(rec.qual_design.ethics || "").split(",").map(function (s) { return s.trim(); });
    return headPill("S9") +
      '<p class="muted">Pick three outcomes from your theory of change and design qualitative research to understand the "why" behind the numbers.</p>' +
      '<section class="card"><h3>Pick outcomes <span class="muted" style="font-weight:400">(' + rec.qual_design.outcomes.length + "/3)</span></h3>" +
        (nodes.length ? '<div class="q-bank">' + nodes.map(function (n) { var on = chosen.has(n.id); return '<button type="button" class="imp-flag' + (on ? " on" : "") + '" data-s9-node="' + n.id + '" aria-pressed="' + on + '">' + esc((n.label || "node").slice(0, 34)) + "</button>"; }).join("") + "</div>" : '<p class="muted">Build a theory of change in S3 first (you need outcome nodes).</p>') +
        "</section>" +
      '<div id="s9-details">' + s9Details() + "</div>" +
      '<section class="card"><h3>Ethics checklist</h3><div class="q-bank">' + QUAL_ETHICS.map(function (e) { var on = ethicsSel.indexOf(e) >= 0; return '<button type="button" class="imp-flag' + (on ? " on" : "") + '" data-s9-ethics="' + esc(e) + '" aria-pressed="' + on + '">' + esc(e) + "</button>"; }).join("") + "</div></section>" +
      '<p class="muted dos-feeds">What this feeds next: fills the <b>Qualitative</b> column of the Evidence Map and the qualitative proposal in S12.</p>';
  }
  function s9Details() {
    if (!rec.qual_design.outcomes.length) return "";
    return rec.qual_design.outcomes.map(function (o, i) {
      var node = rec.toc.nodes.filter(function (n) { return n.id === o.toc_node_id; })[0];
      return '<section class="card"><h4 class="s9-h">' + esc(node ? node.label : "Outcome " + (i + 1)) + "</h4><div class=\"dos-grid\">" +
        '<label class="dos-field">Method<select data-model="qual_design.outcomes.' + i + '.method">' + selOpts([""].concat(QUAL_METHODS), o.method) + "</select></label>" +
        '<label class="dos-field">Sample<input type="text" data-model="qual_design.outcomes.' + i + '.sample" value="' + esc(o.sample || "") + '"></label>' +
        '<label class="dos-field">Participants<input type="text" data-model="qual_design.outcomes.' + i + '.participants" value="' + esc(o.participants || "") + '"></label>' +
        '<label class="dos-field">Guiding question<input type="text" data-model="qual_design.outcomes.' + i + '.question" value="' + esc(o.question || "") + '"></label>' +
        "</div></section>";
    }).join("");
  }
  function refreshS9() { var d = document.getElementById("s9-details"); if (d) d.innerHTML = s9Details(); if (rec.qual_design.outcomes.length) setCell("outcome", "qual", "amber", "Qualitative design: " + rec.qual_design.outcomes.length + " outcome" + (rec.qual_design.outcomes.length === 1 ? "" : "s")); setPill("S9"); }

  /* ---------- Station S10: Evidence priorities ---------- */
  function evidenceMapTable() {
    return '<table class="dos-map"><thead><tr><th scope="col">Level</th>' + METHODS.map(function (m) { return '<th scope="col">' + esc(m.label) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      LEVELS.map(function (lv) {
        return "<tr><th scope=\"row\">" + esc(lv.label) + "</th>" + METHODS.map(function (m) {
          var cc = cell(lv.id, m.id) || { status: "grey", text: "" }, st = STATUS[cc.status] || STATUS.grey;
          return '<td><button class="dos-cell st-' + esc(cc.status) + '" data-cell="' + lv.id + "|" + m.id + '" aria-label="' + esc(lv.label + ", " + m.label + ": " + st.label) + '"><span class="dos-dot" aria-hidden="true"></span><span class="dos-st">' + esc(st.label) + "</span>" + (cc.text ? '<span class="dos-cell-txt">' + esc(cc.text) + "</span>" : "") + "</button></td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
  }
  function prioRow(p, i) {
    return '<div class="prio-row" data-prio="' + i + '"><div class="prio-main">' +
      '<input type="text" data-model="priorities.' + i + '.action" value="' + esc(p.action || "") + '" placeholder="Action" aria-label="Action">' +
      '<button type="button" class="imp-x" data-prio-remove="' + i + '" aria-label="Remove">&times;</button></div>' +
      '<div class="prio-meta"><select data-model="priorities.' + i + '.method" aria-label="Type">' + selOpts([""].concat(ACTION_TYPES), p.method) + "</select>" +
      '<input type="text" data-model="priorities.' + i + '.actors_text" value="' + esc(p.actors_text != null ? p.actors_text : (p.actors || []).join(", ")) + '" placeholder="Actors" aria-label="Actors">' +
      '<select data-model="priorities.' + i + '.cost_band" aria-label="Cost">' + selOpts([{ id: "", label: "Cost…" }].concat(COST_BANDS), p.cost_band, "id", "label") + "</select>" +
      '<input type="text" data-model="priorities.' + i + '.timeline" value="' + esc(p.timeline || "") + '" placeholder="Timeline" aria-label="Timeline"></div></div>';
  }
  function s10Quadrant() {
    var costFeas = { low: 3, medium: 2, high: 1 };
    var pts = rec.priorities.map(function (p, i) { return { p: p, i: i, feas: costFeas[p.cost_band] || 2, imp: 4 - Math.min(3, i + 1) + 1 }; });
    return '<div class="quad"><div class="quad-y">Impact →</div><div class="quad-box">' +
      pts.map(function (pt) {
        var left = (pt.feas - 1) / 2 * 80 + 8, bottom = (pt.imp - 1) / 2 * 80 + 8;
        return '<span class="quad-pt" style="left:' + left + "%;bottom:" + bottom + '%" title="' + esc(pt.p.action || "") + '">' + (pt.i + 1) + "</span>";
      }).join("") + '</div><div class="quad-x">Feasibility →</div></div>';
  }
  function renderS10() {
    return headPill("S10") +
      '<p class="muted">Read the Evidence Map, then set your top three priorities for improving the evidence base.</p>' +
      '<h3 class="dos-h">Evidence Map</h3><div class="dos-map-wrap">' + evidenceMapTable() + "</div>" +
      '<section class="card" style="margin-top:14px"><div class="dos-card-head"><h3>Top priorities <span class="muted" style="font-weight:400">(' + rec.priorities.length + ")</span></h3></div>" +
        '<div id="s10-list">' + (rec.priorities.length ? rec.priorities.map(prioRow).join("") : '<p class="muted">No priorities yet — add up to three.</p>') + "</div>" +
        '<button type="button" class="btn" data-s10-add style="margin-top:10px">+ Add priority</button></section>' +
      '<h3 class="dos-h">Impact × feasibility</h3><div class="card" id="s10-quad">' + s10Quadrant() + "</div>" +
      forumCard("S10", "Forum 5 post — evidence priorities", s10Bullets(), "What are the top three priorities for improving the evidence base in " + (rec.country.name || "your country") + "?") +
      '<p class="muted dos-feeds">What this feeds next: these priorities close the national plan (S12).</p>';
  }
  function s10Bullets() { return rec.priorities.map(function (p, i) { return "Priority " + (i + 1) + ": " + (p.action || "(unnamed)") + (p.method ? " [" + p.method + "]" : "") + (p.cost_band ? " — " + p.cost_band + " cost" : "") + (p.timeline ? ", " + p.timeline : ""); }); }
  function refreshS10() { var q = document.getElementById("s10-quad"); if (q) q.innerHTML = s10Quadrant(); refreshS10Forum(); setPill("S10"); }
  function refreshS10List() { var l = document.getElementById("s10-list"); if (l) l.innerHTML = rec.priorities.length ? rec.priorities.map(prioRow).join("") : '<p class="muted">No priorities yet — add up to three.</p>'; refreshS10(); }
  function refreshS10Forum() { var f = document.getElementById("S10-forum"); if (f) f.outerHTML = forumCard("S10", "Forum 5 post — evidence priorities", s10Bullets(), forumQ("S10", "")); }

  /* ---------- Station S11: Situation Room ---------- */
  function scenario() { return (window.DOSSIER_SCENARIOS && window.DOSSIER_SCENARIOS.novaria) || { criteria: [], reforms: [], brief: "" }; }
  function s11Score(rid, cid) { var s = rec.situation_room.scores || {}; return (s[rid] && s[rid][cid] != null) ? s[rid][cid] : ""; }
  function s11Total(rid) { var sc = scenario(), s = (rec.situation_room.scores || {})[rid] || {}, t = 0, n = 0; sc.criteria.forEach(function (c) { if (s[c.id] != null && s[c.id] !== "") { t += Number(s[c.id]); n++; } }); return n ? t : null; }
  function renderS11() {
    var sc = scenario();
    var totals = sc.reforms.map(function (r) { return { r: r, t: s11Total(r.id) }; }).sort(function (a, b) { return (b.t || -1) - (a.t || -1); });
    return headPill("S11") +
      '<p class="muted">' + esc(sc.brief) + "</p>" +
      '<section class="card"><label class="dos-field">Team name<input type="text" data-model="situation_room.team" value="' + esc(rec.situation_room.team || "") + '"></label></section>' +
      '<div class="dos-map-wrap"><table class="dos-map s11-table"><thead><tr><th scope="col">Reform</th>' + sc.criteria.map(function (c) { return '<th scope="col">' + esc(c.label) + "</th>"; }).join("") + '<th scope="col">Total</th></tr></thead><tbody>' +
        sc.reforms.map(function (r) {
          return '<tr><th scope="row">' + esc(r.name) + '<span class="s11-note">' + esc(r.note) + "</span></th>" +
            sc.criteria.map(function (c) { return '<td><select data-s11-score="' + r.id + "|" + c.id + '" aria-label="' + esc(r.name + " " + c.label) + '">' + selOpts([{ id: "", label: "—" }, { id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }, { id: "5", label: "5" }], s11Score(r.id, c.id), "id", "label") + "</select></td>"; }).join("") +
            '<td class="s11-total" id="s11-total-' + r.id + '"><b>' + (s11Total(r.id) == null ? "—" : s11Total(r.id)) + "</b></td></tr>";
        }).join("") + "</tbody></table></div>" +
      '<div class="s11-rank" id="s11-rank">' + s11RankHtml(totals) + "</div>" +
      '<section class="card"><h3>Team decision</h3><div class="dos-grid">' +
        '<label class="dos-field">First choice<select data-model="situation_room.first_choice">' + selOpts([{ id: "", label: "—" }].concat(sc.reforms.map(function (r) { return { id: r.id, label: r.name }; })), rec.situation_room.first_choice, "id", "label") + "</select></label>" +
        '<label class="dos-field">Second choice<select data-model="situation_room.second_choice">' + selOpts([{ id: "", label: "—" }].concat(sc.reforms.map(function (r) { return { id: r.id, label: r.name }; })), rec.situation_room.second_choice, "id", "label") + "</select></label>" +
      "</div>" +
        '<label class="dos-field" style="margin-top:10px">Rationale<textarea class="dos-full" data-model="situation_room.rationale" rows="2">' + esc(rec.situation_room.rationale || "") + "</textarea></label>" +
        '<label class="dos-field" style="margin-top:10px">Debrief: what would this reform need from your own country\'s evidence plan?<textarea class="dos-full" data-model="situation_room.link_to_own_country" rows="2">' + esc(rec.situation_room.link_to_own_country || "") + "</textarea></label></section>";
  }
  function s11RankHtml(totals) { return totals.filter(function (x) { return x.t != null; }).map(function (x, i) { return '<span class="chip">' + (i + 1) + ". " + esc(x.r.name) + " (" + x.t + ")</span>"; }).join(" "); }
  function refreshS11() {
    var sc = scenario();
    sc.reforms.forEach(function (r) { var el = document.getElementById("s11-total-" + r.id); if (el) el.innerHTML = "<b>" + (s11Total(r.id) == null ? "—" : s11Total(r.id)) + "</b>"; });
    var totals = sc.reforms.map(function (r) { return { r: r, t: s11Total(r.id) }; }).sort(function (a, b) { return (b.t || -1) - (a.t || -1); });
    var rk = document.getElementById("s11-rank"); if (rk) rk.innerHTML = s11RankHtml(totals);
    setPill("S11");
  }

  /* ---------- Station S12: National plan ---------- */
  function s12Sections() {
    var sc = schemeById(rec.toc.scheme_id);
    var covInds = rec.indicators.filter(function (i) { return i.type === "coverage" && indRate(i) != null; });
    var topImpacts = rec.impacts.slice().sort(function (a, b) { return a.relevance < b.relevance ? 1 : -1; }).slice(0, 3);
    return [
      { n: 1, title: "The social protection system", words: 200, body: rec.schemes.length ? (rec.schemes.length + " schemes catalogued (S2), spanning " + [].concat.apply([], FUNCTIONS.filter(function (f) { return rec.schemes.some(function (s) { return s.function === f.id; }); }).map(function (f) { return f.label; })).join(", ") + ".") : "Describe the system from S2." },
      { n: 2, title: "What evidence do we need, and for whom?", words: 300, body: (topImpacts.length ? "Priority impacts (S1): " + topImpacts.map(function (i) { return i.label; }).join("; ") + ". " : "") + (sc ? "Theory of change built for " + sc.name + " (S3)." : "Add a theory of change in S3.") },
      { n: 3, title: "What do we know so far?", words: 500, body: covInds.length ? "Administrative coverage (S4): " + covInds.slice(0, 4).map(function (i) { return i.name + " " + indRate(i) + "%"; }).join("; ") + "." : "Add indicators in S4." },
      { n: 4, title: "Proposals for enhanced impact assessment", words: 1000, body: "Survey (S5): " + (rec.survey.name ? rec.survey.name + ", gap score " + s5GapScore() : "to design") + ". Microsimulation (S6): headcount " + ((rec.microsim.results || {}).headcount_before) + "%→" + ((rec.microsim.results || {}).headcount_after) + "%. Impact evaluation (S7): " + (rec.ie_design.method ? (IE_METHODS[rec.ie_design.method] || {}).label : "to design") + ". Distributional (S8): " + (rec.distribution.incidence.length ? rec.distribution.incidence.length + " incidence rows" : "to design") + ". Qualitative (S9): " + (rec.qual_design.outcomes.length ? rec.qual_design.outcomes.length + " outcomes" : "to design") + "." },
      { n: 5, title: "Overall assessment and priorities", words: "remainder", body: rec.priorities.length ? rec.priorities.map(function (p, i) { return (i + 1) + ". " + p.action; }).join(" ") : "Set priorities in S10." }
    ];
  }
  function renderS12() {
    var secs = s12Sections();
    rec.final.slide_outline = secs.map(function (s) { return s.n + ". " + s.title; });
    var sa = rec.final.self_assessment || {};
    var crit = [["mastery", "Mastery of course content"], ["analysis", "Analysis and interpretation"], ["clarity", "Clarity of communication"], ["compliance", "Compliance with instructions"]];
    return headPill("S12") +
      '<p class="muted">An auto-drafted outline for the ≤10-slide presentation and the 2,000–2,500-word memo, built from every station.</p>' +
      '<section class="card"><h3>Outline</h3>' + secs.map(function (s) {
        return '<div class="plan-sec"><div class="plan-head"><b>' + s.n + ". " + esc(s.title) + '</b><span class="muted">' + (s.words === "remainder" ? "remainder" : "c." + s.words + " words") + "</span></div><p>" + esc(s.body) + "</p></div>";
      }).join("") + "</section>" +
      '<section class="card"><h3>Self-check (1–4)</h3><div class="dos-grid">' + crit.map(function (c) {
        return '<label class="dos-field">' + esc(c[1]) + '<select data-model="final.self_assessment.' + c[0] + '">' + selOpts([{ id: "", label: "—" }, { id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }], sa[c[0]], "id", "label") + "</select></label>";
      }).join("") + "</div></section>" +
      '<section class="card"><h3>Commitment for the Wall of Commitment</h3><textarea class="dos-full" data-model="final.commitment" rows="2" placeholder="One change you will make in your organisation…">' + esc(rec.final.commitment || "") + "</textarea></section>" +
      '<div class="form-actions"><button type="button" class="btn" data-s12-md>Export outline (Markdown)</button><button type="button" class="btn ghost" data-s12-slides>Export slide text</button></div>' +
      '<p class="muted dos-feeds">This closes the Integrated Applied Exercise — the outline maps to the final presentation and technical memo.</p>';
  }
  function s12Markdown() {
    var secs = s12Sections(), sc = schemeById(rec.toc.scheme_id);
    var md = "# National plan for impact assessment — " + (rec.country.name || "") + "\n\n";
    md += "_Participant: " + (rec.participant.name || "") + (rec.participant.organisation ? ", " + rec.participant.organisation : "") + "_\n\n";
    secs.forEach(function (s) { md += "## " + s.n + ". " + s.title + " (" + (s.words === "remainder" ? "remainder" : "c." + s.words + " words") + ")\n\n" + s.body + "\n\n"; });
    if (rec.final.commitment) md += "## Commitment\n\n" + rec.final.commitment + "\n";
    return md;
  }
  function refreshS12() { setPill("S12"); }

  function renderCellEditor() {
    if (!editing) return "";
    var cc = cell(editing.level, editing.method) || { status: "grey", text: "" };
    var lv = (LEVELS.filter(function (l) { return l.id === editing.level; })[0] || {}).label;
    var mt = (METHODS.filter(function (m) { return m.id === editing.method; })[0] || {}).label;
    return '<div class="dos-modal-bg" data-cell-cancel></div><div class="dos-modal" role="dialog" aria-modal="true" aria-label="' + UI.editCell + '">' +
      "<h3>" + UI.editCell + '</h3><p class="muted">' + esc(lv) + " · " + esc(mt) + "</p>" +
      '<label>' + UI.status + '<select id="dos-cell-status">' + STATUS_ORDER.map(function (k) {
        return '<option value="' + k + '"' + (cc.status === k ? " selected" : "") + ">" + esc(STATUS[k].label) + "</option>";
      }).join("") + "</select></label>" +
      "<label>" + UI.note + '<textarea id="dos-cell-text" rows="3" maxlength="140">' + esc(cc.text) + "</textarea></label>" +
      '<div class="form-actions"><button class="btn" id="dos-cell-save">' + UI.save + '</button><button class="btn ghost" data-cell-cancel>' + UI.cancel + "</button></div></div>";
  }

  function toolbar() {
    return '<div class="dos-toolbar"><div class="dos-crumbs">' +
      '<button class="dos-crumb" data-open="home"' + (view.screen === "home" ? ' aria-current="page"' : "") + ">" + UI.home + "</button>" +
      (view.screen === "station" ? '<span aria-hidden="true">/</span><span class="dos-crumb current">' + esc(view.station) + "</span>" : "") +
      "</div><div class=\"dos-actions\">" +
      '<button class="btn ghost" data-act="sample">' + UI.loadSample + "</button>" +
      '<button class="btn ghost" data-act="new">' + UI.newRecord + "</button>" +
      '<button class="btn ghost" data-act="export">' + UI.exportJson + "</button>" +
      '<label class="btn ghost dos-import">' + UI.importJson + '<input type="file" accept="application/json,.json" hidden data-act="import"></label>' +
      "</div></div>";
  }

  function render() {
    var heading = view.screen === "home"
      ? '<div class="section-heading"><p class="eyebrow">04 · Applied exercise</p>' +
        '<h2 class="section-title flush">Country evidence dossier</h2>' +
        '<p class="muted">Build, station by station, an evidence picture of social protection impacts in one country — ending in a national plan for impact assessment.</p></div>'
      : "";
    MOUNT.innerHTML = heading + toolbar() +
      '<div class="dos-body">' + (view.screen === "station" ? renderStation(view.station) : renderHome()) + "</div>" +
      renderCellEditor();
    if (view.screen === "station") {
      if (view.station === "S0") wireS0();
      else if (view.station === "S1") wireS1();
      else { if (STATION_INIT[view.station]) STATION_INIT[view.station](); setPill(view.station); }
    }
  }
  // Writes a station's evidence/derived state once, on open (no container re-render).
  var STATION_INIT = {
    S4: function () { s4WriteEvidence(); setPill("S4"); },
    S5: function () { s5WriteEvidence(); setPill("S5"); },
    S6: function () { var r = rec.microsim.results || {}; if (r.headcount_after != null) setCell("impact", "microsim", "amber", "Illustrative microsim: headcount " + r.headcount_before + "% → " + r.headcount_after + "%"); setPill("S6"); },
    S7: function () { if (ie().method) setCell("impact", "ie", "amber", "IE design: " + ((IE_METHODS[ie().method] || {}).label || ie().method) + " proposed"); setPill("S7"); },
    S8: function () { if (rec.distribution.incidence.length) setCell("outcome", "distribution", "green", "Incidence table (" + rec.distribution.incidence.length + " rows)"); setPill("S8"); },
    S9: function () { if (rec.qual_design.outcomes.length) setCell("outcome", "qual", "amber", "Qualitative design: " + rec.qual_design.outcomes.length + " outcome" + (rec.qual_design.outcomes.length === 1 ? "" : "s")); setPill("S9"); }
  };
  // Lightweight derived refresh when a data-model field in a station changes.
  var STATION_REFRESH = {
    S2: refreshS2,
    S3: function () { refreshS3Links(); refreshS3Forum(); setPill("S3"); },
    S4: refreshS4,
    S5: refreshS5,
    S6: function () { setPill("S6"); },
    S7: refreshS7,
    S8: refreshS8,
    S9: function () { if (rec.qual_design.outcomes.length) setCell("outcome", "qual", "amber", "Qualitative design: " + rec.qual_design.outcomes.length + " outcome" + (rec.qual_design.outcomes.length === 1 ? "" : "s")); setPill("S9"); },
    S10: function () { refreshS10Forum(); setPill("S10"); },
    S11: refreshS11,
    S12: refreshS12
  };

  /* ---------- Events ---------- */
  function go(screen, st) { view.screen = screen; view.station = st || null; editing = null; render(); scrollTop(); }
  function scrollTop() { var p = document.getElementById("panel-dossier"); if (p && p.scrollIntoView) p.scrollIntoView({ block: "start" }); }

  MOUNT.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) { var id = open.getAttribute("data-open"); id === "home" ? go("home") : go("station", id); return; }
    if (e.target.closest("[data-s1-add]")) { s1AddImpact(); return; }
    var impRm = e.target.closest("[data-imp-remove]");
    if (impRm) { var rid2 = impRm.getAttribute("data-imp-remove"); rec.impacts = rec.impacts.filter(function (i) { return i.id !== rid2; }); save(); refreshS1(); return; }
    var impMiss = e.target.closest("[data-imp-missed]");
    if (impMiss) { var m = impact(impMiss.getAttribute("data-imp-missed")); if (m) { m.missed_in_video = !m.missed_in_video; save(); refreshS1(); } return; }
    var impEv = e.target.closest("[data-imp-evidence]");
    if (impEv) { var ev = impact(impEv.getAttribute("data-imp-evidence")); if (ev) { ev.evidence_wanted = !ev.evidence_wanted; save(); refreshS1(); } return; }
    var impSt = e.target.closest(".imp-stake");
    if (impSt) {
      var imS = impact(impSt.getAttribute("data-imp")), sid = impSt.getAttribute("data-stake");
      if (imS) { var p = imS.stakeholder_ids.indexOf(sid); if (p >= 0) imS.stakeholder_ids.splice(p, 1); else imS.stakeholder_ids.push(sid); save(); refreshS1(); }
      return;
    }
    if (e.target.closest("[data-s1-copy]")) { copyText(s1PostText(), "Forum post copied to the clipboard."); return; }
    if (e.target.closest("[data-s1-png]")) { s1SvgAndPng(); return; }

    // Generic forum copy
    var fc = e.target.closest("[data-forum-copy]");
    if (fc) { copyText(forumPost(fc.getAttribute("data-forum-copy")), "Forum post copied to the clipboard."); return; }

    // S2
    if (e.target.closest("[data-s2-add]")) { s2AddScheme(); return; }
    if (e.target.closest("[data-s2-csv]")) { s2ExportCsv(); return; }
    var scRm = e.target.closest("[data-scheme-remove]");
    if (scRm) { var scid = scRm.getAttribute("data-scheme-remove"); rec.schemes = rec.schemes.filter(function (s) { return s.id !== scid; }); save(); refreshS2List(); return; }

    // S3
    var tocAdd = e.target.closest("[data-toc-add]");
    if (tocAdd) { s3AddNode(tocAdd.getAttribute("data-toc-add")); return; }
    var ndRm = e.target.closest("[data-node-remove]");
    if (ndRm) { var nid = ndRm.getAttribute("data-node-remove"); rec.toc.nodes = rec.toc.nodes.filter(function (n) { return n.id !== nid; }); rec.toc.links = rec.toc.links.filter(function (l) { return l.from !== nid && l.to !== nid; }); save(); refreshS3Grid(); return; }
    if (e.target.closest("[data-s3-addlink]")) { var ff = document.getElementById("s3-from"), tt = document.getElementById("s3-to"); if (ff && tt && ff.value && tt.value && ff.value !== tt.value) { rec.toc.links.push({ from: ff.value, to: tt.value }); save(); refreshS3Links(); } return; }
    var lkRm = e.target.closest("[data-link-remove]");
    if (lkRm) { rec.toc.links.splice(Number(lkRm.getAttribute("data-link-remove")), 1); save(); refreshS3Links(); return; }
    if (e.target.closest("[data-s3-preload]")) { s3Preload(); return; }
    if (e.target.closest("[data-s3-png]")) { s3Png(); return; }

    // S4
    if (e.target.closest("[data-s4-add]")) { s4AddIndicator(); return; }
    var indRm = e.target.closest("[data-ind-remove]");
    if (indRm) { var iid = indRm.getAttribute("data-ind-remove"); rec.indicators = rec.indicators.filter(function (i) { return i.id !== iid; }); save(); refreshS4List(); return; }
    if (e.target.closest("[data-s4-png]")) { s4Png(); return; }

    // S6
    if (e.target.closest("[data-s6-regen]")) { if (!rec.microsim.params) rec.microsim.params = {}; rec.microsim.params.seed = (Date.now() % 100000) + 1; refreshS6(); return; }

    // S7
    var ieUse = e.target.closest("[data-ie-use]");
    if (ieUse) { var mm = ieUse.getAttribute("data-ie-use"); rec.ie_design.method = mm; rec.ie_design.key_assumption = (IE_METHODS[mm] || {}).assumption || ""; save(); go("station", "S7"); return; }
    var ieNode = e.target.closest("[data-ie-node]");
    if (ieNode) { var nd = ieNode.getAttribute("data-ie-node"); if (!rec.ie_design.toc_node_ids) rec.ie_design.toc_node_ids = []; var pi = rec.ie_design.toc_node_ids.indexOf(nd); if (pi >= 0) rec.ie_design.toc_node_ids.splice(pi, 1); else rec.ie_design.toc_node_ids.push(nd); save(); ieNode.setAttribute("aria-pressed", pi < 0); return; }

    // S8
    var s8p = e.target.closest("[data-s8-preset]");
    if (s8p) { s8AddPreset(s8p.getAttribute("data-s8-preset")); return; }
    if (e.target.closest("[data-s8-addrow]")) { rec.distribution.incidence.push({ group: "", share_of_benefits: null, share_of_population: null }); save(); refreshS8List(); return; }
    var incRm = e.target.closest("[data-inc-remove]");
    if (incRm) { rec.distribution.incidence.splice(Number(incRm.getAttribute("data-inc-remove")), 1); save(); refreshS8List(); return; }
    var s8q = e.target.closest("[data-s8-q]");
    if (s8q) { var qv = s8q.getAttribute("data-s8-q"); if (!rec.distribution.questions) rec.distribution.questions = []; var qi = rec.distribution.questions.indexOf(qv); if (qi >= 0) rec.distribution.questions.splice(qi, 1); else rec.distribution.questions.push(qv); save(); s8q.classList.toggle("on"); s8q.setAttribute("aria-pressed", qi < 0); refreshS8Forum(); return; }
    var s8m = e.target.closest("[data-s8-method]");
    if (s8m) { var mv = s8m.getAttribute("data-s8-method"); if (!rec.distribution.methods) rec.distribution.methods = []; var mi = rec.distribution.methods.indexOf(mv); if (mi >= 0) rec.distribution.methods.splice(mi, 1); else rec.distribution.methods.push(mv); save(); s8m.classList.toggle("on"); s8m.setAttribute("aria-pressed", mi < 0); refreshS8Forum(); return; }

    // S9
    var s9n = e.target.closest("[data-s9-node]");
    if (s9n) { var n9 = s9n.getAttribute("data-s9-node"); var oi = qualOutcome(n9); if (oi >= 0) rec.qual_design.outcomes.splice(oi, 1); else rec.qual_design.outcomes.push({ toc_node_id: n9, question: "", method: "", sample: "", participants: "" }); save(); go("station", "S9"); return; }
    var s9e = e.target.closest("[data-s9-ethics]");
    if (s9e) { var ev9 = s9e.getAttribute("data-s9-ethics"); var arr = String(rec.qual_design.ethics || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean); var ei = arr.indexOf(ev9); if (ei >= 0) arr.splice(ei, 1); else arr.push(ev9); rec.qual_design.ethics = arr.join(", "); save(); s9e.classList.toggle("on"); s9e.setAttribute("aria-pressed", ei < 0); return; }

    // S10
    if (e.target.closest("[data-s10-add]")) { rec.priorities.push({ rank: rec.priorities.length + 1, action: "", method: "", actors: [], actors_text: "", cost_band: "", timeline: "", toc_node_ids: [] }); save(); refreshS10List(); return; }
    var prRm = e.target.closest("[data-prio-remove]");
    if (prRm) { rec.priorities.splice(Number(prRm.getAttribute("data-prio-remove")), 1); save(); refreshS10List(); return; }

    // S12
    if (e.target.closest("[data-s12-md]")) { download("national-plan-" + slug(rec.country.name) + ".md", s12Markdown(), "text/markdown"); return; }
    if (e.target.closest("[data-s12-slides]")) { download("slides-" + slug(rec.country.name) + ".txt", rec.final.slide_outline.join("\n")); return; }
    var rm = e.target.closest("[data-stake-remove]");
    if (rm) {
      var rid = rm.getAttribute("data-stake-remove");
      rec.stakeholders = rec.stakeholders.filter(function (s) { return s.id !== rid; });
      save();
      var box = document.getElementById("dos-stake-chips");
      if (box) box.innerHTML = renderStakeChips();
      return;
    }
    var qk = e.target.closest("[data-stake-quick]");
    if (qk) {
      var sel = document.getElementById("stake-type");
      if (sel) sel.value = qk.getAttribute("data-stake-quick");
      var nm = document.getElementById("stake-name");
      if (nm) nm.focus();
      return;
    }
    var cellBtn = e.target.closest("[data-cell]");
    if (cellBtn) { var parts = cellBtn.getAttribute("data-cell").split("|"); editing = { level: parts[0], method: parts[1] }; render(); return; }
    if (e.target.closest("[data-cell-cancel]")) { editing = null; render(); return; }
    if (e.target.id === "dos-cell-save") {
      var stv = document.getElementById("dos-cell-status").value;
      var tx = document.getElementById("dos-cell-text").value.trim();
      setCell(editing.level, editing.method, stv, tx); editing = null; render(); return;
    }
    var act = e.target.closest("[data-act]");
    if (act && act.tagName === "BUTTON") {
      var a = act.getAttribute("data-act");
      if (a === "sample") { rec = coerce(deepCopy(sample())); save(); go("home"); }
      else if (a === "new") { if (confirm(UI.confirmNew)) { rec = blank(); save(); go("home"); } }
      else if (a === "export") { download("evidence-dossier-" + slug(rec.country.name || rec.participant.name) + ".json", JSON.stringify(rec, null, 2)); }
    }
  });

  MOUNT.addEventListener("input", function (e) {
    if (e.target.id === "s1-question") {
      if (!rec.forum.S1) rec.forum.S1 = {};
      rec.forum.S1.question = e.target.value;
      save();
      var wcEl = document.getElementById("s1-wordcount");
      if (wcEl) { var wc = wordCount(s1PostText()); var band = wc >= 150 && wc <= 300 ? "ok" : "off"; wcEl.className = "wc-pill wc-" + band; wcEl.textContent = wc + " words"; }
      return;
    }
    var fq = e.target.closest("[data-forumq]");
    if (fq) { var fid = fq.getAttribute("data-forumq"); if (!rec.forum[fid]) rec.forum[fid] = {}; rec.forum[fid].question = fq.value; save(); updateForumWc(fid); return; }
    var sim = e.target.closest("[data-sim]");
    if (sim) { var key = sim.getAttribute("data-sim"); if (!rec.microsim.params) rec.microsim.params = {}; rec.microsim.params[key] = Number(sim.value); var sv = document.getElementById("sim-" + key + "-v"); if (sv) sv.textContent = sim.value + "%"; refreshS6(); return; }
    var f = e.target.closest("[data-model]");
    if (!f) return;
    var path = f.getAttribute("data-model");
    setPath(rec, path, f.getAttribute("type") === "number" ? coerceNum(f.value) : f.value);
    save();
    if (view.station === "S0") refreshS0Pill();
    else if (STATION_REFRESH[view.station]) STATION_REFRESH[view.station]();
  });

  // Drag-and-drop for the S1 relevance grid (keyboard alternative: the card's Relevance menu).
  var dragImpactId = null;
  MOUNT.addEventListener("dragstart", function (e) {
    var c = e.target.closest("[data-impact]");
    if (!c) return;
    dragImpactId = c.getAttribute("data-impact");
    if (e.dataTransfer) { e.dataTransfer.setData("text/plain", dragImpactId); e.dataTransfer.effectAllowed = "move"; }
    c.classList.add("dragging");
  });
  MOUNT.addEventListener("dragend", function (e) {
    var c = e.target.closest("[data-impact]"); if (c) c.classList.remove("dragging");
    dragImpactId = null;
  });
  MOUNT.addEventListener("dragover", function (e) {
    var z = e.target.closest("[data-relzone]"); if (!z) return;
    e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "move"; z.classList.add("drop-hover");
  });
  MOUNT.addEventListener("dragleave", function (e) {
    var z = e.target.closest("[data-relzone]"); if (z) z.classList.remove("drop-hover");
  });
  MOUNT.addEventListener("drop", function (e) {
    var z = e.target.closest("[data-relzone]"); if (!z) return;
    e.preventDefault(); z.classList.remove("drop-hover");
    var id = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || dragImpactId;
    var im = impact(id);
    if (im) { im.relevance = Number(z.getAttribute("data-relzone")); save(); refreshS1(); }
  });

  MOUNT.addEventListener("change", function (e) {
    var impRel = e.target.closest("[data-imp-rel]");
    if (impRel) { var im = impact(impRel.getAttribute("data-imp-rel")); if (im) { im.relevance = Number(impRel.value); save(); refreshS1(); } return; }
    var s11 = e.target.closest("[data-s11-score]");
    if (s11) {
      var parts = s11.getAttribute("data-s11-score").split("|");
      if (!rec.situation_room.scores) rec.situation_room.scores = {};
      if (!rec.situation_room.scores[parts[0]]) rec.situation_room.scores[parts[0]] = {};
      rec.situation_room.scores[parts[0]][parts[1]] = s11.value === "" ? null : Number(s11.value);
      save(); refreshS11(); return;
    }
    var s2imp = e.target.closest("[data-s2-import]");
    if (s2imp && s2imp.files && s2imp.files[0]) { var fr2 = new FileReader(); fr2.onload = function () { try { s2ImportCsv(fr2.result); } catch (err) { alert("Could not read that CSV."); } }; fr2.readAsText(s2imp.files[0]); return; }
    var setS = e.target.closest("[data-set-status]");
    if (setS) { rec.progress[setS.getAttribute("data-set-status")] = setS.value; save(); render(); return; }
    var imp = e.target.closest('[data-act="import"]');
    if (imp && imp.files && imp.files[0]) {
      var fr = new FileReader();
      fr.onload = function () {
        try { rec = coerce(JSON.parse(fr.result)); save(); go("home"); }
        catch (err) { alert("That file is not a valid dossier JSON."); }
      };
      fr.readAsText(imp.files[0]);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && editing) { editing = null; render(); }
  });

  render();
})();
