// Immersive learning — each participant's individual journey through the
// integrated exercise (the Country Evidence Dossier), as a mini dashboard that
// refreshes every week from their submissions. ADMIN ONLY (hidden from the
// participant view until the team decides to open it).
//
// HOW THE WEEKLY REFRESH WORKS
// ----------------------------
// The cohort has not submitted anything yet, so `currentWeek` is 0 and every
// participant starts empty: no journey steps done, an all-grey Evidence Map,
// no logbook. After each week's forum/assignment deadline:
//   1. bump `currentWeek` (1 after week 1, 2 after week 2, …) and `updated`;
//   2. for each participant who submitted, set that week's `journey` step to
//      "draft" | "submitted" | "revised" and add a one-line `key`;
//   3. fill the Evidence Map cells their submission produced — set `status`
//      ("green" evidence exists · "amber" partial/proposed · "red" gap) and a
//      short `text` on the matching {level, method} cell. Cells left out stay
//      grey ("not yet assessed"). This is the same 4×6 map as the dossier.
//   4. add a `logbook` row: confidence 1–5, what moved it, feedback, what changed.
// The dashboard reads this file — nothing else to touch.
//
// The "Amrosea — worked example" entry in the dropdown is NOT a participant; it
// reuses the Amrosea teaching dataset (data/samples.js) to show, honestly, what
// a dashboard looks like once it has filled. Real participants below carry only
// what we actually know from the roster (name, country, organisation, role);
// their focus scheme and Minister's Question are declared by them in Week 1.

