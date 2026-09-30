// Sample records and scenarios for the Country Evidence Dossier.
//
// Worked examples use ONLY the course's fictional countries (Amrosea, Novaria).
// No real-country statistics are used here; every figure below is invented for
// the fictional country Amrosea and is for teaching only.

window.DOSSIER_SCHEMA_VERSION = 1;

window.SAMPLE_RECORDS = {
  amrosea: {
    participant: { name: "Sample Analyst", organisation: "Ministry of Labour (Amrosea)", role: "Social protection analyst" },
    // Figures from the ILO Social Security Inquiry calculator and the effective-
    // coverage methodology deck for the fictional country Amrosea (year 2023).
    // Currency: Amrosean dollar (A$); 1 US$ = 6.58 A$. Person counts below are
    // full persons (the SSI workbook reports them in thousands).
    country: {
      name: "Amrosea", region: "Fictional country (ILO SSI example)", population: 41531000,
      currency: "A$", poverty_line: 375, poverty_rate: 16.1, gdp: "28.65bn A$", avg_wage: 2156, data_year: 2023
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
      { id: "im1", domain: "consumption", label: "Reduced food insecurity among poor households", stakeholder_ids: ["st2", "st6"], relevance: 3, evidence_wanted: true, missed_in_video: false },
      { id: "im2", domain: "education", label: "Higher school attendance for children in beneficiary households", stakeholder_ids: ["st6"], relevance: 2, evidence_wanted: true, missed_in_video: false },
      { id: "im3", domain: "local_economy", label: "Local multiplier effects from cash transfers", stakeholder_ids: ["st1", "st5"], relevance: 2, evidence_wanted: false, missed_in_video: true },
      { id: "im4", domain: "gender", label: "Women's control over household resources", stakeholder_ids: ["st6"], relevance: 2, evidence_wanted: true, missed_in_video: true }
    ],
    // ILO Social Security Inquiry inventory for Amrosea, 2023 (beneficiary counts,
    // full persons). Source: "ILO SSI / Fictif Amrosea" synthetic dataset.
    schemes: [
      { id: "sc-pen-oa", name: "Statutory pension insurance", function: "old_age", type: "contributory", legal_basis: "Statutory pension insurance", administrator: "Pension fund", eligibility: "Insured persons at retirement age (65)", benefit_type: "cash", benefit_amount: 970, frequency: "monthly", beneficiaries: 1587000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-pen-lti", name: "Old-age pension for long-term insured persons", function: "old_age", type: "contributory", legal_basis: "Statutory pension insurance", administrator: "Pension fund", eligibility: "Long-term insured persons", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 373000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-pen-mining", name: "Old-age pension for workers in the mining industry", function: "old_age", type: "contributory", legal_basis: "Statutory pension insurance", administrator: "Pension fund", eligibility: "Insured mining workers", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 6000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-pen-disab", name: "Pension for severely disabled persons", function: "disability", type: "contributory", legal_basis: "Statutory pension insurance", administrator: "Pension fund", eligibility: "Insured persons with severe disability", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 647000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-farm-oa", name: "Pension for farmers", function: "old_age", type: "contributory", legal_basis: "Farmers' pension", administrator: "Rural insurance fund", eligibility: "Insured farmers at retirement age", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 217000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-accident", name: "Statutory accident insurance", function: "employment_injury", type: "contributory", legal_basis: "Accident insurance", administrator: "Accident insurance fund", eligibility: "Insured employees", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 246000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-rural-disab", name: "Statutory rural accident insurance", function: "employment_injury", type: "contributory", legal_basis: "Rural accident insurance", administrator: "Rural insurance fund", eligibility: "Insured farmers", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 70000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-unemp", name: "Unemployment insurance", function: "unemployment", type: "contributory", legal_basis: "Unemployment insurance", administrator: "Employment office", eligibility: "Insured unemployed", benefit_type: "cash", benefit_amount: 668, frequency: "monthly", beneficiaries: 456000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-mat", name: "Maternity insurance", function: "maternity", type: "contributory", legal_basis: "Maternity insurance", administrator: "Health/maternity fund", eligibility: "Insured mothers with newborns", benefit_type: "cash", benefit_amount: null, frequency: "one-off", beneficiaries: 438000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-health", name: "Mandatory health insurance", function: "health", type: "contributory", legal_basis: "Health insurance", administrator: "Health insurance fund", eligibility: "Insured persons and dependants", benefit_type: "in_kind", benefit_amount: null, frequency: "ongoing", beneficiaries: 25546000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-child", name: "Child allowance 0-10", function: "children", type: "non_contributory", legal_basis: "Child allowance", administrator: "Ministry of Labour", eligibility: "Children aged 0-10", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 6067000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-socpen", name: "Social pension (poor elders)", function: "old_age", type: "non_contributory", legal_basis: "Social pension", administrator: "Ministry of Labour", eligibility: "Poor persons above pension age", benefit_type: "cash", benefit_amount: 300, frequency: "monthly", beneficiaries: 745000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-assist-poor", name: "Assistance to the poor", function: "general_assistance", type: "non_contributory", legal_basis: "Social assistance", administrator: "Ministry of Labour", eligibility: "Households below the national poverty line", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 5104000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-school-food", name: "Food assistance to children (school lunch)", function: "children", type: "non_contributory", legal_basis: "School feeding", administrator: "Ministry of Education", eligibility: "School-age children", benefit_type: "in_kind", benefit_amount: null, frequency: "ongoing", beneficiaries: 994000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-pubwork", name: "Public work programme", function: "unemployment", type: "non_contributory", legal_basis: "Public works", administrator: "Employment office", eligibility: "Working-age poor", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 145000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-housing-eld", name: "Housing allowance to poor elders", function: "general_assistance", type: "non_contributory", legal_basis: "Housing allowance", administrator: "Ministry of Labour", eligibility: "Poor elderly", benefit_type: "cash", benefit_amount: null, frequency: "monthly", beneficiaries: 548000, year: 2023, source: "ILO SSI / Fictif Amrosea" },
      { id: "sc-childbirth", name: "Childbirth support", function: "maternity", type: "non_contributory", legal_basis: "Childbirth grant", administrator: "Ministry of Labour", eligibility: "Mothers with newborns", benefit_type: "cash", benefit_amount: null, frequency: "one-off", beneficiaries: 511000, year: 2023, source: "ILO SSI / Fictif Amrosea" }
    ],
    toc: {
      scheme_id: "sc-child",
      nodes: [
        { id: "n1", level: "input", label: "Budget allocation and beneficiary MIS", indicator: "Annual budget (% of GDP)", data_source: "MoF budget" },
        { id: "n2", level: "output", label: "Monthly child allowance paid to eligible children", indicator: "Children reached (6.07m)", data_source: "ILO SSI / MIS" },
        { id: "n3", level: "outcome", label: "Increased household consumption", indicator: "Consumption per capita", data_source: "AHIS survey", impact_id: "im1" },
        { id: "n4", level: "impact", label: "Reduced child poverty", indicator: "Child poverty headcount", data_source: "AHIS + microsimulation", impact_id: "im1" }
      ],
      links: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" }]
    },
    // Effective coverage by function (ILO SSI methodology): numerator = actual
    // beneficiaries/contributors, denominator = reference population. Rates and
    // counts from the Amrosea SSI calculator, 2023 (persons).
    indicators: [
      { id: "ind-agg", name: "At least one benefit (SDG 1.3.1 aggregate)", scheme_ids: [], numerator: 32030000, denominator: 41531000, denominator_label: "total population", rate: 77.1, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-child", name: "Children covered", scheme_ids: ["sc-child", "sc-school-food"], numerator: 6067000, denominator: 9193000, denominator_label: "children aged 0-15", rate: 66.0, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-mat", name: "Mothers with newborns receiving maternity benefits", scheme_ids: ["sc-mat", "sc-childbirth"], numerator: 438000, denominator: 616000, denominator_label: "women giving birth", rate: 71.1, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-unemp", name: "Unemployed receiving benefits", scheme_ids: ["sc-unemp", "sc-pubwork"], numerator: 456000, denominator: 1498000, denominator_label: "registered unemployed", rate: 30.4, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-wi", name: "Workers covered for employment injury", scheme_ids: ["sc-accident", "sc-rural-disab"], numerator: 8175000, denominator: 20294000, denominator_label: "labour force", rate: 40.3, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-dis", name: "Persons with severe disability receiving benefits", scheme_ids: ["sc-pen-disab", "sc-rural-disab"], numerator: 717000, denominator: 1080000, denominator_label: "people with severe disability", rate: 66.4, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-pencontrib", name: "Workforce contributing to a pension", scheme_ids: ["sc-pen-oa", "sc-farm-oa", "sc-pen-mining"], numerator: 16512000, denominator: 20294000, denominator_label: "labour force", rate: 81.4, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-oa", name: "Older persons receiving a pension", scheme_ids: ["sc-pen-oa", "sc-pen-lti", "sc-pen-mining", "sc-farm-oa", "sc-socpen"], numerator: 2928000, denominator: 3425000, denominator_label: "population above retirement age (65)", rate: 85.5, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-poor", name: "Poor receiving social assistance", scheme_ids: ["sc-assist-poor"], numerator: 5103000, denominator: 6674000, denominator_label: "population below the national poverty line", rate: 76.5, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-vuln", name: "Vulnerable persons covered", scheme_ids: ["sc-child", "sc-socpen", "sc-assist-poor"], numerator: 11916000, denominator: 21656000, denominator_label: "population without contributory coverage", rate: 55.0, type: "coverage", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-adq-pen", name: "Pension adequacy (regular pension vs average wage)", scheme_ids: ["sc-pen-oa"], numerator: 970, denominator: 2156, denominator_label: "average wage (A$/month)", rate: 45.0, type: "adequacy", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-adq-unemp", name: "Unemployment benefit adequacy (minimum vs minimum wage)", scheme_ids: ["sc-unemp"], numerator: null, denominator: null, denominator_label: "minimum wage", rate: 43.9, type: "adequacy", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-adq-transfer", name: "Cash transfer adequacy (vs national poverty line)", scheme_ids: ["sc-socpen", "sc-assist-poor"], numerator: 300, denominator: 375, denominator_label: "national poverty line (A$/month)", rate: 80.0, type: "adequacy", benchmark: 100, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 },
      { id: "ind-exp", name: "Social protection expenditure, excl. health (% of GDP)", scheme_ids: [], numerator: 8309715, denominator: 286541913, denominator_label: "GDP (A$ thousands)", rate: 2.9, type: "other", benchmark: null, source: "ILO SSI calculator / Fictif Amrosea", year: 2023 }
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
      params: { child_benefit: 300, pension: 970, disability: 300, child_coverage: 80 },
      results: { headcount_before: 16.1, headcount_after: 12.8, gap_before: 5.4, gap_after: 3.9, gini_before: 0.402, gini_after: 0.381, cost_pct_gdp: 3.6 },
      interpretation: "Illustrative — based on your inputs, not an official estimate. Raising child allowance coverage from 66% to 80% lowers the stylised poverty headcount by about 3 percentage points."
    },
    ie_design: {
      scheme_id: "sc-child", question: "Does the child allowance raise school attendance?", method: "Regression discontinuity",
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
        { level: "input", method: "admin", text: "SSI inventory: 17 schemes catalogued (2023)", status: "green" },
        { level: "output", method: "admin", text: "Beneficiaries by function (SSI 2023)", status: "green" },
        { level: "outcome", method: "admin", text: "Effective coverage by function; SDG 1.3.1 = 77.1%", status: "green" },
        { level: "outcome", method: "survey", text: "AHIS 2023 records receipt; amounts only banded", status: "amber" },
        { level: "outcome", method: "distribution", text: "Benefit incidence: 38% to the poorest quintile", status: "green" },
        { level: "outcome", method: "qual", text: "Focus groups proposed on cash use", status: "amber" },
        { level: "impact", method: "microsim", text: "Illustrative: -3pp poverty from child allowance expansion", status: "amber" },
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
