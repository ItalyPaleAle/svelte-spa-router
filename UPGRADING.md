<table>
  <tr>
    <td>
      <a href="https://www.amazon.com/dp/B08D6T6BKS/"><img src="https://static.packt-cdn.com/products/9781839213625/cover/smaller" width="120" /></a>
    </td>
    <td>
      <h3>Svelte 3 Up and Running</h3>
      <p>Want to learn Svelte 3 and how to build a Single-Page App (SPA) with it (and with this router)? Check out my book <a href="https://www.amazon.com/dp/B08D6T6BKS/">Svelte 3 Up and Running</a> on Amazon.</p>
    </td>
</table>

# Upgrading instructions

## Upgrading to 4.x

When upgrading from svelte-spa-router 3.x to 4.x, please note the following breaking changes:

### Works with Svelte 4

svelte-spa-router 4.x is designed to work with Svelte 4.

## Upgrading to 3.x

When upgrading from svelte-spa-router 2.x to 3.x, please note the following breaking changes:

### URL parameters are now automatically decoded

Params that are extracted from the URL are now automatically decoded, as per [this issue](https://github.com/ItalyPaleAle/svelte-spa-router/issues/107).

For example, if you have a route similar to `/book/:name` and your users navigate to `/book/dante%27s%20inferno`:

- ❌ The **old** behavior (svelte-spa-router 2 and older) was to assign `dante%27s%20inferno` to `params.name`
- ✅ The **new** behavior in svelte-spa-router 3 is to assign `dante's inferno` to `params.name`

This is done by invoking [`decodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent).

If your application was decoding URL parameters before, remove that invocation when updating to svelte-spa-router 3.

### New `wrap` method

The `wrap` method exported by `svelte-spa-router` has been deprecated. Even though it remains available and functional (albeit showing a warning in the console), it will be removed in a later version of the router.

Please use the new `wrap` method exported by `svelte-spa-router/wrap` instead. This method's signature accepts a single argument which is an object of properties. It adds support for many other features too, such as dynamically-imported routes.

To learn more about the new `wrap` method and its features, check out the documentation on [Route wrapping](/Advanced%20Usage.md#route-wrapping).

To upgrade, maintaining the same functionality:

❌ Version 2.x:

````js
// Old import path
import {wrap} from 'svelte-spa-router'

const routes = {
    // Method signature: wrap(component, userData, ...conditions)
    '/foo': wrap(
        // Component
        Foo,
        // Custom data
        {foo: 'bar'},
        // Pre-condition function
        (detail) => {
            // ...
        },
        // ...more pre-condition functions
    )
}
````

✅ Version 3.x:

````js
// New import path
import {wrap} from 'svelte-spa-router/wrap'

const routes = {
    // Method signature: wrap(options)
    '/foo': wrap({
        // Component
        component: Foo,
        // Custom data
        customData: {foo: 'bar'},
        // Pre-condition function
        conditions: [
            (detail) => {
                // ...
            },
             // ...more pre-condition functions
        ]
        // See the documentation for the other possible properties for wrap
    })
}
````

## Upgrading to 2.x

When upgrading from svelte-spa-router 1.x to 2.x, please note the following breaking changes:

### `use:active` syntax changes

When using the `use:active` action, the syntax for the options has changed as it was not compatible with Svelte 3.13+. It now supports one single argument, a dictionary with the following options: `path` and `className`. As a short-hand, you can also pass just a string, which will be interpreted as `path`.

❌ Version 1.x:

````svelte
<a href="/hello/user" use:link use:active={'/hello/*', 'active'}>Say hi!</a>
<a href="/hello/user" use:link use:active={'/hello/*'}>Say hi with a default className!</a>
<a href="/hello/user" use:link use:active>Say hi with all default options!</a>
````

✅ Version 2.x:

````svelte
<a href="/hello/user" use:link use:active={{path: '/hello/*', className: 'active'}}>Say hi!</a>
<a href="/hello/user" use:link use:active={'/hello/*'}>Say hi with a default className!</a>
<a href="/hello/user" use:link use:active>Say hi with all default options!</a>
````

### Changes to route pre-conditions and `routeLoaded` and `conditionsFailed` events

We are now defining a "route detail" object that is used in all the following scenarios: route pre-conditions, `routeLoaded` event, and `conditionsFailed` event.

The "route detail" object contains the following properties: 

- `detail.component`: the Svelte component that is being evaluated (this is a JavaScript function)
- `detail.name`: name of the Svelte component (a string)
- `detail.location`: the current path (just like the `$location` readable store)
- `detail.querystring`: the current "querystring" parameters from the page's hash (just like the `$querystring` readable store)
- `detail.userData`: custom user data passed with the [`wrap` function](/Advanced%20Usage.md#route-pre-conditions)

Note that unlike the similar object in version 1.x, `detail.component` is now the actual Svelte component, and the name is in `detail.name` instead.

This object is passed as the only argument to route pre-conditions, and it's also passed in `event.detail` in the `routeLoaded` and `conditionsFailed` events.

❌ Version 1.x:

````js
// Route pre-conditions
const routes = {
    '/hello': wrap(
        Hello,
        (location, querystring) => {
            console.log(location, querystring)
            return true
        }
    )
}

// Handles the "conditionsFailed" event
function conditionsFailed(event) {
    console.error(event.detail.component)
}

// Handles the "routeLoaded" event
function routeLoaded(event) {
    console.error(event.detail.component)
}
````

✅ Version 2.x:

````js
// Route pre-conditions
const routes = {
    '/hello': wrap(
        Hello,
        (detail) => {
            console.log(detail.location, detail.querystring, detail.name, detail.component, detail.userData)
            return true
        }
    ),

    // This route adds custom user data
    '/foo': wrap(
        Foo,
        {foo: 'bar'},
        (detail) => {
            console.log(detail.location, detail.querystring, detail.name, detail.component, detail.userData)
            return true
        }
    )
}

// Handles the "conditionsFailed" event
function conditionsFailed(event) {
    // Component name is now on event.detail.name
    console.error(event.detail.name)
}

// Handles the "routeLoaded" event
function routeLoaded(event) {
    // Component name is now on event.detail.name
    console.error(event.detail.name)
}
````
