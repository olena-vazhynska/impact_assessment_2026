/* Participant view: a shareable, password-gated link (?view=participant) that
 * hides the admin-only Evidence dossier and Resources tabs.
 *
 * Note: this is a static site, so this gate is light deterrence, not real
 * security — anyone can read the data files directly or use the plain (admin)
 * URL. Keep the admin URL private; use the eCampus for anything confidential.
 *
 * Runs before app.js so the hidden tabs/panels are removed before the app
 * builds its tab list.
 */
(function () {
  "use strict";
  var params = new URLSearchParams(location.search);
  var mode = params.get("view");
  if (mode !== "participant" && mode !== "participants") return;

  // Remove the admin-only tabs and their panels.
  ["dossier", "resources"].forEach(function (t) {
    var btn = document.querySelector('.tabs button[data-tab="' + t + '"]');
    if (btn) btn.remove();
    var panel = document.getElementById("panel-" + t);
    if (panel) panel.remove();
  });
  document.title = "Impact Assessment 2026 — Participant view";

  var KEY = "ia2026-participant-unlocked";
  var DIGEST = "2105149598e55ec7d60d39d178b0de3f5ea1ce36803718b3b2f5a37897bea0b0";
  var unlocked = false;
  try { unlocked = sessionStorage.getItem(KEY) === "1"; } catch (e) { /* storage blocked */ }
  if (unlocked) { document.documentElement.classList.remove("gated"); return; }

  function reveal() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
    document.documentElement.classList.remove("gated");
    var g = document.getElementById("access-gate");
    if (g) g.remove();
  }

  function sha256hex(str) {
    var bytes = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  function build() {
    var g = document.createElement("div");
    g.id = "access-gate";
    g.innerHTML =
      '<div class="gate-card">' +
        '<p class="gate-eyebrow">ITCILO · Course A9718853</p>' +
        "<h1>Impact Assessment for Social Protection Analysts</h1>" +
        '<p class="gate-sub">Enter the course password to open the participant dashboard.</p>' +
        '<form id="gate-form"><label for="gate-pw">Password</label>' +
        '<input id="gate-pw" type="password" autocomplete="current-password" autofocus>' +
        '<button type="submit">Open dashboard</button>' +
        '<p class="gate-err" id="gate-err" role="alert" aria-live="polite"></p></form>' +
      "</div>";
    document.body.appendChild(g);
    var pw = document.getElementById("gate-pw");
    if (pw) pw.focus();
    document.getElementById("gate-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = document.getElementById("gate-err");
      if (!crypto || !crypto.subtle) { err.textContent = "This browser can't verify the password (needs a secure https connection)."; return; }
      sha256hex(document.getElementById("gate-pw").value).then(function (h) {
        if (h === DIGEST) reveal();
        else { err.textContent = "Incorrect password. Please try again."; var i = document.getElementById("gate-pw"); i.select(); }
      }).catch(function () { err.textContent = "Could not verify the password."; });
    });
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
