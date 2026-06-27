---
title: "Active links"
weight: 25
---

svelte-spa-router has built-in support for automatically marking links as "active", with the `use:active` action.

For example, you can use the code below to add the CSS class `active` to links that are active:

```svelte
<script>
import {link} from 'svelte-spa-router'
import active from 'svelte-spa-router/active'
</script>

<style>
/* Style for "active" links.
Need to mark this :global because the router adds the class directly */
:global(a.active) {
    color: red;
}
</style>

<a href="/hello/user"
  use:link
  use:active={{path: '/hello/*', className: 'active', inactiveClassName: 'inactive'}}>
  Say hi!
</a>

<a href="/hello/user"
  use:link
  use:active={'/hello/*'}>
  Say hi with a default className!
</a>

<a href="/hello/user"
  use:link
  use:active>
  Say hi with all default options!
</a>
```

The `active` action accepts a dictionary `options` as argument:

- `options.path`: the path that, when matched, makes the link active. In the first example above, we want the link to be active when the route is `/hello/*` (the asterisk matches anything after that). As you can see, this doesn't have to be the same as the path the link points to. When `options.path` is omitted or false-y, it defaults to the path specified in the link's `href` attribute. This parameter can also be a regular expression that will mark the link as active when it matches: for example, setting to the regular expression `/^\/*\/hi$/` will make the link active when it starts with `/` and ends with `/hi`, regardless of what's in between.
- `options.className`: the name of the CSS class to add. This is optional, and it defaults to `active` if not present.
- `options.inactiveClassName`: the name of the CSS class to add when the link is _not_ active. This is optional, and it defaults to nothing if not present.

As a shorthand, instead of passing a dictionary as `options`, you can pass a single string or regular expression that will be interpreted as `options.path`.
