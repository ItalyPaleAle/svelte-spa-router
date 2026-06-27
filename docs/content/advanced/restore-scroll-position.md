---
title: "Restore scroll position"
weight: 37
---

Starting with svelte-spa-router 3.0, there is a new option in the `Router` component to restore the scroll position when the user navigates to the previous page.

To enable that, set the `restoreScrollState` property to `true` in the router (it's disabled by default):

```svelte
<Router {routes} restoreScrollState={true} />
```

**Important:** In order for the scroll position to be restored, you need to trigger a page navigation using either the `use:link` action or the `push` method. Navigating using links starting with `#` (such as `<a href="#/books">`) will not allow restoring the scroll position.
