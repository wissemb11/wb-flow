#!/usr/bin/env node
/**
 * bin/prompt.js — the shared zero-dep terminal prompter.
 *
 * Extracted from `init.js` so `init` and `model` ask questions the same way
 * instead of carrying two copies that drift. The same "one implementation"
 * discipline that stopped the roster file drifting between three writers.
 *
 * Zero dependencies.
 */

'use strict';

const readline = require('readline');

function abortError() {
  const err = new Error('input closed');
  err.wbAbort = true;
  return err;
}

/**
 * A readline wrapper that fails loudly when stdin closes mid-question.
 *
 * Ctrl-D (or a pipe running dry) closes stdin while a question is pending.
 * Without the `close` handler the callback never fires and the process exits
 * silently having done nothing — which reads as success.
 */
function prompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  let pendingAbort = null;

  rl.on('close', function () {
    closed = true;
    if (pendingAbort) {
      const reject = pendingAbort;
      pendingAbort = null;
      reject(abortError());
    }
  });

  return {
    ask: function (question, fallback) {
      if (closed) return Promise.reject(abortError());
      return new Promise(function (resolve, reject) {
        pendingAbort = reject;
        rl.question(question, function (answer) {
          pendingAbort = null;
          const value = (answer || '').trim();
          resolve(value || fallback);
        });
      });
    },
    close: function () { rl.close(); },
  };
}

function isYes(value, def) {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return def;
  if (v === 'y' || v === 'yes') return true;
  if (v === 'n' || v === 'no') return false;
  return def;
}

/** Can we actually ask? A non-TTY must refuse rather than hang. */
function canPrompt(opts) {
  return Boolean(process.stdin.isTTY) && !(opts && opts.yes);
}

/**
 * Zero-dep interactive terminal checkbox picker with automatic ordering.
 *
 * Controls:
 *   ↑/↓ or k/j  : Navigate options
 *   Space       : Toggle select/deselect (selection order determines chain priority!)
 *   Enter       : Confirm selection
 *   Ctrl+C      : Abort
 */
function checkboxPick(title, items, initialOrderIndex) {
  if (!process.stdin.isTTY) {
    return Promise.resolve(initialOrderIndex || []);
  }

  return new Promise((resolve, reject) => {
    let cursor = 0;
    let selectedOrder = (Array.isArray(initialOrderIndex) ? initialOrderIndex.slice() : [])
      .filter((idx) => items[idx] && !(typeof items[idx] === 'object' && items[idx].disabled));
    let linesRendered = 0;

    if (readline.emitKeypressEvents) {
      readline.emitKeypressEvents(process.stdin);
    }
    if (process.stdin.setRawMode) process.stdin.setRawMode(true);

    function clearRender() {
      if (linesRendered > 0) {
        process.stdout.write('\x1b[' + linesRendered + 'A\x1b[0J');
      }
    }

    function render() {
      clearRender();
      const buf = [];
      buf.push('  ' + title);
      buf.push('  (Use ↑/↓ to move, Space to toggle rank, \'a\' to select/deselect all, Enter to confirm)');
      buf.push('');

      items.forEach((item, i) => {
        const disabled = typeof item === 'object' && item.disabled;
        const isCurrent = i === cursor;
        const rankIdx = selectedOrder.indexOf(i);
        const isSelected = rankIdx !== -1;

        const cursorSymbol = isCurrent ? '❯ ' : '  ';
        const rankBadge = isSelected ? '[' + (rankIdx + 1) + '] ' : '    ';
        const checkSymbol = disabled ? '— ' : (isSelected ? '◉ ' : '◯ ');

        const label = typeof item === 'string' ? item : (item.display || item.name || item.label);
        buf.push('   ' + cursorSymbol + rankBadge + checkSymbol + label);
      });

      buf.push('');
      const selectedLabels = selectedOrder.map((idx) => {
        const item = items[idx];
        return typeof item === 'string' ? item : (item.value || item.name || item.label || item.display);
      });
      buf.push('      chain: ' + (selectedLabels.length ? selectedLabels.join(' || ') : '(none - Enter keeps suggested)'));

      const cols = process.stdout.columns || 80;
      linesRendered = 0;
      buf.forEach(line => {
        linesRendered += Math.max(1, Math.ceil(line.length / cols));
      });
      process.stdout.write(buf.join('\n') + '\n');
    }

    function cleanup() {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.setRawMode) process.stdin.setRawMode(false);
      console.log('');
    }

    function onKeypress(str, key) {
      if (!key) return;

      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(abortError());
        return;
      }

      if (key.name === 'up' || key.name === 'k') {
        cursor = (cursor - 1 + items.length) % items.length;
        render();
      } else if (key.name === 'down' || key.name === 'j') {
        cursor = (cursor + 1) % items.length;
        render();
      } else if (key.name === 'space') {
        if (items[cursor] && typeof items[cursor] === 'object' && items[cursor].disabled) return;
        const existingPos = selectedOrder.indexOf(cursor);
        if (existingPos !== -1) {
          selectedOrder.splice(existingPos, 1);
        } else {
          selectedOrder.push(cursor);
        }
        render();
      } else if (str === 'a' || str === 'A') {
        const selectable = items
          .map((item, i) => ({ item, i }))
          .filter((entry) => !(typeof entry.item === 'object' && entry.item.disabled))
          .map((entry) => entry.i);
        if (selectedOrder.length === selectable.length) {
          selectedOrder = [];
        } else {
          selectedOrder = selectable;
        }
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        const result = selectedOrder.length ? selectedOrder : (initialOrderIndex || []);
        resolve(result);
      }
    }

    process.stdin.on('keypress', onKeypress);
    render();
  });
}

module.exports = { prompter, isYes, abortError, canPrompt, checkboxPick };
