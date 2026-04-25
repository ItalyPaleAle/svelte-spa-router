<h1>svelte-spa-router sample</h1>
<h2>Basic routing</h2>

<!-- Navigation links -->
<ul>
    <li><a href="#/">Home</a></li>
    <li><a href="#/hello/svelte">Say hi!</a></li>
    <li><a href="#/wild/card">Wildcard route</a></li>
    <li><a href="#/does/not/exist">Not found</a></li>
</ul>

<!-- Show the router -->
<Router {routes} />

<script>
// Import the router component
import Router from 'svelte-spa-router'

// Import the list of routes
import routes from './routes'
</script>
