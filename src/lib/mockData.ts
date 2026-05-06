import { PromiseItem, UpdateItem, EvidenceItem, CommentItem } from "@/types";
import aramData from "../../tvk_aram_framework.json";
import porulData from "../../tvk_porul_framework.json";
import inbamData from "../../tvk_inbam_framework.json";

// The 38 Districts of Tamil Nadu
export const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

// Helper utility to sanitize citation tags like [4], [10], [1, 2] from manifesto text
const cleanString = (str: string): string => {
  if (!str) return "";
  return str.replace(/\[\d+(?:,\s*\d+)*\]/g, "").trim();
};

// Parser engine mapping raw manifesto JSON structures into unified PromiseItem schema
const parseFrameworkData = (rawData: any, frameworkName: "Aram" | "Porul" | "Inbam"): PromiseItem[] => {
  const list: PromiseItem[] = [];
  if (!rawData || !rawData.pillars) return list;

  rawData.pillars.forEach((pillar: any, pIdx: number) => {
    const pillarTitle = cleanString(pillar.title);
    
    if (pillar.sections) {
      pillar.sections.forEach((section: any, sIdx: number) => {
        const sectionName = cleanString(section.section_name);
        
        if (section.key_promises) {
          section.key_promises.forEach((promiseText: string, prIdx: number) => {
            const cleanedText = cleanString(promiseText);
            
            // Clean terminal period if present
            const title = cleanedText.endsWith(".") ? cleanedText.slice(0, -1) : cleanedText;

            // Generate a stable unique slug
            const id = `${frameworkName.toLowerCase()}-p${pIdx + 1}-s${sIdx + 1}-pr${prIdx + 1}`;
            
            const description = `${title}. This represents a core policy commitment of the Tamilaga Vettri Kazhagam (TVK) manifesto mapped under the ${pillarTitle} pillar (Section: ${sectionName}).`;

            list.push({
              id,
              title,
              description,
              framework: frameworkName,
              pillar: pillarTitle,
              section: sectionName,
              category: [frameworkName, pillarTitle.split(" ")[0]],
              tags: [frameworkName, "Manifesto"],
              status: "Planned",
              priority: "Medium",
              progress_percentage: 0,
              measurable: true,
              target_date: "2027-12-31",
              budget_amount: 0,
              departments: [],
              districts: ["All Districts"],
              created_at: "2026-05-01T10:00:00Z",
              updated_at: "2026-05-01T10:00:00Z"
            });
          });
        }
      });
    }
  });

  return list;
};

// Brand New Example Showcase Card: TVK's Journey to Lead the Nation
const TVK_JOURNEY_PROMISE: PromiseItem = {
  id: "p0-tvk-journey",
  title: "TVK's Journey: A Commitment to Lead the Nation",
  description: "A comprehensive, verified timeline tracing Tamilaga Vettri Kazhagam's historic journey from official party launch on February 2, 2024, through the April 16, 2026 Aram-Porul-Inbam manifesto unveiling, culminating in emerging as a major force winning 108 seats in the 2026 Tamil Nadu Assembly elections.",
  framework: "Aram",
  pillar: "Tamil Identity and Pride",
  section: "Political Milestones",
  category: ["Politics", "History"],
  tags: ["Journey", "Elections", "Party Milestone"],
  status: "Completed",
  priority: "Critical",
  progress_percentage: 100,
  measurable: true,
  target_date: "2026-05-04",
  budget_amount: 0,
  departments: ["TVK General Secretariat"],
  districts: ["All Districts"],
  created_at: "2024-02-02T10:00:00Z",
  updated_at: "2026-05-05T10:00:00Z"
};

// Complete full-manifesto list generated dynamically at compile time
export const INITIAL_MOCK_PROMISES: PromiseItem[] = [
  TVK_JOURNEY_PROMISE,
  ...parseFrameworkData(aramData, "Aram"),
  ...parseFrameworkData(porulData, "Porul"),
  ...parseFrameworkData(inbamData, "Inbam")
];

