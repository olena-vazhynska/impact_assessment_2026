/* Immersive learning — a mini dashboard for each participant's journey through
 * the integrated exercise (the Country Evidence Dossier). Pick a name from the
 * dropdown to see that person's learning path and their Evidence Map, which
 * fills in week by week from their submissions. Admin only. Read-only.
 *
 * Reads window.IMMERSIVE (data/immersive.js) and, for the worked example, the
 * Amrosea dataset in window.SAMPLE_RECORDS (data/samples.js).
 */
(function () {
  "use strict";
  var MOUNT = document.getElementById("immersive-app");
  if (!MOUNT) return;
  var D = window.IMMERSIVE;
  if (!D) { MOUNT.innerHTML = '<p class="muted">No immersive-learning data loaded.</p>'; return; }
  var SAMPLE = (window.SAMPLE_RECORDS && window.SAMPLE_RECORDS[D.exampleId]) || null;
  var EXAMPLE_VALUE = "__example";

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtDate(iso) { try { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso + "T12:00:00Z")); } catch (e) { return iso; } }
  function initials(name) { return String(name || "").split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase(); }

  var JSTATUS = {
    not_started: { label: "Not started", cls: "st-grey" },
    draft: { label: "Draft", cls: "st-amber" },
    submitted: { label: "Submitted", cls: "st-green" },
    revised: { label: "Revised", cls: "st-green" }
  };
  function jst(v) { return JSTATUS[v] || JSTATUS.not_started; }
  var MAPSTATUS = { green: "Evidence", amber: "Partial", red: "Gap", grey: "—" };

  /* ---------- per-selection model ---------- */
  function participant(id) { for (var i = 0; i < D.participants.length; i++) if (D.participants[i].id === id) return D.participants[i]; return null; }

  // Returns a normalised model for whichever option is selected.
  function model(value) {
    if (value === EXAMPLE_VALUE) {
      var ex = D.example || {};
      return {
        isExample: true,
        name: (SAMPLE && SAMPLE.country ? SAMPLE.country.name : "Amrosea") + " — worked example",
        who: (SAMPLE && SAMPLE.participant ? SAMPLE.participant.role : "Sample analyst"),
        organisation: (SAMPLE && SAMPLE.participant ? SAMPLE.participant.organisation : ""),
        country: (SAMPLE && SAMPLE.country ? SAMPLE.country.name : "Amrosea"),
        region: (SAMPLE && SAMPLE.country ? SAMPLE.country.region : ""),
        focus: ex.focus || {},
        minister_question: ex.minister_question || "",
        hunch: ex.hunch || "",
        headline: ex.headline || "",
        journey: ex.journey || {},
        logbook: ex.logbook || [],
        cells: (SAMPLE && SAMPLE.evidence_map ? SAMPLE.evidence_map.cells : [])
      };
    }
    var p = participant(value) || {};
    return {
      isExample: false,
      name: p.name, who: p.role, organisation: p.organisation,
      country: p.country, region: p.region,
      focus: null, minister_question: "", hunch: "", headline: "",
      journey: {}, logbook: [], cells: []
    };
  }

  function cell(cells, level, method) { for (var i = 0; i < cells.length; i++) if (cells[i].level === level && cells[i].method === method) return cells[i]; return null; }

  /* ---------- small visuals ---------- */
  function ring(pct) {
    var r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<svg viewBox="0 0 64 64" class="im-ring" width="64" height="64" aria-hidden="true">' +
      '<circle class="ring-bg" cx="32" cy="32" r="' + r + '"/>' +
      '<circle class="ring-fg" cx="32" cy="32" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<text class="ring-txt" x="32" y="37" text-anchor="middle">' + Math.round(pct) + "%</text></svg>";
  }

  // Confidence sparkline from a logbook (plots confidence by week number).
  function spark(logbook, w, h) {
    w = w || 150; h = h || 42;
    var rows = (logbook || []).slice().sort(function (a, b) { return a.wk - b.wk; });
    if (!rows.length) return '<span class="muted">—</span>';
    var minW = rows[0].wk, maxW = rows[rows.length - 1].wk, span = Math.max(1, maxW - minW);
    var pad = 5;
    var sx = function (wk) { return pad + (wk - minW) / span * (w - 2 * pad); };
    var sy = function (v) { return h - pad - (v - 1) / 4 * (h - 2 * pad); };
    var d = rows.map(function (r, i) { return (i ? "L" : "M") + sx(r.wk).toFixed(1) + " " + sy(r.confidence).toFixed(1); }).join(" ");
    var dots = rows.map(function (r) { return '<circle cx="' + sx(r.wk).toFixed(1) + '" cy="' + sy(r.confidence).toFixed(1) + '" r="2.6" fill="var(--primary)"/>'; }).join("");
    return '<svg class="im-spark" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true">' +
      '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" stroke="var(--border)" stroke-width="1"/>' +
      (rows.length > 1 ? '<path d="' + d + '" fill="none" stroke="var(--primary)" stroke-width="2"/>' : "") + dots + "</svg>";
  }

  /* ---------- journey ---------- */
  function journeyProgress(m) {
    var done = 0, part = 0;
    D.journey.forEach(function (s) {
      var st = (m.journey[s.ch] || {}).status;
      if (st === "submitted" || st === "revised") done++;
      else if (st === "draft") part++;
    });
    return Math.round((done + part * 0.5) / D.journey.length * 100);
  }

  function rail(m) {
    return '<ol class="im-rail">' + D.journey.map(function (s) {
      var st = (m.journey[s.ch] || {}).status || "not_started";
      var info = jst(st);
      return '<li class="im-node ' + info.cls + (D.currentWeek === s.week ? " im-now" : "") + '" title="' + esc(s.title) + '">' +
        '<span class="im-node-dot">' + s.ch + "</span>" +
        '<span class="im-node-wk">Wk ' + s.week + "</span>" +
        '<span class="im-node-ttl">' + esc(s.title) + "</span>" +
        '<span class="im-node-st">' + info.label + "</span></li>";
    }).join("") + "</ol>";
  }

  function journeyCards(m) {
    return '<div class="im-steps">' + D.journey.map(function (s) {
      var step = m.journey[s.ch] || {}; var st = step.status || "not_started"; var info = jst(st);
      var fills = (s.fills || []).map(function (f) { var mm = D.methods.filter(function (x) { return x.id === f; })[0]; return mm ? mm.label : f; });
      return '<article class="im-step">' +
        '<header class="im-step-head"><span class="im-step-n">' + s.ch + "</span>" +
          '<div class="im-step-h"><b>' + esc(s.title) + '</b><span class="muted">Week ' + s.week + " · due " + fmtDate(s.due) + "</span></div>" +
          '<span class="dos-pill ' + info.cls + '">' + info.label + "</span></header>" +
        '<p class="im-step-focus">' + esc(s.focus) + "</p>" +
        '<div class="im-step-tags">' + s.stations.map(function (t) { return '<span class="im-tag">' + esc(t) + "</span>"; }).join("") + "</div>" +
        '<p class="im-step-feeds"><span class="eyebrow">Feeds</span>' + esc(s.feeds) +
          (fills.length ? ' · fills <b>' + fills.map(esc).join(", ") + "</b> on the map" : "") + "</p>" +
        (step.key ? '<p class="im-step-key">' + esc(step.key) + "</p>" : '<p class="im-step-key muted">Awaiting the Week ' + s.week + " submission.</p>") +
        "</article>";
    }).join("") + "</div>";
  }

  /* ---------- evidence map ---------- */
  function evidenceMap(m) {
    var counts = { green: 0, amber: 0, red: 0, grey: 0 };
    var body = D.levels.map(function (lv) {
      return '<tr><th scope="row">' + esc(lv.label) + "</th>" + D.methods.map(function (mt) {
        var c = cell(m.cells, lv.id, mt.id);
        var status = c ? c.status : "grey"; counts[status] = (counts[status] || 0) + 1;
        return '<td><div class="dos-cell im-mapcell st-' + status + '">' +
          '<span class="dos-st"><span class="dos-dot"></span>' + MAPSTATUS[status] + "</span>" +
          (c && c.text ? '<span class="dos-cell-txt">' + esc(c.text) + "</span>" : "") + "</div></td>";
      }).join("") + "</tr>";
    }).join("");
    var total = D.levels.length * D.methods.length, filled = counts.green + counts.amber + counts.red;
    var head = '<tr><th scope="col">Level \\ Method</th>' + D.methods.map(function (mt) {
      var wk = D.journey.filter(function (s) { return (s.fills || []).indexOf(mt.id) !== -1; }).map(function (s) { return "W" + s.week; })[0];
      return '<th scope="col">' + esc(mt.label) + (wk ? '<span class="im-col-wk">' + wk + "</span>" : "") + "</th>";
    }).join("") + "</tr>";
    var legend = '<p class="dos-legend">' +
      ['<span class="dos-leg st-green"><span class="dos-dot"></span>Evidence exists</span>',
       '<span class="dos-leg st-amber"><span class="dos-dot"></span>Partial / proposed</span>',
       '<span class="dos-leg st-red"><span class="dos-dot"></span>Gap</span>',
       '<span class="dos-leg st-grey"><span class="dos-dot"></span>Not yet assessed</span>'].join("") + "</p>";
    return '<div class="dos-map-wrap"><table class="dos-map im-map"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      legend +
      '<p class="muted im-mapmeter">' + filled + " of " + total + " cells carry evidence so far — the map grows one or two columns each week as submissions come in." +
      (counts.red ? " " + counts.red + " cell(s) flagged as an evidence gap." : "") + "</p>";
  }

  /* ---------- logbook ---------- */
  function logbook(m) {
    if (!m.logbook.length) {
      return '<div class="empty im-empty">No logbook entries yet. Each week, the Evidence Lead records their confidence (1–5), what moved it and what they changed.</div>';
    }
    return '<div class="dos-map-wrap"><table class="im-log"><thead><tr><th>Wk</th><th>Conf.</th><th>What moved it</th><th>Feedback from</th><th>What I changed</th></tr></thead><tbody>' +
      m.logbook.map(function (l) { return "<tr><td>W" + l.wk + '</td><td class="im-conf">' + l.confidence + "/5</td><td>" + esc(l.moved) + "</td><td>" + esc(l.feedback_from) + "</td><td>" + esc(l.changed) + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
  }

  /* ---------- dashboard ---------- */
  function dashboard(value) {
    var m = model(value);
    var pct = journeyProgress(m);
    var latestConf = m.logbook.length ? m.logbook[m.logbook.length - 1].confidence : null;
    var statusChip = m.isExample
      ? '<span class="im-chip im-chip-ex">Worked example · illustrative</span>'
      : (D.currentWeek === 0
          ? '<span class="im-chip im-chip-wait">Not started — opens Week 1</span>'
          : '<span class="im-chip">Week ' + D.currentWeek + " of 7</span>");

    var focus = m.focus || {};
    var placeholder = '<span class="muted">To be declared — Week 1 (Country Passport)</span>';
    var factRows = [
      ["Focus country", m.country ? esc(m.country) : placeholder],
      ["Anchor scheme", focus.anchor_scheme ? esc(focus.anchor_scheme) : placeholder],
      ["Function", focus.function ? esc(focus.function) : placeholder],
      ["Target group", focus.target_group ? esc(focus.target_group) : placeholder]
    ];

    var threads = (m.minister_question || m.hunch || m.headline)
      ? '<p class="im-mq"><span class="eyebrow">Minister\'s Question</span>' + esc(m.minister_question) + "</p>" +
        (m.hunch ? '<p class="im-mq"><span class="eyebrow">Week 1 hunch</span>' + esc(m.hunch) + "</p>" : "") +
        (m.headline ? '<p class="im-mq"><span class="eyebrow">Headline indicator</span>' + esc(m.headline) + "</p>" : "")
      : '<p class="im-mq"><span class="eyebrow">Minister\'s Question</span><span class="muted">To be declared — Week 1, Forum 1</span></p>' +
        '<p class="muted">The focus scheme, the Minister\'s Question and the first hunch are set by the participant in Week 1, then sharpened each week.</p>';

    return (
      '<section class="im-hero">' +
        '<div class="im-hero-id"><span class="im-mono">' + esc(initials(m.country)) + "</span>" +
          '<div><p class="im-hero-eyebrow">' + esc(m.country || "—") + (m.region ? " · " + esc(m.region) : "") + "</p>" +
          "<h2>" + esc(m.name) + "</h2>" +
          '<p class="im-hero-sub">' + esc([m.who, m.organisation].filter(Boolean).join(" · ")) + "</p></div></div>" +
        statusChip +
      "</section>" +

      '<div class="im-snap">' +
        '<article class="card im-snap-card"><div class="im-ringwrap">' + ring(pct) +
          '<div><b>' + pct + '%</b><span class="muted">Journey complete</span></div></div></article>' +
        '<article class="card im-snap-card"><span class="eyebrow">Confidence (1–5)</span>' +
          '<div class="im-confwrap">' + spark(m.logbook) + (latestConf ? "<b>" + latestConf + "/5</b>" : '<b class="muted">—</b>') + "</div>" +
          '<p class="muted im-snap-note">How sure the Evidence Lead is that evidence can answer the Minister\'s Question.</p></article>' +
        '<article class="card im-snap-card im-threads">' + threads + "</article>" +
      "</div>" +

      '<article class="card im-facts-card"><h3>Dossier focus</h3><dl class="dos-facts">' +
        factRows.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + f[1] + "</dd></div>"; }).join("") + "</dl></article>" +

      '<h3 class="dos-h">Learning journey</h3>' +
      '<p class="muted">Seven steps, one country — the integrated exercise. Each step feeds the slide deck and memo and lights up as it is submitted.</p>' +
      rail(m) + journeyCards(m) +

      '<h3 class="dos-h">Evidence Map</h3>' +
      '<p class="muted">Rows are theory-of-change levels; columns are methods — the same map as the Country Evidence Dossier. It is rebuilt from this participant\'s submissions each week.</p>' +
      evidenceMap(m) +

      '<h3 class="dos-h">Evidence Lead\'s logbook</h3>' +
      logbook(m)
    );
  }

  /* ---------- shell + wiring ---------- */
  var OPTIONS = [{ value: EXAMPLE_VALUE, label: (SAMPLE && SAMPLE.country ? SAMPLE.country.name : "Amrosea") + " — worked example" }]
    .concat(D.participants.map(function (p) { return { value: p.id, label: p.name + " · " + p.country }; }));
  var selected = EXAMPLE_VALUE;

  function renderDash() {
    var el = document.getElementById("im-dash");
    if (el) el.innerHTML = dashboard(selected);
  }

  function shell() {
    var weekLine = D.currentWeek === 0
      ? "No submissions yet — dashboards open after the Week 1 forum. Updated " + fmtDate(D.updated) + "."
      : "Week " + D.currentWeek + " of 7 · updated " + fmtDate(D.updated) + " · refreshes weekly from submissions.";
    var countries = {};
    D.participants.forEach(function (p) { countries[p.country] = 1; });
    MOUNT.innerHTML =
      '<div class="section-heading"><p class="eyebrow">08 · Facilitator</p>' +
        '<h2 class="section-title flush">Immersive learning</h2>' +
        '<p class="muted">Each participant\'s journey through the integrated exercise, as a mini dashboard that fills in week by week. <b>Admin only.</b> ' + weekLine + "</p></div>" +
      '<p class="im-cohort-line">' + D.participants.length + " participants · " + Object.keys(countries).length +
        " countries · Week " + D.currentWeek + " · " + (D.currentWeek === 0 ? "0 submissions so far" : "refreshing weekly") + "</p>" +
      '<div class="im-picker">' +
        '<button class="btn ghost im-nav" data-im-nav="-1" aria-label="Previous participant">&larr;</button>' +
        '<label class="im-select"><span class="visually-hidden">Choose a participant</span>' +
          '<select id="im-who">' + OPTIONS.map(function (o) { return '<option value="' + esc(o.value) + '">' + esc(o.label) + "</option>"; }).join("") + "</select></label>" +
        '<button class="btn ghost im-nav" data-im-nav="1" aria-label="Next participant">&rarr;</button>' +
      "</div>" +
      '<div id="im-dash"></div>';
    var sel = document.getElementById("im-who");
    if (sel) { sel.value = selected; sel.addEventListener("change", function () { selected = sel.value; renderDash(); }); }
    MOUNT.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-im-nav]");
      if (!nav) return;
      var dir = parseInt(nav.getAttribute("data-im-nav"), 10);
      var idx = OPTIONS.map(function (o) { return o.value; }).indexOf(selected);
      idx = (idx + dir + OPTIONS.length) % OPTIONS.length;
      selected = OPTIONS[idx].value;
      var s = document.getElementById("im-who"); if (s) s.value = selected;
      renderDash();
    });
    renderDash();
  }

  shell();
})();
