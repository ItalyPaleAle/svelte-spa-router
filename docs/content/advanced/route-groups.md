---
title: "Route groups"
weight: 36
---

You can get route groups by creating a Svelte component which nests the other components. For example:

```svelte
<!-- RouteA.svelte -->
<h2>This is route A</h2>

<!-- RouteB.svelte -->
<h2>This is route B</h2>

<!-- GroupRoute.svelte -->
<RouteA />
<RouteB />
<script>
import RouteA from './RouteA.svelte'
import RouteB from './RouteB.svelte'
</script>
```

When you add `GroupRoute` as a component in your router, you will render both `RouteA` and `RouteB`.
