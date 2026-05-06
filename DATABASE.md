# Database Schema & Structure

NammaArasu is designed to operate on a production-grade relational database layout. The local types defined in `src/types/index.ts` map directly to our PostgreSQL schema (defined in `schema.sql`), which is prepped for seamless deployment on Supabase.

---

## Entity Relationship Model

```text
  ┌────────────────┐         1 : N         ┌────────────────┐
  │    promises    │ ────────────────────> │    updates     │
  └────────────────┘                       └────────────────┘
        │      │
        │      │ 1 : N                     ┌────────────────┐
        │      └─────────────────────────> │    evidence    │
        │                                  └────────────────┘
        │ 1 : N                            ┌────────────────┐
        └────────────────────────────────> │    comments    │
                                           └────────────────┘
```

---

## Table Schemas

### 1. `promises` Table
Represents core manifesto commitments, funding, and real-time status.

| Column Name | PostgreSQL Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique primary key. |
| `title` | `text` | `NOT NULL` | High-level summary of the promise. |
| `description` | `text` | `NOT NULL` | Detailed policy/implementation description. |
| `framework` | `text` | `NOT NULL`, `CHECK (framework IN ('Aram', 'Porul', 'Inbam'))` | Cultural/governance pillar. |
| `pillar` | `text` | `NOT NULL` | Specific sub-theme of the framework. |
| `section` | `text` | `NOT NULL` | The manifesto section. |
| `status` | `text` | `NOT NULL`, `DEFAULT 'Announced'`, `CHECK (...)` | Announced, Planned, Budget Allocated, In Progress, Delayed, Blocked, Completed. |
| `priority` | `text` | `NOT NULL`, `DEFAULT 'Medium'`, `CHECK (...)` | Low, Medium, High, Critical. |
| `progress_percentage`| `integer` | `NOT NULL`, `DEFAULT 0`, `CHECK (0-100)` | Completion sliding scale. |
| `measurable` | `boolean` | `NOT NULL`, `DEFAULT false` | Quantifiability. |
| `budget_amount` | `numeric(15,2)` | `NULL` | Allocated public funding in INR. |
| `departments` | `text[]` | `DEFAULT array[]::text[]` | Responsible state executive departments. |
| `districts` | `text[]` | `DEFAULT array[]::text[]` | Affected Tamil Nadu districts (or "All Districts"). |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Date-time of creation. |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Date-time of last modification. |

### 2. `updates` Table
Chrono logs posted by authorized administrators documenting milestones.

| Column Name | PostgreSQL Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `promise_id` | `uuid` | `NOT NULL`, `REFERENCES promises(id) ON DELETE CASCADE` | Associated manifesto promise. |
| `title` | `text` | `NOT NULL` | Headline of progress milestone. |
| `description` | `text` | `NOT NULL` | Official gazette copy or explanation. |
| `created_by` | `text` | `NOT NULL`, `DEFAULT 'Official Update'` | The administrator name/credential. |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Publication date. |

### 3. `evidence` Table
Citizen-uploaded validation attachments proving progress or blocks.

| Column Name | PostgreSQL Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `promise_id` | `uuid` | `NOT NULL`, `REFERENCES promises(id) ON DELETE CASCADE` | Associated promise. |
| `type` | `text` | `NOT NULL`, `CHECK (type IN ('image', 'video', 'document'))` | Media category. |
| `file_url` | `text` | `NOT NULL` | Public link to verified photo/document. |
| `district` | `text` | `NULL` | District where evidence was collected. |
| `description` | `text` | `NULL` | Explanation of proof. |
| `verification_status`| `text` | `NOT NULL`, `DEFAULT 'pending'`, `CHECK (...)` | pending, verified, rejected. |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Upload date. |

### 4. `comments` Table
Public community feedback, queries, and citizen monitoring discussion.

| Column Name | PostgreSQL Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `promise_id` | `uuid` | `NOT NULL`, `REFERENCES promises(id) ON DELETE CASCADE` | Associated promise. |
| `author` | `text` | `NOT NULL`, `DEFAULT 'Anonymous Citizen'` | Submitter name. |
| `content` | `text` | `NOT NULL` | Comment body. |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Date posted. |

---

## Performance Optimizations & Indexes

To support rapid, high-concurrency public queries, we pre-seed standard and specialized indices:

- **B-Tree Indices**: Applied on frequently-filtered scalar columns:
  - `idx_promises_framework` ON `promises(framework)`
  - `idx_promises_status` ON `promises(status)`
  - `idx_promises_priority` ON `promises(priority)`
- **GIN Indices**: Configured for PostgreSQL array search and filtering (e.g. searching promises affecting specific districts or departments):
  - `idx_promises_districts_gin` ON `promises USING GIN (districts)`
  - `idx_promises_departments_gin` ON `promises USING GIN (departments)`
- **Foreign Key Indexes**: Placed to accelerate join queries:
  - `idx_updates_promise_id` ON `updates(promise_id)`
  - `idx_evidence_promise_id` ON `evidence(promise_id)`
  - `idx_comments_promise_id` ON `comments(promise_id)`

---

## Automatic Triggers

We maintain a PL/pgSQL function to update the `updated_at` column automatically before modifications are written:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON promises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) Policies

We enforce strict security policies on Supabase to ensure that only authenticated administrators can modify core promises or official progress logs, while allowing any citizen to read metrics, post comments, and upload evidence.

1. **Read-Only (Public)**:
   - Anyone can view tables: `promises`, `updates`, `evidence`, and `comments`.
2. **Citizen Submissions**:
   - Anyone can insert into `comments` and `evidence`.
3. **Admin Actions (Authenticated)**:
   - Only authenticated administrators with validated auth roles can insert, update, or delete entries inside `promises` and `updates`.
