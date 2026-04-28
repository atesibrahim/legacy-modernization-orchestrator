---
name: data-migration
description: 'Data migration skill for legacy modernization. Optional Phase 4f. Use when: migrating data from legacy to new schema, writing Flyway/Liquibase/Alembic/Goose schema migration scripts, implementing dual-write reconciliation, validating row counts and checksums, performing large-table chunking, repairing referential integrity, running legacy data cleansing pipelines, executing post-migration data quality audits, producing cutover freeze SQL and rollback procedures.'
argument-hint: 'Path to legacy analysis and target architecture artifacts, plus database connection details'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Data Migration

## Role
**Senior Data Migration Engineer** — Plan and execute a zero-data-loss, reversible migration from the legacy schema to the target schema with full validation and rollback coverage.

## When to Use
- Legacy schema cannot be reused as-is in the new system (different ORM, new bounded contexts, normalized data)
- Large-volume tables requiring chunked migration strategies
- Dual-write reconciliation period needed before cutover
- Post-migration data quality audit required before go-live

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Legacy analysis report | `ai-driven-development/docs/legacy_analysis/legacy_analysis.md` | Always |
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Tech stack selections | `ai-driven-development/docs/tech_stack_selections.md` | Always |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 1: `legacy-analysis`, Phase 3: `target-architecture`, Phase 2.5: Tech Stack Selection Gate), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

---

## Output Artifacts

All outputs go to `ai-driven-development/development/data_migration/`:

```
data_migration/
├── data_migration_todo.md            ← Phase tracker (always)
├── schema_migrations/                ← Versioned migration scripts
│   ├── V001__create_target_schema.sql
│   ├── V002__migrate_users.sql
│   └── ...
├── validation/
│   ├── pre_migration_counts.sql      ← Baseline row counts & checksums
│   ├── post_migration_counts.sql     ← Validation queries after migration
│   └── reconciliation_report.md     ← Comparison of legacy vs new counts
├── cleansing/
│   └── cleanse_legacy_data.sql       ← Data quality fix scripts (run before migration)
└── rollback/
    └── rollback_playbook.md          ← Step-by-step rollback procedure with SQL
```

---

## Procedure

### Step 0 — Create Phase Tracker

Create `ai-driven-development/development/data_migration/data_migration_todo.md`:

```markdown
# Data Migration — Phase Tracker

## Status
- [ ] Phase 1 — Schema Analysis & Mapping
- [ ] Phase 2 — Data Cleansing
- [ ] Phase 3 — Schema Migration Scripts
- [ ] Phase 4 — ETL / Data Transfer
- [ ] Phase 5 — Validation & Reconciliation
- [ ] Phase 6 — Cutover Procedure
- [ ] Phase 7 — PII Handling in Non-Prod
- [ ] Phase 8 — Rollback Playbook
- [ ] Phase 9 — Post-Migration Audit
- [ ] DoD Gate

## Notes
<!-- Running log of decisions, findings, blockers -->
```

---

### Phase 1 — Schema Analysis & Mapping

**Goal**: Produce a complete mapping from every legacy table/column to its target equivalent.

1. **Read** `legacy_analysis.md` §§ Database Schema, Stored Procedures, Table Ownership Matrix.
2. **Read** `target_architecture.md` §§ Domain Model, Database Design.
3. **Produce a migration mapping table**:

| Legacy Table | Legacy Column | Target Table | Target Column | Transformation | Notes |
|---|---|---|---|---|---|
| `CUSTOMER` | `CUST_NM` | `customers` | `full_name` | trim + title-case | nullable → not null |
| `ORDER_HDR` | `ORD_STS` | `orders` | `status` (enum) | code map: `O`→`OPEN`, `C`→`CLOSED` | — |
| `ORDER_HDR` | `TOT_AMT` | `orders` | `total_cents` (integer) | multiply by 100 | currency precision |

4. **Flag unmapped tables** — tables with no target equivalent (archive, drop, or transform to new structure).
5. **Flag split/merge operations** — legacy tables that split into multiple target tables, or multiple legacy tables that merge into one.
6. **Identify God tables** — tables used by many bounded contexts; document how ownership will be split.

---

### Phase 2 — Data Cleansing

**Goal**: Fix known data quality issues in the legacy database *before* migration to prevent ETL failures.

