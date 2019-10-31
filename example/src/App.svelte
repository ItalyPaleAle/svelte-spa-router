<h1>svelte-spa-router example</h1>
<!-- Navigation links, using the "link" action -->
<!-- Also, use the "active" action to add the "active" CSS class when the URL matches -->
<ul class="navigation-links">
    <li><a href="/" use:link use:active>Home</a></li>
    <li><a href="/brand" use:link><b>Brand</b></a></li>
    <li><a href="/hello/svelte" use:link use:active={'/hello/*', 'active'}>Say hi!</a></li>
    <li><a href="/does/not/exist" use:link>Not found</a></li>
</ul>

<!-- Navigate with buttons -->
<p class="navigation-buttons">
    <button on:click={() => push('/wild/something')}>Visit /wild/something</button>
    <button on:click={() => pop()}>Go back</button>
    <button on:click={() => replace('/wild/replaced')}>Replace current page</button>
</p>

<!-- Query string -->
<a href="/hello/svelte?quantity=100" use:link use:active={'/hello/*'}>Querystring args</a>

<!-- Show the current path -->
<p>
    Current path: <code id="currentpath">{$location}</code>
    <br/>
    Querystring: <code id="currentqs">{$querystring}</code>
</p>

<!-- Show the router -->
<Router {routes} on:conditionsFailed={conditionsFailed} on:routeLoaded={routeLoaded} />

<!-- Testing dynamic list of links -->
<h2>Dynamic links</h2>
<ul class="navigation-dynamic-links">
{#each dynamicLinks as dl (dl.id)}
    <li>
        <a id="dynamic-link-{dl.id}" href={dl.link} use:link use:active>Dynamic Link {dl.id}</a>
         - 
        <i id="delete-link-{dl.id}" on:click={() => dynamicLinks = dynamicLinks.filter(e => e.id != dl.id)}>delete link</i>
    </li>
{/each}
</ul>

<!-- Used for testing -->
<pre id="logbox">{logbox}</pre>

<style>
/* Style for "active" links; need to mark this :global because the router adds the class directly */
:global(a.active) {
    color: crimson;
}
</style>

<script>
// Import the router component
// Normally, this would be import: `import Router from 'svelte-spa-router'`
import Router from '../../Router.svelte'
// Import the "link" action and the methods to control history programmatically from the same module, as well as the location store
import {link, push, pop, replace, location, querystring} from '../../Router.svelte'

// Import the "active" action
// Normally, this would be import: `import active from 'svelte-spa-router/active'`
import active from '../../active'

// Import the list of routes
import routes from './routes'

// Contains logging information used by tests
let logbox = ''

// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
function conditionsFailed(event) {
    // eslint-disable-next-line no-console
    console.error('Caught event conditionsFailed', event.detail)
    logbox += 'conditionsFailed - ' + JSON.stringify(event.detail) + '\n'

    // Replace the route
    replace('/wild/conditions-failed')
}

// Handles the "routeLoaded" event dispatched by the router after a route has been successfully loaded
function routeLoaded(event) {
    // eslint-disable-next-line no-console
    console.info('Caught event routeLoaded', event.detail)
    logbox += 'routeLoaded - ' + JSON.stringify(event.detail) + '\n'
}

let dynamicLinks = [
    {
        id: 1,
        link: '/hello/dynamic-link-1'
    },
    {
        id: 2,
        link: '/hello/dynamic-link-2'
    },
    {
        id: 3,
        link: '/hello/dynamic-link-3'
    }
]
</script>
