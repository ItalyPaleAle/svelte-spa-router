<h2 class="routetitle">Hi there!</h2>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<p id="nameparams" on:click={() => dispatch('routeEvent', {action: 'hi', params})}>Your name is: <b>{params.first}</b> <b>{#if params.last}{params.last}{/if}</b></p>
<p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/jane/doe</code></p>

<script>
export let params = {}

// Event dispatcher for the custom "routeEvent" event
import {createEventDispatcher} from 'svelte'
const dispatch = createEventDispatcher()
</script>