1. **Review** data quality findings from `legacy_analysis.md` § Data Quality Assessment.
2. **Write cleansing scripts** in `cleansing/cleanse_legacy_data.sql`:

```sql
-- Remove duplicate customers (keep most recent record)
DELETE FROM CUSTOMER
WHERE CUST_ID NOT IN (
    SELECT MAX(CUST_ID)
    FROM CUSTOMER
    GROUP BY EMAIL_ADDR
);

-- Trim whitespace from name columns
UPDATE CUSTOMER
SET CUST_NM = TRIM(CUST_NM)
WHERE CUST_NM <> TRIM(CUST_NM);

-- Fix NULL email addresses with placeholder
UPDATE CUSTOMER
SET EMAIL_ADDR = 'unknown_' || CUST_ID || '@legacy.invalid'
WHERE EMAIL_ADDR IS NULL;

-- Enforce referential integrity: orphaned order lines
DELETE FROM ORDER_LINE
WHERE ORD_ID NOT IN (SELECT ORD_ID FROM ORDER_HDR);
```

3. **Run cleansing on a copy** — never the live DB — and record row counts before and after.
4. **Review with stakeholders** — any destructive cleansing (deletes) requires sign-off.

---

### Phase 3 — Schema Migration Scripts

**Goal**: Produce versioned, idempotent DDL scripts to create the target schema alongside (or instead of) the legacy schema.

#### Tool selection (from `tech_stack_selections.md`):

| Backend Stack | Recommended Migration Tool |
|---|---|
| Java + Spring Boot | Flyway or Liquibase |
| .NET + ASP.NET Core | EF Core Migrations or Flyway |
| Python + FastAPI | Alembic |
| Go + Gin/Fiber | Goose |
| Any (DB-first) | Flyway (SQL-based, vendor-neutral) |

#### Flyway conventions:
```
db/migration/
├── V001__create_schema.sql
├── V002__create_customers.sql
├── V003__create_orders.sql
└── V004__create_order_lines.sql
```

- Script names: `V{version}__{description}.sql` — double underscore required.
- Every script is **idempotent** — use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... IF NOT EXISTS`.
- Never modify a script that has already been applied — add a new version instead.

#### Liquibase conventions (Java / any stack):
```
db/changelog/
├── db.changelog-master.xml
└── changes/
    ├── 001-create-customers.xml
    └── 002-create-orders.xml
```

`db.changelog-master.xml` — root changelog that includes all change files:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.20.xsd">

    <include file="changes/001-create-customers.xml" relativeToChangelogFile="true"/>
    <include file="changes/002-create-orders.xml" relativeToChangelogFile="true"/>
</databaseChangeLog>
```

`changes/001-create-customers.xml` — individual changeset:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.20.xsd">

    <changeSet id="001" author="migration">
        <createTable tableName="customers">
            <column name="id" type="UUID">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="full_name" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="email" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="created_at" type="TIMESTAMPTZ" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <rollback>
            <dropTable tableName="customers"/>
        </rollback>
    </changeSet>
