---
title: "Navigation"
weight: 23
---

You can navigate between pages with normal anchor (`<a>`) tags. For example:

```svelte
<a href="#/book/123">Thus Spoke Zarathustra</a>
```

## The `use:link` action

Rather than having to type `#` before each link, you can also use the `use:link` action:

```svelte
<script>
import {link} from 'svelte-spa-router'
</script>
<a href="/book/321" use:link>The Little Prince</a>
```

The `use:link` action accepts an optional parameter `opts`, which can be one of:

- A dictionary `{href: '/foo', disabled: false}` where both keys are optional:
  - If you set a value for `href`, your link will be updated to point to that address, reactively (this will always take precedence over `href` attributes, if present)
  - Setting `disabled: true` disables the link, so clicking on that would have no effect
- A string with a destination (e.g. `/foo`), which is a shorthand to setting `{href: '/foo'}`.

For example:

```svelte
<script>
import {link} from 'svelte-spa-router'
let myLink = "/book/456"
</script>
<!-- Note the {{...}} notation because we're passing an object
as parameter for a Svelte action -->
<a use:link={{href: myLink, disabled: false}}>
  The Biggest Princess
</a>
```

The above is equivalent to:

```svelte
<script>
import {link} from 'svelte-spa-router'
let myLink = "/book/456"
</script>
<a use:link={myLink}>The Biggest Princess</a>
```

Changing the value of `myLink` will reactively update the link's `href` attribute.

## Navigating programmatically

You can navigate between pages programmatically too:

```js
import {push, pop, replace} from 'svelte-spa-router'

// The push(url) method navigates to another page,
// just like clicking on a link.
push('/book/42')

// The pop() method is equivalent to hitting the back
// button in the browser.
pop()

// The replace(url) method navigates to a new page, but
// without adding a new entry in the browser's history stack.
// So, clicking on the back button in the browser would not
// lead to the page users were visiting before
// the call to replace().
replace('/book/3')
```

These methods can be used inside Svelte markup too, for example:

```svelte
<button onclick={() => push('/page')}>Go somewhere</button>
```

The `push`, `pop` and `replace` methods perform navigation actions only in the next iteration ("tick") of the JavaScript event loop. This makes it safe to use them also inside `onMount` callbacks within Svelte components.

These functions return a Promise that resolves with no value once the navigation has been triggered (in the next tick of the event loop); however, please note that this will likely be before the new page has rendered.
