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

# svelte-spa-router

[![Build Status](https://github.com/ItalyPaleAle/svelte-spa-router/workflows/Continuous%20Integration%20tests/badge.svg)](https://github.com/ItalyPaleAle/svelte-spa-router/actions) 
[![npm](https://img.shields.io/npm/v/svelte-spa-router.svg)](https://www.npmjs.com/package/svelte-spa-router)
[![GitHub](https://img.shields.io/github/license/ItalyPaleAle/svelte-spa-router.svg)](https://github.com/ItalyPaleAle/svelte-spa-router/blob/master/LICENSE.md)

This module is a router for [Svelte 3 and 4](https://github.com/sveltejs/svelte) applications, specifically optimized for Single Page Applications (SPA).

Main features:

- Leverages **hash-based routing**, which is optimal for SPAs and doesn't require any server-side processing
- Insanely simple to use, and has a minimal footprint
- Uses the tiny [regexparam](https://github.com/lukeed/regexparam) for parsing routes, with support for parameters (e.g. `/book/:id?`) and more

This module is released under MIT license.

## Video

["So you want to pick a router?"]((https://www.youtube.com/watch?v=EL1qM0cv0eA)) talk by @ItalyPaleAle at Svelte Summit 2020. Includes an explanation of the two kinds of routers and a demo of svelte-spa-router.  
_(Click on the cover image to play the video on YouTube)_

[![Click to play video: 'So you want to pick a router?'](https://img.youtube.com/vi/EL1qM0cv0eA/0.jpg)](https://www.youtube.com/watch?v=EL1qM0cv0eA)

## Hash-based routing

With hash-based routing, navigation is possible thanks to storing the current view in the part of the URL after `#`, called "hash" or "fragment".

For example, if your SPA is in a static file called `index.html`, your URLs for navigating within the app look something like `index.html#/profile`, `index.html#/book/42`, etc. (The `index.html` part can usually be omitted for the index file, so you can just create URLs that look like `http://example.com/#/profile`).

When I created this component, other routers for Svelte 3+ implemented navigation using the HTML5 history API. While those URLs look nicer (e.g. you can actually navigate to `http://example.com/profile`), they are not ideal for static Single Page Applications. In order for users to be able to share links or even just refresh the page, you are required to have a server on the backend processing the request, and building fully-static apps is much harder as a consequence.

Hash-based routing is simpler, works well even without a server, and it's generally better suited for static SPAs, especially when SEO isn't a concern, as is the case when the app requires authentication. Many popular apps use hash-based routing, including GMail!

## Sample code

Check out the code in the [examples](/examples) folder for some usage examples.

To run the samples, clone the repository, install the dependencies, then build each sample using Rollup:

````sh
git clone https://github.com/ItalyPaleAle/svelte-spa-router
cd svelte-spa-router
npm install

# Navigate to a sample
cd examples/…
# For example
cd examples/basic-routing

# Build and run (in the folder of a sample)
npx rollup -c
npx serve -n -l 5050 dist
````

The sample will be running at http://localhost:5050

## Starter template

You can find a starter template with Svelte 4 and svelte-spa-router at [italypaleale/svelte-spa-router-template](https://github.com/italypaleale/svelte-spa-router-template).

To use the template:

```sh
npx degit italypaleale/svelte-spa-router-template svelte-app
cd svelte-app
```

More information can be found on the [template's repo](https://github.com/italypaleale/svelte-spa-router-template).

## Using svelte-spa-router

You can include the router in any project using Svelte 3 or 4.

### Install from NPM

To add svelte-spa-router to your project:

````sh
npm install svelte-spa-router
````

### Supported browsers

svelte-spa-router aims to support modern browsers, including recent versions of:

- Chrome
- Edge ("traditional" and Chromium-based)
- Firefox
- Safari

Support for Internet Explorer is not a goal for this project. Some users have reportedly been able to use svelte-spa-router with IE11 after transpilation (e.g. with Babel), but this is not guaranteed.

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

Alternatively, you can also define your routes using custom regular expressions, as explained below.

Note that the order matters! When your users navigate inside the app, the first matching path will determine which route to load. It's important that you leave any "catch-all" route (e.g. a "Page not found" one) at the end.

### Include the router view

To display the router, in a Svelte component (usually `App.svelte`), first import the router component:

````js
import Router from 'svelte-spa-router'
````

Then, display the router anywhere you'd like by placing the component in the markup. For example:

````svelte
<body>
    <Router {routes}/>
</body>
````

The `routes` prop is the dictionary defined above.

That's it! You already have all that you need for a fully-functional routing experience.

### Dynamically-imported components and code-splitting

Starting with version 3.0, svelte-spa-router supports dynamically-imported components (via the `import()` construct). The advantage of using dynamic imports is that, if your bundler supports that, you can enable code-splitting and reduce the size of the bundle you send to your users. This has been tested with bundlers including Rollup and Webpack.

To use dynamically-imported components, you need to leverage the `wrap` method (which can be used for a variety of actions, as per the docs on [route wrapping](/Advanced%20Usage.md#route-wrapping)). First, import the `wrap` method:

```js
import {wrap} from 'svelte-spa-router/wrap'
```

Then, in your route definition, wrap your routes using the `wrap` method, passing a function that returns the dynamically-imported component to the `asyncComponent` property:

```js
wrap({
    asyncComponent: () => import('./Foo.svelte')
})
```

> Note: the value of `asyncComponent` must be the **definition of a function** returning a dynamically-imported component, such as `asyncComponent: () => import('./Foo.svelte')`.  
> Do **not** use `asyncComponent: import('./Foo.svelte')`, which is a function invocation instead.

For example, to make the Author and Book routes from the first example dynamically-imported, we'd update the code to:

````js
// Import the wrap method
import {wrap} from 'svelte-spa-router/wrap'

// Note that Author and Book are not imported here anymore, so they can be imported at runtime
import Home from './routes/Home.svelte'
import NotFound from './routes/NotFound.svelte'

const routes = {
    '/': Home,

    // Wrapping the Author component
    '/author/:first/:last?': wrap({
        asyncComponent: () => import('./routes/Author.svelte')
    }),

    // Wrapping the Book component
    '/book/*': wrap({
        asyncComponent: () => import('./routes/Book.svelte')
    }),

    // Catch-all route last
    '*': NotFound,
}
````

The `wrap` method accepts an object with multiple properties and enables other features, including: setting a "loading" component that is shown while a dynamically-imported component is being requested, adding pre-conditions (route guards), passing static props, and adding custom user data.

You can learn more about all the features of `wrap` in the documentation for [route wrapping](/Advanced%20Usage.md#route-wrapping).

### Navigating between pages

You can navigate between pages with normal anchor (`<a>`) tags. For example:

````svelte
<a href="#/book/123">Thus Spoke Zarathustra</a>
````

#### The `use:link` action

Rather than having to type `#` before each link, you can also use the `use:link` action:

````svelte
<script>
import {link} from 'svelte-spa-router'
</script>
<a href="/book/321" use:link>The Little Prince</a>
````

The `use:link` action accepts an optional parameter `opts`, which can be one of:

- A dictionary `{href: '/foo', disabled: false}` where both keys are optional:
  - If you set a value for `href`, your link will be updated to point to that address, reactively (this will always take precedence over `href` attributes, if present)
  - Setting `disabled: true` disables the link, so clicking on that would have no effect
- A string with a destination (e.g. `/foo`), which is a shorthand to setting `{href: '/foo'}`.

For example:

````svelte
<script>
import {link} from 'svelte-spa-router'
let myLink = "/book/456"
</script>
<!-- Note the {{...}} notation because we're passing an object as parameter for a Svelte action -->
<a use:link={{href: myLink, disabled: false}}>The Biggest Princess</a>
````

The above is equivalent to:

````svelte
<script>
import {link} from 'svelte-spa-router'
let myLink = "/book/456"
</script>
<a use:link={myLink}>The Biggest Princess</a>
````

Changing the value of `myLink` will reactively update the link's `href` attribute.

#### Navigating programmatically

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

````svelte
<button on:click={() => push('/page')}>Go somewhere</button>
````

The `push`, `pop` and `replace` methods perform navigation actions only in the next iteration ("tick") of the JavaScript event loop. This makes it safe to use them also inside `onMount` callbacks within Svelte components.

These functions return a Promise that resolves with no value once the navigation has been triggered (in the next tick of the event loop); however, please note that this will likely be before the new page has rendered.

### Parameters from routes

svelte-spa-router uses [regexparam](https://github.com/lukeed/regexparam) to parse routes, so you can add optional parameters to the route. Basic syntax is:

- `/path` matches `/path` exactly (and only that)
- `/path/:id` matches `/path/` followed by any string, which is a named argument `id`
- `/path/:id/:version?` allows for an optional second named argument `version`
- `/path/*` matches `/path/` followed by anything, using a non-named argument

_Please refer to the documentation of regexparam for more details._

If your route contains any parameter, they will be made available to your component inside the `params` dictionary.

For example, for a route `/name/:first/:last?`, you can create this Svelte component:

````svelte
<p>Your name is: <b>{params.first}</b> <b>{#if params.last}{params.last}{/if}</b></p>
<script>
// You need to define the component prop "params"
export let params = {}
</script>
````

Non-named arguments are returned as `params.wild`.

### Getting the current page

You can get the current page from the `$location` readable store. This is a Svelte store, so it can be used reactively too.

````svelte
<script>
import {location} from 'svelte-spa-router'
</script>
<p>The current page is: {$location}</p>
````

### Querystring parameters

You can also extract "querystring" parameters from the hash of the page. This isn't the _real_ querystring, as it's located after the `#` character in the URL, but it can be used in a similar way. For example: `#/books?show=authors,titles&order=1`.

When svelte-spa-router finds a "querystring" in the hash, it separates that from the location and returns it as a string in the Svelte store `$querystring`. For example:

````svelte
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

It's important to note that, to keep this component lightweight, svelte-spa-router **does not parse** the "querystring". If you want to parse the value of `$querystring`, you can use [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) available in all modern browsers, or third-party modules such as [qs](https://www.npmjs.com/package/qs).

### Highlight active links

svelte-spa-router has built-in support for automatically marking links as "active", with the `use:active` action.

For example, you can use the code below to add the CSS class `active` to links that are active:

````svelte
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

<a href="/hello/user" use:link use:active={{path: '/hello/*', className: 'active', inactiveClassName: 'inactive'}}>Say hi!</a>
<a href="/hello/user" use:link use:active={'/hello/*'}>Say hi with a default className!</a>
<a href="/hello/user" use:link use:active>Say hi with all default options!</a>
````

The `active` action accepts a dictionary `options` as argument:

- `options.path`: the path that, when matched, makes the link active. In the first example above, we want the link to be active when the route is `/hello/*` (the asterisk matches anything after that). As you can see, this doesn't have to be the same as the path the link points to. When `options.path` is omitted or false-y, it defaults to the path specified in the link's `href` attribute. This parameter can also be a regular expression that will mark the link as active when it matches: for example, setting to the regular expression `/^\/*\/hi$/` will make the link active when it starts with `/` and ends with `/hi`, regardless of what's in between.
- `options.className`: the name of the CSS class to add. This is optional, and it defaults to `active` if not present.
- `options.inactiveClassName`: the name of the CSS class to add when the link is _not_ active. This is optional, and it defaults to nothing if not present.

As a shorthand, instead of passing a dictionary as `options`, you can pass a single string or regular expression that will be interpreted as `options.path`.

### Define routes with custom regular expressions

Since version 1.2 of svelte-spa-router, it's possible to define routes using custom regular expressions too, allowing for greater flexibility. However, this requires defining routes using a JavaScript Map rather than an object:

````js
import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import NotFound from './routes/NotFound.svelte'

const routes = new Map()

// You can still use strings to define routes
routes.set('/', Home)
routes.set('/hello/:first/:last?', Name)

// The keys for the next routes are regular expressions
// You will very likely always want to start the regular expression with ^
routes.set(/^\/hola\/(.*)/i, Name)
routes.set(/^\/buongiorno(\/([a-z]+))/i, Name)

// Catch-all, must be last
routes.set('*', NotFound)
````

When you define routes as regular expressions, the `params` prop is populated with an array with the result of the matches from the regular expression.

For example, with this `Name.svelte` route:

````svelte
<p>Params is: <code>{JSON.stringify(params)}</code></p>
<script>
// You need to define the component prop "params"
export let params = {}
</script>
````

When visiting `#/hola/amigos`, the params prop will be `["/hola/amigos","amigos"]`.

This is consistent with the results of [`RegExp.prototype.exec()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec).

> When defining a route using a regular expression, you can optionally use [named capturing groups](https://2ality.com/2017/05/regexp-named-capture-groups.html). When using those, in addition to finding your matches in the `params` prop, you can find the matches for named capturing groups in `params.group`.  
> For example, consider the route:
>
> ```js
> routes.set(/^\/book\/(?<title>[a-z]+)$/, Book)
> ```
> 
> When visiting `/#/book/mytitle`, the `params` prop will be an array with `["/book/mytitle", "mytitle"]`, and `params.groups` will be a dictionary with `{"title": "mytitle"}`.

## Advanced usage

Check out the [Advanced Usage](/Advanced%20Usage.md) documentation for using:

- [Route wrapping](/Advanced%20Usage.md#route-wrapping), including:
  - [Dynamically-imported routes and placeholders](/Advanced%20Usage.md#async-routes-and-loading-placeholders)
  - [Route pre-conditions](/Advanced%20Usage.md#route-pre-conditions) ("route guards")
  - [Adding user data to routes](/Advanced%20Usage.md#user-data)
  - [Static props](/Advanced%20Usage.md#static-props)
- [`routeEvent` event](/Advanced%20Usage.md#routeevent-event)
- [`routeLoading` and `routeLoaded` events](/Advanced%20Usage.md#routeloading-and-routeloaded-events)
- [Querystring parsing](/Advanced%20Usage.md#querystring-parsing)
- [Static props](/Advanced%20Usage.md#static-props)
- [Route transitions](/Advanced%20Usage.md#route-transitions)
- [Nested routers](/Advanced%20Usage.md#nested-routers)
- [Route groups](/Advanced%20Usage.md#route-groups)
- [Restore scroll position](/Advanced%20Usage.md#restore-scroll-position)
