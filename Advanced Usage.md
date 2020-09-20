# Advanced usage

svelte-spa-router is simple by design. A minimal router is easy to learn and implement, adds minimum overhead, and leaves more control in the hands of the developers.

Thanks to the many features of Svelte 3 or other components in the ecosystem, svelte-spa-router can be used to get many more "advanced" features. This document explains how to achieve certain results with svelte-spa-router beyond what's offered by the component itself.

- [Route wrapping](#route-wrapping), including:
  - [Dynamically-imported routes and placeholders](#async-routes-and-loading-placeholders)
  - [Route pre-conditions](#route-pre-conditions) ("route guards")
  - [Adding user data to routes](#user-data)
- [`routeEvent` event](#routeevent-event)
- [`routeLoading` and `routeLoaded` events](#routeloading-and-routeloaded-events)
- [Querystring parsing](#querystring-parsing)
- [Static props](#static-props)
- [Route transitions](#route-transitions)
- [Nested routers](#nested-routers)
- [Route groups](#route-groups)
- [Restore scroll position](#restore-scroll-position)

## Route wrapping

As shown in the intro documentation, the `wrap` method allows defining components that need to be dynamically-imported at runtime, which makes it possible to support code-splitting.

The `wrap` method allows a few more interesting features, however:

- In addition to dynamically-importing components, you can define a component to be shown while a dynamically-imported one is being requested
- You can add pre-conditions to routes (sometimes called "route guards")
- You can add custom user data that is then used with the [`routeLoading` and `routeLoaded` events](#routeloading-and-routeloaded-events)

### The `wrap` method

The `wrap(options)` method is imported from `svelte-spa-router/wrap`:

```js
import Router from 'svelte-spa-router'
```

It accepts a single `options` argument that is an object with the following properties:

- `options.route`: Svelte component to use, statically-included in the bundle. This is a Svelte component, such as `route: Foo`, with that previously imported with `import Foo from './Foo.svelte'`.
- `options.asyncRoute`: Used to dynamically-import route. This must be a function definition that returns a dynamically-imported component, such as: `asyncRoute: () => import('./Foo.svelte')`
- `options.loadingRoute`: Used together with `asyncRoute`, this is a Svelte component, that must be part of the bundle, which is displayed while `asyncRoute` is being downloaded. If this is empty, then the router will not display any component while the request is in progress.
- `options.loadingParams`: When using a `loadingRoute`, this is an optional dictionary that will be passed to the component as the `params` prop.
- `options.userData`: Optional dictionary that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`.
- `options.conditions`: Array of route pre-condition functions to add, which will be executed in order.

One and only one of `options.route` or `options.asyncRoute` must be set; all other properties are optional.

You use the `wrap` method in your route definition, such as:

```js
import Books from './Books.svelte'

// Using a dictionary to define the route object
const routes = {
    '/books': wrap({
        route: Books,
        userData: {foo: 'bar'}
    })
}

// Using a map
const routes = new Map()
routes.set('/books', wrap({
    route: Books,
    userData: {foo: 'bar'}
}))
```

### Async routes and loading placeholders

As mentioned in the main readme, starting with version 3 the `wrap` method is used with dynamically-imported components. This allows (when the bundler supports that, such as with Rollup or Webpack) code-splitting too, so code for less-common routes can be downloaded on-demand from the server rather than shipped in the app's core bundle.

This is done by setting the `options.asyncRoute` property to a function that returns a dynamically-imported module. For example:

```js
const routes = {
    '/book/:id': wrap({
        asyncRoute: () => import('./Book.svelte')
    })
}
```

Note that the value of `asyncRoute` must be a function definition, such as `() => import(…)`, and **not** `import(…)` (which is a function invocation). The latter would in fact request the module right away (albeit asynchronously), rather than on-demand when needed.

By default, while a module is being downloaded, the router does not display any component. You can however define a component (which must be statically-included in the app's bundle) to be displayed while the router is downloading a module. This is done with the `options.loadingRoute` property. Additionally, with `options.loadingParams` you can define a JavaScript object/dictionary that is passed to the loading placeholder component as the `params` prop.

For example, with a `Loading.svelte` component:

```svelte
<h2>Loading</h2>
{#if params && params.message}
    <p id="loadingmessage">Message is {params.message}</p>
{/if}

<script>
export let params = null
</script>
```

You can define the route as:

```js
// Import the wrap method
import {wrap} from 'svelte-spa-router/wrap'

// Statically-included components
import Loading from './Loading.svelte'

// Route definition object
const routes = {
    // Wrapping the Book component
    '/book/*': wrap({
        // Dynamically import the Book component
        asyncRoute: () => import('./Book.svelte'),
        // Display the Loading component while the request for the Book component is pending
        loadingRoute: Loading,
        // Value for `params` in the Loading component
        loadingParams: {
            message: 'secret',
            foo: 'bar'
        }
    })
}
```

### User data

The `wrap` method can also be used to add a dictionary with custom user data, that will be passed to all pre-condition functions (more on that below), and to the [`routeLoading`, `routeLoaded`](#routeloading-and-routeloaded-events), and [`conditionsFailed`](#route-pre-conditions) events.

This is useful to pass custom callbacks (as properties inside the dictionary) that can be used by the `routeLoading`, `routeLoaded`, and `conditionsFailed` event listeners to take specific actions.

For example:

```js
import Books from './Books.svelte'

const routes = {
    // Using a statically-included component and adding user data
    '/books': wrap({
        route: Books,
        userData: {foo: 'bar'}
    }),
    // Same, but for dynamically-loaded components
    '/authors': wrap({
        asyncRoute: () => import('./Authors.svelte'),
        userData: {hello: 'world'}
    })
}
```

### Route pre-conditions

You can define pre-conditions on routes, also known as "route guards". You can define one or more functions that the router will execute before loading the component that matches the current path. Your application can use pre-conditions to implement custom checks before routes are loaded, for example ensuring that users are authenticated.

Pre-conditions are defined in the `options.conditions` argument for the `wrap` function, which is an array of callbacks.

Each pre-condition function receives a dictionary `detail` with the same structure as the `routeLoading` event (more information [below](#routeloading-and-routeloaded-events)):

- `detail.route`: the route that was matched, exactly as defined in the route definition object
- `detail.location`: the current path (just like the `$location` readable store)
- `detail.querystring`: the current "querystring" parameters from the page's hash (just like the `$querystring` readable store)
- `detail.userData`: custom user data passed with the `wrap` function (see above)

The pre-condition functions must return a boolean indicating wether the condition succeeded (true) or failed (false).

You can define any number of pre-conditions for each route, and they're executed in order. If all pre-conditions succeed (returning true), the route is loaded. If one condition fails, the router stops executing pre-conditions and does not load any route.

Example:

````svelte
<!-- App.svelte -->
<Router {routes} />
<script>
import Router from 'svelte-spa-router'
import {wrap} from 'svelte-spa-router/wrap'

import Lucky from './Lucky.svelte'
import Hello from './Hello.svelte'

// Route definition object
const routes = {
    // This route has a pre-condition function that lets people in only 50% of times, and a second pre-condition that is always true
    '/lucky': wrap({
        // The Svelte component used by the route
        route: Lucky,

        // Custom data: any JavaScript object
        // This is optional and can be omitted
        // It can be useful to understand the component who caused the pre-condition failure
        userData: {
            hello: 'world',
            myFunc: () => {
                console.log('do something!')
            }
        }

        // List of route pre-conditions
        conditions: [
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
        ]
    })
}
</script>
````

Pre-conditions can be applied to dynamically-loaded routes too.

Additionally, starting with version 3 of svelte-spa-router, pre-conditions can be asynchronous function too. This is helpful, for example, to request authentication data, user profiles… For example:

```js
const routes = {
    // This route has an async function as pre-condition
    '/admin': wrap({
        // Use a dynamically-loaded component for this
        asyncRoute: () => import('./Admin.svelte'),
        // Adding one pre-condition that's an async function
        conditions: [
            async (detail) => {
                // Make a network request, which are async operations
                const response = await fetch('/user/profile')
                const data = await response.json()
                // Return true to continue loading the component, or false otherwise
                if (data.isAdmin) {
                    return true
                }
                else {
                    return false
                }
            }
        ]
    })
}
```

In case a condition fails, the router emits the `conditionsFailed` event, with the same `detail` dictionary.

You can listen to the `conditionsFailed` event and perform actions in case no route wasn't loaded because of a failed pre-condition:

````svelte
<Router {routes} on:conditionsFailed={conditionsFailed} on:routeLoaded={routeLoaded} />

<script>
// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
function conditionsFailed(event) {
    console.error('conditionsFailed event', event.detail)

    // Perform any action, for example replacing the current route
    if (event.detail.userData.foo == 'bar') {
        replace('/hello/world')
    }
}

// Handles the "routeLoaded" event dispatched by the router when a component was loaded
function routeLoaded(event) {
    console.log('routeLoaded event', event.detail)
}
</script>
````

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

## `routeLoading` and `routeLoaded` events

These two events are used by the router to notify the application when routes are being mounted. You can optionally listen to these events and trigger any custom logic.

First, the router emits `routeLoading` when it's about to mount a new component. If the component is [dynamically-imported](/README.md#dynamically-imported-routes-and-code-splitting) and needs to be requested, this event is fired when the component is being requested. In all other cases, such as if the dynamically-imported component has already been loaded, or if the component is statically included in the bundle, the `routeLoading` event is still fired right before `routeLoaded`.

Eventually, the router emits the `routeLoaded` event after a route has been successfully loaded (and injected in the DOM).

The event listener for **`routeLoading`** receives an `event` object that contains the following `detail` object:

````js
// For the routeLoading event
event.detail = {
    // The route that was matched, as in the route definition object
    route: '/book/:id',
    // The current path, equivalent to the value of the $location readable store
    // Note that this is different from the route property as the former is the route definition, while this is the actual path the user requested
    location: '/book/343',
    // The "querystring" from the page's hash, equivalent to the value of the $querystring readable store
    querystring: 'foo=bar',
    // User data passed with the wrap function; can be any kind of object/dictionary
    userData: {...}
}
````

For the **`routeLoaded`** event, the `event.detail` argument contains the four properties above in addition to:

```js
// For the routeLoaded event
event.detail = {
    // This includes the four properties of the detail object sent to routeLoading:
    route: '/book/:id',
    location: '/book/343',
    querystring: 'foo=bar',
    userData: {...}

    // Additionally, it includes two more properties:

    // The name of the Svelte component that was loaded
    name: 'Book',
    // The actual Svelte component that was loaded (a function)
    component: function() {...},
}
```

For example:

````svelte
<Router 
  {routes}
  on:routeLoading={routeLoading}
  on:routeLoaded={routeLoaded}
/>

<script>
function routeLoading(event) {
    console.log('routeLoading event')
    console.log('Route', event.detail.route)
    console.log('Location', event.detail.location)
    console.log('Querystring', event.detail.querystring)
    console.log('User data', event.detail.userData)
}

function routeLoaded(event) {
    console.log('routeLoaded event')
    // The first 4 properties are the same as for the routeLoading event
    console.log('Route', event.detail.route)
    console.log('Location', event.detail.location)
    console.log('Querystring', event.detail.querystring)
    console.log('User data', event.detail.userData)
    // The last two properties are unique to routeLoaded
    console.log('Component', event.detail.component) // This is a Svelte component, so a function
    console.log('Name', event.detail.name)
}
</script>
````

For help with the `wrap` function, check the [route pre-conditions](#route-pre-conditions) section.

> **Note:** When using minifiers such as terser, the name of Svelte components might be altered by the minifier. As such, it is recommended to use custom user data to identify the component who caused the pre-condition failure, rather than relying on the `detail.name` property. The latter, might contain the minified name of the class.

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

## Static props

In certain cases, you might need to pass static props to a component within the router.

For example, assume this component `Foo.svelte`:

```svelte
<p>The secret number is {num}</p>
<script>
// Prop
export let num
</script>
```

If `Foo` is a route in your application, you can pass a series of props to it through the router, with:

```svelte
<Router {routes} {props} />
<script>
// Import the router and routes
import Router from 'svelte-spa-router'
import Foo from './Foo.svelte'

// Route definition object
const routes = {
    '/': Foo
}

// Static props
const props = {
    num: 42
}
</script>
```

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

Note that if your parent router uses a route that contains parameters, such as `/user/:id`, then you must define a regular expression for `prefix`. For example: `prefix={/^\/user\/[0-9]+/}`. This is available in svelte-spa-router 3 or higher.

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

## Restore scroll position

Starting with svelte-spa-router 3.0, there is a new option in the `Router` component to restore the scroll position when the user navigates to the previous page.

To enable that, set the `restoreScrollState` property to `true` in the router (it's disabled by default):

```svelte
<Router {routes} restoreScrollState={true} />
```
