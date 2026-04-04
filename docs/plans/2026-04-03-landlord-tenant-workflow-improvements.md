# Landlord-Tenant Workflow Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close 8 gaps in the landlord-tenant workflow with SB 38 awareness, CARES Act check, retaliation documentation, rent-into-registry detail, post-eviction rights, constructive eviction, code enforcement, and security deposit fix.

**Architecture:** New/modified guided step TypeScript files + one migration + step router update.

**Tech Stack:** TypeScript, PostgreSQL (Supabase migration)

---

## Changes

| # | Item | Type | Task key |
|---|------|------|----------|
| 1 | SB 38 eviction reform awareness | New step | `lt_sb38_awareness` |
| 2 | CARES Act / federal property check | New step | `lt_federal_property_check` |
| 3 | Retaliation defense documentation | New step | `lt_retaliation_defense` |
| 4 | Rent-into-registry appeal guide | New step | `lt_rent_into_registry` |
| 5 | Post-eviction rights & belongings | New step | `lt_post_eviction_rights` |
| 6 | Constructive eviction guide | New step | `lt_constructive_eviction` |
| 7 | Code enforcement complaint guide | New step | `lt_code_enforcement` |
| 8 | Security deposit forwarding address fix | Modify existing | (modify lt-security-deposit-demand.ts) |
| 9 | DB migration | New migration | N/A |
| 10 | Step router registration | Modify existing | N/A |

## New task positions

- `lt_sb38_awareness` — after `landlord_tenant_intake`, before `evidence_vault` (critical context early)
- `lt_federal_property_check` — after `landlord_tenant_intake`, unlocks alongside `lt_sb38_awareness`
- `lt_retaliation_defense` — unlocks after `lt_eviction_response` (depth task)
- `lt_rent_into_registry` — unlocks after `lt_appeal_guide` (depth task)
- `lt_post_eviction_rights` — unlocks after `hearing_day` (depth task)
- `lt_constructive_eviction` — unlocks after `lt_habitability_checklist` (depth task)
- `lt_code_enforcement` — unlocks after `lt_repair_request` (depth task)
