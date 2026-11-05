// Immersive learning — each participant's individual journey through the
// integrated exercise (the Country Evidence Dossier), as a mini dashboard that
// refreshes every week from their submissions. ADMIN ONLY (hidden from the
// participant view until the team decides to open it).
//
// HOW THE WEEKLY REFRESH WORKS
// ----------------------------
// `currentWeek` is the last week whose assignment has been marked. After each
// week's forum/assignment deadline:
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
// Everything below the roster fields comes from the participants' own weekly
// dossiers (Chapters 1–4, Weeks 1–4). No marks, scores or assessment comments
// are held here; `confidence` is the participant's own self-rating from their
// Evidence Lead's Logbook. Participants with no entry beyond the roster have
// not submitted. Note that this is a static site and the participant-view gate
// is light deterrence only — anything confidential belongs on the eCampus.
//
// The "Amrosea — worked example" entry in the dropdown is NOT a participant; it
// reuses the Amrosea teaching dataset (data/samples.js) as a reference of what
// a complete dashboard looks like.

window.IMMERSIVE = {
  currentWeek: 4,                 // last marked week; bump after each deadline
  startDate: "2026-10-05",
  updated: "2026-11-05",
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

  // Participants, with everything their Weeks 1–4 dossiers produced. Roster
  // fields (name, country, region, organisation, role) come from the cohort
  // list; focus, minister_question, hunch, headline, journey, cells and
  // logbook are taken from the submitted chapters. A participant carrying
  // roster fields only has not submitted.
  participants: [
    { id: "p-simoes", name: "Ercília Simões", country: "Angola", region: "Africa",
      organisation: "MASFAMU", role: "National Director",
      focus: { anchor_scheme: "Kwenda — Programa de Fortalecimento da Protecção Social",
               function: "General social assistance",
               scheme_type: "Non-contributory · cash transfer · targeted",
               target_group: "Vulnerable households in the lowest poverty quintiles" },
      minister_question: "Will we be able to implement Kwenda with the country's own resources beyond 2029, ensuring coverage and adequacy and taking the population growth rate into account?",
      hunch: "Coverage has scaled up to its baseline goals, but adequacy remains a structural challenge: the Kz 11,000 transfer (about USD 12) is under macroeconomic pressure.",
      headline: "The Kz 11,000 transfer is about 90% of the Kz 12,181 poverty line (2024); 71% of beneficiaries are women",
      journey: {
        1: { status: "submitted", key: "12 schemes inventoried in Portuguese and English; Kwenda set as the anchor, with over 80% of workers informally employed" },
        2: { status: "submitted", key: "Adequacy about 90% of the poverty line; 71/29 female–male split; the coverage numerator still to reconcile" },
        3: { status: "draft", key: "IDREA 2018–19 identified (12,448 households), but it predates Kwenda, so no national survey can yet identify the scheme" },
        4: { status: "not_started", key: "" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "12 schemes inventoried with institution, legal basis and programme type" },
        { level: "output", method: "admin", status: "amber", text: "Coverage numerator of 7,768,030 does not reconcile with the 1,751,621 beneficiaries in the inventory" },
        { level: "outcome", method: "admin", status: "green", text: "Kz 11,000 transfer against a Kz 12,181 poverty line — about 90%; 71% of recipients women" },
        { level: "output", method: "survey", status: "amber", text: "IDREA 2018–19: welfare aggregate, adult equivalence and the four A-MPI dimensions set out" },
        { level: "outcome", method: "survey", status: "red", text: "IDREA 2018–19 predates Kwenda (2021), so the scheme cannot be identified in any national survey" }
      ],
      logbook: [
        { wk: 2, confidence: 4, moved: "Council contributions and existing programme data", feedback_from: "Ministry of Finance", changed: "Reframed the question around whether poverty reduction justifies continuity on domestic resources beyond 2029" },
        { wk: 3, confidence: 4, moved: "Survey identified and the poverty measure set out", feedback_from: "NSO survey manager", changed: "Added the adult-equivalence scale, economies of scale within households and the four A-MPI dimensions" }
      ] },

    { id: "p-sebastian", name: "Sean Sebastian", country: "Belize", region: "Americas",
      organisation: "Social Security Board", role: "Manager, Statistical Services" },

    { id: "p-aitimova", name: "Shynar Aitimova", country: "Kazakhstan", region: "Europe & Central Asia",
      organisation: "State Social Insurance Fund", role: "Chief Manager",
      focus: { anchor_scheme: "Social Payment for Job Loss (State Social Insurance Fund)",
               function: "Unemployment",
               scheme_type: "Contributory social insurance · cash · no income or poverty test",
               target_group: "Registered unemployed with at least six months of insurance" },
      minister_question: "How will reducing the maximum payment period from six to three months, starting on 1 January 2027, affect people's return to work and their financial security?",
      hunch: "A shorter payment period may help some people return to work faster, but it may also increase financial problems for those who need longer to find a job.",
      headline: "More than 314,500 people received job-loss payments in January–August 2026 — a beneficiary count, not a coverage rate",
      journey: {
        1: { status: "submitted", key: "All nine functions mapped; 314,500 recipients and KZT 101bn recorded for January–August 2026" },
        2: { status: "submitted", key: "Reform-specific theory of change built; five of six indicator rows not calculable for want of a denominator" },
        3: { status: "submitted", key: "Survey verified down to forms D 003 and D 004; D 004 pools the job-loss payment with all other benefits" },
        4: { status: "submitted", key: "Entitlement-exposure difference-in-differences assigned on pre-2027 rules; no power calculation or cost figure yet" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "Social Code rules documented: 0.45 replacement coefficient, contribution-period factor, financing" },
        { level: "output", method: "admin", status: "green", text: "314,500 recipients and KZT 101bn, January–August 2026 (SSIF)" },
        { level: "outcome", method: "admin", status: "red", text: "No record links benefit history to later employment or earnings; eligible non-recipients unknown" },
        { level: "output", method: "survey", status: "amber", text: "2025 BNS Household Budget Survey verified down to statistical forms D 003 and D 004" },
        { level: "outcome", method: "survey", status: "red", text: "D 004 section 3 groups the job-loss payment with all other social benefits" },
        { level: "impact", method: "microsim", status: "amber", text: "Mechanical entitlement illustration only, explicitly labelled as not an impact estimate" },
        { level: "outcome", method: "ie", status: "amber", text: "DiD comparing 4–6 against 1–3 months of entitlement under pre-2027 rules; no MDE yet" },
        { level: "impact", method: "distribution", status: "amber", text: "Distributional and economic questions set out; the claimant-level panel does not yet exist" }
      ],
      logbook: [
        { wk: 1, confidence: 2, moved: "Legal documents and aggregate SSIF statistics are available; the causal effect of the new rules is unknown", feedback_from: "Fellow Evidence Lead", changed: "Defined the question, the anchor scheme, the stakeholders and the main evidence gaps" },
        { wk: 2, confidence: 2, moved: "Observable indicators and critical data gaps defined, but no causal evidence and no SSI workbook", feedback_from: "Ministry of Labour (reply not received)", changed: "Added a reform-specific theory of change, baseline figures and three testable assumptions" },
        { wk: 3, confidence: 2, moved: "Survey design, poverty definition and the D 004 combined item verified; still no SSIF-linked microdata", feedback_from: "NSO survey manager (reply not received)", changed: "Audited five modules, proposed three improvements and documented a rule-based entitlement illustration" },
        { wk: 4, confidence: 2, moved: "A clearer counterfactual and linked-data plan, but no claimant panel, pre-trend test or post-2027 outcome", feedback_from: "Social partner (reply not received)", changed: "Added an entitlement-exposure DiD, financial-hardship outcomes and three updated assumptions" }
      ] },

    { id: "p-mamo", name: "Bernard Mamo", country: "Malta", region: "Europe & Central Asia",
      organisation: "Ministry for Social Policy (MSPC)", role: "Senior Manager",
      focus: { anchor_scheme: "Two-Thirds Pension, National Contributory Pension Scheme (Cap. 318)",
               function: "Old age (the wider scheme also covers invalidity and survivors)",
               scheme_type: "Contributory · cash, periodic · earnings-related, not means-tested",
               target_group: "Insured employees and self-employed persons reaching pension age" },
      minister_question: "Should the Government phase non-basic wages into the tripartite contribution base over four years (25%, 50%, 75%, 100%), capped at the MPI and assessed annually, given its effect on take-home pay and pension adequacy for women and men below the MPI, and on the system's long-term sustainability?",
      hunch: "Limited added pension liability, since basic wages are rising faster than the MPI and most workers reach the maximum pension anyway; adequacy gains concentrate among low earners with high non-basic pay, so the measure mainly closes a revenue gap.",
      headline: "The Two-Thirds Pension reaches 73% of men but 25% of women aged 61 and over, and pays on average about 91% of the poverty line (2025)",
      journey: {
        1: { status: "revised", key: "19 schemes inventoried (€4.36bn); the question narrowed from three bundled decisions to one, dropping the ring-fenced fund" },
        2: { status: "revised", key: "Coverage 47.6% of those aged 61+ (men 72.5%, women 25.1%); average pension 91.5% of the poverty line" },
        3: { status: "revised", key: "EU-SILC cannot split basic from non-basic pay; the TRR microsimulation returns €2.65 of pension per €1 for men, €3.24 for women" },
        4: { status: "revised", key: "Full simulation on 307,625 contributor records; DiD with continuous exposure; net €0.71 of liability per €1 collected" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "19 schemes, €4.36bn; Two-Thirds Pension €729.3m, about 3.0% of GDP (2025)" },
        { level: "output", method: "admin", status: "green", text: "63,512 pensioners against 330,614 contributors — 81% of the working-age population" },
        { level: "outcome", method: "admin", status: "green", text: "Coverage 47.6% of those aged 61+, reported by sex; 18.3% of old-age pensioners on a minimum pension" },
        { level: "output", method: "survey", status: "red", text: "EU-SILC question E1a records basic and non-basic pay as one amount, so the split cannot be identified" },
        { level: "outcome", method: "survey", status: "amber", text: "EU-SILC 2025 gives the €13,220 poverty line, but PY100G pools the scheme with other old-age benefits" },
        { level: "outcome", method: "microsim", status: "green", text: "National TRR model: €2.65 (men) and €3.24 (women) of pension per €1 of employee contribution" },
        { level: "impact", method: "microsim", status: "amber", text: "A worker on €18,000 moves from 81% to 96% of the 2065 poverty line; model workers, not microdata" },
        { level: "outcome", method: "ie", status: "amber", text: "DiD with continuous exposure, employer × year effects and a triple difference; MDE and decision rule registered in advance" },
        { level: "impact", method: "distribution", status: "amber", text: "Fiscal incidence (CEQ) designed on the lifetime simulation; awaits the EU-SILC–Class 1–FS3 linkage" },
        { level: "impact", method: "qual", status: "amber", text: "Focus groups with shift workers through the unions planned to test assumption A1" }
      ],
      logbook: [
        { wk: 1, confidence: 4, moved: "Confirmed the payroll records for 2008–2025 split basic from non-basic pay by sex and employer", feedback_from: "Fellow Evidence Lead (Mgbemena)", changed: "Dropped the ring-fenced fund from the question, added results by sex and added minimum-pension recipients to 1.3" },
        { wk: 2, confidence: 4, moved: "Payroll records can measure the income shock directly; household effects and the employer response still need survey data", feedback_from: "Ministry of Finance", changed: "Reframed A3 as the net fiscal effect — present value of added liability per €1 of extra contributions" },
        { wk: 3, confidence: 4, moved: "The microsimulation shows who gains and by how much, but group sizes and household income remain untested", feedback_from: "NSO survey manager", changed: "Replaced the E1a follow-up question with linkage of EU-SILC to Class 1 and FS3 records" },
        { wk: 4, confidence: 4, moved: "The full simulation gives the net fiscal effect (€0.71 per €1), and the design can test the employer response from 2027", feedback_from: "Social partner", changed: "Redesigned the package (pension credit, €1,000 exemption, ring-fenced reserve) and added employer × year effects and a triple difference" }
      ] },

    { id: "p-felix", name: "Ngozi Felix", country: "Nigeria", region: "Africa",
      organisation: "Ministry of Poverty Alleviation, Abia State", role: "Commissioner",
      focus: { anchor_scheme: "Contributory Pension Scheme (CPS) — Micro Pension Plan",
               function: "Old age; survivors",
               scheme_type: "Contributory · cash · employment-based, voluntary for informal workers",
               target_group: "Informal-sector workers saving under the Micro Pension Plan" },
      minister_question: "Should Nigeria prioritise more flexible contribution arrangements for informal-sector workers under the Contributory Pension Scheme, given what the evidence shows about sustained contributions and prospects for adequate retirement income?",
      hunch: "Flexible payment arrangements should make enrolment and regular saving easier for some informal workers, but irregular and low earnings may stop many from building adequate balances — an expectation to be tested, not an established effect.",
      headline: "5.87% of registered Micro Pension accounts were funded by December 2024 (10,155 of 172,936) — a funded-registration measure, not national coverage",
      journey: {
        1: { status: "submitted", key: "System map complete across nine functions, holding registrations, active contributors and pension recipients apart throughout" },
        2: { status: "submitted", key: "Funded-registration share 5.87%; the 30.9% female share labelled registration composition, not women's coverage" },
        3: { status: "not_started", key: "" },
        4: { status: "not_started", key: "" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "PRA 2014, PenCom supervision and the voluntary Micro Pension channel documented" },
        { level: "output", method: "admin", status: "green", text: "10,583,853 cumulative RSAs; 172,936 Micro Pension registrations of which 10,155 funded (2024)" },
        { level: "outcome", method: "admin", status: "red", text: "Six-of-twelve-month contribution continuity needs PFA transaction records, which are not published" },
        { level: "impact", method: "admin", status: "red", text: "Registration and asset stocks do not establish monthly pension adequacy" }
      ],
      logbook: [
        { wk: 1, confidence: 3, moved: "PenCom reports registrations and pension assets, but these establish neither active participation nor adequacy for informal workers", feedback_from: "Obinna Uzuegbu (Fellow Evidence Lead)", changed: "Sharpened the question around sustained contributions and adequate retirement income" },
        { wk: 2, confidence: 3, moved: "The 5.87% funded share is clearer than registration alone, but shows neither contribution frequency nor retirement adequacy", feedback_from: "Obinna Uzuegbu (Ministry of Finance)", changed: "Added a six-of-twelve-month continuity indicator and named PFA monthly transaction records as the missing evidence" }
      ] },

    { id: "p-mgbemena", name: "Chioma Mgbemena", country: "Nigeria", region: "Africa",
      organisation: "NIMASA", role: "Technical Assistant",
      focus: { anchor_scheme: "Contributory Pension Scheme (CPS), Pension Reform Act 2014",
               function: "Old age, with survivors' and invalidity rights attached to the RSA",
               scheme_type: "Contributory · cash · mandatory, fully funded individual accounts",
               target_group: "Nigerian seafarers and dockworkers within the CPS" },
      minister_question: "As the Pension Reform Bill 2026 tightens remittance rules, should verified pension remittance also become a condition of NIMASA licences for maritime employers, given what we know about how non-remittance and early withdrawals reduce the retirement savings of Nigerian seafarers and dockworkers compared with other formal-sector workers?",
      hunch: "Maritime workers have lower effective coverage and smaller RSA balances than their formal-sector peers, mainly through non-remittance and gaps between contracts; without licence-linked checks and shared data, enforcement in shipping will stay weak.",
      headline: "Older persons receiving a pension: 4.8% (CPS 4.6%); labour force with a pension account: 14.6% at most (2024)",
      journey: {
        1: { status: "submitted", key: "17 schemes inventoried including state-level provision; CPS set as the anchor, with seafarers and dockworkers as the focus group" },
        2: { status: "revised", key: "Coverage 14.6% of the labour force at most, reconciled against ILOSTAT's 19.6%; average pension 88% of the minimum wage" },
        3: { status: "revised", key: "Only 48 maritime workers in NLSS 2023; the cohort model puts the maritime median at ₦23,385 against ₦63,281" },
        4: { status: "revised", key: "Randomised phase-in across 725 employers, MDE about 5.5 points, denominator moved from payroll to total crew" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "17 schemes inventoried; CPS holds 11.39m RSAs and ₦31.8tn in assets (August 2026)" },
        { level: "output", method: "admin", status: "amber", text: "14.6% of the labour force hold an RSA — an upper bound; PenCom publishes no industry split" },
        { level: "outcome", method: "admin", status: "green", text: "4.8% of people aged 60+ draw a pension; the average pension is 88% of the minimum wage" },
        { level: "output", method: "survey", status: "red", text: "Only 48 sampled NLSS 2023 workers fall within maritime ISIC codes — no estimate for the target group" },
        { level: "outcome", method: "survey", status: "amber", text: "10.5% of private-sector wage workers report a pension entitlement, against 88.5% in federal employment" },
        { level: "outcome", method: "microsim", status: "green", text: "Cohort model: licence-linked remittance lifts the maritime median from ₦23,385 to ₦44,010 a month" },
        { level: "impact", method: "microsim", status: "amber", text: "ESCAP simulator, Pakistan comparator: a ₦32,500 floor cuts poverty 19.6% to 8.5% at about 1.2% of GDP" },
        { level: "outcome", method: "ie", status: "amber", text: "Randomised roll-out order with Callaway–Sant'Anna for staggered adoption; MDE about 5.5 points" },
        { level: "impact", method: "distribution", status: "amber", text: "Benefit incidence by consumption decile and sex designed; needs linked NIMASA–PenCom records" },
        { level: "input", method: "qual", status: "amber", text: "Crew lists to be validated with the maritime unions, which also take seats on the steering committee" }
      ],
      logbook: [
        { wk: 1, confidence: 1, moved: "PenCom publishes nothing by industry and NIMASA's labour register is not linked to RSA PINs", feedback_from: "Fellow Evidence Lead (Mamo)", changed: "Nothing this week — the Council loop was left open" },
        { wk: 2, confidence: 2, moved: "National coverage and adequacy baselines now in place: 14.6%, 4.8%, average pension 88% of the minimum wage", feedback_from: "Ministry of Finance (Mamo)", changed: "Revised the licence check from renewal-only to continuous NIMASA–PenCom matching, with a verification-cost line" },
        { wk: 3, confidence: 2, moved: "The simulator answers the Committee's cost question, not the remittance question; the survey holds only 48 maritime workers", feedback_from: "NSO survey manager", changed: "Replaced the pension module with one filter question funded by dropping s4q57g–k, and added consent-based PenCom linkage" },
        { wk: 4, confidence: 2, moved: "A randomised phase-in gives a credible comparison and 725 employers detect about 5.5 points; the data link still does not exist", feedback_from: "Social partner (Mamo)", changed: "Moved the denominator from payroll to total crew with union validation, and made the casual share a co-primary safeguard outcome" }
      ] },

    { id: "p-okoh", name: "Nneka Esther Okoh", country: "Nigeria", region: "Africa",
      organisation: "World Bank", role: "Consultant Economist (STC)" },

    { id: "p-uzuegbu", name: "Obinna Uzuegbu", country: "Nigeria", region: "Africa",
      organisation: "Ministry of Poverty Alleviation, Abia State", role: "Social Policy Officer",
      focus: { anchor_scheme: "Household Uplifting Programme – Conditional Cash Transfers (HUP-CCT), NASSP",
               function: "General social assistance / poverty reduction",
               scheme_type: "Non-contributory · cash · poverty-targeted, with a conditional top-up",
               target_group: "Poor and vulnerable households selected through the National Social Register" },
      minister_question: "Should Nigeria prioritise making HUP-CCT payments regular and predictable over increasing transfer amounts or expanding coverage, based on their potential effects on food security and household consumption among enrolled poor households over 12 months?",
      hunch: "Predictable transfers should help households plan food and essential purchases and rely less on short-term borrowing, but higher amounts or wider coverage may also improve welfare — the available evidence may not settle which option does most.",
      headline: "About 1.94 million HUP-CCT beneficiary households (2022), roughly 4.75% of national households — a household ratio, not SDG 1.3.1 coverage",
      journey: {
        1: { status: "submitted", key: "System map and stakeholder table complete across nine functions, with informal credit providers added after Council feedback" },
        2: { status: "submitted", key: "Adequacy about 5.2% of the CPI-adjusted household poverty threshold; ₦40.1bn recorded as transfers plus direct costs" },
        3: { status: "not_started", key: "" },
        4: { status: "not_started", key: "" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "Six schemes inventoried; ₦40.1bn recorded as transfers plus direct costs, not programme expenditure" },
        { level: "output", method: "admin", status: "green", text: "About 1.94m beneficiary households (2022), roughly 4.75% of an estimated 40.82m households" },
        { level: "outcome", method: "admin", status: "amber", text: "₦5,000 a month is about 5.2% of the CPI-adjusted household poverty threshold; the sex row is left blank" },
        { level: "impact", method: "admin", status: "red", text: "Payment timeliness and completeness are not recorded, so regularity cannot yet be measured" }
      ],
      logbook: [
        { wk: 1, confidence: 3, moved: "Published programme information supports a starting assessment, but evidence on payment timing against amounts or coverage is limited", feedback_from: "Habambi Philemon Habambi (Fellow Evidence Lead)", changed: "Reframed the question as a choice among payment regularity, transfer size and coverage over a 12-month horizon" },
        { wk: 2, confidence: 3, moved: "2022 beneficiary totals and the ₦5,000 entitlement establish scale and design, but not delivery compliance or household benefit", feedback_from: "Ngozi Blessing Felix (Ministry of Finance)", changed: "Specified the on-time and in-full payment indicator and set the three options against a single 12-month budget" }
      ] },

    { id: "p-habambi", name: "Habambi Philemon Habambi", country: "Tanzania", region: "Africa",
      organisation: "Women and Social Protection (WSP) Tanzania", role: "Researcher & Programme Officer",
      focus: { anchor_scheme: "Productive Social Safety Net (PSSN II/III), Tanzania Social Action Fund",
               function: "General social assistance",
               scheme_type: "Non-contributory · cash, public works and livelihoods · targeted",
               target_group: "Extremely poor and food-insecure households, especially labour-constrained ones" },
      minister_question: "What is the impact of the PSSN cash transfers and public works on household poverty and consumption in Tanzania Mainland?",
      hunch: "Significant short-term improvements in food security and school attendance, but more mixed results on sustainable graduation out of poverty without stronger complementary economic inclusion packages.",
      headline: "",
      journey: {
        1: { status: "submitted", key: "All nine functions mapped; targeting sequence set out — geographic, then community-based, then proxy means test" },
        2: { status: "not_started", key: "" },
        3: { status: "draft", key: "HBS 2017–18 audited to question level (22E.01–22E.11); 'last payment only' identified as the limit on transfer intensity" },
        4: { status: "not_started", key: "" },
        5: { status: "not_started", key: "" },
        6: { status: "not_started", key: "" },
        7: { status: "not_started", key: "" }
      },
      cells: [
        { level: "input", method: "admin", status: "green", text: "Nine functions mapped; PSSN targeting sequence and the recent fall in household numbers under PSSN III recorded" },
        { level: "output", method: "admin", status: "red", text: "No SSI inventory submitted, so Chapter 2 has no scheme-level numerator to build on" },
        { level: "output", method: "survey", status: "green", text: "HBS 2017–18 items 22E.01, .03–.04, .06 and .08 identify PSSN receipt and public works wages" },
        { level: "outcome", method: "survey", status: "amber", text: "22E.04 records the last payment only, so transfer intensity over the year cannot be measured" }
      ],
      logbook: [
        { wk: 1, confidence: 4, moved: "TASAF administrative reports and Transfer Project baseline evaluation data give a clear empirical foundation", feedback_from: "Programme reports (Council entry not completed)", changed: "Mapped all nine functions and set out the PSSN targeting sequence and financing structure" }
      ] }
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
