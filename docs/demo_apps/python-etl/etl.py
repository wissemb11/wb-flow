import pandas as pd
import json
from pathlib import Path

def main():
    # Simulate raw input
    raw = pd.DataFrame({
        "region": ["NA", "EU", "NA", "APAC", "EU", None],
        "revenue": [1200, 800, 1500, 600, 950, 300],
        "date": ["2026-05-01"] * 6
    })

    # Clean: drop null regions
    cleaned = raw.dropna(subset=["region"])

    # Aggregate
    summary = cleaned.groupby("region")["revenue"].sum().to_dict()

    # Write report
    out = Path("reports/daily_revenue.json")
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(summary, indent=2))

    print(f"Report written to {out}: {summary}")

if __name__ == "__main__":
    main()
