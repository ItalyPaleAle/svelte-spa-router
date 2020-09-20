<h2>Hi there!</h2>

<p>
    Your name is:
    <b>{params.first}</b>
    <b>{#if params.last}{params.last}{/if}</b>
</p>
<p>This comes from the URL, matching <code>/hello/:first/:last?</code>, where the last name is optional.</p>
<p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/alex</code> or <code>/hello/jane/doe</code></p>

<script>
// The params prop contains values matched from the URL
export let params = {}
</script>
