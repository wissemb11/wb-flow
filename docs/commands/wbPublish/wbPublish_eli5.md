# /wbPublish — ELI5

You wrote a book. The publisher prints copies and puts them in bookstores.

`/wbPublish` is the publisher step: it takes your package (which `/wbRelease` already gave a new version number to) and pushes it to npm, where anyone in the world can `npm install` it.

You run it *after* `/wbRelease`, never before. And you run `/wbRelease --restore` *after* it, to put your dev setup back to normal.

Rule: `/wbPublish` only works for packages (code other developers import). Apps go to `/wbDeploy` instead.

---
