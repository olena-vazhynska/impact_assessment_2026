// Participant roster for the dashboard.
//
// One object per person. These records feed both the "Participants" tab
// (searchable / filterable / sortable table with summary charts) and the
// "Demographics" tab (geographic and organizational breakdown). Nothing is sent
// to a server — the dashboard is fully static.
//
// Every field is optional except `name`; any extra field you add becomes a
// table column automatically. The charts and demographics use `country`,
// `region`, `sex` (or `gender`) and `orgType` when present.
//
// Source: A9718853 participant list. Email addresses are intentionally omitted
// so this static dashboard can be published without exposing personal contacts.

window.PARTICIPANTS = [
  { name: "Ercília Alíria Lupessi Simões", sex: "F", country: "Angola", region: "Africa",
    organization: "Ministry of Social Action, Family and Women's Promotion (MASFAMU)", orgType: "Government",
    position: "National Director" },
  { name: "Sean Sebastian", sex: "M", country: "Belize", region: "Americas",
    organization: "Social Security Board (SSB)", orgType: "Social security institution",
    position: "Manager, Statistical Services" },
  { name: "Shynar Aitimova", sex: "F", country: "Kazakhstan", region: "Europe & Central Asia",
    organization: "State Social Insurance Fund (JSC)", orgType: "Social security institution",
    position: "Chief Manager" },
  { name: "Bernard Mamo", sex: "M", country: "Malta", region: "Europe & Central Asia",
    organization: "Ministry for Social Policy and Children's Rights (MSPC), Pensions Strategy Directorate", orgType: "Government",
    position: "Senior Manager" },
  { name: "Ngozi Blessing Felix", sex: "F", country: "Nigeria", region: "Africa",
    organization: "Ministry of Poverty Alleviation and Social Protection, Abia State Government", orgType: "Government",
    position: "Commissioner" },
  { name: "Chioma Rosemary Mgbemena", sex: "F", country: "Nigeria", region: "Africa",
    organization: "Nigerian Maritime Administration and Safety Agency (NIMASA)", orgType: "Government",
    position: "Technical Assistant" },
  { name: "Nneka Esther Okoh", sex: "F", country: "Nigeria", region: "Africa",
    organization: "World Bank", orgType: "International organization",
    position: "Consultant Economist (STC)" },
  { name: "Obinna Faithpaul Uzuegbu", sex: "M", country: "Nigeria", region: "Africa",
    organization: "Ministry of Poverty Alleviation and Social Protection, Abia State", orgType: "Government",
    position: "Social Policy Officer" },
  { name: "Habambi Philemon Habambi", sex: "M", country: "Tanzania, United Republic of", region: "Africa",
    organization: "Women and Social Protection (WSP) Tanzania", orgType: "Civil society / NGO",
    position: "Researcher & Programme Officer" }
];
