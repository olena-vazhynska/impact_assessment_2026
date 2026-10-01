(function () {
  "use strict";

  var C = window.COURSE;
  var P = Array.isArray(window.PARTICIPANTS) ? window.PARTICIPANTS : [];

  // `?now=2026-10-20T15:00:00+02:00` lets you preview the dashboard at any date.
  var nowParam = new URLSearchParams(location.search).get("now");
  function now() { return nowParam ? new Date(nowParam) : new Date(); }

  // Times are shown in the fixed UTC offset stated in the agenda for each session.
  function agendaTz(iso) {
    var m = iso.match(/([+-])(\d\d):\d\d$/);
    return m ? "Etc/GMT" + (m[1] === "+" ? "-" : "+") + String(+m[2]) : "UTC";
  }
  var sessions = [];
  C.weeks.forEach(function (w) {
    w.sessions.forEach(function (s) {
      s.week = w;
      s.startD = new Date(s.start);
      s.endD = new Date(s.end);
      sessions.push(s);
    });
  });

  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dayStart(iso) { return new Date(iso + "T00:00:00+02:00"); }
  function dayEnd(iso) { return new Date(iso + "T23:59:59+01:00"); }

  function fmt(d, opts, tz) {
    return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: tz || undefined }, opts)).format(d);
  }
  function fmtDay(d, tz) { return fmt(d, { weekday: "long", day: "2-digit", month: "long" }, tz); }
  function fmtTime(d, tz) { return fmt(d, { hour: "2-digit", minute: "2-digit", hour12: false }, tz); }
  function offsetLabel(iso) {
    var m = iso.match(/([+-])(\d\d):\d\d$/);
    return m ? "UTC" + m[1] + String(+m[2]) : "";
  }

  function status(s) {
    var t = now();
    if (t >= s.endD) return "done";
    if (t >= s.startD) return "live";
    return "upcoming";
  }
  function nextSession() {
    var t = now();
    for (var i = 0; i < sessions.length; i++) if (sessions[i].endD > t) return sessions[i];
    return null;
  }
  function currentWeek() {
    var t = now();
    for (var i = 0; i < C.weeks.length; i++) {
      var w = C.weeks[i];
      if (t >= dayStart(w.start) && t <= dayEnd(w.end)) return w;
    }
    return null;
  }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll(".tabs button");
  function showTab(id, noHash) {
    if (!document.getElementById("panel-" + id)) id = "overview";
    tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === id ? "true" : "false"); });
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.dataset.panel !== id; });
    if (!noHash) history.replaceState(null, "", location.pathname + location.search + "#" + id);
  }
  tabs.forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tab); }); });
  document.querySelector(".tabs-inner").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var list = Array.prototype.slice.call(tabs);
    var i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var n = list[(i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length];
    n.focus(); n.click();
  });

  /* ---------- Hero ---------- */
  function renderHero() {
    $("#hero-lead").textContent = C.lead;
    var d = function (iso) { return fmt(new Date(iso + "T12:00:00Z"), { day: "numeric", month: "long", year: "numeric" }, "UTC"); };
    var meta = [
      ["Dates", d(C.start) + " – " + d(C.end)],
      ["Format", "Online · " + C.platform + " · " + C.weeksCount + " weeks · " + C.hours + " hours"],
      ["Language", C.language],
      ["Course code", C.code]
    ];
    $("#hero-meta").innerHTML = meta.map(function (m) {
      return "<div><span>" + esc(m[0]) + "</span><strong>" + esc(m[1]) + "</strong></div>";
    }).join("");
  }

  function renderKpis() {
    var speakers = uniquePeople().filter(function (p) { return p !== "ITCILO Team"; });
    var countries = {};
    P.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var items = [
      [C.weeksCount, "Weeks"],
      [C.hours, "Learning hours"],
      [sessions.length, "Live sessions"],
      [speakers.length, "Resource persons"]
    ];
    if (P.length) items.push([P.length, "Participants"]);
    if (Object.keys(countries).length) items.push([Object.keys(countries).length, "Countries"]);
    $("#kpis").innerHTML = items.map(function (k) {
      return '<div class="kpi"><div class="kpi-value">' + k[0] + '</div><div class="kpi-label">' + k[1] + "</div></div>";
    }).join("");
  }

  /* ---------- Overview ---------- */
  var countdownTimer;
  function renderNext() {
    var s = nextSession();
    var box = $("#next-card");
    clearInterval(countdownTimer);
    if (!s) {
      box.innerHTML = '<div><div class="next-label">Course completed</div><div class="next-title">Thank you for taking part in Impact Assessment 2026!</div></div>';
      return;
    }
    var st = status(s);
    box.innerHTML =
      "<div>" +
        '<div class="next-label">' + (st === "live" ? "Live now" : "Next live session") + " · Week " + s.week.n + "</div>" +
        '<div class="next-title">' + esc(s.id.toUpperCase()) + " — " + esc(s.title) + "</div>" +
        '<div class="muted" style="margin:0">' + fmtDay(s.startD, agendaTz(s.start)) + " · " + fmtTime(s.startD, agendaTz(s.start)) + "–" + fmtTime(s.endD, agendaTz(s.start)) +
        " " + offsetLabel(s.start) + " · your time " + fmtTime(s.startD) + " · " + esc(s.people.join(", ")) + "</div>" +
        (s.zoom ? '<a class="btn join next-join" href="' + esc(s.zoom) + '" target="_blank" rel="noopener">Join Zoom &#8599;</a>' : "") +
      "</div>" +
      '<div class="countdown" id="countdown"></div>';
    function tick() {
      var diff = Math.max(0, (st === "live" ? s.endD : s.startD) - now());
      if (diff === 0) { renderNext(); renderTimetable(); return; }
      var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, sec = Math.floor(diff / 1e3) % 60;
      var parts = st === "live" ? [[h, "hrs"], [m, "min"], [sec, "sec"]] : [[d, "days"], [h, "hrs"], [m, "min"]];
      var el = document.getElementById("countdown");
      if (el) el.innerHTML = (st === "live" ? '<span class="badge live" style="align-self:center">Ends in</span>' : "") +
        parts.map(function (p) { return "<div><b>" + p[0] + "</b><span>" + p[1] + "</span></div>"; }).join("");
    }
    tick();
    if (!nowParam) countdownTimer = setInterval(tick, 1000);
  }

  function renderProgress() {
    var t = now();
    var start = dayStart(C.start), end = dayEnd(C.end);
    var pct = Math.max(0, Math.min(100, ((t - start) / (end - start)) * 100));
    var done = sessions.filter(function (s) { return status(s) === "done"; }).length;
    var daysLeft = Math.max(0, Math.ceil((end - t) / 864e5));
    var daysToStart = Math.ceil((start - t) / 864e5);
    var cw = currentWeek();
    $("#progress").innerHTML =
      '<div class="progress-block"><div class="progress-head"><span>Course timeline</span><span>' + Math.round(pct) + "%</span></div>" +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="progress-row"><span>5 Oct</span><span>' +
          (daysToStart > 0 ? "Starts in " + daysToStart + " day" + (daysToStart === 1 ? "" : "s") : daysLeft > 0 ? daysLeft + " days to go" : "Completed") +
        "</span><span>20 Nov</span></div></div>" +
      '<div class="progress-block"><div class="progress-head"><span>Live sessions held</span><span>' + done + " / " + sessions.length + "</span></div>" +
        '<div class="bar"><i style="width:' + (done / sessions.length) * 100 + '%"></i></div></div>' +
      '<div class="progress-block"><div class="progress-head"><span>Current week</span><span>' + (cw ? "Week " + cw.n : "—") + "</span></div>" +
        '<div class="muted" style="margin:.25rem 0 0">' + (cw ? esc(cw.title) : daysToStart > 0 ? "The course has not started yet." : "The course has ended.") + "</div></div>";
  }

  function renderOverviewText() {
    $("#overview-text").textContent = C.overview;
    $("#topics").innerHTML = C.topics.map(function (t) { return "<li><b>" + esc(t[0]) + "</b> " + esc(t[1]) + "</li>"; }).join("");
    $("#outcomes").innerHTML = C.outcomes.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("");
    $("#pillars").innerHTML = C.pillars.map(function (p, i) {
      return '<article class="card pillar"><span class="card-index">0' + (i + 1) + "</span><h3>" + esc(p[0]) + "</h3><p>" + esc(p[1]) + "</p></article>";
    }).join("");
  }

  /* ---------- Learning journey ---------- */
  function renderJourney() {
    var cw = currentWeek(), t = now();
    $("#journey").innerHTML = C.weeks.map(function (w) {
      var cls = cw === w ? "current" : t > dayEnd(w.end) ? "past" : "";
      return '<button class="step ' + cls + '" data-week="' + w.n + '"><div class="week-num">Week ' + w.n + "</div><h3>" + esc(w.title) + '</h3><div class="dates">' + esc(w.range) + "</div></button>";
    }).join("");
    $("#journey").addEventListener("click", function (e) {
      var b = e.target.closest(".step");
      if (!b) return;
      showTab("timetable");
      var sel = document.getElementById("week-filter");
      if (sel) { sel.value = b.dataset.week; sel.dispatchEvent(new Event("change")); }
      var el = document.getElementById("week-" + b.dataset.week);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function renderJourneyInfo() {
    $("#learning-format").textContent = C.learningFormat;
    $("#phases").innerHTML = C.phases.map(function (p) { return '<div class="phase"><b>' + esc(p[0]) + "</b><p>" + esc(p[1]) + "</p></div>"; }).join("");
    $("#why").innerHTML = C.why.map(function (w) { return '<div class="why"><h3>' + esc(w[0]) + "</h3><p>" + esc(w[1]) + "</p></div>"; }).join("");
  }

  /* ---------- Timetable ---------- */
  var localTz = false, weekFilter = "all";
  function renderTimetable() {
    var cw = currentWeek(), nx = nextSession();
    var shown = C.weeks.filter(function (w) { return weekFilter === "all" || String(w.n) === weekFilter; });
    $("#weeks").innerHTML = shown.map(function (w) {
      return '<div class="week' + (cw === w ? " current" : "") + '" id="week-' + w.n + '">' +
        '<div class="week-head"><span class="week-num">Week ' + w.n + "</span><h3>" + esc(w.title) + '</h3><span class="dates">' + esc(w.range) + "</span></div>" +
        w.sessions.map(function (s) {
          var st = status(s);
          var badge = st === "done" ? '<span class="badge done">Done</span>' : st === "live" ? '<span class="badge live">Live now</span>' : s === nx ? '<span class="badge next">Next</span>' : "";
          var zone = localTz ? "your time" : offsetLabel(s.start);
          var tz = localTz ? undefined : agendaTz(s.start);
          return '<div class="session ' + (st === "done" ? "past" : st) + '">' +
            '<div class="s-when"><b>' + fmtDay(s.startD, tz) + "</b><span>" + fmtTime(s.startD, tz) + "–" + fmtTime(s.endD, tz) + " " + zone + "</span></div>" +
            "<div>" +
              '<span class="s-id">Live session ' + esc(s.id) + "</span>" +
              '<p class="s-title">' + esc(s.title) + "</p>" +
              (s.subtitle ? '<p class="s-sub">' + esc(s.subtitle) + "</p>" : "") +
              '<div class="s-people">' + s.people.map(function (p) { return '<span class="chip">' + esc(p) + "</span>"; }).join("") + "</div>" +
            "</div>" +
            '<div class="s-side">' + badge +
              (st !== "done" && s.zoom ? '<a class="btn join' + (st === "live" || s === nx ? "" : " ghost") + '" href="' + esc(s.zoom) + '" target="_blank" rel="noopener">Join Zoom &#8599;</a>' : "") +
              (st !== "done" ? '<button class="btn ghost" data-ics="' + s.id + '">+ Calendar</button>' : "") + "</div>" +
          "</div>";
        }).join("") +
      "</div>";
    }).join("");
    var n = shown.reduce(function (a, w) { return a + w.sessions.length; }, 0);
    $("#session-count").textContent = n + " live session" + (n === 1 ? "" : "s") + (weekFilter === "all" ? "" : " · Week " + weekFilter);
  }
  function initTimetableControls() {
    var sel = $("#week-filter");
    sel.innerHTML = '<option value="all">All seven weeks</option>' + C.weeks.map(function (w) {
      return '<option value="' + w.n + '">Week ' + w.n + " — " + esc(w.title) + "</option>";
    }).join("");
    sel.addEventListener("change", function () { weekFilter = sel.value; renderTimetable(); });
    $("#tz-toggle").addEventListener("change", function (e) { localTz = e.target.checked; renderTimetable(); });
  }

  /* ---------- Calendar export ---------- */
  function icsDate(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function icsEscape(s) { return String(s).replace(/[\\;,]/g, function (c) { return "\\" + c; }).replace(/\n/g, "\\n"); }
  function buildIcs(list) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ITCILO//Impact Assessment 2026//EN", "CALSCALE:GREGORIAN"];
    list.forEach(function (s) {
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + C.code + "-" + s.id + "@itcilo.org",
        "DTSTAMP:" + icsDate(new Date()),
        "DTSTART:" + icsDate(s.startD),
        "DTEND:" + icsDate(s.endD),
        "SUMMARY:" + icsEscape("Impact Assessment 2026 · Live session " + s.id + ": " + s.title),
        "DESCRIPTION:" + icsEscape("Week " + s.week.n + " — " + s.week.title + "\nResource persons: " + s.people.join(", ") + (s.subtitle ? "\n" + s.subtitle : "") + (s.zoom ? "\nJoin Zoom: " + s.zoom : "")),
        "LOCATION:" + icsEscape(s.zoom ? "Zoom · " + s.zoom : "ITCILO eCampus"),
        (s.zoom ? "URL:" + s.zoom : "X-NO-URL:"),
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function initCalendar() {
    $("#ics-all").addEventListener("click", function () { download("impact-assessment-2026.ics", buildIcs(sessions), "text/calendar"); });
    $("#weeks").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ics]");
      if (!b) return;
      var s = sessions.filter(function (x) { return x.id === b.dataset.ics; })[0];
      download("impact-assessment-2026-" + s.id + ".ics", buildIcs([s]), "text/calendar");
    });
  }

  /* ---------- Resource persons ---------- */
  function uniquePeople() {
    var seen = [];
    sessions.forEach(function (s) { s.people.forEach(function (p) { if (seen.indexOf(p) < 0) seen.push(p); }); });
    return seen;
  }
  function initials(n) { return n.split(/\s+/).filter(function (w) { return /^[A-Z]/.test(w); }).map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function renderPeople() {
    $("#people").innerHTML = uniquePeople().map(function (p) {
      var list = sessions.filter(function (s) { return s.people.indexOf(p) >= 0; });
      return '<div class="person"><div class="person-top"><div class="avatar">' + esc(initials(p)) + "</div><div><h3>" + esc(p) + '</h3><div class="count">' +
        list.length + " live session" + (list.length === 1 ? "" : "s") + "</div></div></div><ul>" +
        list.map(function (s) { return "<li><b>" + esc(s.id) + "</b> · " + fmt(s.startD, { day: "2-digit", month: "short" }, agendaTz(s.start)) + " — " + esc(s.title) + "</li>"; }).join("") +
        "</ul></div>";
    }).join("");
  }

  // The "Country Evidence Dossier" tab is a self-contained module (assets/dossier.js).

  /* ---------- Resources & course info ---------- */
  function renderResources() {
    if (!$("#resources")) return; // Resources panel removed in participant view
    var totalItems = C.resourceGroups.reduce(function (a, g) { return a + g.items.length; }, 0);
    var apiItems = C.resourceGroups.reduce(function (a, g) {
      return a + g.items.filter(function (it) { return it[3]; }).length;
    }, 0);
    var html = '<div class="card indicators-card"><h2>Suggested indicators to pull</h2>' +
      '<p class="muted">A starting set for a social protection impact dashboard.</p>' +
      '<ul class="chips-list">' + C.indicators.map(function (i) { return '<li>' + esc(i) + "</li>"; }).join("") + "</ul>" +
      '<p class="muted" style="margin:.75rem 0 0">' + totalItems + " open-data sources across " + C.resourceGroups.length +
      " themes · <span class=\"api-tag\">API</span> marks a source you can query by machine (" + apiItems + " of " + totalItems + ").</p></div>";
    html += C.resourceGroups.map(function (g) {
      return '<section class="resource-group"><div class="group-head"><h3>' + esc(g.title) +
        '</h3><span class="group-weeks">' + esc(g.weeks) + "</span></div>" +
        '<div class="cards-3">' + g.items.map(function (r) {
          return '<a class="card resource" href="' + esc(r[2]) + '" target="_blank" rel="noopener">' +
            (r[3] ? '<span class="api-tag">API</span>' : "") +
            "<h4>" + esc(r[0]) + " ↗</h4><p>" + esc(r[1]) + "</p></a>";
        }).join("") + "</div></section>";
    }).join("");
    $("#resources").innerHTML = html;

    $("#audience").textContent = C.audience;
    var d = function (iso) { return fmt(new Date(iso + "T12:00:00Z"), { day: "numeric", month: "long", year: "numeric" }, "UTC"); };
    $("#facts").innerHTML = '<h2>Key facts</h2><dl class="facts">' + [
      ["Dates", d(C.start) + " – " + d(C.end)],
      ["Duration", C.weeksCount + " weeks · " + C.hours + " hours"],
      ["Format", "Online · " + C.platform],
      ["Language", C.language],
      ["Course code", C.code],
      ["Tuition", C.price],
      ["Certification", "ITCILO Certificate of Achievement"]
    ].map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>";
    var c = C.contact;
    $("#contact").innerHTML = "<h2>Contact</h2><address><b>" + esc(c.org) + "</b><br>" + esc(c.unit) + "<br>" + esc(c.address) +
      '<br><br>T <a href="tel:' + c.phone.replace(/\s/g, "") + '">' + esc(c.phone) + '</a><br><a href="mailto:' + c.email + '">' + esc(c.email) +
      '</a><br><a href="' + c.web + '" target="_blank" rel="noopener">www.itcilo.org</a></address>';
  }

  /* ---------- Participants & demographics ---------- */
  function countBy(rows, key) {
    var m = {};
    rows.forEach(function (r) { var v = r[key]; if (v) m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
  }
  function barChart(title, data) {
    if (!data.length) return "";
    var max = data[0][1];
    return '<div class="card"><h2>' + esc(title) + "</h2>" + data.slice(0, 12).map(function (d) {
      return '<div class="hbar"><span class="hbar-label" title="' + esc(d[0]) + '">' + esc(d[0]) + '</span><span class="hbar-track"><i style="width:' + (d[1] / max) * 100 + '%"></i></span><span class="hbar-val">' + d[1] + "</span></div>";
    }).join("") + (data.length > 12 ? '<div class="muted" style="margin:.5rem 0 0">+ ' + (data.length - 12) + " more</div>" : "") + "</div>";
  }
  var LABELS = { name: "Name", country: "Country", region: "Region", sex: "Sex", gender: "Gender", organization: "Organization", orgType: "Organization type", position: "Position", email: "Email" };
  function label(k) { return LABELS[k] || k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (c) { return c.toUpperCase(); }); }

  function emptyState(target) {
    return '<div class="empty"><p><b>No participant records loaded yet.</b></p><p>Add the roster to <code>data/participants.js</code> — one object per person — and ' + target + ' appears here automatically.</p></div>';
  }

  function renderParticipants() {
    var body = $("#participants-body");
    if (!P.length) { body.innerHTML = emptyState("the searchable table and summary charts"); return; }
    var cols = [];
    P.forEach(function (r) { Object.keys(r).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
    var filterKeys = ["country", "region", "orgType", "sex", "gender"].filter(function (k) { return cols.indexOf(k) >= 0; });
    var sortKey = cols[0], sortDir = 1;

    body.innerHTML =
      '<div class="filters"><input type="search" id="p-search" placeholder="Search participants…" aria-label="Search participants">' +
        filterKeys.map(function (k) {
          return '<select data-filter="' + k + '" aria-label="' + esc(label(k)) + '"><option value="">All ' + esc(label(k).toLowerCase()) + "</option>" +
            countBy(P, k).map(function (d) { return "<option>" + esc(d[0]) + "</option>"; }).join("") + "</select>";
        }).join("") + "</div>" +
      '<p class="muted" id="p-count"></p>' +
      '<div class="charts" id="p-charts"></div>' +
      '<div class="table-wrap"><table><thead><tr>' + cols.map(function (c) { return '<th data-sort="' + esc(c) + '">' + esc(label(c)) + "</th>"; }).join("") + '</tr></thead><tbody id="p-rows"></tbody></table></div>';

    function draw() {
      var q = $("#p-search").value.trim().toLowerCase();
      var f = {};
      body.querySelectorAll("[data-filter]").forEach(function (s) { if (s.value) f[s.dataset.filter] = s.value; });
      var rows = P.filter(function (r) {
        for (var k in f) if (r[k] !== f[k]) return false;
        return !q || cols.some(function (c) { return String(r[c] == null ? "" : r[c]).toLowerCase().indexOf(q) >= 0; });
      }).sort(function (a, b) { return String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")) * sortDir; });
      $("#p-rows").innerHTML = rows.map(function (r) {
        return "<tr>" + cols.map(function (c) { return "<td>" + esc(r[c]) + "</td>"; }).join("") + "</tr>";
      }).join("");
      $("#p-count").textContent = "Showing " + rows.length + " of " + P.length + " participants";
      $("#p-charts").innerHTML = barChart("By country", countBy(rows, "country")) + barChart("By region", countBy(rows, "region")) +
        barChart("By organization type", countBy(rows, "orgType")) + barChart("By sex", countBy(rows, "sex").concat(countBy(rows, "gender")));
      body.querySelectorAll("th").forEach(function (th) {
        th.textContent = label(th.dataset.sort) + (th.dataset.sort === sortKey ? (sortDir > 0 ? " ▲" : " ▼") : "");
      });
    }
    body.addEventListener("input", draw);
    body.querySelector("thead").addEventListener("click", function (e) {
      var th = e.target.closest("th"); if (!th) return;
      if (sortKey === th.dataset.sort) sortDir = -sortDir; else { sortKey = th.dataset.sort; sortDir = 1; }
      draw();
    });
    draw();
  }

  function renderDemographics() {
    var body = $("#demographics-body");
    if (!P.length) { body.innerHTML = emptyState("the cohort's geographic and organizational breakdown"); return; }
    var charts = [
      barChart("By country", countBy(P, "country")),
      barChart("By region", countBy(P, "region")),
      barChart("By organization type", countBy(P, "orgType")),
      barChart("By sex", countBy(P, "sex").concat(countBy(P, "gender")))
    ].filter(Boolean).join("");
    var countries = countBy(P, "country").length, regions = countBy(P, "region").length;
    body.innerHTML =
      '<div class="cards-3">' +
        '<article class="card stat"><span class="card-index">' + P.length + '</span><h3>Participants</h3></article>' +
        '<article class="card stat"><span class="card-index">' + (countries || "—") + '</span><h3>Countries</h3></article>' +
        '<article class="card stat"><span class="card-index">' + (regions || "—") + '</span><h3>Regions</h3></article>' +
      "</div>" +
      '<div class="charts">' + (charts || '<p class="muted">Add <code>country</code>, <code>region</code>, <code>orgType</code> or <code>sex</code> fields to the roster to see breakdowns.</p>') + "</div>";
  }

  /* ---------- Init ---------- */
  renderHero();
  renderKpis();
  renderNext();
  renderProgress();
  renderOverviewText();
  renderPeople();
  renderJourney();
  renderJourneyInfo();
  initTimetableControls();
  renderTimetable();
  initCalendar();
  renderResources();
  renderParticipants();
  renderDemographics();
  showTab((location.hash || "#overview").slice(1), true);
})();
