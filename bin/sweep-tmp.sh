#!/usr/bin/env bash
# Sweep /tmp so leaked .so files do not accumulate
T=${TMPDIR:-/tmp}
find "$T" -maxdepth 1 -type f -name '.*-*.so' -delete 2>/dev/null || true
find "$T" -maxdepth 1 -name 'tmp*.wbefore_plan' -delete 2>/dev/null || true
