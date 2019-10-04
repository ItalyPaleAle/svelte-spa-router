# Advanced usage

svelte-spa-router is simple by design. A minimal router is easy to learn and implement, adds minimum overhead, and leaves more control in the hands of the developers.

Thanks to the many features of Svelte 3 or other components in the ecosystem, svelte-spa-router can be used to get many more "advanced" features. This document explains how to achieve certain results with svelte-spa-router beyond what's offered by the component itself.

- [Route transitions](#route-transitions)
- [Querystring parsing](#querystring-parsing)
- [Nested routers](#nested-routers)
- [Route groups](#route-groups)

## Route transitions

It's easy to add a nice transition between routes, leveraging the built-in [transitions](https://svelte.dev/docs#Transitions) of Svelte 3.

For example, to make your components fade in gracefully, you can wrap the markup in a container (e.g. `<div>`, or `<section>`, etc) and attach a Svelte transition to that. For example:

````svelte
<div in:fade="{{duration: 500}}">
    <h2>Component's code goes here</h2>
</div>

<script>
import {fade} from 'svelte/transition'
</script>
````

When you apply the transition to multiple components, you can get a smooth transition effect:

![Example of transitions](/img/transitions.gif)

For more details: [official documentation](https://svelte.dev/docs#Transitions) on Svelte transitions.

## Querystring parsing

As the main documentation for svelte-spa-router mentions, you can extract parameters from the "querystring" in the hash of the page. This allows you to build apps that navigate to pages such as `#/search?query=hello+world&sort=title`.

The router has built-in support for returning the value of the "querystring", but it only returns the full string and doesn't perform any parsing. Components can access the "querystring" part of the hash from the `$querystring` store in the svelte-spa-router component. For example:

````svelte
<script>
import {location, querystring} from 'svelte-spa-router'
</script>
<p>The current page is: {$location}</p>
<p>The querystring is: {$querystring}</p>
````

When visiting the page `#/search?query=hello+world&sort=title`, this would generate:

````text
The current page is: /search
The querystring is: query=hello+world&sort=title
````

Most times, however, you might want to parse the "querystring" into a dictionary, to be able to use those values inside your application easily. There are multiple ways of doing that (some as simple as [a few lines of JavaScript](https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript)), but a good, robust and safe solution is to rely on the popular library [qs](https://www.npmjs.com/package/qs).

For example, changing the component above to:

````svelte
<script>
import {parse} from 'qs'
import {querystring} from 'svelte-spa-router'

// Use a reactive statement to ensure parsed
// is updated every time $querystring changes
$: parsed = parse($querystring)
</script>
<code>{JSON.stringify(parsed)}</code>
````

With the same URL as before, the result would be:

````text
{"query":"hello world","sort":"title"}
````

qs supports advanced things such as arrays, nested objects, etc. Check out their [README](https://github.com/ljharb/qs) for more information.

## Nested routers

The `<Router>` component of svelte-spa-router can be nested without issues.

For example, consider an app with these four components:

````svelte
<!-- App.svelte -->
<Router {routes}/>
<script>
import Router from 'svelte-spa-router'
import Hello from './Hello.svelte'
// Routes for the "outer router"
const routes = {
    '/hello/*': Hello,
}
</script>

<!-- Hello.svelte -->
<h2>Hello!</h2>
<Router {routes}/>
<script>
import Router from 'svelte-spa-router'
import FullName from './FullName.svelte'
import ShortName from './ShortName.svelte'
// Routes for the "inner router"
// Note that the path is still the absolute one!
const routes = {
    '/hello/:first/:last': FullName,
    '/hello/:first': ShortName
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
````

This works as you would expect:

- `#/hello/John` will show the `ShortName` component and pass "John" as `params.first`
- `#/hello/Jane/Doe` will show the `FullName` component, pass "Jane" as `params.first`, and "Doe" as `params.last`
- Both routes will also display the `Hello!` header.

Both routes first load the `Hello` route, as they both match `/hello/*` in the outer router. The inner router then loads the separate components based on the path.

Features like highlighting active links will still work, regardless of where those links are placed in the page (in which component).

However, keep in mind that routes are still defined in absolute terms also in inner routers, and whatever route you define must match the full path. For example, had we defined the inner route as `/:first/:last` without `/hello` as a prefix, we would get unexpected results.

## Route groups

You can get route groups by creating a Svelte component which nests the other components. For example:

````svelte
<!-- RouteA.svelte -->
<h2>This is route A</h2>

<!-- RouteB.svelte -->
<h2>This is route B</h2>

<!-- GroupRoute.svelte -->
<RouteA />
<RouteB />
<script>
import RouteA from './RouteA.svelte'
import RouteB from './RouteB.svelte'
</script>
````

When you add `GroupRoute` as a component in your router, you will render both `RouteA` and `RouteB`.
