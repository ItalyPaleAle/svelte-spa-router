---
title: "Getting started"
weight: 22
---

## Define your routes

Each route is a normal Svelte component, with the markup, scripts, bindings, etc. Any Svelte component can be a route.

The route definition is just a JavaScript dictionary (object) where the key is a string with the path (including parameters, etc), and the value is the route object.

For example:

```js
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
```

Routes must begin with `/` (or `*` for the catch-all route).

Alternatively, you can also define your routes using [custom regular expressions](/docs/regular-expression-routes).

Note that the order matters! When your users navigate inside the app, the first matching path will determine which route to load. It's important that you leave any "catch-all" route (e.g. a "Page not found" one) at the end.

## Include the router view

To display the router, in a Svelte component (usually `App.svelte`), first import the router component:

```js
import Router from 'svelte-spa-router'
```

Then, display the router anywhere you'd like by placing the component in the markup. For example:

```svelte
<body>
    <Router {routes}/>
</body>
```

The `routes` prop is the dictionary defined above.

That's it! You already have all that you need for a fully-functional routing experience.

## Next steps

- [Navigate between pages](/docs/navigation) with links and programmatically
- Read [route parameters](/docs/route-parameters) and the querystring
- Highlight [active links](/docs/active-links)
- Enable [code splitting](/docs/code-splitting) with dynamically-imported components
