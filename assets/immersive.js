/* Immersive learning — facilitator view of each participant's Evidence Dossier
 * journey. Admin only. Reads window.IMMERSIVE (data/immersive.js), which the
 * course team refreshes each week from participant submissions. Read-only.
 */
(function () {
  "use strict";
  var MOUNT = document.getElementById("immersive-app");
  if (!MOUNT) return;
  var D = window.IMMERSIVE;
  if (!D) { MOUNT.innerHTML = '<p class="muted">No immersive-learning data loaded.</p>'; return; }

  var STATUS = {
    not_started: { label: "Not started", cls: "im-ns" },
    draft: { label: "Draft", cls: "im-draft" },
    submitted: { label: "Submitted", cls: "im-sub" },
    revised: { label: "Revised", cls: "im-rev" }
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function st(v) { return STATUS[v] || STATUS.not_started; }
  function fmtDate(iso) { try { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso + "T12:00:00Z")); } catch (e) { return iso; } }
  function pById(id) { for (var i = 0; i < D.participants.length; i++) if (D.participants[i].id === id) return D.participants[i]; return null; }
  function latestConf(p) { return p.logbook && p.logbook.length ? p.logbook[p.logbook.length - 1].confidence : null; }

  /* confidence sparkline across weeks 1..currentWeek */
  function spark(p, w, h) {
    w = w || 96; h = h || 26;
    var weeks = [], i;
    for (i = 1; i <= D.currentWeek; i++) weeks.push(i);
    var pts = weeks.map(function (wk) { var row = (p.logbook || []).filter(function (l) { return l.wk === wk; })[0]; return row ? row.confidence : null; });
    var pad = 3, n = Math.max(1, weeks.length - 1);
    var sx = function (idx) { return pad + idx * (w - 2 * pad) / n; };
    var sy = function (v) { return h - pad - (v - 1) / 4 * (h - 2 * pad); };
    var dsegs = [], last = null;
    pts.forEach(function (v, idx) { if (v == null) return; var x = sx(idx), y = sy(v); dsegs.push((last == null ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1)); last = idx; });
    var dots = pts.map(function (v, idx) { return v == null ? "" : '<circle cx="' + sx(idx).toFixed(1) + '" cy="' + sy(v).toFixed(1) + '" r="2.2" fill="var(--primary)"/>'; }).join("");
    return '<svg class="im-spark" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true">' +
      (dsegs.length > 1 ? '<path d="' + dsegs.join(" ") + '" fill="none" stroke="var(--primary)" stroke-width="1.6"/>' : "") + dots + "</svg>";
  }

  /* ---------- Cohort view ---------- */
  function cohort() {
    var cw = D.currentWeek;
    var submittedThisWeek = D.participants.filter(function (p) { var c = p.chapters[cw]; return c && (c.status === "submitted" || c.status === "revised"); }).length;
    var confs = D.participants.map(latestConf).filter(function (v) { return v != null; });
    var avgConf = confs.length ? (confs.reduce(function (a, b) { return a + b; }, 0) / confs.length).toFixed(1) : "—";
    var totalCells = D.participants.length * 5; // chapters 1–5 are the build weeks
    var doneCells = 0;
    D.participants.forEach(function (p) { for (var i = 1; i <= 5; i++) { var c = p.chapters[i]; if (c && (c.status === "submitted" || c.status === "revised")) doneCells++; } });

    var html =
      '<div class="section-heading"><p class="eyebrow">08 · Facilitator</p>' +
      '<h2 class="section-title flush">Immersive learning</h2>' +
      '<p class="muted">Each participant\'s Evidence Dossier journey — one country, seven chapters. <b>Admin only.</b> Week ' + cw + ' of 7 · updated ' + fmtDate(D.updated) + ' · refreshes weekly from submissions.</p></div>' +
      '<div class="cards-3 im-stats">' +
        '<article class="card stat"><span class="card-index">' + D.participants.length + '</span><h3>Participants</h3></article>' +
        '<article class="card stat"><span class="card-index">' + submittedThisWeek + "/" + D.participants.length + '</span><h3>Submitted · Week ' + cw + '</h3></article>' +
        '<article class="card stat"><span class="card-index">' + avgConf + '</span><h3>Avg confidence (1–5)</h3></article>' +
        '<article class="card stat"><span class="card-index">' + doneCells + "/" + totalCells + '</span><h3>Chapters 1–5 in</h3></article>' +
      "</div>" +
      '<h3 class="dos-h">Progress by chapter</h3>' +
      '<p class="muted">Click a participant to open their dossier. Each cell is a chapter status.</p>' +
      '<div class="dos-map-wrap"><table class="im-grid"><thead><tr><th scope="col">Participant</th>' +
        D.chapters.map(function (c) { return '<th scope="col" title="' + esc(c.title) + '">Ch ' + c.n + "</th>"; }).join("") +
        '<th scope="col">Confidence</th></tr></thead><tbody>' +
        D.participants.map(function (p) {
          return '<tr class="im-row" data-p="' + p.id + '"><th scope="row"><button class="im-name" data-p="' + p.id + '"><b>' + esc(p.name) + "</b><span>" + esc(p.country) + " · " + esc(p.function) + "</span></button></th>" +
            D.chapters.map(function (c) { var s = st((p.chapters[c.n] || {}).status); return '<td><span class="im-cell ' + s.cls + '" title="' + esc(s.label + ((p.chapters[c.n] || {}).key ? " — " + p.chapters[c.n].key : "")) + '">' + s.label.charAt(0) + "</span></td>"; }).join("") +
            '<td class="im-sparkcell">' + spark(p) + "<b>" + (latestConf(p) || "—") + "</b></td></tr>";
        }).join("") +
      "</tbody></table></div>" +
      '<p class="im-legend">' + ["revised", "submitted", "draft", "not_started"].map(function (k) { return '<span class="im-leg ' + STATUS[k].cls + '"><span class="im-cell ' + STATUS[k].cls + '">' + STATUS[k].label.charAt(0) + "</span>" + STATUS[k].label + "</span>"; }).join("") + "</p>" +
      '<p class="muted im-note">Sample data — replace <code>data/immersive.js</code> with each week\'s submissions. Status: Not started · Draft · Submitted · Revised.</p>';
    return html;
  }

  /* ---------- Participant detail ---------- */
  function detail(id) {
    var p = pById(id); if (!p) return cohort();
    var chapters = D.chapters.map(function (c) {
      var pc = p.chapters[c.n] || {}; var s = st(pc.status);
      return '<div class="im-chap"><div class="im-chap-top"><span class="im-cell ' + s.cls + '">' + s.label.charAt(0) + '</span><b>Ch ' + c.n + " · " + esc(c.title) + '</b><span class="im-pill ' + s.cls + '">' + s.label + "</span></div>" +
        '<div class="im-chap-meta"><span>Week ' + c.week + " · due " + fmtDate(c.due) + "</span><span>" + esc(c.feeds) + "</span></div>" +
        (pc.key ? '<p class="im-key">' + esc(pc.key) + "</p>" : "") + "</div>";
    }).join("");
    var logrows = (p.logbook || []).map(function (l) {
      return "<tr><td>W" + l.wk + '</td><td class="im-conf">' + l.confidence + "</td><td>" + esc(l.moved) + "</td><td>" + esc(l.feedback_from) + "</td><td>" + esc(l.changed) + "</td></tr>";
    }).join("");
    return '<button class="btn ghost dos-back" data-im-home>&larr; Back to cohort</button>' +
      '<div class="section-heading"><p class="eyebrow">' + esc(p.council) + " · Evidence Lead</p><h2 class=\"section-title flush\">" + esc(p.name) + "</h2>" +
      '<p class="muted">' + esc(p.organisation) + " · " + esc(p.role) + "</p></div>" +
      '<div class="grid-2">' +
        '<article class="card"><h2>Dossier profile</h2><dl class="facts">' +
          [["Focus country", p.country], ["Anchor scheme", p.anchor_scheme], ["Function", p.function], ["Type", p.scheme_type], ["Target group", p.target_group]].map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl></article>" +
        '<article class="card"><h2>The threads</h2>' +
          '<p class="im-mq"><span class="eyebrow">Minister\'s Question</span>' + esc(p.minister_question) + "</p>" +
          '<p class="im-mq"><span class="eyebrow">Week 1 hunch</span>' + esc(p.hunch) + "</p>" +
          '<p class="im-mq"><span class="eyebrow">Headline indicator</span>' + esc(p.headline) + "</p>" +
          '<div class="im-confwrap"><span class="eyebrow">Confidence trend</span>' + spark(p, 160, 40) + "<b>" + (latestConf(p) || "—") + "/5</b></div></article>" +
      "</div>" +
      '<h3 class="dos-h">Progress tracker</h3><div class="im-chaps">' + chapters + "</div>" +
      '<h3 class="dos-h">Evidence Lead\'s logbook</h3>' +
      '<div class="table-wrap"><table><thead><tr><th>Wk</th><th>Conf.</th><th>What moved it</th><th>Council feedback</th><th>What I changed</th></tr></thead><tbody>' +
        (logrows || '<tr><td colspan="5" class="muted">No logbook entries yet.</td></tr>') + "</tbody></table></div>";
  }

  var view = "home";
  function render() {
    MOUNT.innerHTML = view === "home" ? cohort() : detail(view);
  }
  MOUNT.addEventListener("click", function (e) {
    if (e.target.closest("[data-im-home]")) { view = "home"; render(); scrollTop(); return; }
    var n = e.target.closest("[data-p]");
    if (n) { view = n.getAttribute("data-p"); render(); scrollTop(); }
  });
  function scrollTop() { var el = document.getElementById("panel-immersive"); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" }); }

  render();
})();
