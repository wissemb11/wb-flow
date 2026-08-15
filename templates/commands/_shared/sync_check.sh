#!/usr/bin/env bash
# Derived-block sync check for a wb-flow plan file.
# Exit 0 = the derived blocks agree with the task table. Non-zero = drift.
P="$1"; [ -f "$P" ] || { echo "no such plan: $P"; exit 2; }
fail=0

# ── counts from the task table (the source of truth) ──────────────────────────
# Only rows in the canonical task table are source-of-truth rows. Other numbered
# tables (findings, oracles, budgets, etc.) are deliberately ignored.
task_rows() {
  awk '
    /^\| # \| Requires \|/ { inside=1; next }
    inside && !/^\|/ { exit }
    inside && /^\|---/ { next }
    inside && /^\| \[?[0-9]+\]?[( ]/ { print }
  ' "$P"
}

read -r T D V < <(task_rows | awk -F'|' '
  { d=$(NF-2); v=$(NF-1);
    if (d ~ /🚫|⏸️/ || v ~ /🚫|⏸️/) next;
    t++;
    if (d ~ /✅/) dn++; if (v ~ /✅/) vn++ }
  END { printf "%d %d %d\n", t, dn, vn }')

if [ "$T" -eq 0 ]; then
  echo "✗ SYNC: no task rows parsed — refusing to judge completeness"
  fail=1
fi


# ── 1. no CLOSED row (Done AND Valid) may still appear in the matrix ──────────
closed=$(task_rows | awk -F'|' '{
    d=$(NF-2); v=$(NF-1); id=$2; match(id, /[0-9]+/); id=substr(id, RSTART, RLENGTH);
    if (d ~ /✅/ && v ~ /✅/) print id }')
matrix=$(awk '/^## 🌊 Next Executable Sequence/{inside=1; next} inside && /^## /{exit} inside{print}' "$P")
for id in $closed; do
  if printf '%s\n' "$matrix" | grep -qE "^\| \*\*[A-Z][^|]*\|.*--id=[0-9,]*\b${id}\b"; then
    echo "✗ SYNC: closed row $id still scheduled in the 🌊 matrix"; fail=1
  fi
done

# ── 2. What's Next progress line must match the table ─────────────────────────
if [ "$T" -gt 0 ]; then
  if grep -q "🧭 What's Next" "$P"; then
    if ! grep -qE "Progress:[^0-9]*${D}/${T} tasks completed, ${V}/${T} validated" "$P"; then
      echo "✗ SYNC: What's Next progress ≠ table (table says ${D}/${T} done, ${V}/${T} valid)"; fail=1
    fi
  else
    echo "✗ SYNC: '## 🧭 What's Next?' section missing"; fail=1
  fi
fi

# ── 3. how-to-run block present between its markers ───────────────────────────
grep -q '<!-- HOW_TO_RUN_START -->' "$P" && grep -q '<!-- HOW_TO_RUN_END -->' "$P" \
  || { echo "✗ SYNC: ▶️ How to run this plan block missing (re-embed with: wb-flow next $P --embed)"; fail=1; }

# ── 4. status callout must agree with open-row count ──────────────────────────
open=$(( T - D ))
if [ "$T" -gt 0 ]; then
  if [ "$D" -eq "$T" ] && [ "$V" -eq "$T" ]; then
    grep -qE '\*\*Status:\*\*.*CLOSED' "$P" || { echo "✗ SYNC: all rows closed but Status is not ✅ CLOSED"; fail=1; }
  else
    grep -qE '\*\*Status:\*\*.*OPEN' "$P" || { echo "✗ SYNC: rows still open but Status is not 🟢 OPEN"; fail=1; }
  fi
fi

# ── 5. every matrix cell must carry a real plan path, never a <placeholder> ───
grep -qE '^\| \*\*[A-Z][^|]*<[a-z ]+>' "$P" && { echo "✗ SYNC: matrix cell contains a <placeholder> — wave.js interpolates it LITERALLY"; fail=1; }

# ── 6. narrative status and dispatch bullets must agree with the table ────────
# Keep this scoped to What's Next?; the same plan may quote commands/statuses in
# findings, evidence, or copy/paste blocks without those quotes being live state.
next_block=$(awk '
  /^## 🧭 What.s Next[?]/{inside=1; next}
  inside && /^## /{exit}
  inside{print}
' "$P")

if [ -n "$next_block" ]; then
  narrative_status=$(printf '%s\n' "$next_block" | grep -oE 'Status is (✅|🟢) \*\*(CLOSED|OPEN)\*\*' | head -n 1 || true)
  if [ -n "$narrative_status" ]; then
    if [ "$D" -eq "$T" ] && [ "$V" -eq "$T" ]; then
      printf '%s\n' "$narrative_status" | grep -qE 'Status is (✅|🟢) \*\*CLOSED\*\*' \
        || { echo "✗ SYNC: What's Next narrative status contradicts table: expected ✅ CLOSED"; fail=1; }
    else
      printf '%s\n' "$narrative_status" | grep -qE 'Status is 🟢 \*\*OPEN\*\*' \
        || { echo "✗ SYNC: What's Next narrative status contradicts table: expected 🟢 OPEN"; fail=1; }
    fi
  fi

  while IFS= read -r bullet; do
    case "$bullet" in
      -\ *|\ \ -\ *)
        while IFS= read -r ids; do
          [ -n "$ids" ] || continue
          for id in ${ids//,/ }; do
            if printf '%s\n' "$closed" | grep -qx "$id"; then
              echo "✗ SYNC: What's Next dispatch bullet still names closed row $id"
              fail=1
            fi
          done
        done < <(printf '%s\n' "$bullet" | grep -oE -- '--id=[0-9]+(,[0-9]+)*' | sed 's/^--id=//')
        ;;
    esac
  done <<< "$next_block"
fi

[ "$fail" -eq 0 ] && echo "✓ SYNC OK — table ${D}/${T} done, ${V}/${T} valid; matrix, how-to-run and What's Next agree"
exit $fail
