# Database Schema & Structure

NammaArasu operates on a structured, relational layout currently represented inside `src/types/index.ts` and mirrored by the static database seeds in `schema.sql`.

## Schema Models

### 1. `PromiseItem`
Represents a specific core manifesto promise, its financial projection, and status.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique UUID primary key |
| `title` | `string` | High-level summary of the promise |
| `description` | `string` | Granular technical implementation target |
| `framework` | `"Aram" \| "Porul" \| "Inbam"` | Core cultural/governance pillar |
| `status` | `PromiseStatus` | Current implementation state (Announced, In Progress, etc.) |
| `priority` | `PriorityLevel` | Urgent civic attention rating (Critical, High, etc.) |
| `progress_percentage` | `number` | Numeric completion metric (0 to 100) |
| `budget_amount` | `number` | Allocated public funding in INR |
| `districts` | `string[]` | Affected districts or "All Districts" |
| `departments` | `string[]` | Responsible executive state departments |
| `target_date` | `string` | Public target implementation deadline |

---

### 2. `TimelineLog`
Official log records posted by administrators to document milestones.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `timestamp` | `string` | Date-time of publication |
| `author` | `string` | Publisher's name / credential |
| `status` | `string` | Associated progress status transition |
| `description` | `string` | Gazette text or description of the update |
| `progress` | `number` | Updated completion rate |

---

### 3. `Evidence`
Citizen-uploaded validation entries containing media.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `timestamp` | `string` | Date of upload |
| `citizenName` | `string` | Submitter's name |
| `description` | `string` | Narrative proof explanation |
| `mediaUrl` | `string` | Public link to uploaded image or document |
