---
title: "Route wrapping"
weight: 31
---

As shown in the [getting started](/docs/getting-started) documentation, the `wrap` method allows defining components that need to be dynamically-imported at runtime, which makes it possible to support code-splitting.

The `wrap` method allows a few more interesting features, however:

- In addition to dynamically-importing components, you can define a component to be shown while a dynamically-imported one is being requested
- You can add pre-conditions to routes (sometimes called "route guards")
- You can add custom user data that is then used with the [`onRouteLoading` and `onRouteLoaded` callback props](/advanced/route-events)
- You can set static props, which are passed to the component as mounted by the router

## The `wrap` method

The `wrap(options)` method is imported from `svelte-spa-router/wrap`:

```js
import { wrap } from 'svelte-spa-router/wrap'
```

It accepts a single `options` argument that is an object with the following properties:

- `options.component`: Svelte component to use, statically-included in the bundle. This is a Svelte component, such as `component: Foo`, with that previously imported with `import Foo from './Foo.svelte'`.
- `options.asyncComponent`: Used to dynamically-import components. This must be a function definition that returns a dynamically-imported component, such as: `asyncComponent: () => import('./Foo.svelte')`
- `options.loadingComponent`: Used together with `asyncComponent`, this is a Svelte component, that must be part of the bundle, which is displayed while `asyncComponent` is being downloaded. If this is empty, then the router will not display any component while the request is in progress.
- `options.loadingParams`: When using a `loadingComponent`, this is an optional dictionary that will be passed to the component as the `params` prop.
- `options.userData`: Optional dictionary that will be passed to callbacks such as `onRouteLoading`, `onRouteLoaded`, `onConditionsFailed`.
- `options.conditions`: Optional array of route pre-condition functions to add, which will be executed in order.
- `options.props`: Optional dictionary of props that are passed to the component when mounted. The props are expanded with the spread operator (`{...props}`), so the key of each element becomes the name of the prop.

One and only one of `options.component` or `options.asyncComponent` must be set; all other properties are optional.

You use the `wrap` method in your route definition, such as:

```js
import Books from './Books.svelte'

// Using a dictionary to define the route object
const routes = {
   '/books': wrap({
      component: Books,
      userData: {foo: 'bar'}
   })
}

// Using a map
const routes = new Map()
routes.set('/books', wrap({
   component: Books,
   userData: {foo: 'bar'}
}))
```

## Async routes and loading placeholders

As mentioned in the [code splitting](/docs/code-splitting) documentation, starting with version 3 the `wrap` method is used with dynamically-imported components. This allows (when the bundler supports that, such as with Vite, Rollup or Webpack) code-splitting too, so code for less-common routes can be downloaded on-demand from the server rather than shipped in the app's core bundle.

This is done by setting the `options.asyncComponent` property to a function that returns a dynamically-imported module. For example:

```js
const routes = {
   '/book/:id': wrap({
      asyncComponent: () => import('./Book.svelte')
   })
}
```

Note that the value of `asyncComponent` must be a function definition, such as `() => import(…)`, and **not** `import(…)` (which is a function invocation). The latter would in fact request the module right away (albeit asynchronously), rather than on-demand when needed.

By default, while a module is being downloaded, the router does not display any component. You can however define a component (which must be statically-included in the app's bundle) to be displayed while the router is downloading a module. This is done with the `options.loadingComponent` property. Additionally, with `options.loadingParams` you can define a JavaScript object/dictionary that is passed to the loading placeholder component as the `params` prop.

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
      asyncComponent: () => import('./Book.svelte'),
      // Display the Loading component while the request
      // for the Book component is pending
      loadingComponent: Loading,
      // Value for `params` in the Loading component
      loadingParams: {
         message: 'secret',
         foo: 'bar'
      }
   })
}
```

## User data

The `wrap` method can also be used to add a dictionary with custom user data, that will be passed to all pre-condition functions (more on that below), and to the [`onRouteLoading`, `onRouteLoaded`](/advanced/route-events), and [`onConditionsFailed`](#route-pre-conditions) callback props.

This is useful to pass custom callbacks (as properties inside the dictionary) that can be used by the `onRouteLoading`, `onRouteLoaded`, and `onConditionsFailed` callback handlers to take specific actions.

For example:

```js
import Books from './Books.svelte'

