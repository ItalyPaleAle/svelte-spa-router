<h2 class="routetitle">Loading</h2>

<p id="pleasewait">Please wait…</p>
{#if props && props.message}
    <p id="loadingmessage">Message is {props}</p>
{/if}

<script>
export let props = null
</script>
