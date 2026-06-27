# svelte-spa-router: hash-based router for Svelte 5

[![npm](https://img.shields.io/npm/v/svelte-spa-router.svg)](https://www.npmjs.com/package/svelte-spa-router)

**[📚 Read the docs](https://svelte-spa-router.italypaleale.me)**

This package is a router for [Svelte 5](https://github.com/sveltejs/svelte) applications, specifically optimized for Single Page Applications (SPA).

Main features:

- Leverages **hash-based routing**, which is optimal for SPAs and doesn't require any server-side processing
- Insanely simple to use, and has a minimal footprint
- Uses the tiny [regexparam](https://github.com/lukeed/regexparam) for parsing routes, with support for parameters (e.g. `/book/:id?`) and more

This package is released under MIT license.

> For support for Svelte 3 and 4, please use the ([v4 branch](https://github.com/ItalyPaleAle/svelte-spa-router/blob/v4.0.2/README.md))

## Video

["So you want to pick a router?"]((https://www.youtube.com/watch?v=EL1qM0cv0eA)) talk by @ItalyPaleAle at Svelte Summit 2020. Includes an explanation of the two kinds of routers and a demo of svelte-spa-router.  
_(Click on the cover image to play the video on YouTube)_

[![Click to play video: 'So you want to pick a router?'](/docs/static/img/router-video-cover.webp)](https://www.youtube.com/watch?v=EL1qM0cv0eA)

## Hash-based routing

With hash-based routing, navigation is possible thanks to storing the current view in the part of the URL after `#`, called "hash" or "fragment".

For example, if your SPA is in a static file called `index.html`, your URLs for navigating within the app look something like `index.html#/profile`, `index.html#/book/42`, etc. (The `index.html` part can usually be omitted for the index file, so you can just create URLs that look like `http://example.com/#/profile`).

When I created this component, other routers for Svelte apps implemented navigation using the HTML5 history API. While those URLs look nicer (e.g. you can actually navigate to `http://example.com/profile`), they are not ideal for static Single Page Applications. In order for users to be able to share links or even just refresh the page, you are required to have a server on the backend processing the request, and building fully-static apps is much harder as a consequence.

Hash-based routing is simpler, works well even without a server, and it's generally better suited for static SPAs, especially when SEO isn't a concern, as is the case when the app requires authentication. Many popular apps use hash-based routing, including GMail!

## Sample code

Check out the code in the [examples](/examples) folder for some usage examples.

To run the samples, clone the repository, build the package, then start a sample:

````sh
# From the repo root: install deps and build the package
pnpm install
pnpm run build

# Navigate to a sample
cd examples/…
# For example
cd examples/basic-routing

# Start a development server
pnpm install
pnpm run dev
````

The sample will be running at `http://localhost:5173`

## Supported browsers

svelte-spa-router aims to support modern browsers, including recent versions of:

- Chrome
- Edge ("traditional" and Chromium-based)
- Firefox
- Safari

Support for Internet Explorer is not a goal for this project. Some users have reportedly been able to use svelte-spa-router with IE11 after transpilation (e.g. with Babel), but this is not guaranteed.

## Documentation

All documentation lives on the [website](https://svelte-spa-router.italypaleale.me).

Quick links:

- [Getting started](https://svelte-spa-router.italypaleale.me/docs/getting-started/)
- [Navigation](https://svelte-spa-router.italypaleale.me/docs/navigation/)
- [Advanced usage](https://svelte-spa-router.italypaleale.me/advanced/)
- [Upgrading](https://svelte-spa-router.italypaleale.me/upgrading/)
