---
title: "Nested routers"
weight: 35
---

The `<Router>` component of svelte-spa-router can be nested without issues.

For example, consider an app with these four components:

```svelte
<!-- App.svelte -->
<Router {routes}/>
<script>
import Router from 'svelte-spa-router'
import Hello from './Hello.svelte'
// Routes for the "outer router"
const routes = {
    // We need to define both '/hello' and '/hello/*' in two separate
    // lines to ensure that both '/hello' (with nothing else) and sub-paths are matched
    '/hello': Hello,
    '/hello/*': Hello,
}

/*
Note: If defining routes using a Map object, you could use a custom regular expression
instead of having to define the route twice:
routes.set(/^\/hello(\/(.*))?/, Hello)
*/
</script>

<!-- Hello.svelte -->
<h2>Hello!</h2>
<Router {routes} {prefix} />
<script>
import Router from 'svelte-spa-router'
import FullName from './FullName.svelte'
import ShortName from './ShortName.svelte'
// Routes for the "inner router"
// Note that we have a "prefix" property for this nested router
const prefix = '/hello'
const routes = {
    '/:first/:last': FullName,
    '/:first': ShortName
}
</script>

<!-- FullName.svelte -->
<p>You gave us both a first name and last name!</p>
<p>First: {params.first}</p>
<p>Last: {params.last}</p>
<script>
export let params = {}
</script>

<!-- ShortName.svelte -->
<p>You shy person, giving us a first name only!</p>
<p>First: {params.first}</p>
<script>
export let params = {}
</script>
```

This works as you would expect:

- `#/hello/John` will show the `ShortName` component and pass "John" as `params.first`
- `#/hello/Jane/Doe` will show the `FullName` component, pass "Jane" as `params.first`, and "Doe" as `params.last`
- Both routes will also display the `Hello!` header.

Both routes first load the `Hello` route, as they both match `/hello/*` in the outer router. The inner router then loads the separate components based on the path.

Features like highlighting active links will still work, regardless of where those links are placed in the page (in which component).

Note that if your parent router uses a route that contains parameters, such as `/user/:id`, then you must define a regular expression for `prefix`. For example: `prefix={/^\/user\/[0-9]+/}`. This is available in svelte-spa-router 3 or higher.
