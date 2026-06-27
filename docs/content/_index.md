---
title: "svelte-spa-router"
nav_title: "Introduction"
weight: 11
---

svelte-spa-router is a router for [Svelte 5](https://github.com/sveltejs/svelte) applications, specifically optimized for Single Page Applications (SPA).

## Highlights

- Leverages **hash-based routing**, which is optimal for SPAs and doesn't require any server-side processing
- Insanely simple to use, and has a minimal footprint
- Uses the tiny [regexparam](https://github.com/lukeed/regexparam) for parsing routes, with support for parameters (e.g. `/book/:id?`) and more

This module is released under MIT license.

> For support for Svelte 3 and 4, please use the [v4 branch](https://github.com/ItalyPaleAle/svelte-spa-router/blob/v4.0.2/README.md). See the [Upgrading](/upgrading) guide for migration instructions.

## Hash-based routing

With hash-based routing, navigation is possible thanks to storing the current view in the part of the URL after `#`, called "hash" or "fragment".

For example, if your SPA is in a static file called `index.html`, your URLs for navigating within the app look something like `index.html#/profile`, `index.html#/book/42`, etc. (The `index.html` part can usually be omitted for the index file, so you can just create URLs that look like `http://example.com/#/profile`).

When this component was created, other routers for Svelte apps implemented navigation using the HTML5 history API. While those URLs look nicer (e.g. you can actually navigate to `http://example.com/profile`), they are not ideal for static Single Page Applications. In order for users to be able to share links or even just refresh the page, you are required to have a server on the backend processing the request, and building fully-static apps is much harder as a consequence.

Hash-based routing is simpler, works well even without a server, and it's generally better suited for static SPAs, especially when SEO isn't a concern, as is the case when the app requires authentication. Many popular apps use hash-based routing, including GMail!

## Video: "So you want to pick a router?"

["So you want to pick a router?"](https://www.youtube.com/watch?v=EL1qM0cv0eA) talk by [@ItalyPaleAle](https://github.com/ItalyPaleAle) at Svelte Summit 2020. It includes an explanation of the two kinds of routers and a demo of svelte-spa-router.

[![Click to play video: 'So you want to pick a router?'](/img/router-video-cover.webp)](https://www.youtube.com/watch?v=EL1qM0cv0eA)

## Supported browsers

svelte-spa-router aims to support modern browsers, including recent versions of:

- Chrome
- Edge ("traditional" and Chromium-based)
- Firefox
- Safari

Support for Internet Explorer is not a goal for this project. Some users have reportedly been able to use svelte-spa-router with IE11 after transpilation (e.g. with Babel), but this is not guaranteed.

## Start here

- [Getting started](/docs/getting-started)
- [Navigation](/docs/navigation)
- [Advanced Usage](/advanced)
- [Upgrading](/upgrading)
