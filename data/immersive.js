// Immersive learning — facilitator view of each participant's Evidence Dossier
// journey. ADMIN ONLY (hidden from the participant view).
//
// This file is the weekly refresh point: after each Monday's submissions, update
// `currentWeek`, `updated`, and each participant's `chapters` status, one-line
// key result, and `logbook` row. Status values: not_started | draft | submitted
// | revised. Confidence is 1–5 (how confident the Evidence Lead is that evidence
// could answer their Minister's Question).
//
// The records below are SAMPLE (mock) data illustrating the layout for a cohort
// two weeks in — replace them with real submissions as they arrive.

window.IMMERSIVE = {
  currentWeek: 2,
  updated: "2026-10-19",
  // Chapter definitions (from the Evidence Dossier template).
  chapters: [
    { n: 1, title: "System map & evidence demand", week: 1, due: "2026-10-12", feeds: "Slides 2–3 · Memo 1–2" },
    { n: 2, title: "Theory of change & admin indicators", week: 2, due: "2026-10-19", feeds: "Slides 3–4 · Memo 2–3" },
    { n: 3, title: "Survey evidence & simulation", week: 3, due: "2026-10-26", feeds: "Slides 5–6 · Memo 4" },
    { n: 4, title: "Distribution & causal impact", week: 4, due: "2026-11-02", feeds: "Slides 6–7 · Memo 4" },
    { n: 5, title: "Qualitative evidence", week: 5, due: "2026-11-09", feeds: "Slide 8 · Memo 4" },
    { n: 6, title: "Presentation preparation", week: 6, due: "2026-11-16", feeds: "Slides 9–10 · Memo 5" },
    { n: 7, title: "Technical Memo", week: 7, due: "2026-12-06", feeds: "Final assessment (20 pts)" }
  ],

  participants: [
    {
      id: "p-simoes", name: "Ercília Simões", country: "Angola", organisation: "MASFAMU", role: "National Director",
      council: "Evidence Council A", anchor_scheme: "Valor Criança (child grant)", function: "Children & family",
      scheme_type: "Non-contributory · cash · targeted", target_group: "Poor children under 5",
      minister_question: "Is the child grant reaching the poorest children, and does it reduce child poverty?",
      hunch: "Coverage is improving but leakage to non-poor remains high.",
      headline: "Child grant reaches ~62% of poor under-5s (2024)",
      chapters: { 1: { status: "revised", key: "9 schemes mapped; child grant is the anchor" }, 2: { status: "submitted", key: "Coverage 62%, adequacy 41% of poverty line" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 2, moved: "Realised admin data can't see non-beneficiaries", feedback_from: "Fellow Evidence Lead", changed: "Sharpened the Minister's Question" },
        { wk: 2, confidence: 3, moved: "Coverage indicator computed from SSI", feedback_from: "Ministry of Finance", changed: "Added adequacy benchmark and 3 assumptions" }
      ]
    },
    {
      id: "p-sebastian", name: "Sean Sebastian", country: "Belize", organisation: "Social Security Board", role: "Manager, Statistical Services",
      council: "Evidence Council B", anchor_scheme: "Non-Contributory Pension", function: "Old age",
      scheme_type: "Non-contributory · cash · targeted", target_group: "Older persons without a contributory pension",
      minister_question: "How many older persons are left without any pension, and why?",
      hunch: "Coverage gaps concentrate among informal-sector workers.",
      headline: "Old-age pension coverage ~55% (contributory + social)",
      chapters: { 1: { status: "submitted", key: "Inventory done; pension system mapped" }, 2: { status: "draft", key: "Indicators drafted, denominators pending" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 3, moved: "Good admin coverage data available", feedback_from: "Fellow Evidence Lead", changed: "Narrowed to the coverage gap question" },
        { wk: 2, confidence: 3, moved: "Denominator uncertainty (informal workers)", feedback_from: "Ministry of Finance", changed: "Flagged data gap on informality" }
      ]
    },
    {
      id: "p-aitimova", name: "Shynar Aitimova", country: "Kazakhstan", organisation: "State Social Insurance Fund", role: "Chief Manager",
      council: "Evidence Council B", anchor_scheme: "Mandatory Pension Insurance", function: "Old age",
      scheme_type: "Contributory · cash · earnings-related", target_group: "Insured workers at retirement age",
      minister_question: "Will today's contributors retire with an adequate pension?",
      hunch: "Adequacy is at risk for workers with interrupted contributions.",
      headline: "81% of the labour force contributing to a pension",
      chapters: { 1: { status: "revised", key: "Contributory system mapped; anchor set" }, 2: { status: "submitted", key: "Contributor coverage 81%; replacement rate 45%" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 3, moved: "Strong administrative records", feedback_from: "Fellow Evidence Lead", changed: "Focused on adequacy, not just coverage" },
        { wk: 2, confidence: 4, moved: "Replacement-rate indicator computed", feedback_from: "Ministry of Finance", changed: "Added contribution-density assumption" }
      ]
    },
    {
      id: "p-mamo", name: "Bernard Mamo", country: "Malta", organisation: "Ministry for Social Policy (MSPC)", role: "Senior Manager",
      council: "Evidence Council A", anchor_scheme: "Children's Allowance", function: "Children & family",
      scheme_type: "Non-contributory · cash · universal", target_group: "Families with children",
      minister_question: "Does the universal children's allowance still reduce child poverty effectively?",
      hunch: "Universality helps coverage but adequacy has eroded with inflation.",
      headline: "Children's allowance covers ~96% of families with children",
      chapters: { 1: { status: "submitted", key: "System mapped; universal allowance anchored" }, 2: { status: "submitted", key: "Coverage 96%; adequacy falling in real terms" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 4, moved: "Rich EU-SILC and admin data", feedback_from: "Fellow Evidence Lead", changed: "Framed around adequacy erosion" },
        { wk: 2, confidence: 4, moved: "Real-value trend of the benefit", feedback_from: "Ministry of Finance", changed: "Added indexation assumption to register" }
      ]
    },
    {
      id: "p-felix", name: "Ngozi Felix", country: "Nigeria", organisation: "Ministry of Poverty Alleviation, Abia State", role: "Commissioner",
      council: "Evidence Council C", anchor_scheme: "Conditional Cash Transfer", function: "General social assistance",
      scheme_type: "Non-contributory · cash · targeted", target_group: "Poor and vulnerable households",
      minister_question: "Is the cash transfer reaching the intended poor households in the state?",
      hunch: "Targeting misses many eligible households (exclusion error).",
      headline: "CCT reaches a small share of the eligible poor (to confirm)",
      chapters: { 1: { status: "submitted", key: "State system mapped; CCT anchored" }, 2: { status: "draft", key: "Coverage estimate drafting; data thin" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 2, moved: "Administrative data are fragmented", feedback_from: "Fellow Evidence Lead", changed: "Prioritised the targeting question" },
        { wk: 2, confidence: 2, moved: "Denominator (eligible poor) hard to pin down", feedback_from: "Ministry of Finance", changed: "Logged a survey-data need" }
      ]
    },
    {
      id: "p-mgbemena", name: "Chioma Mgbemena", country: "Nigeria", organisation: "NIMASA", role: "Technical Assistant",
      council: "Evidence Council C", anchor_scheme: "Maternity Benefit", function: "Maternity",
      scheme_type: "Contributory · cash", target_group: "Insured mothers with newborns",
      minister_question: "Do insured mothers actually receive maternity benefits when they give birth?",
      hunch: "Formal-sector coverage is high but reach beyond it is minimal.",
      headline: "Maternity benefit reaches insured mothers only (coverage TBC)",
      chapters: { 1: { status: "draft", key: "Inventory started; anchor being confirmed" }, 2: { status: "not_started", key: "" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 2, moved: "Still choosing between two anchor schemes", feedback_from: "Fellow Evidence Lead", changed: "Leaning towards maternity benefit" }
      ]
    },
    {
      id: "p-uzuegbu", name: "Obinna Uzuegbu", country: "Nigeria", organisation: "Ministry of Poverty Alleviation, Abia State", role: "Social Policy Officer",
      council: "Evidence Council C", anchor_scheme: "Public Works Programme", function: "Unemployment / general assistance",
      scheme_type: "Non-contributory · cash-for-work · targeted", target_group: "Working-age poor",
      minister_question: "Does public works provide meaningful income support to the poor?",
      hunch: "Reach is limited and benefits are too small to move households out of poverty.",
      headline: "Public works reaches a thin slice of the working-age poor",
      chapters: { 1: { status: "submitted", key: "System mapped; public works anchored" }, 2: { status: "not_started", key: "" }, 3: { status: "not_started", key: "" }, 4: { status: "not_started", key: "" }, 5: { status: "not_started", key: "" }, 6: { status: "not_started", key: "" }, 7: { status: "not_started", key: "" } },
      logbook: [
        { wk: 1, confidence: 3, moved: "Clear programme documentation", feedback_from: "Fellow Evidence Lead", changed: "Framed around adequacy of the wage" }
      ]
    }
  ]
};
