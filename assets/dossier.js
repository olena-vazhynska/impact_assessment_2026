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
    MOUNT.innerHTML = toolbar() +
      '<div class="dos-body">' + (view.screen === "station" ? renderStation(view.station) : renderHome()) + "</div>" +
      renderCellEditor();
    if (view.screen === "station" && view.station === "S0") wireS0();
    if (view.screen === "station" && view.station === "S1") wireS1();
  }

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
    var f = e.target.closest("[data-model]");
    if (!f) return;
    var path = f.getAttribute("data-model");
    setPath(rec, path, f.getAttribute("type") === "number" ? coerceNum(f.value) : f.value);
    save();
    if (view.station === "S0") refreshS0Pill();
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
