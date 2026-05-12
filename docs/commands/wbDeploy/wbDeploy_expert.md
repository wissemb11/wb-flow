# wbDeploy — Expert Architecture

> How `/wbDeploy` generates deployment configurations and orchestrates site publishing.

---

## 1. System Role

`/wbDeploy` is a **deployment planner**. It analyzes the project type and generates the appropriate deployment configuration and commands for the target platform.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (generative) |
| **Input** | Folder path + target platform |
| **Output** | Deployment config files + deploy commands |
| **Mutates files** | Yes — creates/updates deployment configs |

---

## 2. Supported Targets

| Target | Flag | Generates |
|---|---|---|
| **GitHub Pages** (default) | `--target=gh-pages` | `.github/workflows/deploy.yml` |
| **Vercel** | `--target=vercel` | `vercel.json` |
| **Netlify** | `--target=netlify` | `netlify.toml` |
| **Custom** | `--target=custom` | Generic deploy script |

---

## 3. Detection Logic

`/wbDeploy` auto-detects the project type to choose the right build command:

| Signal | Build Command |
|---|---|
| `vite.config.*` | `npm run build` (Vite) |
| VuePress config | `npm run docs:build` |
| Static files only | No build step — direct copy |
| Custom `build` script | Uses `npm run build` |

---

## 4. Deployment Pipeline

```
Target detection → Build config → Deploy config → Pre-deploy checks → Command output
```

| Stage | Action |
|---|---|
| **Detection** | Identify framework, build tool, output directory |
| **Build config** | Verify build command produces expected output |
| **Deploy config** | Generate platform-specific configuration |
| **Checks** | Verify output directory exists after build |
| **Command** | Produce deployment command for user |

---

## 5. GitHub Pages Workflow

Generated `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          publish_dir: ./dist
```

---

## 6. What wbDeploy Does NOT Do

| Action | Use Instead |
|---|---|
| Run deployment | User triggers via CI/CD or manual command |
| Publish npm packages | `/wbPublish` |
| Manage DNS/domains | Manual configuration |
| Set up hosting accounts | Manual setup |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
