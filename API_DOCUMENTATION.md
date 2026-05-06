# API Specifications

The `promiseService` inside `src/lib/db.ts` mimics a production public API endpoint structure to manage manifesto promises, updates, and evidence submissions.

## Methods & Endpoints

### 1. Retrieve All Promises
* **Signature**: `getPromises(): Promise<PromiseItem[]>`
* **Description**: Pulls the full list of 15 core manifesto promises with their frameworks, progress percentages, budgets, and district metadata.
* **Response Model**: `PromiseItem[]`

---

### 2. Retrieve Specific Promise
* **Signature**: `getPromiseById(id: string): Promise<PromiseItem | null>`
* **Description**: Fetches a single manifesto promise with detailed progress timeline logs and citizen evidence attachments.
* **Response Model**: `PromiseItem`

---

### 3. Submit Citizen Evidence
* **Signature**: `submitEvidence(promiseId: string, evidence: Omit<Evidence, "id" | "timestamp">): Promise<Evidence>`
* **Description**: Appends a verified image or document proof of implementation progress from public citizen monitors.
* **Request Schema**:
  ```typescript
  {
    citizenName: string;
    description: string;
    mediaUrl: string;
  }
  ```

---

### 4. Post Official Progress Entry
* **Signature**: `postTimelineLog(promiseId: string, author: string, status: string, description: string, progress: number): Promise<void>`
* **Description**: Allows authenticated administrators to record official progress updates, legislative steps, and budget expenditures.
