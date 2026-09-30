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

  // Further reading for the applied exercise.
  resources: [
    ["Labour and social protection", "ILOSTAT", "Indicators and methodological resources from the ILO.", "https://ilostat.ilo.org/data/"],
    ["Social protection", "ILO World Social Protection Database", "Country and scheme information for comparative context.", "https://www.social-protection.org/gimi/WSPDB.action?id=32"],
    ["Development indicators", "World Bank Open Data", "Contextual demographic and economic series.", "https://data.worldbank.org/"],
    ["Household surveys", "UNICEF MICS", "Survey data and tools relevant to child and household outcomes.", "https://mics.unicef.org/"],
    ["Household surveys", "Living Standards Measurement Study", "Survey programmes and documentation for welfare analysis.", "https://www.worldbank.org/en/programs/lsms"],
    ["Course information", "ITCILO course page", "Official course information and updates.", "https://www.itcilo.org/courses/impact-assessment-social-protection-analysts"]
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
