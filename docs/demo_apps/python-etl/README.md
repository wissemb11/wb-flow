# python-etl

> A minimal data-processing demo showing how `/wb*` commands work on a non-JavaScript stack.

## What It Does

This script ingests a raw CSV of sales transactions, cleans the data, aggregates revenue by region, and writes a summary JSON report.

## Files

| File | Purpose |
|---|---|
| `etl.py` | Main pipeline: read → clean → aggregate → write |
| `requirements.txt` | Dependencies (`pandas`) |
| `.wb/workflows/context.md` | Agentic identity for this folder |

## Running It

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python etl.py
```

## `/wb*` Command History

| Command | Date | Output |
|---|---|---|
| `/wbSetup .` | 2026-05-12 | [setup_report](.wb/workflows/reports/2026/05/12/setup/setup_python-etl_20260512.md) |
| `/wbAudit .` | 2026-05-12 | [audit_report](.wb/workflows/reports/2026/05/12/audits/audit_python-etl_20260512.md) |
| `/wbPlan .` | 2026-05-12 | [plan](.wb/workflows/reports/2026/05/12/plans/plan_python-etl_20260512.md) |


## Overview

This demo shows wb-flow applied to a Python ETL pipeline project. It demonstrates how the same workflow commands work across different languages and project types.

## What's Included

- `.wb/workflows/context.md` — Project context and identity
- Real command outputs in the reports directory


## Related

For more examples, see the [my-new-app](../my-new-app/README.md) demo or the [demo apps hub](../README.md).

---

← [Demo Apps](../README.md) · [Home](../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
