# svelte-spa-router

[![Build Status](https://dev.azure.com/italypaleale/italypaleale/_apis/build/status/ItalyPaleAle.svelte-spa-router?branchName=master)](https://dev.azure.com/italypaleale/italypaleale/_build/latest?definitionId=16&branchName=master) ![npm](https://img.shields.io/npm/v/svelte-spa-router.svg) ![GitHub](https://img.shields.io/github/license/ItalyPaleAle/svelte-spa-router.svg) [![dependencies Status](https://david-dm.org/ItalyPaleAle/svelte-spa-router/status.svg)](https://david-dm.org/ItalyPaleAle/svelte-spa-router)

This module is a router for [Svelte 3](https://github.com/sveltejs/svelte) applications, specifically optimized for Single Page Applications (SPA).

Main features:

- Leverages **hash-based routing**, which is optimal for SPAs and doesn't require any server-side processing
- Insanely simple to use, and has a minimal footprint
- Uses the tiny [regexparam](https://github.com/lukeed/regexparam) for parsing routes, with support for parameters (e.g. `/book/:id?`) and more

This module is released under MIT license.

## Hash-based routing

With hash-based routing, navigation is possible thanks to storing the current view in the part of the URL after `#`, called "hash" or "fragment".

For example, if your SPA is in a static file called `index.html`, your URLs for navigating within the app look something like `index.html#/profile`, `index.html#/book/42`, etc. (The `index.html` part can usually be omitted for the index file, so you can just create URLs that look like `http://example.com/#/profile`).

When I created this component, other routers for Svelte 3 implemented navigation using the HTML5 history API. While those URLs look nicer (e.g. you can actually navigate to `http://example.com/profile`), they are not ideal for static Single Page Applications. In order for users to be able to share links or even just refresh the page, you are required to have a server on the backend processing the request, and building fully-static apps is much harder as a consequence.

Hash-based routing is simpler, works well even without a server, and it's generally better suited for static SPAs, especially when SEO isn't a concern, as is the case when the app requires authentication. Many popular apps use hash-based routing, including GMail!

## Sample code

Check out the code in the [example](/example) folder for some usage example. It's a full Svelte app, showcasing all the features of the router.

To run the sample, clone the repository, install the dependencies, then build the sample:

````sh
git clone https://github.com/ItalyPaleAle/svelte-spa-router
cd svelte-spa-router
npm install
npm run build-example
npm run start-example
````

## Using svelte-spa-router

You can include the router in any project using Svelte 3.

## Install from NPM

To add svelte-spa-router to your project:

````sh
npm install --save svelte-spa-router
````

### Define your routes

Each route is a normal Svelte component, with the markup, scripts, bindings, etc. Any Svelte component can be a route.

The route definition is just a JavaScript dictionary (object) where the key is a string with the path (including parameters, etc), and the value is the route object.

For example:

````js
import Home from './routes/Home.svelte'
import Author from './routes/Author.svelte'
import Book from './routes/Book.svelte'
import NotFound from './routes/NotFound.svelte'

const routes = {
    // Exact path
    '/': Home,

    // Using named parameters, with last being optional
    '/author/:first/:last?': Author,

    // Wildcard parameter
    '/book/*': Book,

    // Catch-all
    // This is optional, but if present it must be the last
    '*': NotFound,
}
````

Routes must begin with `/` (or `*` for the catch-all route).

Note that the order matters! When your users navigate inside the app, the first matching path will determine which route to load. It's important that you leave any "catch-all" route (e.g. a "Page not found" one) at the end.

### Include the router view

To display the router, in a Svelte component (usually `App.svelte`), first import the router component:

````js
import Router from 'svelte-spa-router'
````

Then, display the router anywhere you'd like by placing the component in the markup. For example:

````html
<body>
    <Router {routes}/>
</body>
````

The `routes` prop is the dictionary defined above.

That's it! You already have all that you need for a fully-functional routing experience.

### Navigating between pages

You can navigate between pages with normal anchor (`<a>`) tags. For example:

````html
<a href="#/book/123">Thus Spoke Zarathustra</a>
````

Rather than having to type `#` before each link, you can also use the `use:link` action:

````html
<script>
import {link} from 'svelte-spa-router'
</script>
<a href="/book/321" use:link>The Little Prince</a>
````

You can navigate between pages programmatically too:

````js
import {push, pop, replace} from 'svelte-spa-router'

// The push(url) method navigates to another page, just like clicking on a link
push('/book/42')

// The pop() method is equivalent to hitting the back button in the browser
pop()

// The replace(url) method navigates to a new page, but without adding a new entry in the browser's history stack
// So, clicking on the back button in the browser would not lead to the page users were visiting before the call to replace()
replace('/book/3')
````

These methods can be used inside Svelte markup too, for example:

````html
<button on:click={() => push('/page')}>Go somewhere</button>
````

### Parameters from routes

svelte-spa-router uses [regexparam](https://github.com/lukeed/regexparam) to parse routes, so you can add optional parameters to the route. Basic syntax is:

- `/path` matches `/path` exactly (and only that)
- `/path/:id` matches `/path/` followed by any string, which is a named argument `id`
- `/path/:id/:version?` allows for an optional second named argument `version`
- `/path/*` matches `/path/` followed by anything, using a non-named argument

_Please refer to the documentation of regexparam for more details._

If your route contains any parameter, they will be made available to your component inside the `params` dictionary.

For example, for a route `/name/:first/:last?`, you can create this Svelte component:

````html
<p>Your name is: <b>{params.first}</b> <b>{#if params.last}{params.last}{/if}</b></p>
<script>
// You need to define the component prop "params"
export let params = {}
</script>
````

Non-named arguments are returned as `params.wild`.

### Getting the current page

You can get the current page from the `$location` readable store. This is a Svelte store, so it can be used reactively too.

````html
<script>
import {location} from 'svelte-spa-router'
</script>
<p>The current page is: {$location}</p>
````

### Querystring parameters

You can also extract "querystring" parameters from the hash of the page. This isn't the _real_ querystring, as it's located after the `#` character in the URL, but it can be used in a similar way. For example: `#/books?show=authors,titles&order=1`.

When svelte-spa-router finds a "querystring" in the hash, it separates that from the location and returns it as a string in the Svelte store `$querystring`. For example:

````html
<script>
import {location, querystring} from 'svelte-spa-router'
</script>
<p>The current page is: {$location}</p>
<p>The querystring is: {$querystring}</p>
````

With the example above, this would print:

````text
The current page is: /books
The querystring is: show=authors,titles&order=1
````

It's important to note that, to keep this component lightweight, svelte-spa-router **does not parse** the "querystring". If you want to parse the value of `$querystring`, you can use third-party modules such as [qs](https://www.npmjs.com/package/qs) in your application.

### Highlight active links

svelte-spa-router has built-in support for automatically marking links as "active", with the `use:active` action.

For example, you can use the code below to add the CSS class `active` to links that are active:

````html
<script>
import {link} from 'svelte-spa-router'
import active from 'svelte-spa-router/active'
</script>

<style>
/* Style for "active" links; need to mark this :global because the router adds the class directly */
:global(a.active) {
    color: red;
}
</style>

<a href="/hello/user" use:link use:active={'/hello/*', 'active'}>Say hi!</a>
<a href="/hello/user" use:link use:active>Say hi again!</a>
````

The `active` action accepts 2 arguments:

- The first is the path that, when matched, makes the link active. In the first example above, we want the link to be active when the route is `/hello/*` (the asterisk matches anything after that). As you can see, this doesn't have to be the same as the path the link points to.
When the first argument is omitted or falsey, it defaults to the path specified in the link's `href` attribute.
- The second is the name of the CSS class to add. This is optional, and it defaults to `active` if not present.

## Advanced usage

Check out the [Advanced Usage](/Advanced%20Usage.md) documentation for using:

- [Route transitions](/Advanced%20Usage.md#route-transitions)
- [Querystring parsing](/Advanced%20Usage.md#querystring-parsing)
- [Nested routers](/Advanced%20Usage.md#nested-routers)
- [Route groups](/Advanced%20Usage.md#route-groups)
