---
title: "Regular expression routes"
weight: 26
---

Since version 1.2 of svelte-spa-router, it's possible to define routes using custom regular expressions too, allowing for greater flexibility. However, this requires defining routes using a JavaScript Map rather than an object:

```js
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
```

When you define routes as regular expressions, the `params` prop is populated with an array with the result of the matches from the regular expression.

For example, with this `Name.svelte` route:

```svelte
<p>Params is: <code>{JSON.stringify(params)}</code></p>
<script>
// You need to define the component prop "params"
let {params = {}} = $props()
</script>
```

When visiting `#/hola/amigos`, the params prop will be `["/hola/amigos","amigos"]`.

This is consistent with the results of [`RegExp.prototype.exec()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec).

> When defining a route using a regular expression, you can optionally use [named capturing groups](https://2ality.com/2017/05/regexp-named-capture-groups.html). When using those, in addition to finding your matches in the `params` prop, you can find the matches for named capturing groups in `params.group`.
>
> For example, consider the route:
>
> ```js
> routes.set(/^\/book\/(?<title>[a-z]+)$/, Book)
> ```
>
> When visiting `/#/book/mytitle`, the `params` prop will be an array with `["/book/mytitle", "mytitle"]`, and `params.groups` will be a dictionary with `{"title": "mytitle"}`.
