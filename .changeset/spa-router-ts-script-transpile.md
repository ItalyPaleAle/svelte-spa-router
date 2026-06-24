---
'svelte-spa-router': patch
---

fix: transpile TypeScript to JavaScript in packaged Svelte components

The published `dist/Router.svelte` shipped its `<script>` blocks as raw TypeScript because no preprocessor was configured for `svelte-package`. Tools that parse the component script as JavaScript without first running the Svelte preprocessor (such as Vite 8's rolldown-based dependency optimizer) failed with a parse error on TypeScript-only syntax, e.g. the optional parameter in `link(node, opts?)`. A `svelte.config.js` using `vitePreprocess({script: true})` now transpiles the `<script>` blocks so packaged components contain plain JavaScript.