// Pre-seeded timeline entries for the Journey Example Card (taken from official user-provided timeline)
export const INITIAL_MOCK_UPDATES: UpdateItem[] = [
  {
    id: "tvk_2024_launch",
    promise_id: "p0-tvk-journey",
    title: "Tamilaga Vettri Kazhagam (TVK) officially launched",
    description: "Actor Vijay officially launched Tamilaga Vettri Kazhagam (TVK) on February 2, 2024. This date is historically significant as it marked his formal transition from a three-decade cinema career to full-time politics with a commitment to bring a righteous, identity-focused government to Tamil Nadu.",
    created_by: "Official TVK Announcement",
    created_at: "2024-02-02T10:00:00Z"
  },
  {
    id: "tvk_2025_membership",
    promise_id: "p0-tvk-journey",
    title: "Massive state-wide membership drive crosses 15 million",
    description: "In July 2025, TVK focused intensively on its massive state-wide membership drive, successfully crossing 15 million members by September 2025 to build a solid grassroots network across all 234 constituencies.",
    created_by: "TVK General Secretariat",
    created_at: "2025-07-15T12:00:00Z"
  },
  {
    id: "tvk_2026_framework",
    promise_id: "p0-tvk-journey",
    title: "Aram–Porul–Inbam governance framework officially unveiled",
    description: "While ethical governance was discussed throughout 2025, the official unveiling of the 'Aram–Porul–Inbam' (Ethics, Wealth, Joy) framework as the core of their manifesto occurred on April 16, 2026, during the election campaign, establishing the ethical foundation for the state's development.",
    created_by: "TVK Manifesto Committee",
    created_at: "2026-04-16T11:00:00Z"
  },
  {
    id: "tn_2026_polling",
    promise_id: "p0-tvk-journey",
    title: "Single-phase Tamil Nadu Assembly polling conducted",
    description: "The Election Commission of India (ECI) conducted polling for all 234 constituencies in a single phase on Thursday, April 23, 2026. The state recorded a record-breaking, historic voter turnout of 85.1%.",
    created_by: "Election Commission of India",
    created_at: "2026-04-23T18:00:00Z"
  },
  {
    id: "tn_2026_results",
    promise_id: "p0-tvk-journey",
    title: "TVK emerges as historic leading force winning 108 seats",
    description: "Following the vote counting on May 4, 2026, major media reports on May 5, 2026 declared TVK as the 'historic leading force' in Tamil Nadu after winning 108 seats. Vijay is officially the Chief Minister-designate, with his swearing-in ceremony scheduled for May 7, 2026.",
    created_by: "Election Results Live Coverage",
    created_at: "2026-05-05T10:00:00Z"
  }
];

// Pre-seeded citizen evidence for the featured journey card
export const INITIAL_MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev_journey",
    promise_id: "p0-tvk-journey",
    type: "document",
    file_url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80",
    district: "Chennai",
    description: "Official results and news coverage clippings detailing TVK's historic performance of winning 108 seats in the Tamil Nadu Assembly elections.",
    verification_status: "verified",
    created_at: "2026-05-05T12:00:00Z"
  }
];

// Pre-seeded citizen comments for the featured journey card
export const INITIAL_MOCK_COMMENTS: CommentItem[] = [
  {
    id: "c1_journey",
    promise_id: "p0-tvk-journey",
    author: "Sivakumar S.",
    content: "An incredible journey from a new party in 2024 to winning 108 seats in 2026! A historic mandate for change in Tamil Nadu.",
    created_at: "2026-05-04T20:00:00Z"
  },
  {
    id: "c2_journey",
    promise_id: "p0-tvk-journey",
    author: "Lavanya R.",
    content: "The Aram, Porul, and Inbam framework resonated strongly with the youth. Excited to see this governance model in action.",
    created_at: "2026-05-05T09:15:00Z"
  }
];
