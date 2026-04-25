<h1 id="catalog">Item {id}</h1>

<a id="previous" href use:link={`/catalog/${id - 1}`}>Previous</a>
<a id="next" href use:link={`/catalog/${id + 1}`}>Next</a>

<script>
// Import the link action
import {link} from 'svelte-spa-router'
let {params} = $props()
let id = $derived(params && parseInt(params.id, 10))
</script>
