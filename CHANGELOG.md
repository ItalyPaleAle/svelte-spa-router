# Changelog

## 5.1.1

### Patch Changes

- 9887d02: fix: transpile TypeScript to JavaScript in packaged Svelte components

  The published `dist/Router.svelte` shipped its `<script>` blocks as raw TypeScript because no preprocessor was configured for `svelte-package`. A `svelte.config.js` using `vitePreprocess({script: true})` now transpiles the `<script>` blocks so packaged components contain plain JavaScript.

- 5c5e1f0: fix: rendering in SSR context

  Makes svelte-spa-router work with Astro and other frameworks doing SSR.

## 5.1.0

### Minor Changes

- addf1cc: Migrate codebase to TypeScript

  The codebase has been migrated to modern TypeScript, with better testing infrastructure powered by Playwright.

  The external API surface is unchanged, but exported type declarations should now be more accurate.

## 5.0.1

### Patch Changes

- 0774dab: fix: restore router scroll state after route render

## 5.0.0

### Major Changes

- c93e046: breaking: require Svelte 5, remove stores in favor of new router object, remove events in favor of callback props

## 4.0.2

### Patch Changes

- 2f5a129: fix: make types compatible with Svelte 5

A detailed changelog for each release is published in the [GitHub Releases page](https://github.com/ItalyPaleAle/svelte-spa-router/releases).

Additionally, breaking changes (e.g. from 3.x to 4.x) are explained in the [UPGRADING.md](/UPGRADING.md) file, with instructions to upgrade your code.
