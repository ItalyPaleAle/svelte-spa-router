---
title: "Route events and callbacks"
weight: 32
---

## `onRouteEvent`

The `onRouteEvent` callback prop can be used to bubble events from a component displayed by the router, to the router's parent component.

For example, assume that your Svelte component `App` contains the router's component `Router`. Inside the router, the current view is displaying the `Foo` component. If `Foo` emitted an event, `Router` would receive it and would ignore it by default

Using **`onRouteEvent`**, instead, allows your components within the router (such as `Foo`) to bubble a payload to the `Router` component's parent.

Example for `App.svelte`:

```svelte
<Router {routes} {onRouteEvent} />

<script>
import Router from 'svelte-spa-router'
import Foo from './Foo.svelte'
const routes = {'*': Foo}
function onRouteEvent(detail) {
    // Do something
}
</script>
```

Example for `Foo.svelte`:

```svelte
<button onclick={() => onRouteEvent({foo: 'bar'})}>Hello</button>

<script>
let {onRouteEvent = () => {}} = $props()
</script>
```

## `onRouteLoading` and `onRouteLoaded`

These two callbacks are used by the router to notify the application when routes are being mounted. You can optionally listen to these callbacks and trigger any custom logic.

First, the router calls `onRouteLoading` when it's about to mount a new component. If the component is [dynamically-imported](/docs/code-splitting) and needs to be requested, this callback is fired when the component is being requested. In all other cases, such as if the dynamically-imported component has already been loaded, or if the component is statically included in the bundle, `onRouteLoading` is still called right before `onRouteLoaded`.

Eventually, the router calls `onRouteLoaded` after a route has been successfully loaded (and injected in the DOM).

The callback for **`onRouteLoading`** receives the following `detail` object directly:

```js
// For onRouteLoading
detail = {
    // The route that was matched, as in the route definition object
    route: '/book/:id',
    // The current path, equivalent to the value of router.location
    // Note that this is different from the route property as the
    // former is the route definition, while this is the actual path the user requested
    location: '/book/343',
    // The "querystring" from the page's hash, equivalent to the value
    // of router.querystring
    querystring: 'foo=bar',
    // Params matched from the route (such as :id from the route)
    params: { id: '343' },
    // User data passed with the wrap function; can be any kind of object/dictionary
    userData: {...}
}
```

For **`onRouteLoaded`**, the `detail` argument contains the four properties above in addition to:

```js
// For onRouteLoaded
detail = {
    // This includes the four properties of the detail object sent to onRouteLoading:
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

```svelte
<Router
    {routes}
    {onRouteLoading}
    {onRouteLoaded}
/>

<script>
function onRouteLoading(detail) {
    console.log('onRouteLoading')
    console.log('Route', detail.route)
    console.log('Location', detail.location)
    console.log('Querystring', detail.querystring)
    console.log('User data', detail.userData)
}

function onRouteLoaded(detail) {
    console.log('onRouteLoaded')
    // The first 5 properties are the same as for onRouteLoading
    console.log('Route', detail.route)
    console.log('Location', detail.location)
    console.log('Querystring', detail.querystring)
    console.log('Params', detail.params)
    console.log('User data', detail.userData)
    // The last two properties are unique to onRouteLoaded
    console.log('Component', detail.component) // This is a Svelte component, so a function
    console.log('Name', detail.name)
}
</script>
```

For help with the `wrap` function, check the [route wrapping](/advanced/route-wrapping) section.

> **Note:** When using minifiers such as terser, the name of Svelte components might be altered by the minifier. As such, it is recommended to use custom user data to identify the component who caused the pre-condition failure, rather than relying on the `detail.name` property. The latter, might contain the minified name of the class.
