{#if staticProp}
    <p>We have a static prop: <b id="staticprop">{staticProp}</b></p>
    <button type="button" id="fooeventtrigger" onclick={() => onRouteEvent({action: 'foo', staticProp})}>
        Trigger route event from Foo
    </button>
{:else}
    <p>No static props here!</p>
{/if}

<script>
let {staticProp = null, onRouteEvent = () => {}} = $props()
</script>