<h2 class="routetitle">Hi there!</h2>

<p id="nameparams" onclick={() => onRouteEvent({detail: {action: 'hi', params}})}>
    Your name is: <b>{params.first ?? 'null'}</b>
    <b
        >{#if params.last}{params.last}{/if}</b
    >
</p>
<p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/jane/doe</code></p>

<script>
let {params = {}, onRouteEvent = () => {}} = $props()
</script>
