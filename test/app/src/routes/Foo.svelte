{#if staticProp}
  <p>We have a static prop: <b id="staticprop">{staticProp}</b></p>
{:else}
  <p>No static props here!</p>
{/if}

<script>
// Static props if they're set
export let staticProp = null
</script>
