<h1>svelte-spa-router example</h1>
<!-- Navigation links, using the "link" action -->
<!-- Also, use the "active" action to add the "active" CSS class when the URL matches -->
<ul>
    <li><a href="/" use:link use:active={'/', 'active'}>Home</a></li>
    <li><a href="/hello/svelte" use:link use:active={'/hello/*', 'active'}>Say hi!</a></li>
    <li><a href="/does/not/exist" use:link>Not found</a></li>
</ul>

<!-- Navigate with buttons -->
<p>
    <button on:click={() => push('/wild/something')}>Visit /wild/something</button>
    <button on:click={() => pop()}>Go back</button>
    <button on:click={() => replace('/wild/replaced')}>Replace current page</button>
</p>

<!-- Show the current path -->
<pre><code>
Current path:
</code></pre>

<!-- Show the router -->
<Router {routes}/>

<style>
/* Style for "active" links; need to mark this :global because the router adds the class directly */
:global(a.active) {
    color: crimson;
}
</style>

<script>
// Import the router component
// Normally, this would be import: `import Router from 'svelte-spa-router'
import Router from '../../router.svelte'
// Import the "link" action and the methods to control history programmatically from the same module
import {link, push, pop, replace} from '../../router.svelte'

// Import the "active" action
// Normally, this would be import: `import active from 'svelte-spa-router/active'
import active from '../../active'

// Import the list of routes
import routes from './routes'

</script>