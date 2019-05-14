<h2>Hi there!</h2>
<p>Your name is: <b>{params.first}</b> <b>{#if params.last} {params.last}{/if}</b></p>
<p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/jane/doe</code></p>

<script>
export let params = {}
</script>
