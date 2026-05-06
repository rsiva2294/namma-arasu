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

// High-fidelity pre-seeded promises extracted from Aram, Porul, and Inbam JSON files
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
  },
  {
    id: "p2-tamil-ai",
    title: "Development of Tamil Artificial Intelligence (AI) Models",
    description: "Developing advanced, open-source Tamil LLMs and AI technologies to safeguard Tamil language heritage, with commercial rights provided to foreign countries and developers free of charge.",
    framework: "Aram",
    pillar: "Tamil Identity and Pride",
    section: "Tamil Language - Culture - Heritage",
    category: ["Technology", "Language"],
    tags: ["AI", "Open Source", "Tamil LLM"],
    status: "Planned",
    priority: "High",
    progress_percentage: 20,
    measurable: true,
    target_date: "2027-06-30",
    budget_amount: 250000000, // 25 Crores
    departments: ["Information Technology Department", "Tamil Development Department"],
    districts: ["Chennai", "Coimbatore", "Madurai"],
    created_at: "2026-01-15T09:00:00Z",
    updated_at: "2026-04-12T11:00:00Z"
  },
  {
    id: "p3-cooum-river",
    title: "Restoration of Cooum and Adyar Rivers",
    description: "Cleaning and restoring the historic Cooum and Adyar rivers on a high-priority mission-mode basis to eradicate pollution, install treatment plants, and develop riverfront parks.",
    framework: "Inbam",
    pillar: "Healthcare, Environment, & Climate",
    section: "Environment and Climate Action",
    category: ["Environment", "Infrastructure"],
    tags: ["River Cleaning", "Eco Restoration", "Chennai"],
    status: "In Progress",
    priority: "Critical",
    progress_percentage: 45,
    measurable: true,
    target_date: "2028-12-31",
    budget_amount: 1200000000, // 120 Crores
    departments: ["Public Works Department", "Municipal Administration Department", "Environment & Climate Change Department"],
    districts: ["Chennai", "Chengalpattu", "Tiruvallur"],
    created_at: "2026-01-05T08:30:00Z",
    updated_at: "2026-05-04T16:45:00Z"
  },
  {
    id: "p4-model-villages",
    title: "Establishment of 5,000 Model Villages",
    description: "Transforming 5,000 rural villages into high-infrastructure 'Model Villages' equipped with modern concrete houses, 24/7 solar power, high-speed internet, smart schools, and modern primary health centers.",
    framework: "Inbam",
    pillar: "World-Class Infrastructure & Rural/Urban Development",
    section: "Rural and Urban Development",
    category: ["Infrastructure", "Rural Development"],
    tags: ["Smart Village", "Housing", "Solar Power"],
    status: "Budget Allocated",
    priority: "High",
    progress_percentage: 15,
    measurable: true,
    target_date: "2030-05-01",
    budget_amount: 5000000000, // 500 Crores
    departments: ["Rural Development & Panchayat Raj Department"],
    districts: ["Madurai", "Thanjavur", "Tiruchirappalli", "Salem", "Cuddalore", "Dharmapuri"],
    created_at: "2026-02-01T11:00:00Z",
    updated_at: "2026-04-20T10:15:00Z"
  },
  {
    id: "p5-free-ivf",
    title: "Free IVF Treatments in Government Hospitals",
    description: "Setting up fully equipped reproductive medicine wings in major government medical colleges to offer premium, safe, and completely free IVF (In Vitro Fertilization) treatments for lower-income childless couples.",
    framework: "Inbam",
    pillar: "Healthcare, Environment, & Climate",
    section: "Healthcare Modernization and Well-being",
    category: ["Healthcare", "Social Welfare"],
    tags: ["IVF", "Fertility", "Govt Hospital"],
    status: "Planned",
    priority: "Medium",
    progress_percentage: 30,
    measurable: true,
    target_date: "2026-11-30",
    budget_amount: 80000000, // 8 Crores
    departments: ["Health and Family Welfare Department"],
    districts: ["Chennai", "Madurai", "Coimbatore", "Tirunelveli"],
    created_at: "2026-01-20T14:20:00Z",
    updated_at: "2026-03-15T09:30:00Z"
  },
  {
    id: "p6-kamarajar-education",
    title: "Kamarajar Education Guarantee Scheme (₹15,000 Deposit)",
    description: "Depositing a financial security of ₹15,000 in dedicated savings accounts for children enrolled in grades 1 through 12 in public schools to eradicate poverty-induced dropouts and secure higher education opportunities.",
    framework: "Porul",
    pillar: "Women's Welfare and Empowerment",
    section: "Welfare Schemes and Economic Empowerment",
    category: ["Education", "Social Welfare"],
    tags: ["Scholarship", "School", "Welfare"],
    status: "Announced",
    priority: "High",
    progress_percentage: 5,
    measurable: true,
    target_date: "2027-06-01",
    budget_amount: 1800000000, // 180 Crores
    departments: ["School Education Department", "Finance Department"],
    districts: ["All Districts"],
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z"
  },
  {
    id: "p7-velu-nachiyar-force",
    title: "Rani Velu Nachiyar Force for Women's Safety",
    description: "Creating an elite, highly responsive 500-member specialized female policing force equipped with body cameras, advanced patrolling vehicles, and direct GPS links to safe houses.",
    framework: "Porul",
    pillar: "Women's Welfare and Empowerment",
    section: "Uncompromising Women's Safety",
    category: ["Law and Order", "Women Safety"],
    tags: ["Special Force", "Safety", "Police"],
    status: "In Progress",
    priority: "High",
    progress_percentage: 50,
    measurable: true,
    target_date: "2026-10-01",
    budget_amount: 120000000, // 12 Crores
    departments: ["Home Department", "Police Department"],
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    created_at: "2026-01-08T12:00:00Z",
    updated_at: "2026-04-28T14:00:00Z"
  },
  {
    id: "p8-youth-victory-fund",
    title: "Youth Victory Fund (Unemployment Stipends)",
    description: "Providing a transitional support stipend of ₹4,000 monthly for unemployed college graduates and ₹2,500 monthly for diploma/ITI holders for up to 2 years, coupled with mandatory skill training sessions.",
    framework: "Porul",
    pillar: "Youth Welfare, Employment & Sports",
    section: "Employment and Skill Development",
    category: ["Youth", "Employment"],
    tags: ["Stipend", "Skill Development", "Unemployment"],
    status: "Budget Allocated",
    priority: "High",
    progress_percentage: 80,
    measurable: true,
    target_date: "2026-08-01",
    budget_amount: 3200000000, // 320 Crores
    departments: ["Labour Welfare and Skill Development Department", "Finance Department"],
    districts: ["All Districts"],
    created_at: "2026-01-12T11:00:00Z",
    updated_at: "2026-05-02T13:40:00Z"
  },
  {
    id: "p9-neeratchi-scheme",
    title: "Neeratchi Scheme: 5 Lakh New Farm Ponds",
    description: "Constructing and restoring 5 lakh new agricultural rainwater harvesting ponds ('Neeratchi') across Tamil Nadu to enhance groundwater tables and protect farmers against droughts.",
    framework: "Porul",
    pillar: "Farmers, Fishermen, & Water Management",
    section: "Water Management & Livestock",
    category: ["Water Management", "Agriculture"],
    tags: ["Ponds", "Groundwater", "Farming"],
    status: "In Progress",
    priority: "High",
    progress_percentage: 35,
    measurable: true,
    target_date: "2029-03-31",
    budget_amount: 750000000, // 75 Crores
    departments: ["Agriculture and Farmers Welfare Department", "Water Resources Department"],
    districts: ["Thanjavur", "Tiruvarur", "Nagapattinam", "Pudukkottai", "Ariyalur", "Karur"],
    created_at: "2026-01-22T09:30:00Z",
    updated_at: "2026-04-30T16:00:00Z"
  },
  {
    id: "p10-no-application-welfare",
    title: "First-of-its-Kind 'No-Application' Welfare Delivery",
    description: "Implementing an intelligent database system that automatically scans eligible citizen parameters and directly delivers welfare certificates, pensions, and allowances without requiring any applications or bribery.",
    framework: "Inbam",
    pillar: "People's Government, Transparency & Law",
    section: "Honest Administration and Citizen Services",
    category: ["Governance", "Technology"],
    tags: ["Direct Benefit", "Anti Corruption", "Smart Govt"],
    status: "Planned",
    priority: "Critical",
    progress_percentage: 10,
    measurable: false,
    target_date: "2027-12-31",
    budget_amount: 45000000, // 4.5 Crores
    departments: ["Information Technology Department", "Revenue Department"],
    districts: ["Chennai"],
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-04-05T14:15:00Z"
  },
  {
    id: "p11-tamil-taxi-app",
    title: "Commission-Free 'Tamil Taxi App'",
    description: "Launching a government-backed, commission-free mobile taxi and auto aggregation application protecting drivers from commercial platform exploitation and providing reliable, standardized fares for citizens.",
    framework: "Aram",
    pillar: "Dignified Life and Social Security for All",
    section: "Other Vital Workforces",
    category: ["Transport", "Workforce Welfare"],
    tags: ["Taxi", "Gig Workers", "App"],
    status: "Delayed",
    priority: "Medium",
    progress_percentage: 55,
    measurable: true,
    target_date: "2026-06-30",
    budget_amount: 35000000, // 3.5 Crores
    departments: ["Transport Department", "Information Technology Department"],
    districts: ["Chennai", "Coimbatore", "Madurai"],
    created_at: "2026-01-18T14:00:00Z",
    updated_at: "2026-05-01T10:00:00Z"
  },
  {
    id: "p12-lokayukta-anti-corruption",
    title: "Strengthening the Lokayukta Against Corruption",
    description: "Passing legislation to grant complete, independent prosecuting powers to the Lokayukta to investigate corruption, speed up trials, and confiscate illegal wealth of public servants.",
    framework: "Inbam",
    pillar: "People's Government, Transparency & Law",
    section: "Zero Tolerance for Corruption",
    category: ["Law and Order", "Governance"],
    tags: ["Anti Corruption", "Lokayukta", "Transparency"],
    status: "Completed",
    priority: "Critical",
    progress_percentage: 100,
    measurable: false,
    target_date: "2026-04-15",
    budget_amount: 15000000, // 1.5 Crores
    departments: ["Law Department"],
    districts: ["All Districts"],
    created_at: "2026-01-02T10:00:00Z",
    updated_at: "2026-04-15T18:00:00Z"
  },
  {
    id: "p13-forest-cover-33",
    title: "Increasing Forest Cover to 33% by 2031",
    description: "Executing the 'Green Tamil Nadu' mass tree plantation scheme focused on planting and nurturing 10 crore native saplings (Teak, Sandalwood, Neem) to elevate state forest cover from 23% to 33%.",
    framework: "Inbam",
    pillar: "Healthcare, Environment, & Climate",
    section: "Environment and Climate Action",
    category: ["Environment", "Climate Change"],
    tags: ["Forest", "Afforestation", "Native Trees"],
    status: "In Progress",
    priority: "High",
    progress_percentage: 30,
    measurable: true,
    target_date: "2031-12-31",
    budget_amount: 1500000000, // 150 Crores
    departments: ["Environment & Climate Change Department", "Forest Department"],
    districts: ["All Districts"],
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-04-29T11:30:00Z"
  },
  {
    id: "p14-transgender-act",
    title: "Transgender Welfare and Dignity Protection Act",
    description: "Enacting a state legislation to secure the safety, livelihood, and dignity of transgender individuals, with specialized skill-training workshops, monthly stipends, and housing land patta allocations.",
    framework: "Aram",
    pillar: "Dignified Life and Social Security for All",
    section: "Transgender and Weavers Welfare",
    category: ["Social Welfare", "Social Justice"],
    tags: ["Transgender", "Welfare", "Dignity"],
    status: "Completed",
    priority: "High",
    progress_percentage: 100,
    measurable: false,
    target_date: "2026-03-31",
    budget_amount: 50000000, // 5 Crores
    departments: ["Social Justice Department", "Revenue Department"],
    districts: ["All Districts"],
    created_at: "2026-01-11T10:00:00Z",
    updated_at: "2026-03-31T17:30:00Z"
  },
  {
    id: "p15-$1.5t-economy",
    title: "Drafting 20 Sector Transformation Maps for $1.5T GDP",
    description: "Developing comprehensive blueprint industrial maps for 20 sectors (AI, Semiconductors, EV, Textiles, Aerospace, etc.) to target a $1.5 Trillion State Economy by 2036.",
    framework: "Porul",
    pillar: "Prosperous Tamil Nadu: Industry & Economy",
    section: "Industrial Growth and MSME Revival",
    category: ["Economy", "Industrial Growth"],
    tags: ["GDP", "$1.5T", "Industrial Map"],
    status: "Blocked",
    priority: "High",
    progress_percentage: 40,
    measurable: true,
    target_date: "2026-09-30",
    budget_amount: 30000000, // 3 Crores
    departments: ["Industries Department", "Planning & Development Department"],
    districts: ["All Districts"],
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-05-02T12:00:00Z"
  }
];

