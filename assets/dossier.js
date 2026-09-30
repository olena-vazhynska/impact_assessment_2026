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

  function renderStation(id) {
    var s = station(id); if (!s) return renderHome();
    var stt = rec.progress[id] || "not_started";
    var readNames = s.reads.length ? s.reads.join(", ") : "—";
    var writeNames = s.writes.length ? s.writes.join(", ") : "—";
    var colNote = s.col ? "Fills the <b>" + esc((METHODS.filter(function (m) { return m.id === s.col; })[0] || {}).label || s.col) + "</b> column of the Evidence Map." : "Does not write directly to the Evidence Map.";
    return '<button class="btn ghost dos-back" data-open="home">&larr; ' + UI.back + "</button>" +
      '<div class="dos-station-head"><span class="eyebrow">' + esc(s.id) + " · " + esc(s.tag) + " · " + esc(weekDates(s.week)) + "</span>" +
      "<h2>" + esc(s.title) + "</h2><p class=\"dos-q\">" + esc(s.q) + "</p></div>" +
      '<div class="dos-io card"><div><span class="eyebrow">' + UI.reads + "</span><p>" + esc(readNames) + "</p></div>" +
      '<div><span class="eyebrow">' + UI.writes + "</span><p>" + esc(writeNames) + "</p></div>" +
      '<div><span class="eyebrow">' + UI.feedsNext + '</span><p>' + colNote + "</p></div></div>" +
      '<div class="card dos-soon"><p>' + esc(UI.comingSoon) + "</p>" +
      '<label class="dos-status-set">' + UI.status + ": <select data-set-status=\"" + esc(id) + "\">" +
        ["not_started", "in_progress", "done"].map(function (v) {
          return '<option value="' + v + '"' + (stt === v ? " selected" : "") + ">" + esc(UI[v === "not_started" ? "notStarted" : v === "in_progress" ? "inProgress" : "done"]) + "</option>";
        }).join("") + "</select></label></div>";
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
  }

  /* ---------- Events ---------- */
  function go(screen, st) { view.screen = screen; view.station = st || null; editing = null; render(); scrollTop(); }
  function scrollTop() { var p = document.getElementById("panel-dossier"); if (p && p.scrollIntoView) p.scrollIntoView({ block: "start" }); }

  MOUNT.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) { var id = open.getAttribute("data-open"); id === "home" ? go("home") : go("station", id); return; }
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

  MOUNT.addEventListener("change", function (e) {
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
