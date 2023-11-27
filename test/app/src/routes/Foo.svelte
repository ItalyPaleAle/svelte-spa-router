{#if staticProp}
  <p>We have a static prop: <b id="staticprop">{staticProp}</b></p>
{:else}
  <p>No static props here!</p>
{/if}

{dynamicProp}
{#if dynamicProp}
  <p>We have a static prop: <b id="dynamicprop">{dynamicProp}</b></p>
{:else}
  <p>No static props here!</p>
{/if}

<script>
// Static props if they're set
export let staticProp = null
export let dynamicProp = null
</script>