// Pre-seeded progress update timeline entries
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
  },
  {
    id: "u4",
    promise_id: "p3-cooum-river",
    title: "Mission Mode Taskforce Gazetted",
    description: "Under the Chennai Eco-Restoration Trust, a high-priority river cleanup taskforce was formed with dedicated funds.",
    created_by: "Chief Secretary's Office",
    created_at: "2026-01-15T09:00:00Z"
  },
  {
    id: "u5",
    promise_id: "p3-cooum-river",
    title: "Sealing of 42 Industrial Outlets",
    description: "In a massive crackdown, 42 small-scale electroplating and textile washing units discharging untreated effluent directly into the Cooum have been sealed.",
    created_by: "TN Pollution Control Board Inspector",
    created_at: "2026-03-25T15:00:00Z"
  },
  {
    id: "u6",
    promise_id: "p3-cooum-river",
    title: "Desilting and Dredging Commenced",
    description: "Heavy machinery deployed along the 18km stretch from Cooum mouth to Chetpet. Over 1,200 tons of plastic and sludge cleared this week.",
    created_by: "Water Resources Dept Engineer",
    created_at: "2026-05-04T16:45:00Z"
  },
  {
    id: "u7",
    promise_id: "p12-lokayukta-anti-corruption",
    title: "Amendment Bill Introduced",
    description: "Lokayukta Independent Prosecuting Powers Amendment Bill introduced in the State Legislative Assembly.",
    created_by: "Ministry of Law",
    created_at: "2026-02-10T11:00:00Z"
  },
  {
    id: "u8",
    promise_id: "p12-lokayukta-anti-corruption",
    title: "Assembly Passes Bill",
    description: "The bill has been passed unanimously. It grants the Lokayukta its own independent investigation wing led by an IPS officer.",
    created_by: "Speaker's Office",
    created_at: "2026-03-05T16:30:00Z"
  },
  {
    id: "u9",
    promise_id: "p12-lokayukta-anti-corruption",
    title: "Gazette Notification and Integration",
    description: "The act has been officially gazetted and is now fully active. Lokayukta's secure portal for citizen complaints is live.",
    created_by: "Department of Personnel & Reforms",
    created_at: "2026-04-15T18:00:00Z"
  },
  {
    id: "u10",
    promise_id: "p15-$1.5t-economy",
    title: "Consulting Partner Selected",
    description: "A top global advisory firm has been selected via competitive bidding to assist in drafting the sector blueprints.",
    created_by: "State Investment Authority",
    created_at: "2026-02-28T10:00:00Z"
  },
  {
    id: "u11",
    promise_id: "p15-$1.5t-economy",
    title: "Inter-Departmental Deadlock",
    description: "Progress has hit a bottleneck as the Land Administration and Industries departments clash over the allocation of SEZ boundaries.",
    created_by: "State Planning Board",
    created_at: "2026-05-02T12:00:00Z"
  }
];

