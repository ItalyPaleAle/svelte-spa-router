---
title: "Code splitting"
weight: 27
---

Starting with version 3.0, svelte-spa-router supports dynamically-imported components (via the `import()` construct). The advantage of using dynamic imports is that, if your bundler supports that, you can enable code-splitting and reduce the size of the bundle you send to your users. This has been tested with bundlers including Vite, Rollup and Webpack.

To use dynamically-imported components, you need to leverage the `wrap` method (which can be used for a variety of actions, as per the docs on [route wrapping](/advanced/route-wrapping)). First, import the `wrap` method:

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

For example, to make the Author and Book routes from the [getting started](/docs/getting-started) example dynamically-imported, we'd update the code to:

```js
// Import the wrap method
import {wrap} from 'svelte-spa-router/wrap'

// Note that Author and Book are not imported here anymore,
// so they can be imported at runtime
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
```

The `wrap` method accepts an object with multiple properties and enables other features, including: setting a "loading" component that is shown while a dynamically-imported component is being requested, adding pre-conditions (route guards), passing static props, and adding custom user data.

You can learn more about all the features of `wrap` in the documentation for [route wrapping](/advanced/route-wrapping).