</databaseChangeLog>
```

- Each `<changeSet>` has a unique `id` + `author` — never modify after applying; add a new changeset instead.
- Always include a `<rollback>` block for every destructive or structural change.

#### Alembic conventions (Python):
```python
# alembic/versions/001_create_customers.py
def upgrade() -> None:
    op.create_table(
        'customers',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

def downgrade() -> None:
    op.drop_table('customers')
```

#### Goose conventions (Go):
```sql
-- +goose Up
CREATE TABLE IF NOT EXISTS customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS customers;
```

---

### Phase 4 — ETL / Data Transfer

**Goal**: Move and transform data from legacy tables into target tables.

#### Strategy selection:

| Volume | Approach |
|---|---|
| < 1M rows | Single SQL `INSERT INTO ... SELECT` per table |
| 1M – 50M rows | Chunked migration (batches of 10,000 rows) |
| > 50M rows | Parallel chunked migration or dedicated ETL tool (pgloader, AWS DMS, dbt) |

#### Chunked migration pattern (PostgreSQL):
```sql
-- Chunked migration for large tables (batch size: 10,000)
DO $$
DECLARE
    batch_size  INT := 10000;
    offset_val  BIGINT := 0;
    rows_moved  INT;
BEGIN
    LOOP
        INSERT INTO customers (id, full_name, email, created_at)
        SELECT
            gen_random_uuid(),
            INITCAP(TRIM(c.CUST_NM)),
            LOWER(TRIM(c.EMAIL_ADDR)),
            COALESCE(c.CREATED_DT, NOW())
        FROM CUSTOMER c
        ORDER BY c.CUST_ID
        LIMIT batch_size OFFSET offset_val
        ON CONFLICT (email) DO NOTHING;

        GET DIAGNOSTICS rows_moved = ROW_COUNT;
        EXIT WHEN rows_moved = 0;
        offset_val := offset_val + batch_size;
        RAISE NOTICE 'Migrated % rows (offset %)', rows_moved, offset_val;
    END LOOP;
END $$;
```

#### Dual-write pattern (zero-downtime migration):
```
Phase A — Reads from legacy, writes to legacy + new
Phase B — Reads from new (with fallback to legacy), writes to both
Phase C — Reads from new, writes to new only; legacy is read-only
Phase D — Legacy decommissioned
```

Implementation checklist for dual-write:
- [ ] New service writes to both legacy DB and new DB on every mutation
- [ ] Reconciliation job runs every N minutes — compares counts/checksums
- [ ] Alerts fire if reconciliation drift > threshold
- [ ] Feature flag controls which DB is the read source
- [ ] Rollback path: flip feature flag back to legacy; stop dual-write

---

### Phase 5 — Validation & Reconciliation

**Goal**: Prove that target data exactly matches the migrated legacy data.

#### Pre-migration baseline (`validation/pre_migration_counts.sql`):
```sql
-- Run BEFORE migration; save output to a file for comparison
SELECT 'CUSTOMER'     AS table_name, COUNT(*) AS row_count, MD5(STRING_AGG(CUST_ID::text, ',' ORDER BY CUST_ID)) AS checksum FROM CUSTOMER
UNION ALL
SELECT 'ORDER_HDR',   COUNT(*), MD5(STRING_AGG(ORD_ID::text,  ',' ORDER BY ORD_ID))  FROM ORDER_HDR
UNION ALL
SELECT 'ORDER_LINE',  COUNT(*), MD5(STRING_AGG(LINE_ID::text, ',' ORDER BY LINE_ID)) FROM ORDER_LINE;
```

#### Post-migration validation (`validation/post_migration_counts.sql`):
```sql
-- Run AFTER migration; compare counts and checksums against pre-migration baseline
SELECT 'customers'    AS table_name, COUNT(*) AS row_count, MD5(STRING_AGG(id::text, ',' ORDER BY id)) AS checksum FROM customers
UNION ALL
SELECT 'orders',      COUNT(*), MD5(STRING_AGG(id::text, ',' ORDER BY id)) FROM orders
UNION ALL
SELECT 'order_lines', COUNT(*), MD5(STRING_AGG(id::text, ',' ORDER BY id)) FROM order_lines;
```

#### Referential integrity check:
```sql
-- Verify no orphaned records after migration
SELECT 'Orphaned order_lines' AS issue, COUNT(*) AS count
FROM order_lines ol
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = ol.order_id)
UNION ALL
SELECT 'Orphaned orders', COUNT(*)
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id);
-- Expected: all counts = 0
```

#### Reconciliation report template (`validation/reconciliation_report.md`):
```markdown
# Migration Reconciliation Report
**Date**: YYYY-MM-DD
**Performed by**: [name]

| Legacy Table | Legacy Count | Target Table | Target Count | Delta | Checksum Match |
|---|---|---|---|---|---|
| CUSTOMER | 45,231 | customers | 45,231 | 0 | ✅ |
| ORDER_HDR | 182,044 | orders | 182,044 | 0 | ✅ |