// Pre-seeded citizen evidence
export const INITIAL_MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev1",
    promise_id: "p3-cooum-river",
    type: "image",
    file_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    district: "Chennai",
    description: "Heavy machinery desilting the Cooum river near Chetpet. Excellent progress seen over the last week!",
    verification_status: "verified",
    created_at: "2026-05-02T09:00:00Z"
  },
  {
    id: "ev2",
    promise_id: "p1-caste-survey",
    type: "document",
    file_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    district: "Madurai",
    description: "Pamphlet distributed in Madurai explaining the Caste Survey socio-economic questions. The community is actively participating.",
    verification_status: "verified",
    created_at: "2026-04-18T10:30:00Z"
  },
  {
    id: "ev3",
    promise_id: "p11-tamil-taxi-app",
    type: "image",
    file_url: "https://images.unsplash.com/photo-1549880181-56a44cf8a4a1?auto=format&fit=crop&w=800&q=80",
    district: "Coimbatore",
    description: "No updates or apps are available in Coimbatore. Requesting the transport department to expedite driver registrations.",
    verification_status: "verified",
    created_at: "2026-04-25T14:20:00Z"
  }
];

// Pre-seeded comments
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
  },
  {
    id: "c3",
    promise_id: "p3-cooum-river",
    author: "Sridhar Subramanian, Chennai Citizen",
    content: "For the first time in 20 years, I can see dredging being done continuously near Chetpet. Please ensure no new sewage lines are connected!",
    created_at: "2026-05-05T08:00:00Z"
  }
];
