export type FrameworkType = "Aram" | "Porul" | "Inbam";

export type PromiseStatus =
  | "Announced"
  | "Planned"
  | "Budget Allocated"
  | "In Progress"
  | "Delayed"
  | "Blocked"
  | "Completed";

export type PromisePriority = "Low" | "Medium" | "High" | "Critical";

export type PromiseItem = {
  id: string;
  title: string;
  description: string;

  framework: FrameworkType;
  pillar: string;
  section: string;

  category: string[];
  tags: string[];

  status: PromiseStatus;
  priority: PromisePriority;

  progress_percentage: number;
  measurable: boolean;

  target_date?: string;
  budget_amount?: number;

  departments?: string[];
  districts?: string[];

  created_at: string;
  updated_at: string;
};

export type UpdateItem = {
  id: string;
  promise_id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type EvidenceItem = {
  id: string;
  promise_id: string;
  type: "image" | "video" | "document";
  file_url: string;
  district?: string;
  description?: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
};

export type CommentItem = {
  id: string;
  promise_id: string;
  author: string;
  content: string;
  created_at: string;
};

export type DistrictStats = {
  name: string;
  totalPromises: number;
  completedPromises: number;
  activePromises: number;
  delayedPromises: number;
  evidenceCount: number;
  completionRate: number;
};