**Result**: PASS / FAIL
**Sign-off**: [ ] DBA  [ ] Lead Developer  [ ] Product Owner
```

---

### Phase 6 — Cutover Procedure

**Goal**: Coordinate the final switch from legacy to new system with minimal downtime.

#### Cutover checklist:
1. [ ] Reconciliation report signed off by DBA + Product Owner
2. [ ] Maintenance window communicated to stakeholders (minimum 4 hours recommended)
3. [ ] All active sessions drained from legacy application
4. [ ] **Legacy database set to read-only**:
   ```sql
   -- PostgreSQL
   ALTER DATABASE legacy_db SET default_transaction_read_only = on;
   -- Or terminate connections and revoke write access:
   REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM app_user;
   ```
5. [ ] Final incremental data sync (capture changes since last batch)
6. [ ] Final validation query run — all counts and checksums must match
7. [ ] New application connection strings pointed to new database
8. [ ] Smoke test all critical user journeys against new system
9. [ ] Monitor error rates and latency for 30 minutes post-cutover
10. [ ] Stakeholder sign-off received
11. [ ] Legacy database archived (not dropped) — retain for 90 days minimum

---

### Phase 7 — PII Handling in Non-Prod

**Goal**: Ensure no real personal data exists in development, staging, or CI environments. This section is **mandatory** whenever the legacy database contains PII (names, emails, phone numbers, addresses, national IDs, payment data, health data, or any field that can identify a living individual).

#### 7.1 — PII Column Inventory

Before copying any data to a non-prod environment, produce a PII column inventory from `legacy_analysis.md` and the schema mapping table (Phase 1):

| Table | Column | PII Category | Masking Strategy |
|---|---|---|---|
| `CUSTOMER` | `CUST_NM` | Name | Faker — random full name |
| `CUSTOMER` | `EMAIL_ADDR` | Email | Deterministic hash: `anon_{MD5(email)}@example.com` |
| `CUSTOMER` | `PHONE_NBR` | Phone | Replace with `+10000000000` |
| `CUSTOMER` | `DOB` | Date of birth | Shift date ±1–5 years randomly |
| `PAYMENT` | `CARD_NBR` | Payment card | Retain first 6 + last 4, mask middle: `411111XXXXXX1234` |
| `PAYMENT` | `CVV` | Payment card | Replace with `000` |

#### 7.2 — Data Masking Scripts

Create `masking/mask_non_prod_data.sql` (or equivalent for the chosen migration tool). Masking **must** run automatically as part of the non-prod data-load pipeline — never require a manual step.

```sql
-- ============================================================
-- mask_non_prod_data.sql
-- Run AFTER data load on non-prod (dev / staging / CI) databases
-- NEVER run on production
-- ============================================================

-- Guard: abort if accidentally run on production
DO $$
BEGIN
    IF current_database() NOT LIKE '%dev%'
       AND current_database() NOT LIKE '%staging%'
       AND current_database() NOT LIKE '%test%'
       AND current_database() NOT LIKE '%ci%' THEN
        RAISE EXCEPTION 'Safety guard: this script must not run on %', current_database();
    END IF;
END $$;

-- Mask customer names with deterministic placeholder
UPDATE customers
SET
    full_name  = 'User ' || id,
    email      = 'anon_' || MD5(email) || '@example.com',
    phone      = '+10000000000',
    birth_date = birth_date + (FLOOR(RANDOM() * 11) - 5)::INT * INTERVAL '1 year'
WHERE TRUE;

-- Mask payment card numbers (keep BIN + last 4)
UPDATE payment_methods
SET
    card_number = SUBSTRING(card_number, 1, 6) || 'XXXXXX' || RIGHT(card_number, 4),
    cvv         = '000',
    cardholder_name = 'MASKED CARDHOLDER'