window.IMMERSIVE = {
  currentWeek: 0,                 // 0 = no submissions yet; becomes 1, 2, … weekly
  startDate: "2026-10-05",
  updated: "2026-10-01",
  exampleId: "amrosea",           // worked example, read from window.SAMPLE_RECORDS

  // Evidence Map axes — identical to the Country Evidence Dossier.
  levels: [
    { id: "input", label: "Inputs & activities" },
    { id: "output", label: "Outputs" },
    { id: "outcome", label: "Outcomes" },
    { id: "impact", label: "Impacts" }
  ],
  methods: [
    { id: "admin", label: "Admin data" },
    { id: "survey", label: "Household survey" },
    { id: "microsim", label: "Microsimulation" },
    { id: "ie", label: "Impact evaluation" },
    { id: "distribution", label: "Distributional" },
    { id: "qual", label: "Qualitative" }
  ],

  // The integrated exercise as a seven-step learning path. Each step names the
  // dossier stations it covers and the Evidence Map columns (method ids) its
  // submission fills — so the map visibly grows one or two columns per week.
  journey: [
    { ch: 1, week: 1, due: "2026-10-12", title: "Impacts & system map",
      stations: ["S0 Country Passport", "S1 Impact explorer", "S2 System map"],
      fills: ["admin"], feeds: "Slides 2–3 · Memo 1–2",
      focus: "Frame the Minister's Question, map the scheme inventory, pick the anchor scheme." },
    { ch: 2, week: 2, due: "2026-10-19", title: "Theory of change & indicators",
      stations: ["S3 Theory of change", "S4 Indicator calculator"],
      fills: ["admin"], feeds: "Slides 3–4 · Memo 2–3",
      focus: "Build the results chain and compute coverage & adequacy from admin data." },
    { ch: 3, week: 3, due: "2026-10-26", title: "Survey evidence & simulation",
      stations: ["S5 Survey scanner", "S6 Microsimulation"],
      fills: ["survey", "microsim"], feeds: "Slides 5–6 · Memo 4",
      focus: "Can the household survey measure the impacts? Simulate a benefit change." },
    { ch: 4, week: 4, due: "2026-11-02", title: "Causal impact & distribution",
      stations: ["S7 Impact evaluation", "S8 Who gets what"],
      fills: ["ie", "distribution"], feeds: "Slides 6–7 · Memo 4",
      focus: "Design a credible causal evaluation; analyse who benefits across groups." },
    { ch: 5, week: 5, due: "2026-11-09", title: "Qualitative evidence & priorities",
      stations: ["S9 Qualitative design", "S10 Evidence priorities"],
      fills: ["qual"], feeds: "Slide 8 · Memo 4",
      focus: "Design the 'why' evidence, then read the whole map and pick top-three actions." },
    { ch: 6, week: 6, due: "2026-11-16", title: "Situation Room & presentation",
      stations: ["S11 Situation Room", "Presentation prep"],
      fills: [], feeds: "Slides 9–10 · Memo 5",
      focus: "Weigh a reform as a team; assemble the slide deck." },
    { ch: 7, week: 7, due: "2026-12-06", title: "Technical Memo",
      stations: ["S12 National plan"],
      fills: [], feeds: "Final assessment (20 pts)",
      focus: "Deliver the national plan for impact assessment." }
  ],

  // Real participants — roster facts only. Everything they produce (focus,
  // Minister's Question, journey, Evidence Map, logbook) fills in from Week 1.
  participants: [
    { id: "p-simoes", name: "Ercília Simões", country: "Angola", region: "Africa",
      organisation: "MASFAMU", role: "National Director" },
    { id: "p-sebastian", name: "Sean Sebastian", country: "Belize", region: "Americas",
      organisation: "Social Security Board", role: "Manager, Statistical Services" },
    { id: "p-aitimova", name: "Shynar Aitimova", country: "Kazakhstan", region: "Europe & Central Asia",
      organisation: "State Social Insurance Fund", role: "Chief Manager" },
    { id: "p-mamo", name: "Bernard Mamo", country: "Malta", region: "Europe & Central Asia",
      organisation: "Ministry for Social Policy (MSPC)", role: "Senior Manager" },
    { id: "p-felix", name: "Ngozi Felix", country: "Nigeria", region: "Africa",
      organisation: "Ministry of Poverty Alleviation, Abia State", role: "Commissioner" },
    { id: "p-mgbemena", name: "Chioma Mgbemena", country: "Nigeria", region: "Africa",
      organisation: "NIMASA", role: "Technical Assistant" },
    { id: "p-uzuegbu", name: "Obinna Uzuegbu", country: "Nigeria", region: "Africa",
      organisation: "Ministry of Poverty Alleviation, Abia State", role: "Social Policy Officer" },
    { id: "p-habambi", name: "Habambi Philemon Habambi", country: "Tanzania", region: "Africa",
      organisation: "Women and Social Protection (WSP) Tanzania", role: "Researcher & Programme Officer" }
  ],

  // Illustrative journey + confidence for the Amrosea worked example (its
  // Evidence Map, schemes and indicators come from data/samples.js). This is a
  // teaching dataset, clearly labelled, not a real submission.
  example: {
    focus: { anchor_scheme: "Child allowance 0–10 (sc-child)", function: "Children & family",
             scheme_type: "Non-contributory · cash", target_group: "Children aged 0–10" },
    minister_question: "Is the child allowance reaching poor children, and does it reduce child poverty?",
    hunch: "Coverage is broad but adequacy and targeting are the open questions.",
    headline: "At least one benefit reaches 77.1% of the population (SDG 1.3.1, 2023)",
    journey: {
      1: { status: "revised", key: "17 schemes inventoried; child allowance set as the anchor" },
      2: { status: "revised", key: "Coverage 66% of children; pension adequacy 45% of average wage" },
      3: { status: "submitted", key: "AHIS scans partial on amounts; microsim shows −3pp child poverty" },
      4: { status: "draft", key: "RD design proposed; 38% of benefits reach the poorest quintile" },
      5: { status: "draft", key: "Focus groups on cash use drafted; top-three actions shortlisted" },
      6: { status: "not_started", key: "" },
      7: { status: "not_started", key: "" }
    },
    logbook: [
      { wk: 1, confidence: 2, moved: "Admin data can't see non-beneficiaries", feedback_from: "Fellow Evidence Lead", changed: "Sharpened the Minister's Question" },
      { wk: 2, confidence: 3, moved: "Coverage & adequacy computed from SSI", feedback_from: "Ministry of Finance", changed: "Added adequacy benchmark and assumptions" },
      { wk: 3, confidence: 4, moved: "Microsimulation gave a credible poverty effect", feedback_from: "NSO", changed: "Logged a survey gap on benefit amounts" },
      { wk: 4, confidence: 4, moved: "Benefit incidence showed progressivity", feedback_from: "Development partner", changed: "Chose an RD design for the next step" }
    ]
  }
};
