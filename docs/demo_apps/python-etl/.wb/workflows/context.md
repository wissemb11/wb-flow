# Context — python-etl

> **Identity:** Python data-pipeline demo for the wb-flow docs.
> **Stack:** Python 3.11, pandas, standard library only.
> **Scope:** Single-script ETL. No tests, no CI, no deployment.
> **Constraints:** Keep dependencies minimal. No external APIs.
> **Agentic commands used:** `/wbSetup`, `/wbAudit`, `/wbPlan`

## Folder Layout

```
python-etl/
├── README.md
├── etl.py
├── requirements.txt
└── .wb/workflows/
    └── context.md
```

## Notes

- This is a **documentation demo**, not a production package.
- The `reports/` directory is gitignored; it is created at runtime by `etl.py`.

## Project Identity

This context file defines the python-etl project for wb-flow. It specifies the Python stack and ETL pipeline conventions.


## Configuration

This context file defines the python-etl project for wb-flow. It specifies the Python stack and ETL pipeline conventions.


## Workflow Conventions

All `/wb*` commands in this project follow the conventions defined in this context file. The project uses Python with pytest and pip.

## Related

- [python-etl README](../../README.md) — Project overview
- [Demo Apps Hub](../../README.md) — All available demos




## Notes

This context file defines the Python ETL project for wb-flow commands. Update the configuration when project conventions change.

---

