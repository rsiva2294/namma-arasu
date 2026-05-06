import { PromiseItem, UpdateItem, EvidenceItem, CommentItem } from "@/types";

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

// Single Example Promise Card retained explicitly to demonstrate all tracking features
export const INITIAL_MOCK_PROMISES: PromiseItem[] = [
  {
    id: "p1-caste-survey",
    title: "Implementation of a Caste Survey for Proportional Representation",
    description: "Conducting a comprehensive, scientifically rigorous state-wide Caste Survey to collect accurate socio-economic data and ensure fair, proportional representation and welfare distribution for all communities.",
    framework: "Aram",
    pillar: "Tamil Identity and Pride",
    section: "Protection of Financial and State Rights of Tamil Nadu",
    category: ["Social Justice", "Governance"],
    tags: ["Survey", "Representation", "Policy"],
    status: "In Progress",
    priority: "Critical",
    progress_percentage: 65,
    measurable: true,
    target_date: "2026-12-31",
    budget_amount: 150000000, // 15 Crores
    departments: ["Revenue Department", "Social Justice Department"],
    districts: ["All Districts"],
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-05-01T15:30:00Z"
  }
];

// Pre-seeded timeline entries for the example card
export const INITIAL_MOCK_UPDATES: UpdateItem[] = [
  {
    id: "u1",
    promise_id: "p1-caste-survey",
    title: "Drafting Panel Formed",
    description: "A high-level statistical committee chaired by retired IAS officers and statisticians has been formed to define the questionnaire and data parameters.",
    created_by: "Official Gazette",
    created_at: "2026-01-28T14:30:00Z"
  },
  {
    id: "u2",
    promise_id: "p1-caste-survey",
    title: "Pilot Survey Completed in 3 Districts",
    description: "The pilot phase of the socio-economic Caste Survey has been completed in Madurai, Cuddalore, and Chennai. Data pipeline validated.",
    created_by: "Revenue Department Nodal Officer",
    created_at: "2026-03-12T11:15:00Z"
  },
  {
    id: "u3",
    promise_id: "p1-caste-survey",
    title: "Statewide App Deployment Launched",
    description: "A secure android application developed for field surveyors has been launched. Training completed for 45,000 field volunteers.",
    created_by: "Social Justice Department Spokesperson",
    created_at: "2026-05-01T15:30:00Z"
  }
];

// Pre-seeded citizen evidence for the example card
export const INITIAL_MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev2",
    promise_id: "p1-caste-survey",
    type: "document",
    file_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    district: "Madurai",
    description: "Pamphlet distributed in Madurai explaining the Caste Survey socio-economic questions. The community is actively participating.",
    verification_status: "verified",
    created_at: "2026-04-18T10:30:00Z"
  }
];

// Pre-seeded citizen comments for the example card
export const INITIAL_MOCK_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    promise_id: "p1-caste-survey",
    author: "Arun Kumar, Researcher",
    content: "This is a historic step. Proportional representation cannot be achieved without accurate, verifiable socio-economic data.",
    created_at: "2026-05-02T11:00:00Z"
  },
  {
    id: "c2",
    promise_id: "p1-caste-survey",
    author: "Deepika R.",
    content: "Hope the surveyors are thoroughly trained. The digital app must safeguard citizen privacy strictly.",
    created_at: "2026-05-03T09:15:00Z"
  }
];
