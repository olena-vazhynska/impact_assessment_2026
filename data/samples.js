// Sample records and scenarios for the Country Evidence Dossier.
//
// Worked examples use ONLY the course's fictional countries (Amrosea, Novaria).
// No real-country statistics are used here; every figure below is invented for
// the fictional country Amrosea and is for teaching only.

window.DOSSIER_SCHEMA_VERSION = 1;

window.SAMPLE_RECORDS = {
  amrosea: {
    participant: { name: "Sample Analyst", organisation: "Ministry of Labour (Amrosea)", role: "Social protection analyst" },
    country: {
      name: "Amrosea", region: "Fictional region (course example)", population: 18500000,
      currency: "AMD", poverty_line: 95, poverty_rate: 27.4, gdp: "62bn AMD", avg_wage: 420, data_year: 2024
    },
    stakeholders: [
      { id: "st1", name: "Ministry of Finance", type: "MoF", interests: "Fiscal cost and sustainability" },
      { id: "st2", name: "Ministry of Labour", type: "MoL", interests: "Coverage and delivery" },
      { id: "st3", name: "National Statistics Office", type: "NSO", interests: "Data quality and surveys" },
      { id: "st4", name: "Trade Union Congress", type: "social_partner", interests: "Benefit adequacy for workers" },
      { id: "st5", name: "Development partner", type: "donor", interests: "Results and targeting" },
      { id: "st6", name: "Civil society network", type: "civil_society", interests: "Inclusion and rights" }
    ],
    impacts: [
      { id: "im1", domain: "Consumption & food security", label: "Reduced food insecurity among poor households", stakeholder_ids: ["st2", "st6"], relevance: 3, evidence_wanted: true, missed_in_video: false },
      { id: "im2", domain: "Education", label: "Higher school attendance for children in beneficiary households", stakeholder_ids: ["st6"], relevance: 2, evidence_wanted: true, missed_in_video: false },
      { id: "im3", domain: "Local economy", label: "Local multiplier effects from cash transfers", stakeholder_ids: ["st1", "st5"], relevance: 2, evidence_wanted: false, missed_in_video: true },
      { id: "im4", domain: "Gender & empowerment", label: "Women's control over household resources", stakeholder_ids: ["st6"], relevance: 2, evidence_wanted: true, missed_in_video: true }
    ],
    schemes: [
      { id: "sc1", name: "Amrosea Child Grant", function: "children", type: "non_contributory", legal_basis: "Social Assistance Act 2016", administrator: "Ministry of Labour", eligibility: "Households with children under 15 below the means test", benefit_type: "cash", benefit_amount: 35, frequency: "monthly", beneficiaries: 640000, year: 2024, source: "MoL MIS 2024" },
      { id: "sc2", name: "Old-Age Contributory Pension", function: "old_age", type: "contributory", legal_basis: "Social Insurance Act 2004", administrator: "Amrosea Social Insurance Fund", eligibility: "15+ years of contributions, age 63", benefit_type: "cash", benefit_amount: 180, frequency: "monthly", beneficiaries: 210000, year: 2024, source: "ASIF annual report 2024" },
      { id: "sc3", name: "Disability Allowance", function: "disability", type: "non_contributory", legal_basis: "Social Assistance Act 2016", administrator: "Ministry of Labour", eligibility: "Certified disability, means test", benefit_type: "cash", benefit_amount: 50, frequency: "monthly", beneficiaries: 48000, year: 2024, source: "MoL MIS 2024" }
    ],
    toc: {
      scheme_id: "sc1",
      nodes: [
        { id: "n1", level: "input", label: "Budget allocation and beneficiary MIS", indicator: "Annual budget (% of GDP)", data_source: "MoF budget" },
        { id: "n2", level: "output", label: "Monthly cash paid to eligible households", indicator: "Beneficiaries reached", data_source: "MoL MIS" },
        { id: "n3", level: "outcome", label: "Increased household consumption", indicator: "Consumption per capita", data_source: "AHIS survey", impact_id: "im1" },
        { id: "n4", level: "impact", label: "Reduced child poverty", indicator: "Child poverty headcount", data_source: "AHIS + microsimulation", impact_id: "im1" }
      ],
      links: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" }]
    },
    indicators: [
      { id: "ind1", name: "Child Grant coverage", scheme_ids: ["sc1"], numerator: 640000, denominator: 2300000, denominator_label: "children under 15 in poor households", rate: 27.8, type: "coverage", benchmark: 50, source: "MoL MIS / AHIS", year: 2024 },
      { id: "ind2", name: "Old-age pension coverage", scheme_ids: ["sc2"], numerator: 210000, denominator: 1400000, denominator_label: "population above pension age", rate: 15.0, type: "coverage", benchmark: 60, source: "ASIF", year: 2024 },
      { id: "ind3", name: "Child Grant adequacy", scheme_ids: ["sc1"], numerator: 35, denominator: 95, denominator_label: "monthly poverty line", rate: 36.8, type: "adequacy", benchmark: 100, source: "MoL / NSO", year: 2024 }
    ],
    survey: {
      name: "Amrosea Household Income Survey (AHIS)", year: 2023, agency: "National Statistics Office",
      welfare_measure: "consumption", poverty_line_type: "national",
      sp_questions: [
        { topic: "Receipt by scheme", present: "yes", note: "Asks which programmes" },
        { topic: "Amount received", present: "partial", note: "Only a banded amount" },
        { topic: "Contributions paid", present: "no", note: "Not captured" },
        { topic: "Informal work", present: "yes", note: "Employment module" },
        { topic: "Disability", present: "partial", note: "Washington Group short set, partial" },
        { topic: "Shocks", present: "no", note: "No shocks module" },
        { topic: "Access barriers", present: "no", note: "Not captured" }
      ],
      gap_score: 3
    },
    microsim: {
      params: { child_benefit: 35, pension: 180, disability: 50, child_coverage: 60 },
      results: { headcount_before: 27.4, headcount_after: 23.1, gap_before: 9.2, gap_after: 6.8, gini_before: 0.41, gini_after: 0.385, cost_pct_gdp: 0.9 },
      interpretation: "Illustrative — based on your inputs, not an official estimate. Expanding the Child Grant to 60% coverage lowers the stylised poverty headcount by about 4 percentage points."
    },
    ie_design: {
      scheme_id: "sc1", question: "Does the Child Grant raise school attendance?", method: "Regression discontinuity",
      key_assumption: "Households just above and below the means-test cut-off are comparable",
      counterfactual: "Households just above the eligibility threshold", data: "AHIS + MIS", sample: "Households near the cut-off",
      threats: ["Manipulation of the eligibility score", "Attrition near the threshold"],
      ethics: "Informed consent; no benefit withheld for research", toc_node_ids: ["n3", "n4"]
    },
    distribution: {
      questions: ["Who receives the largest share of benefits?", "How progressive is the Child Grant?"],
      incidence: [
        { group: "Poorest quintile", share_of_benefits: 38, share_of_population: 20 },
        { group: "Quintile 2", share_of_benefits: 26, share_of_population: 20 },
        { group: "Quintile 3", share_of_benefits: 18, share_of_population: 20 },
        { group: "Quintile 4", share_of_benefits: 12, share_of_population: 20 },
        { group: "Richest quintile", share_of_benefits: 6, share_of_population: 20 }
      ],
      methods: ["Benefit incidence analysis"]
    },
    qual_design: {
      outcomes: [
        { toc_node_id: "n3", question: "How do households use the extra cash?", method: "Focus groups", sample: "8 groups across 4 regions", participants: "Beneficiary caregivers" },
        { toc_node_id: "n4", question: "What barriers keep eligible families from enrolling?", method: "Key informant interviews", sample: "20 interviews", participants: "Local officials and non-recipients" }
      ],
      ethics: "Consent, anonymity and safe interview settings"
    },
    evidence_map: {
      cells: [
        { level: "input", method: "admin", text: "Budget and MIS in MoF / MoL systems", status: "green" },
        { level: "output", method: "admin", text: "Beneficiary counts by scheme (2024)", status: "green" },
        { level: "outcome", method: "survey", text: "AHIS 2023 records receipt; amounts only banded", status: "amber" },
        { level: "outcome", method: "distribution", text: "Benefit incidence: 38% to the poorest quintile", status: "green" },
        { level: "outcome", method: "qual", text: "Focus groups proposed on cash use", status: "amber" },
        { level: "impact", method: "microsim", text: "Illustrative: -4pp poverty from Child Grant expansion", status: "amber" },
        { level: "impact", method: "ie", text: "RD design proposed; not yet conducted", status: "red" }
      ]
    },
    priorities: [
      { rank: 1, action: "Add a benefit-amount and shocks module to AHIS", method: "Survey", actors: ["NSO", "MoL"], cost_band: "medium", timeline: "Next survey round (2026)", toc_node_ids: ["n3"] },
      { rank: 2, action: "Commission an RD impact evaluation of the Child Grant", method: "Impact evaluation", actors: ["MoL", "Development partner"], cost_band: "high", timeline: "12-18 months", toc_node_ids: ["n4"] },
      { rank: 3, action: "Publish beneficiary data disaggregated by sex and region", method: "Routine data", actors: ["MoL"], cost_band: "low", timeline: "6 months", toc_node_ids: ["n2"] }
    ],
    situation_room: { team: "", first_choice: "", second_choice: "", rationale: "", link_to_own_country: "" },
    final: { slide_outline: [], memo_outline: [], self_assessment: { mastery: 0, analysis: 0, clarity: 0, compliance: 0 }, commitment: "" },
    progress: {
      S0: "done", S1: "done", S2: "done", S3: "done", S4: "done", S5: "in_progress", S6: "in_progress",
      S7: "in_progress", S8: "in_progress", S9: "in_progress", S10: "not_started", S11: "not_started", S12: "not_started",
      updated_at: "2026-10-29T12:00:00Z"
    }
  }
};

// Shared scenario for the Situation Room (S11). Fictional country Novaria.
window.DOSSIER_SCENARIOS = {
  novaria: {
    country: "Novaria",
    brief: "Novaria's cabinet must pick a first social protection reform within a tight fiscal envelope. Score each option, then choose a first and second preference as a team.",
    criteria: [
      { id: "fiscal_cost", label: "Fiscal cost (5 = most affordable)" },
      { id: "adequacy", label: "Adequacy gain" },
      { id: "coverage", label: "Coverage gain" },
      { id: "evidence_strength", label: "Strength of supporting evidence" }
    ],
    reforms: [
      { id: "r1", name: "Universal child benefit", note: "Tax-financed, all children 0-14" },
      { id: "r2", name: "Contributory pension expansion", note: "Lower the contribution threshold" },
      { id: "r3", name: "Disability grant top-up", note: "Raise benefit and broaden eligibility" },
      { id: "r4", name: "Unemployment assistance pilot", note: "Means-tested, urban areas first" }
    ]
  }
};
