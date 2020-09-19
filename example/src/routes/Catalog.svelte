<h1 id="catalog">Item {id}</h1>

<a id="previous" href use:link={`/catalog/${id - 1}`}>Previous</a>
<a id="next" href use:link={`/catalog/${id + 1}`}>Next</a>

<script>
// Import the link action
// Normally, this would be import: `import {link} from 'svelte-spa-router'`
import {link} from '../../../Router.svelte'
export let params
let id
$: if (params) {
    id = parseInt(params.id, 10)
}
</script>
