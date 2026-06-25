---
'svelte-spa-router': patch
---

fix: transpile TypeScript to JavaScript in packaged Svelte components

The published `dist/Router.svelte` shipped its `<script>` blocks as raw TypeScript because no preprocessor was configured for `svelte-package`. A `svelte.config.js` using `vitePreprocess({script: true})` now transpiles the `<script>` blocks so packaged components contain plain JavaScript.
