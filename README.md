# SheetFill — website

The public website for the SheetFill browser extension: landing page, privacy policy, terms of
service and help page.

This repository is public because GitHub Pages on a Free account requires it. It contains **only**
the published pages. The extension's source code and the project's business documents live in a
separate, private repository.

## Rebuilding

```bash
node _build.mjs
```

Regenerates `privacy.html`, `terms.html` and `support.html` from the markdown in `docs/`, and
`index.html` from `pages/index.frag.html`. Deployment happens automatically on push to `main`.

## Do not edit the generated HTML

Edit `docs/*.md` or `pages/index.frag.html` and rebuild. Direct edits to the `.html` files are
overwritten on the next build.

## Keeping it in sync

These files are exported from the main project with `node scripts/export-site.mjs`. Copy the
export over this repository's contents and commit.
