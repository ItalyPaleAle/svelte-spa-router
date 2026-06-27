---
title: "Querystring parsing"
weight: 33
---

As the [route parameters](/docs/route-parameters) documentation mentions, you can extract parameters from the "querystring" in the hash of the page. This allows you to build apps that navigate to pages such as `#/search?query=hello+world&sort=title`.

The router has built-in support for returning the value of the "querystring", but it only returns the full string and doesn't perform any parsing. Components can access the "querystring" part of the hash from `router.querystring`. For example:

```svelte
<script>
import {router} from 'svelte-spa-router'
</script>
<p>The current page is: {router.location}</p>
<p>The querystring is: {router.querystring}</p>
```

When visiting the page `#/search?query=hello+world&sort=title`, this would generate:

```text
The current page is: /search
The querystring is: query=hello+world&sort=title
```

Most times, however, you might want to parse the "querystring" into a dictionary, to be able to use those values inside your application easily. There are multiple ways of doing that. The simplest one is using [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) which is available in all modern browsers. If you need support for older browsers, a safe solution is to rely on the popular [qs](https://www.npmjs.com/package/qs) library.

Here's an example on using `qs` by changing the component above to:

```svelte
<script>
import {parse} from 'qs'
import {router} from 'svelte-spa-router'

// Use a derived to ensure parsed is updated
// every time router.querystring changes
const parsed = $derived(parse(router.querystring || ''))
</script>
<code>{JSON.stringify(parsed)}</code>
```

With the same URL as before, the result would be:

```text
{"query":"hello world","sort":"title"}
```

`qs` supports advanced things such as arrays, nested objects, etc. Check out their [README](https://github.com/ljharb/qs) for more information.