const routes = {
   // Using a statically-included component and adding user data
   '/books': wrap({
      component: Books,
      userData: {foo: 'bar'}
   }),
   // Same, but for dynamically-loaded components
   '/authors': wrap({
      asyncComponent: () => import('./Authors.svelte'),
      userData: {hello: 'world'}
   })
}
```

## Route pre-conditions

You can define pre-conditions on routes, also known as "route guards". You can define one or more functions that the router will execute before loading the component that matches the current path. Your application can use pre-conditions to implement custom checks before routes are loaded, for example ensuring that users are authenticated.

Pre-conditions are defined in the `options.conditions` argument for the `wrap` function, which is an array of callbacks.

Each pre-condition function receives a dictionary `detail` with the same structure as [`onRouteLoading`](/advanced/route-events):

- `detail.route`: the route that was matched, exactly as defined in the route definition object
- `detail.location`: the current path (equivalent to `router.location`)
- `detail.querystring`: the current "querystring" parameters from the page's hash (equivalent to `router.querystring`)
- `detail.userData`: custom user data passed with the `wrap` function (see above)

The pre-condition functions must return a boolean indicating wether the condition succeeded (true) or failed (false).

You can define any number of pre-conditions for each route, and they're executed in order. If all pre-conditions succeed (returning true), the route is loaded. If one condition fails, the router stops executing pre-conditions and does not load any route.

Example:

```svelte
<!-- App.svelte -->
<Router {routes} />
<script>
import Router from 'svelte-spa-router'
import {wrap} from 'svelte-spa-router/wrap'

import Lucky from './Lucky.svelte'
import Hello from './Hello.svelte'

// Route definition object
const routes = {
   // This route has a pre-condition function that lets people in only 50% of times,
   // and a second pre-condition that is always true.
   '/lucky': wrap({
      // The Svelte component used by the route
      component: Lucky,

      // Custom data: any JavaScript object.
      // This is optional and can be omitted.
      // It can be useful to understand the component which
      // caused the pre-condition failure.
      userData: {
         hello: 'world',
         myFunc: () => {
            console.log('do something!')
         }
      },

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
            console.log('Pre-condition 2 executed',
               detail.location, detail.querystring)
            // Always succeed
            return true
         }
      ]
   })
}
</script>
```

Pre-conditions can be applied to dynamically-loaded routes too.

Additionally, starting with version 3 of svelte-spa-router, pre-conditions can be asynchronous function too. This is helpful, for example, to request authentication data, user profiles… For example:

```js
const routes = {
   // This route has an async function as pre-condition
   '/admin': wrap({
      // Use a dynamically-loaded component for this
      asyncComponent: () => import('./Admin.svelte'),
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

In case a condition fails, the router calls the `onConditionsFailed` callback prop with the same `detail` dictionary.

You can handle `onConditionsFailed` and perform actions in case no route wasn't loaded because of a failed pre-condition:

```svelte
<Router {routes} {onConditionsFailed} {onRouteLoaded} />

<script>
// Handles when a component can't be loaded because one of its pre-condition failed
function onConditionsFailed(detail) {
   console.error('onConditionsFailed', detail)

   // Perform any action, for example replacing the current route
   if (detail.userData.foo == 'bar') {
      replace('/hello/world')
   }
}

// Handles when a component was loaded
function onRouteLoaded(detail) {
   console.log('onRouteLoaded', detail)
}
</script>
```

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

If `Foo` is a route in your application, you can pass a series of props to it through the router, using `wrap`:

```svelte
<Router {routes} {props} />
<script>
// Import the router and routes
import Router from 'svelte-spa-router'
import {wrap} from 'svelte-spa-router/wrap'
import Foo from './Foo.svelte'

// Route definition object
const routes = {
   '/': wrap({
      component: Foo,
      // Static props
      props: {
         num: 42
      }
   })
}
</script>
```
