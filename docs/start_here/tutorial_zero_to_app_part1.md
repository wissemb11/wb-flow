# Zero to App Tutorial — From Empty Folder to Scaffold

> This tutorial walks you through building a complete Vue 2.7 application from scratch using wb-flow commands. By the end, you'll have a working app scaffold with components, tests, and documentation.

---

## Prerequisites

- [Bootstrapping](./bootstrapping_part1.md) complete
- [First Run Walkthrough](./first_run_walkthrough_part1.md) complete
- Familiarity with the audit → plan → work cycle

---

## Part 1: Creating the Project

### Step 1: Initialize

```bash
mkdir my-vue-app && cd my-vue-app
npm init -y
npm install vue@2.7.16
npx @wbc-ui2/wb-flow init
```

### Step 2: Generate Context

```bash
/wbContext .
```

```text
[AI] Scanning project...
[AI]   Package: my-vue-app
[AI]   Framework: Vue 2.7 (detected)
[AI]   Type: Application (no main export)
[AI]
[AI] Writing .wb/workflows/context.md
```

### Step 3: Brainstorm Features

```bash
/wbIdea .
```

```text
[AI] Generating ideas for my-vue-app...
[AI]
[AI] | # | Score | Idea | P | Est. Time |
[AI] |---|---|---|---|---|
[AI] | 1 | 9 | Create App.vue entry component | P1 | 15 min |
[AI] | 2 | 8 | Add Vue Router with 3 routes | P1 | 30 min |
[AI] | 3 | 8 | Create shared layout component | P1 | 20 min |
[AI] | 4 | 7 | Add dark mode toggle | P2 | 25 min |
[AI] | 5 | 6 | Add error boundary component | P2 | 20 min |
```

### Step 4: Create a Plan from Ideas

```bash
/wbPlan . --ingest idea_my-vue-app_20260511.md
```

```text
[AI] Ingesting 5 ideas into plan...
[AI] Ordering by score and dependency...
[AI]
[AI] | # | Task | Dep | P | Est. |
[AI] |---|---|---|---|---|
[AI] | 1 | Create App.vue entry component | — | P1 | 15 |
[AI] | 2 | Create shared layout component | 1 | P1 | 20 |
[AI] | 3 | Add Vue Router with 3 routes | 1 | P1 | 30 |
[AI] | 4 | Add dark mode toggle | 2 | P2 | 25 |
[AI] | 5 | Add error boundary component | — | P2 | 20 |
```

---

## Part 2: Building the App

### Step 5: Execute Tasks

```bash
# Task 1: Create the entry component
/wbWork plan_my-vue-app_20260511.md --task=1

# AI creates:
#   src/App.vue (root component with <template>, <script setup>, <style>)
#   src/main.js (Vue instance mounting)
```

```bash
# Task 2: Shared layout (depends on Task 1)
/wbWork plan_my-vue-app_20260511.md --task=2

# AI creates:
#   src/components/AppLayout.vue (header, sidebar, content slot)
#   Updates App.vue to use AppLayout
```

```bash
# Task 3: Vue Router
/wbWork plan_my-vue-app_20260511.md --task=3

# AI creates:
#   src/router/index.js (3 routes: Home, About, Settings)
#   src/views/HomeView.vue
#   src/views/AboutView.vue
#   src/views/SettingsView.vue
#   Updates main.js to use router
```

### Step 6: Validate Progress

```bash
/wbValid plan_my-vue-app_20260511.md --task=1,2,3
```

```text
[AI] Batch validation:
[AI]   Task #1: ✅ 10/10 — Clean entry component
[AI]   Task #2: ✅ 9/10 — Layout uses slots correctly
[AI]   Task #3: ✅ 8/10 — Router works, consider lazy loading
```

---

## Part 3: The File Tree So Far

After 3 tasks, your project looks like:

```
my-vue-app/
├── package.json
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── components/
│   │   └── AppLayout.vue
│   ├── router/
│   │   └── index.js
│   └── views/
│       ├── HomeView.vue
│       ├── AboutView.vue
│       └── SettingsView.vue
├── .wb/
│   └── workflows/
│       ├── context.md
│       └── reports/
│           └── 2026/05/11/
│               ├── ideas/
│               ├── plans/
│               │   ├── plan_my-vue-app_20260511.md
│               │   └── tasks/
│               │       ├── task_1/
│               │       ├── task_2/
│               │       └── task_3/
│               └── standups/
```

---

← [Start Here Hub](README.md) · [Home](../README.md)
