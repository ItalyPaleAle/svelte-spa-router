---
title: "Route parameters"
weight: 24
---

## Parameters from routes

svelte-spa-router uses [regexparam](https://github.com/lukeed/regexparam) to parse routes, so you can add optional parameters to the route. Basic syntax is:

- `/path` matches `/path` exactly (and only that)
- `/path/:id` matches `/path/` followed by any string, which is a named argument `id`
- `/path/:id/:version?` allows for an optional second named argument `version`
- `/path/*` matches `/path/` followed by anything, using a non-named argument

_Please refer to the documentation of regexparam for more details._

If your route contains any parameter, they will be made available to your component inside the `params` dictionary.

For example, for a route `/name/:first/:last?`, you can create this Svelte component:

```svelte
<p>
  Your name is:
  <b>{params.first}</b> <b>{#if params.last}{params.last}{/if}</b>
</p>
<script>
// You need to define the component prop "params"
let {params = {}} = $props()
</script>
```

Non-named arguments are returned as `params.wild`.

> If you define your routes using [custom regular expressions](/docs/regular-expression-routes), the `params` prop is populated with an array of matches instead of a dictionary.

## Getting the current page

You can get the current page from `router.location`.

```svelte
<script>
import {router} from 'svelte-spa-router'
</script>
<p>The current page is: {router.location}</p>
```

If you need both location and querystring together, use `router.loc`.

## Querystring parameters

You can also extract "querystring" parameters from the hash of the page. This isn't the _real_ querystring, as it's located after the `#` character in the URL, but it can be used in a similar way. For example: `#/books?show=authors,titles&order=1`.

When svelte-spa-router finds a "querystring" in the hash, it separates that from the location and returns it as a string in `router.querystring`. For example:

```svelte
<script>
import {router} from 'svelte-spa-router'
</script>
<p>The current page is: {router.location}</p>
<p>The querystring is: {router.querystring}</p>
```

With the example above, this would print:

```text
The current page is: /books
The querystring is: show=authors,titles&order=1
```

It's important to note that, to keep this component lightweight, svelte-spa-router **does not parse** the "querystring". If you want to parse the value of `router.querystring`, you can use [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) available in all modern browsers, or third-party modules such as [qs](https://www.npmjs.com/package/qs).

> For a complete example of parsing the querystring into a dictionary, see [Querystring parsing](/advanced/querystring-parsing) in the Advanced Usage section.
