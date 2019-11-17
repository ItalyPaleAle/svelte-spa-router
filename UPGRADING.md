# Upgrading instructions

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
