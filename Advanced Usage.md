# Advanced usage

svelte-spa-router is simple by design. A minimal router is easy to learn and implement, adds minimum overhead, and leaves more control in the hands of the developers.

Thanks to the many features of Svelte 3 or other components in the ecosystem, svelte-spa-router can be used to get many more "advanced" features. This document explains how to achieve certain results with svelte-spa-router beyond what's offered by the component itself.

- [routeEvent event](#routeevent-event)
- [routeLoaded event](#routeloaded-event)
- [Querystring parsing](#querystring-parsing)
- [Route pre-conditions](#route-pre-conditions) ("Route guards")
- [Route transitions](#route-transitions)
- [Nested routers](#nested-routers)
- [Route groups](#route-groups)
- [Async route loading](#async-route-loading)

## `routeEvent` event

The custom `routeEvent` event can be used to bubble events from a component displayed by the router, to the router's parent component.

For example, assume that your Svelte component `App` contains the router's component `Router`. Inside the router, the current view is displaying the `Foo` component. If `Foo` emitted an event, `Router` would receive it and would ignore it by default

Using the custom event **`routeEvent`**, instead, allows your components within the router (such as `Foo`) to bubble an event to the `Router` component's parent.

Example for `App.svelte`:

```svelte
<Router {routes} on:routeEvent={routeEvent} />
<script>
import Router from 'svelte-spa-router'
import Foo from './Foo.svelte'
const routes = {'*': Foo}
function routeEvent(event) {
    // Do something
}
</script>
```

Example for `Foo.svelte`:

```svelte
<button on:click={() => dispatch('routeEvent', {foo: 'bar'})}>Hello</button>
<script>
import {createEventDispatcher} from 'svelte'
const dispatch = createEventDispatcher()
</script>
```

## `routeLoaded` event

The router emits the `routeLoaded` event after a route has been successfully loaded (and injected in the DOM). You can listen to this event and trigger any custom logic.

The event listener receives an `event` object that contains the following `detail` object:

````js
event.detail = {
    // The name of the Svelte component that was loaded
    name: 'Book',
    // The actual Svelte component that was loaded (a function)
    component: function() {...},
    // The current path, equivalent to the value of the $location readable store
    location: '/path',
    // The "querystring" from the page's hash, equivalent to the value of the $querystring readable store
    querystring: 'foo=bar',
    // User data passed with the wrap function; can be any kind of object/dictionary
    customData: {...}
}
````

For example:

````svelte
<Router {routes} on:routeLoaded={routeLoaded} />

<script>
function routeLoaded(event) {
    console.log('routeLoaded event')
    console.log('Component', event.detail.component) // This is a Svelte component, so a function
    console.log('Name', event.detail.name)
    console.log('Location', event.detail.location)
    console.log('Querystring', event.detail.querystring)
    console.log('User data', event.detail.userData)
}
</script>
````

For help with the `wrap` function, check the [route pre-conditions](#route-pre-conditions) section.

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

## Route pre-conditions

You can define pre-conditions on routes, also known as "route guards". You can define one or more functions that the router will execute before loading the route that matches the current path. Your application can use pre-conditions to implement custom checks before routes are loaded, for example ensuring that users are authenticated.

Pre-conditions are defined in the routes object, using the `wrap` method exported by the router rather than the Svelte component directly.

The pre-condition functions receive a dictionary `detail` with the same structure as the `routeLoaded` event:

- `detail.component`: the Svelte component that is being evaluated (this is a JavaScript function)
- `detail.name`: name of the Svelte component (a string)
- `detail.location`: the current path (just like the `$location` readable store)
- `detail.querystring`: the current "querystring" parameters from the page's hash (just like the `$querystring` readable store)
- `detail.userData`: custom user data passed with the `wrap` function (see below)

The pre-condition functions must return a boolean indicating wether the condition succeeded (true) or failed (false).

You can define any number of pre-conditions for each route, and they're executed in order. If all pre-conditions succeed (returning true), the route is loaded.

If one condition fails, the router stops executing pre-conditions and does not load any route.

The `wrap` method can also be used to add a dictionary with custom user data, that will be passed to all pre-condition functions, and to the `routeLoaded` and `conditionsFailed` events. This is useful to pass custom callbacks (as properties inside the dictionary) that can be used by the `routeLoaded` and `conditionsFailed` event listeners to take specific actions.

Example:

````svelte
<!-- App.svelte -->
<Router {routes}/>
<script>
import Router from 'svelte-spa-router'
import {wrap} from 'svelte-spa-router'

import Lucky from './Lucky.svelte'
import Hello from './Hello.svelte'

// Route definition object
const routes = {
    // This route has a pre-condition function that lets people in only 50% of times, and a second pre-condition that is always true
    '/lucky': wrap(
        // The Svelte component used by the route
        Lucky,

        // Custom data: any JavaScript object
        // This is optional and can be omitted
        {foo: 'bar'},

        // First pre-condition function
        (detail) => {
            // Pre-condition succeeds only 50% of times
            return (Math.random() > 0.5)
        },

        // Second pre-condition function
        (detail) => {
            // This pre-condition is executed only if the first one succeeded
            console.log('Pre-condition 2 executed', detail.location, detail.querystring)

            // Always succeed
            return true
        }
    ),

    // This route doesn't have pre-conditions, but we're wrapping it to add custom data
    '/hello': wrap(
        // The Svelte component used by the route
        Hello,

        // Custom data object
        {hello: 'world', myFunc: () => {
            console.log('do something!')
        }}
    )
}
</script>
````

In case a condition fails, the router emits the `conditionsFailed` event, with the same `detail` dictionary.

You can listen to the `conditionsFailed` and perform actions in case no route wasn't loaded because of a failed pre-condition:

````svelte
<Router {routes} on:conditionsFailed={conditionsFailed} on:routeLoaded={routeLoaded} />

<script>
// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
function conditionsFailed(event) {
    console.error('conditionsFailed event', event.detail)

    // Perform any action, for example replacing the current route
    if (event.detail.name == 'Lucky') {
        replace('/hello/world')
    }
}

// Handles the "routeLoaded" event dispatched by the router when a component was loaded
function routeLoaded(event) {
    console.log('routeLoaded event', event.detail)
}
</script>
````

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
    // We need to define both '/hello' and '/hello/*' in two separate lines to ensure that both '/hello' (with nothing else) and sub-paths are matched
    '/hello': Hello,
    '/hello/*': Hello,
}

/*
Note: If defining routes using a Map object, you could use a custom regular expression instead of having to define the route twice:
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
````

This works as you would expect:

- `#/hello/John` will show the `ShortName` component and pass "John" as `params.first`
- `#/hello/Jane/Doe` will show the `FullName` component, pass "Jane" as `params.first`, and "Doe" as `params.last`
- Both routes will also display the `Hello!` header.

Both routes first load the `Hello` route, as they both match `/hello/*` in the outer router. The inner router then loads the separate components based on the path.

Features like highlighting active links will still work, regardless of where those links are placed in the page (in which component).

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

## Async route loading 

> Note that this capability is provided by a third-party plugin [hmmhmmhm/svelte-spa-chunk](https://github.com/hmmhmmhm/svelte-spa-chunk) and is not part of the core svelte-spa-router project.

It's possible to load routes asynchronously, so the Svelte components are fetched from the server only when a route is loaded. When using tools like webpack or Parcel, the code can be automatically split into multiple files too.

Install the svelte-spa-chunk plugin:

````sh
npm i svelte-spa-chunk
````

You can then define routes to be loaded asynchronously in your routes object, for example:

````js
import {ChunkGenerator} from 'svelte-spa-chunk'
import ChunkComponent from 'svelte-spa-chunk/Chunk.svelte'
const Chunk = ChunkGenerator(ChunkComponent)

/**
 * @description Client Side Render Index
 */
export default {
    '/':        Chunk(()=> import('./main.svelte')),
    '/a':       Chunk(()=> import('./a.svelte')),
    '/b':       Chunk(()=> import('./b.svelte')),
    '/async':   Chunk(()=> import('./async.svelte')),

    '*':        Chunk(()=> import('./main.svelte')),
}
````
