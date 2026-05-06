# Public API & Service Specifications

The unified `promiseService` (defined in `src/lib/db.ts`) handles all database operations. It operates on standard TypeScript signatures designed to mirror a production-grade public REST or GraphQL API. This structure enables external developers to easily transition these services into public Next.js API Routes (`/api/promises/*`).

---

## 1. Promises & Milestones

### Retrieve All Promises
Pulls the complete list of manifesto commitments, sorted chronologically by creation date.

- **Signature**: `getPromises(): Promise<PromiseItem[]>`
- **Response Schema**: `PromiseItem[]`
- **Response Example**:
  ```json
  [
    {
      "id": "p0-tvk-journey",
      "title": "TVK's Journey: A Commitment to Lead the Nation",
      "description": "A comprehensive, verified timeline tracing TVK's historic milestones...",
      "framework": "Aram",
      "pillar": "Tamil Identity and Pride",
      "section": "Political Milestones",
      "status": "Completed",
      "priority": "Critical",
      "progress_percentage": 100,
      "measurable": true,
      "target_date": "2026-05-04",
      "budget_amount": 0,
      "departments": ["TVK General Secretariat"],
      "districts": ["All Districts"],
      "created_at": "2024-02-02T10:00:00Z",
      "updated_at": "2026-05-05T10:00:00Z"
    }
  ]
  ```

---

### Retrieve Specific Promise
Fetches details of a single manifesto promise by its stable ID.

- **Signature**: `getPromiseById(id: string): Promise<PromiseItem | null>`
- **Parameters**: `id: string` (The stable promise slug or UUID)
- **Response Schema**: `PromiseItem` or `null` if not found.

---

### Update Promise Progress (Admin Only)
Modifies the status, budget, or progress percentage of an existing promise.

- **Signature**: `updatePromise(id: string, updates: Partial<PromiseItem>): Promise<PromiseItem | null>`
- **Parameters**:
  - `id: string`
  - `updates`: Object containing modified fields (e.g., `{ status: "In Progress", progress_percentage: 45 }`)
- **Response Schema**: Updated `PromiseItem` or `null` on failure.

---

### Transition Promise Status & Log (Admin Only)
Updates the promise metrics and automatically appends an official progress entry to the public timeline.

- **Signature**: `transitionPromiseStatus(id: string, newStatus: PromiseStatus, progress: number, logDescription: string): Promise<PromiseItem | null>`
- **Parameters**:
  - `id: string`
  - `newStatus`: `PromiseStatus`
  - `progress`: `number` (0 to 100)
  - `logDescription`: `string` (The official Gazette text/announcement)
- **Response Schema**: Updated `PromiseItem`.

---

## 2. Chrono Logs, Evidence & Comments

### Fetch Chronological Updates
Fetches official timeline updates for a specific promise.

- **Signature**: `getUpdatesByPromiseId(promiseId: string): Promise<UpdateItem[]>`
- **Response Schema**: `UpdateItem[]`

---

### Post Official Progress Log (Admin Only)
Appends a verified official timeline log to a promise.

- **Signature**: `addUpdate(update: Omit<UpdateItem, "id" | "created_at">): Promise<UpdateItem>`
- **Request Parameters**:
  ```typescript
  {
    promise_id: string;
    title: string;
    description: string;
    created_by: string;
  }
  ```
- **Response Schema**: Complete created `UpdateItem` with generated `id` and `created_at` timestamp.

---

### Submit Citizen Evidence
Enables citizens to upload a media attachment (document, image, video link) validating progress or indicating blocks.

- **Signature**: `addEvidence(evidence: Omit<EvidenceItem, "id" | "verification_status" | "created_at">): Promise<EvidenceItem>`
- **Request Parameters**:
  ```typescript
  {
    promise_id: string;
    type: "image" | "video" | "document";
    file_url: string;
    district?: string;
    description?: string;
  }
  ```
- **Response Schema**: Created `EvidenceItem` (automatically initialized as `verified` in MVP fallback mode).

---

### Submit Citizen Discussion Comment
Enables citizens to post feedback and engage in open discussions regarding a promise's implementation status.

- **Signature**: `addComment(comment: Omit<CommentItem, "id" | "created_at">): Promise<CommentItem>`
- **Request Parameters**:
  ```typescript
  {
    promise_id: string;
    author: string;
    content: string;
  }
  ```
- **Response Schema**: Complete created `CommentItem`.

---

## 3. Regional Analytics

### Retrieve District Analytics
Aggregates and compiles progress metrics across all 38 Tamil Nadu districts. It tallies affected promises, completion percentages, active developments, and uploaded citizen evidence counts for each individual administrative region.

- **Signature**: `getDistrictStats(): Promise<DistrictStats[]>`
- **Response Schema**: `DistrictStats[]`
- **Response Example**:
  ```json
  [
    {
      "name": "Chennai",
      "totalPromises": 15,
      "completedPromises": 1,
      "activePromises": 14,
      "delayedPromises": 0,
      "evidenceCount": 1,
      "completionRate": 7
    }
  ]
  ```

---

## Resilience & Error Handling

- **Self-Healing Sync**: If Firestore fails or rejects queries due to permission issues or missing indices, the service logs a console warning and falls back immediately to `localStorage`.
- **Pre-seeded Static Fallbacks**: If `localStorage` is empty, the parsing engine extracts promises directly from static JSON documents (`tvk_aram_framework.json`, etc.) so the frontend loads immediately.