WHERE TRUE;
```

> **Flyway/Liquibase non-prod overlay**: If using a migration tool, add the masking script as a repeatable migration (`R__mask_non_prod_data.sql` in Flyway) that only runs in non-prod environments via a Spring profile or environment variable gate.

#### 7.3 — Data Subsetting (Large Databases)

For databases > 10 GB, copying the full dataset to non-prod is unnecessary and increases PII exposure. Apply data subsetting:

1. **Select a representative subset** — typically the most recent N% of records per entity (e.g., last 90 days of orders, a stratified sample of customers).
2. **Preserve referential integrity** — include all rows referenced by foreign key constraints in the subset.
3. **Minimum viable subset size** — enough rows to exercise all code paths (typically 5–10% of production volume, minimum 10,000 rows per primary entity).
4. **Document the subsetting criteria** in `data_migration_todo.md` so all team members use the same dataset.

Example subsetting query:
```sql
-- Extract a referentially-consistent subset: last 90 days of orders + their customers
CREATE TABLE staging_export AS
SELECT DISTINCT c.*
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '90 days';
```

#### 7.4 — Non-Prod Data Pipeline Checklist

- [ ] PII column inventory documented in `masking/pii_inventory.md`
- [ ] `masking/mask_non_prod_data.sql` (or equivalent) created and peer-reviewed
- [ ] Masking script includes an environment guard (cannot run on prod)
- [ ] Masking script is executed automatically in the CI/CD pipeline after each non-prod data refresh
- [ ] Data subsetting criteria documented (if database > 10 GB)
- [ ] No real email addresses, phone numbers, or payment data visible in non-prod application UI
- [ ] **Privacy/compliance team sign-off obtained** before first non-prod data load (record sign-off date and approver in `data_migration_todo.md`)

> ⚠️ **Regulatory note**: Loading unmasked PII into non-prod environments may violate GDPR Art. 25 (data protection by design), CCPA §1798.100, HIPAA Safe Harbor, and PCI DSS Requirement 6.3.3. If uncertain whether the data contains regulated PII, treat it as if it does and apply masking. Obtain written sign-off from the privacy or compliance team before proceeding.

---

### Phase 8 — Rollback Playbook

**Goal**: Ensure the team can revert to the legacy system within the agreed RTO if critical issues occur.

Create `rollback/rollback_playbook.md`:

```markdown
# Rollback Playbook

## Trigger Criteria (Go to rollback if ANY of these occur)
- Error rate > 5% in new system within 30 minutes of cutover
- Critical data loss detected (missing records vs legacy)
- P95 latency > 3× legacy baseline
- Business-critical workflow completely unavailable

## Rollback Steps

### Step 1 — Decision (≤ 5 minutes)
- [ ] On-call lead declares rollback
- [ ] Notify stakeholders via incident channel

### Step 2 — Traffic (≤ 10 minutes)
- [ ] Revert load balancer / DNS to point to legacy application
- [ ] Verify legacy application is serving traffic (smoke test)

### Step 3 — Database (≤ 15 minutes)
- [ ] Re-enable writes on legacy database:
  ```sql
  ALTER DATABASE legacy_db SET default_transaction_read_only = off;
  GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
  ```
- [ ] Verify legacy DB accepts writes

### Step 4 — Validate (≤ 20 minutes)
- [ ] Run critical path smoke tests on legacy system
- [ ] Confirm row counts match pre-cutover baseline

### Step 5 — Post-Rollback
- [ ] Document root cause
- [ ] Retain new system data snapshot for analysis
- [ ] Schedule post-mortem within 48 hours
```

---

### Phase 9 — Post-Migration Data Quality Audit

**Goal**: After a stabilization period (typically 1–2 weeks), confirm data integrity in production.

Audit checklist:
- [ ] **Row count stability**: no unexpected deltas vs cutover counts
- [ ] **Business metric validation**: key KPIs (revenue totals, user counts, order volumes) match legacy reporting for same period
- [ ] **Null rate audit**: columns that were NOT NULL in legacy are not NULL in target
- [ ] **Enum/code integrity**: all legacy status codes correctly mapped to target enums
- [ ] **Foreign key health**: run referential integrity check queries — all counts must be 0
- [ ] **Duplicate audit**: unique-constrained columns have no duplicates
- [ ] **Date/timezone audit**: datetime values are in the expected timezone and format
- [ ] **Currency/decimal audit**: monetary values match legacy totals within rounding tolerance

---

## Definition of Done

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §4 — Cross-Cutting Concerns checklist and §6 — Dependency Management Rules.

- [ ] Schema mapping table covers 100% of legacy tables (including decisions to archive/drop)
- [ ] Data cleansing scripts documented and reviewed
- [ ] Schema migration scripts committed and applied successfully on staging
- [ ] ETL scripts tested on a staging copy of production data
- [ ] Pre- and post-migration validation queries produce matching counts and checksums
- [ ] Reconciliation report signed off by DBA and Product Owner
- [ ] Cutover procedure checklist complete and rehearsed on staging
- [ ] PII column inventory documented; masking scripts written, reviewed, and run automatically in non-prod pipeline
- [ ] Privacy/compliance team sign-off obtained before first non-prod data load
- [ ] Rollback playbook written and tested (rehearsed on staging)
- [ ] Post-migration audit checklist completed after stabilization period
- [ ] All migration artifacts committed to `ai-driven-development/development/data_migration/`
