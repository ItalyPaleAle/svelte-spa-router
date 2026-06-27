---
title: "Installation"
weight: 21
---

You can include the router in any project using Svelte 5.

## Install from NPM

To add svelte-spa-router to your project:

```sh
# Using npm
npm install svelte-spa-router
# Using yarn
yarn install svelte-spa-router
# Using pnpm
pnpm install svelte-spa-router
```

## Supported browsers

svelte-spa-router aims to support modern browsers, including recent versions of:

- Chrome
- Edge ("traditional" and Chromium-based)
- Firefox
- Safari

Support for Internet Explorer is not a goal for this project. Some users have reportedly been able to use svelte-spa-router with IE11 after transpilation (e.g. with Babel), but this is not guaranteed.

## Sample code

Check out the code in the [examples](https://github.com/ItalyPaleAle/svelte-spa-router/tree/main/examples) folder for some usage examples.

To run the samples, clone the repository, build the package, then start a sample.

From the repo root: install deps and build the package

```sh
pnpm install
pnpm run build
```

Navigate to a sample

```sh
# 
cd examples/<sample>
# For example
cd examples/basic-routing
```

Start a development server

```sh
pnpm install
pnpm run dev
```

The sample will be running at `http://localhost:5173`
