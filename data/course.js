// Course content for the dashboard.
// Source: A9718853 flyer + "Agenda_Impact_2026_FINAL" timetable.
// Session times are stored with the explicit UTC offset given in the agenda
// (UTC+2 for weeks 1-4, UTC+1 for weeks 5-7) so they convert correctly
// to each visitor's local time.

window.COURSE = {
  code: "A9718853",
  title: "Impact Assessment for Social Protection Analysts",
  programme: "Social Protection, Governance and Tripartism (SPGT)",
  start: "2026-10-05",
  end: "2026-11-20",
  weeksCount: 7,
  hours: 100,
  platform: "ITCILO eCampus",
  language: "English",
  applicationDeadline: "2026-09-11",
  price: "€1,685",
  applyUrl: "https://oarf2.itcilo.org/DST/A9718853/en",
  contact: {
    org: "International Training Centre of the ILO",
    unit: "Programme on Social Protection, Governance and Tripartism (SPGT)",
    address: "Viale Maestri del Lavoro, 10 · 10127 Turin – Italy",
    phone: "+39 011 693 6524",
    email: "spgt@itcilo.org",
    web: "https://www.itcilo.org"
  },

  lead:
    "Measure coverage, adequacy, poverty and inequality, examine causal impacts, and translate " +
    "findings into a national plan for impact assessment.",

  overview:
    "Impact assessment is a central component of the social protection policy planning process. " +
    "It is key for identifying gaps and weaknesses in existing social protection provision, and is a " +
    "valuable tool for evaluating the potential impact of proposed initiatives. This course aims to equip " +
    "participants with the skills to dynamically assess the effectiveness and efficiency of social protection " +
    "systems as they evolve over time. The course is centred around the use of administrative and household " +
    "survey data for the purpose of impact assessment of social protection systems, while also introducing " +
    "participants to key considerations in the design of scheme-specific impact evaluations.",

  // Three summary cards on the Overview tab.
  pillars: [
    ["Map the pathway", "Define outcomes, indicators and theories of change for social protection schemes and systems."],
    ["Choose the evidence", "Assess data sources and methods, from coverage and adequacy analysis to microsimulation and impact evaluation."],
    ["Inform decisions", "Interpret findings and present accessible, compelling recommendations for policy makers."]
  ],

  topics: [
    ["Identifying theories of change", "and impact pathways of social protection systems"],
    ["Administrative and household survey data", "for analysis of social protection coverage and adequacy"],
    ["Poverty and inequality measurement", "using microdata"],
    ["Microsimulation and cost-effectiveness analysis", "including tax-benefit microsimulation and assessment of local economy multipliers"],
    ["Impact evaluation", "using national household survey data and scheme-specific surveys"]
  ],

  outcomes: [
    "Identify the core outcomes, indicators and theories of change for assessment of social protection schemes and systems",
    "Design and manage impact assessment processes, including assessing appropriate analytical approaches and data sources",
    "Interpret results from data analysis and distil findings into accessible and compelling formats for policy makers"
  ],

  why: [
    ["Integrated Applied Exercise", "Put learning into practice through an exercise focused on your own national context"],
    ["A diverse network of professionals", "Interact with peers engaging in issues of impact assessment of social protection"],
    ["A mix of training methods", "Lectures, plenary discussions, good practices, case studies, group work and individual exercises"],
    ["Diploma for Social Protection Analysts", "This course is eligible for the ITCILO Diploma: complete three courses within five years and a capstone assessment"]
  ],

  learningFormat:
    "Flexible eCampus preparation, live interactive sessions, recorded presentations, individual and " +
    "collaborative exercises, peer learning, technical forums, and an end-of-course assignment. Successful " +
    "completion of assessments and the final assignment leads to an ITCILO Certificate of Achievement.",

  audience:
    "Practitioners with several years of work experience in social protection seeking to strengthen knowledge " +
    "and skills in impact assessment: professionals from government ministries, social security institutions, " +
    "social partners, UN agencies, NGOs, research institutes and consultancy firms. Participants hold bachelor " +
    "or advanced degrees and have a solid quantitative background.",

  phases: [
    ["Pre-course", "Flexible (asynchronous) self-guided online learning on eCampus and an end-of-phase assessment."],
    ["Real-time learning", "Live interactive sessions and video presentations by experienced trainers, blended with individual and group exercises, peer-to-peer assessment and online technical forums on eCampus."],
    ["End-of-course assignment", "Individual assignment applying technical knowledge to the participant's organization. Successful participants receive an ITCILO Certificate of Achievement."]
  ],

  // Impact workbench — a private, in-browser planning aid.
  workbench: {
    methods: [
      "Descriptive coverage and adequacy analysis",
      "Poverty and inequality analysis",
      "Tax-benefit microsimulation",
      "Quasi-experimental impact evaluation",
      "Randomized impact evaluation",
      "Mixed-methods or qualitative research"
    ],
    prompts: [
      "Who is eligible, reached and left out?",
      "Which outcomes can be observed reliably?",
      "What would have happened without the intervention?",
      "Which distributional groups matter?",
      "Are data access, consent and privacy addressed?",
      "How will uncertainty and limitations be communicated?"
    ]
  },

  // Indicators worth pulling into an impact-assessment dashboard.
  indicators: [
    "SDG 1.3.1 — social protection coverage by function",
    "Social protection spending (% of GDP)",
    "Benefit adequacy (transfer value vs. consumption)",
    "Poverty headcount and Gini before vs. after transfers",
    "Informality rate",
    "Old-age dependency ratio",
    "Child poverty rate",
    "Adults receiving government transfers into an account",
    "Fiscal space indicators",
    "Count of impact evaluations by country (3ie)"
  ],

  // Open-data sources for the applied exercise, grouped by theme and matched to
  // the course weeks. Each item is [title, description, url, hasApi].
  // Check the scope, definitions, coverage and update date of every source.
  resourceGroups: [
    { title: "Coverage, spending & adequacy", weeks: "Weeks 1–2", items: [
      ["ILO World Social Protection Database (WSPDB)", "SDG 1.3.1 coverage by function, spending as % of GDP and benefit adequacy.", "https://www.social-protection.org/gimi/WSPDB.action?id=32", true],
      ["ILO Social Security Inquiry (SSI)", "The ILO questionnaire that is the primary source of administrative data behind SDG 1.3.1.", "https://qpss.ilo.org/", false],
      ["World Social Protection Data Dashboards", "Interactive SDG 1.3.1 coverage by function, drawn from the WSPDB.", "https://wspdb.social-protection.org", true],
      ["ILOSTAT", "Labour force, informality, working poverty, wages and NEET rates.", "https://ilostat.ilo.org/data/", true],
      ["World Bank ASPIRE", "Coverage, benefit incidence and adequacy by quintile; poverty and Gini reduction from transfers.", "https://www.worldbank.org/en/data/datatopics/aspire", true],
      ["OECD SOCX & Pensions at a Glance", "Social expenditure by branch and comparative pension indicators.", "https://www.oecd.org/en/data/datasets/social-expenditure-database-socx.html", true],
      ["Eurostat ESSPROS & EU-SILC", "At-risk-of-poverty rate before and after social transfers (Europe).", "https://ec.europa.eu/eurostat/web/social-protection/database", true],
      ["IMF Government Finance Statistics (COFOG)", "Public spending on social protection by function.", "https://data.imf.org/", true],
      ["SSA/ISSA — Social Security Programs Throughout the World", "Legal scheme design, eligibility and contribution rates; a WSPDB secondary source (ISSA).", "https://www.ssa.gov/policy/docs/progdesc/ssptw/", false],
      ["HelpAge — Social Pensions Database", "Non-contributory (social) pensions worldwide; a WSPDB secondary source.", "https://www.pension-watch.net/", false],
      ["socialprotection.org", "Programme profiles, country pages and publications.", "https://www.socialprotection.org/", false]
    ] },
    { title: "Poverty, inequality & fiscal incidence", weeks: "Weeks 1 & 4", items: [
      ["World Bank Poverty and Inequality Platform (PIP)", "Poverty headcounts at international lines, Gini and shared prosperity.", "https://pip.worldbank.org/", true],
      ["World Development Indicators (WDI)", "Macro, demographic and social indicators.", "https://databank.worldbank.org/source/world-development-indicators", true],
      ["World Inequality Database (WID)", "Pre- vs. post-tax income and top income and wealth shares.", "https://wid.world/", true],
      ["SWIID", "Market vs. disposable-income Gini — the redistributive effect.", "https://fsolt.org/swiid/", false],
      ["CEQ Institute Data Center", "Fiscal incidence of taxes, transfers and contributions on poverty and inequality.", "https://commitmentoequity.org/datacenter", false],
      ["UNU-WIDER WIID & Government Revenue Dataset", "Income inequality, and tax and social security contribution revenue.", "https://www.wider.unu.edu/database/world-income-inequality-database-wiid", false],
      ["LIS Cross-National Data Center", "Harmonised income microdata; key figures open, microdata on registration.", "https://www.lisdatacenter.org/", false],
      ["UNDP HDR & Global MPI", "HDI, IHDI, GII and the global Multidimensional Poverty Index.", "https://hdr.undp.org/data-center", true]
    ] },
    { title: "Microdata & microsimulation", weeks: "Week 3", items: [
      ["World Bank Microdata Library & LSMS", "Household and living-standards survey microdata.", "https://microdata.worldbank.org/", false],
      ["IPUMS International", "Harmonised census microdata (free, registration required).", "https://international.ipums.org/", false],
      ["DHS Program", "Demographic and Health Surveys indicators and microdata.", "https://dhsprogram.com/", true],
      ["UNICEF MICS", "Multiple Indicator Cluster Surveys — child and household microdata.", "https://mics.unicef.org/", false],
      ["UNU-WIDER SOUTHMOD", "Tax-benefit microsimulation models for Africa, Asia and Latin America.", "https://www.wider.unu.edu/project/southmod-simulating-tax-and-benefit-policies-development", false],
      ["EUROMOD (JRC)", "EU tax-benefit microsimulation model and statistics.", "https://euromod-web.jrc.ec.europa.eu/", false],
      ["Global Findex", "Adults receiving government transfers into an account and digital-payment use.", "https://www.worldbank.org/en/publication/globalfindex", true]
    ] },
    { title: "Impact evaluation evidence", weeks: "Weeks 2 & 4", items: [
      ["3ie Development Evidence Portal", "Impact evaluations and systematic reviews, filterable by social protection.", "https://developmentevidence.3ieimpact.org/", false],
      ["J-PAL Evaluations", "Randomized evaluation database and policy insights.", "https://www.povertyactionlab.org/evaluations", false],
      ["AEA RCT Registry", "Registered trials, with designs and outcomes.", "https://www.socialscienceregistry.org/", false],
      ["The Transfer Project", "Evaluations of cash transfers in sub-Saharan Africa.", "https://transfer.cpc.unc.edu/", false],
      ["Campbell Collaboration", "Library of systematic reviews.", "https://www.campbellcollaboration.org/", false],
      ["World Bank DIME & IE catalogue", "Impact-evaluation replication datasets.", "https://microdata.worldbank.org/index.php/catalog/impact_evaluation", false]
    ] },
    { title: "Perceptions & qualitative context", weeks: "Week 5", items: [
      ["Afrobarometer", "Trust in government, perceived fairness and access to services (Africa).", "https://www.afrobarometer.org/", false],
      ["Latinobarómetro", "Public attitudes and trust (Latin America).", "https://www.latinobarometro.org/", false],
      ["World Values Survey", "Attitudes towards redistribution and welfare.", "https://www.worldvaluessurvey.org/", false],
      ["ISSP — Role of Government", "Cross-national attitudes towards the role of government.", "https://issp.org/", false]
    ] },
    { title: "Demography, gender, children, disability & health", weeks: "Cross-cutting", items: [
      ["UN DESA World Population Prospects", "Age structure, dependency ratios and population projections.", "https://population.un.org/wpp/", true],
      ["UNICEF Data Warehouse", "Child poverty and SDG child indicators.", "https://data.unicef.org/", true],
      ["World Bank Gender Data Portal", "Gender indicators and Women, Business and the Law provisions.", "https://genderdata.worldbank.org/", false],
      ["UN Women Data Hub (Women Count)", "Gender statistics, including women's access to social protection; a WSPDB secondary source.", "https://data.unwomen.org/", false],
      ["WHO Global Health Observatory", "UHC service coverage and out-of-pocket health spending.", "https://www.who.int/data/gho", true],
      ["UN SDG Global Database", "SDG indicators including 1.3.1, 5.4.1 and 10.4.1.", "https://unstats.un.org/sdgs/dataportal", true],
      ["Washington Group on Disability Statistics", "Disability measurement tools and survey resources.", "https://www.washingtongroup-disability.com/", false]
    ] },
    { title: "Shocks, risk & adaptive social protection", weeks: "Weeks 5–6 · Situation room", items: [
      ["HDX — Humanitarian Data Exchange", "Country crisis datasets.", "https://data.humdata.org/", true],
      ["INFORM Risk Index (EC JRC)", "Hazard, vulnerability and coping-capacity scores.", "https://drmkc.jrc.ec.europa.eu/inform-index", false],
      ["WFP HungerMap LIVE & FAOSTAT", "Food insecurity monitoring and food-security statistics.", "https://hungermap.wfp.org/", true],
      ["EM-DAT", "International disaster database (free with registration).", "https://www.emdat.be/", false]
    ] },
    { title: "Governance, delivery & institutions", weeks: "Weeks 5–7 · National plan", items: [
      ["Worldwide Governance Indicators (WGI)", "Six dimensions of governance quality.", "https://www.worldbank.org/en/publication/worldwide-governance-indicators", true],
      ["World Bank ID4D", "Identification coverage, relevant to registries and delivery systems.", "https://id4d.worldbank.org/", false],
      ["Open Budget Survey", "Budget transparency and participation.", "https://internationalbudget.org/open-budget-survey/", false],
      ["IMF World Economic Outlook & Fiscal Monitor", "Fiscal space and public debt.", "https://www.imf.org/en/Publications/WEO", true]
    ] },
    { title: "Regional sources", weeks: "Comparative context", items: [
      ["ECLAC CEPALSTAT & Non-Contributory SP Database", "Statistics for Latin America and the Caribbean.", "https://statistics.cepal.org/", false],
      ["ADB Social Protection Indicator", "Coverage and spending across Asia-Pacific.", "https://www.adb.org/what-we-do/topics/social-development/social-protection-indicator", false],
      ["AfDB Data Portal", "African development and social statistics.", "https://dataportal.opendataforafrica.org/", true],
      ["UN ESCWA Data Portal", "Statistics for the Arab States.", "https://data.unescwa.org/", false]
    ] },
    { title: "Aggregators for fast dashboard building", weeks: "Week 6 · AI & modelling", items: [
      ["Our World in Data", "Clean, harmonised CSVs and a charts API.", "https://ourworldindata.org/", true],
      ["World Bank Data360", "Multi-source query tool spanning many databases.", "https://data360.worldbank.org/", true],
      ["DBnomics", "One API aggregating the IMF, OECD, Eurostat, ILO and national statistics offices.", "https://db.nomics.world/", true],
      ["UNdata & OECD Data Explorer", "Cross-domain UN and OECD data.", "https://data.un.org/", false]
    ] }
  ],

  weeks: [
    { n: 1, title: "Mapping social protection impacts", range: "05 – 11 October 2026", start: "2026-10-05", end: "2026-10-11",
      sessions: [
        { id: "1a", title: "Joint Opening Ceremony", start: "2026-10-06T14:00:00+02:00", end: "2026-10-06T15:30:00+02:00", people: ["ITCILO Team"], kind: "ceremony" },
        { id: "1b", title: "Range of analysis: selecting sources of social protection data and defining the indicators", start: "2026-10-08T14:00:00+02:00", end: "2026-10-08T15:30:00+02:00", people: ["Valeria Nesterenko", "Olena Vazhynska"] }
      ] },
    { n: 2, title: "Reading the menu & digesting administrative data", range: "12 – 18 October 2026", start: "2026-10-12", end: "2026-10-18",
      sessions: [
        { id: "2a", title: "What's on the menu? Theories of change, methods and role of evidence", start: "2026-10-13T14:00:00+02:00", end: "2026-10-13T15:30:00+02:00", people: ["Olena Vazhynska"] },
        { id: "2b", title: "Mapping social protection impacts", start: "2026-10-15T14:00:00+02:00", end: "2026-10-15T15:30:00+02:00", people: ["Chris De Neubourg"] }
      ] },
    { n: 3, title: "Survey analysis & microsimulation", range: "19 – 25 October 2026", start: "2026-10-19", end: "2026-10-25",
      sessions: [
        { id: "3a", title: "Getting familiar with microdata", start: "2026-10-20T14:00:00+02:00", end: "2026-10-20T15:30:00+02:00", people: ["Zina Nimeh"] },
        { id: "3b", title: "Microsimulation", start: "2026-10-22T14:00:00+02:00", end: "2026-10-22T15:30:00+02:00", people: ["Zina Nimeh"] }
      ] },
    { n: 4, title: "Economic impacts & impact evaluation", range: "26 October – 01 November 2026", start: "2026-10-26", end: "2026-11-01",
      sessions: [
        { id: "4a", title: "Impact evaluation", start: "2026-10-27T14:00:00+02:00", end: "2026-10-27T15:30:00+02:00", people: ["Zina Nimeh"] },
        { id: "4b", title: "From assessing immediate outcomes to long-term impacts. Impact of social protection benefits, taxes and social security contributions in reducing income inequalities", start: "2026-10-29T14:00:00+02:00", end: "2026-10-29T15:30:00+02:00", people: ["Umberto Cattaneo"] }
      ] },
    { n: 5, title: "Qualitative research & putting it all together", range: "02 – 08 November 2026", start: "2026-11-02", end: "2026-11-08",
      sessions: [
        { id: "5a", title: "Qualitative research on social protection", start: "2026-11-03T14:00:00+01:00", end: "2026-11-03T15:30:00+01:00", people: ["Amjad Rabi"] },
        { id: "5b", title: "From impacts to setting new benchmarks. Lessons for strengthening social protection systems", subtitle: "Beyond impact: institutional factors, methodological frontiers and emerging techniques", start: "2026-11-05T14:00:00+01:00", end: "2026-11-05T15:30:00+01:00", people: ["Amjad Rabi"] }
      ] },
    { n: 6, title: "Sharing knowledge and applying learning", range: "09 – 15 November 2026", start: "2026-11-09", end: "2026-11-15",
      sessions: [
        { id: "6a", title: "Situation room: Multidisciplinary exercise", start: "2026-11-10T14:00:00+01:00", end: "2026-11-10T16:00:00+01:00", people: ["ITCILO Team"], kind: "exercise" },
        { id: "6b", title: "AI and Quantitative Modelling", start: "2026-11-12T14:00:00+01:00", end: "2026-11-12T15:30:00+01:00", people: ["Martin Blumhart"] }
      ] },
    { n: 7, title: "A National Plan for Impact Assessment", range: "16 – 20 November 2026", start: "2026-11-16", end: "2026-11-20",
      sessions: [
        { id: "7a", title: "Final presentation", start: "2026-11-17T14:00:00+01:00", end: "2026-11-17T15:30:00+01:00", people: ["ITCILO Team"], kind: "exercise" },
        { id: "7b", title: "Closing Ceremony", start: "2026-11-19T14:00:00+01:00", end: "2026-11-19T15:30:00+01:00", people: ["ITCILO Team"], kind: "ceremony" }
      ] }
  ]
};
