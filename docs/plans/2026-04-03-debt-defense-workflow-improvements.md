# Debt Defense Workflow Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close 9 gaps in the debt defense workflow by adding discovery response guidance, exemption claim process, court type differentiation, debt buyer standing challenge, TDCPA expansion, 2019 SOL reform, business records challenge, pre-answer settlement, and appeal process steps.

**Architecture:** New/modified guided step TypeScript files in `packages/shared/src/guided-steps/debt-defense/`, one Supabase migration for new task_keys + updated unlock chain, and step router updates.

**Tech Stack:** TypeScript (guided step configs), PostgreSQL (Supabase migration)

---

## Summary of Changes

| # | Item | Type | New task_key |
|---|------|------|-------------|
| 1 | Discovery response + RFA warning | New step | `debt_discovery_response` |
| 2 | Texas exemption claim process | New step | `debt_exemption_claim` |
| 3 | JP vs County/District court guide | New step | `debt_court_type_guide` |
| 4 | Debt buyer standing challenge | New step | `debt_standing_challenge` |
| 5 | TDCPA expansion | Modify existing | (modify fdcpa-check.ts) |
| 6 | 2019 SOL reform note | Modify existing | (modify debt-sol-check.ts) |
| 7 | Business records affidavit challenge | New step | `debt_business_records_challenge` |
| 8 | Pre-answer settlement guidance | New step | `debt_pre_answer_settlement` |
| 9 | Appeal process step | New step | `debt_appeal_process` |
| 10 | DB migration | New migration | N/A |
| 11 | Step router registration | Modify existing | N/A |

## New task positions in chain

- `debt_court_type_guide` — after `debt_defense_intake`, before `evidence_vault` (needs court type context early)
- `debt_pre_answer_settlement` — after `prepare_debt_validation_letter`, before `prepare_debt_defense_answer` (settlement before filing)
- `debt_standing_challenge` — after `prepare_debt_defense_answer`, before `debt_file_with_court` (strengthen answer)
- `debt_discovery_response` — after `serve_plaintiff`, before `debt_hearing_prep` (respond to plaintiff's discovery)
- `debt_business_records_challenge` — after `serve_plaintiff`, unlocks alongside `debt_discovery_response`
- `debt_exemption_claim` — after `debt_post_judgment` (post-judgment protection)
- `debt_appeal_process` — after `debt_post_judgment` (post-judgment option)
