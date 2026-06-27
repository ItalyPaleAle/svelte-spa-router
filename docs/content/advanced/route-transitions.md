---
title: "Route transitions"
weight: 34
---

It's easy to add a nice transition between routes, leveraging the built-in [transitions](https://svelte.dev/docs#Transitions) of Svelte.

For example, to make your components fade in gracefully, you can wrap the markup in a container (e.g. `<div>`, or `<section>`, etc) and attach a Svelte transition to that. For example:

```svelte
<div in:fade="{{duration: 500}}">
    <h2>Component's code goes here</h2>
</div>

<script>
import {fade} from 'svelte/transition'
</script>
```

When you apply the transition to multiple components, you can get a smooth transition effect:

![Example of transitions](/docs/img/transitions.gif)

For more details: [official documentation](https://svelte.dev/docs#Transitions) on Svelte transitions.
