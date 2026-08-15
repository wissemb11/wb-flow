# /wbDeploy — ELI5

You made a website. Now you need to put it on the internet so people can visit it.

`/wbDeploy` builds the website (compresses the code into a tight package) and pushes it to wherever it lives — usually GitHub Pages, so the URL ends up something like `https://wbc-ui.com/wbdataviewer2/`.

Key rule: deploy is for **apps** (things with a URL), not **packages** (things other developers install). Apps → `/wbDeploy`. Packages → `/wbPublish`.

Also: always run `/wbDeploy --target=local` first. That builds the thing and serves it on your laptop so you can see if it works before showing it to the world.

---
