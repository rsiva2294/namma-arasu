import { useState, useEffect } from "react";

export type Language = "en" | "ta";

// Dictionary of core UI translations
export const translations = {
  en: {
    dashboard: "Governance Dashboard",
    districtAtlas: "Regional Atlas",
    kanbanBoard: "Kanban Board",
    manifestoLibrary: "Manifesto Library",
    citizenMode: "Public Citizen Mode",
    adminMode: "Official Admin Mode",
    activeScope: "Select Administrative Scope",
    statewideFocus: "Statewide Focus",
    statewideCore: "Tamil Nadu Core Manifesto",
    targetedDistricts: "Targeted Local Districts",
    searchPolicies: "Search targeted policies...",
    viewDetails: "View Audit Details",
    progress: "Progress",
    statewideProgs: "Statewide Programs",
    targetedRegional: "Targeted Regional Schemes",
    impactedDistricts: "Impacted Districts",
    activeAuditLoop: "Active Audit Loop",
    allDistricts: "All Districts",
    originalManifesto: "Original Manifesto Documents",
    backToDashboard: "Back to Governance Dashboard",
    implementationProgress: "Implementation Progress",
    announced: "Announced",
    planned: "Planned",
    inProgress: "In Progress",
    completed: "Completed",
    delayed: "Delayed",
    priority: "Priority",
    status: "Status",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    exampleCard: "Showcase Example",
    sourceIntegrityNotice: "Source Integrity Notice",
    viewPdf: "View PDF",
    download: "Download",
    
    // Promise Detail View
    auditedCompletionProgress: "Audited Completion Progress",
    changeGovernanceStatus: "Change Governance Status",
    implementationTimeline: "Implementation Timeline",
    postOfficialProgressEntry: "Post Official Progress Entry",
    logTitlePlaceholder: "Log title (e.g. 'Site Inspection Completed')",
    logDescriptionPlaceholder: "Provide full official details or outcomes achieved...",
    postLogEntry: "Post Log Entry",
    noTimelineRecorded: "No implementation timeline recorded yet.",
    governanceParameters: "Governance Parameters",
    approvedBudget: "Approved Budget",
    awaitingBudget: "Awaiting Budget Allocation",
    targetDeadline: "Target Deadline",
    responsibleDepartments: "Responsible Departments",
    unassigned: "Unassigned",
    affectedRegions: "Affected Regions",
    manifestoMapping: "Manifesto Mapping",
    viewOriginalPdf: "View Original Manifesto PDF",
    pillar: "Pillar",
    framework: "Framework",
    section: "Section",
    
    // Homepage Filters
    filterByFramework: "Filter by Framework",
    filterByStatus: "Filter by Status",
    filterByPriority: "Filter by Priority",
    filterBySection: "Filter by Section",
    allFrameworks: "All Frameworks",
    allStatuses: "All Statuses",
    allPriorities: "All Priorities",
    allSections: "All Sections",
    clearFilters: "Clear Filters",
    searchPlaceholder: "Search promises or keywords...",
    showAnalytics: "Show Analytics",
    hideAnalytics: "Hide Analytics",
    showFilters: "Show Filters",
    hideFilters: "Hide Filters",
    commitmentsFound: "commitments found"
  },
  ta: {
    dashboard: "ஆளுமை முகப்பு",
    districtAtlas: "வட்டார வரைபடம்",
    kanbanBoard: "கான்பான் பலகை",
    manifestoLibrary: "தேர்தல் அறிக்கை",
    citizenMode: "பொது குடிமகன் முறை",
    adminMode: "நிர்வாகி முறை",
    activeScope: "நிர்வாக வரம்பைத் தேர்ந்தெடுக்கவும்",
    statewideFocus: "மாநிலம் தழுவிய திட்டம்",
    statewideCore: "தமிழ்நாடு முதன்மை தேர்தல் அறிக்கை",
    targetedDistricts: "குறிப்பிடப்பட்ட மாவட்டங்கள்",
    searchPolicies: "திட்டங்களைத் தேடுங்கள்...",
    viewDetails: "விவரங்களைக் காண்க",
    progress: "முன்னேற்றம்",
    statewideProgs: "மாநில அளவிலான திட்டங்கள்",
    targetedRegional: "வட்டாரத் திட்டங்கள்",
    impactedDistricts: "பயனடைந்த மாவட்டங்கள்",
    activeAuditLoop: "செயலில் உள்ள தணிக்கை",
    allDistricts: "அனைத்து மாவட்டங்கள்",
    originalManifesto: "அசல் தேர்தல் அறிக்கை ஆவணங்கள்",
    backToDashboard: "ஆளுமை முகப்பிற்குச் செல்லவும்",
    implementationProgress: "அமலாக்க முன்னேற்றம்",
    announced: "அறிவிக்கப்பட்டது",
    planned: "திட்டமிடப்பட்டது",
    inProgress: "செயல்பாட்டில் உள்ளது",
    completed: "நிறைவடைந்தது",
    delayed: "தாமதமானது",
    priority: "முன்னுரிமை",
    status: "நிலை",
    low: "குறைந்த",
    medium: "நடுத்தர",
    high: "அதிக",
    critical: "முக்கியமான",
    exampleCard: "விளக்க உதாரணம்",
    sourceIntegrityNotice: "மூல நம்பகத்தன்மை அறிவிப்பு",
    viewPdf: "PDF காண்க",
    download: "பதிவிறக்கு",

    // Promise Detail View
    auditedCompletionProgress: "தணிக்கை செய்யப்பட்ட முன்னேற்றம்",
    changeGovernanceStatus: "ஆளுமை நிலையை மாற்றவும்",
    implementationTimeline: "அமலாக்க காலவரிசை",
    postOfficialProgressEntry: "முன்னேற்றத்தைப் பதிவுசெய்க",
    logTitlePlaceholder: "தலைப்பு (எ.கா. 'தள ஆய்வு நிறைவடைந்தது')",
    logDescriptionPlaceholder: "அதிகாரப்பூர்வ முழு விவரங்களை வழங்கவும்...",
    postLogEntry: "பதிவைச் சேமிக்கவும்",
    noTimelineRecorded: "இன்னும் அமலாக்க காலவரிசை பதிவு செய்யப்படவில்லை.",
    governanceParameters: "ஆளுமை அளவுருக்கள்",
    approvedBudget: "அனுமதிக்கப்பட்ட பட்ஜெட்",
    awaitingBudget: "பட்ஜெட் ஒதுக்கீட்டிற்கு காத்திருக்கிறது",
    targetDeadline: "இலக்கு காலக்கெடு",
    responsibleDepartments: "பொறுப்பான துறைகள்",
    unassigned: "ஒதுக்கப்படவில்லை",
    affectedRegions: "பாதிக்கப்பட்ட பகுதிகள்",
    manifestoMapping: "தேர்தல் அறிக்கை மேப்பிங்",
    viewOriginalPdf: "அசல் தேர்தல் அறிக்கை PDF காண்க",
    pillar: "தூண்",
    framework: "அமைப்பு",
    section: "பிரிவு",
    
    // Homepage Filters
    filterByFramework: "அமைப்பின்படி வடிகட்டவும்",
    filterByStatus: "நிலையின்படி வடிகட்டவும்",
    filterByPriority: "முன்னுரிமையின்படி வடிகட்டவும்",
    filterBySection: "பிரிவின்படி வடிகட்டவும்",
    allFrameworks: "அனைத்து அமைப்புகள்",
    allStatuses: "அனைத்து நிலைகள்",
    allPriorities: "அனைத்து முன்னுரிமைகள்",
    allSections: "அனைத்து பிரிவுகள்",
    clearFilters: "வடிகட்டிகளை நீக்கு",
    searchPlaceholder: "திட்டங்களைத் தேடுங்கள்...",
    showAnalytics: "பகுப்பாய்வைக் காட்டு",
    hideAnalytics: "பகுப்பாய்வை மறை",
    showFilters: "வடிகட்டிகளைக் காட்டு",
    hideFilters: "வடிகட்டிகளை மறை",
    commitmentsFound: "திட்டங்கள் கண்டறியப்பட்டன"
  }
};

export const getLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("namma_arasu_language") as Language) || "en";
};

export const setLanguage = (lang: Language) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("namma_arasu_language", lang);
  window.dispatchEvent(new Event("namma_arasu_language_change"));
};

export const useLanguage = () => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    setLangState(getLanguage());
    const handleLangChange = () => setLangState(getLanguage());
    window.addEventListener("namma_arasu_language_change", handleLangChange);
    return () => window.removeEventListener("namma_arasu_language_change", handleLangChange);
  }, []);

  const t = translations[lang];

  return { lang, setLanguage, t };
};
