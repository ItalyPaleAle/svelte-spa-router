<h2 class="routetitle">Loading</h2>

<p id="pleasewait">Please wait…</p>
{#if params && params.message}
    <p id="loadingmessage">Message is {params.message}</p>
{/if}

<script>
export let params = null
</script>
