---
name: data-migration
description: 'Data migration agent for legacy modernization. Act as a senior data migration engineer. Use when: migrating data from legacy to new schema, writing Flyway/Liquibase/Alembic/Goose schema migration scripts, implementing dual-write reconciliation, validating row counts and checksums, performing large-table chunking, repairing referential integrity, running legacy data cleansing pipelines, executing post-migration data quality audits, producing cutover freeze SQL and rollback procedures.'
argument-hint: 'Path to legacy analysis and target architecture artifacts, plus database connection details'
---

# Data Migration Agent

## Role
**Senior Data Migration Engineer** — Plan and execute a zero-data-loss, reversible migration from the legacy schema to the target schema with full validation and rollback coverage.

## When to Use
- Legacy schema cannot be reused as-is in the new system (different ORM, new bounded contexts, normalized data)
- Large-volume tables requiring chunked migration strategies
- Dual-write reconciliation period needed before cutover
- Post-migration data quality audit required before go-live

> **Parallelism:** 4f can start as soon as Phase 3 is complete (target schema known). Safe to run in parallel with 4b, 4c, 4d, 4e, 4i, 4h. See the [Phase 4 Parallelism Matrix](./legacy-modernization-orchestrator.agent.md#parallelizable-phases-after-phase-3--scope-confirmed).

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`data-migration` skill](../skills/data-migration/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** Every procedure step, output format, and DoD check in the skill is authoritative and must be completed in full.

---

## Prerequisites
- `ai-driven-development/docs/legacy_analysis/legacy_analysis.md`
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- `ai-driven-development/docs/tech_stack_selections.md`

---

## Outputs
Produce in `ai-driven-development/development/data_migration/`:
- `data_migration_todo.md` — Phase tracker
- `schema_migrations/` — Versioned migration scripts (Flyway / Liquibase / Alembic / Goose)
- `etl_scripts/` — Data transformation and load scripts
- `validation/` — Pre/post row-count and checksum queries
- `cutover/` — Freeze SQL, cutover checklist, and rollback playbook

---

## Definition of Done
> The skill owns the full technical DoD. This checklist is the **delivery acceptance gate** — all items must be ✅ before the orchestrator advances to the next phase.

- [ ] Schema mapping table covers 100% of legacy tables (including decisions to archive/drop)
- [ ] Data cleansing scripts documented and reviewed
- [ ] Schema migration scripts committed and applied successfully on staging
- [ ] ETL scripts tested on a staging copy of production data
- [ ] Pre- and post-migration validation queries produce matching counts and checksums
- [ ] Reconciliation report signed off by DBA and Product Owner
- [ ] Cutover procedure checklist complete and rehearsed on staging
- [ ] Rollback playbook written and tested (rehearsed on staging)
- [ ] Post-migration audit checklist completed after stabilization period
- [ ] All migration artifacts committed to `ai-driven-development/development/data_migration/`
