<h2 class="routetitle">Home!</h2>

<p>Welcome to this sample code!</p>
<p>Things to try:</p>
<ul>
    <li>Navigate around with the links and buttons (notice how certain links become active depending on the path</li>
    <li>Try pressing the browsers' back and forward buttons</li>
    <li>The "Replace current page" button will change the page without adding a new item in the history stack (try pressing the back button!)</li>
    <li>Manually change the URL's fragment/hash</li>
    <li>Try refreshing the page</li>
</ul>

{#if staticProp}
  <p>We have a static prop: <b id="staticprop">{staticProp}</b></p>
{/if}

<script>
// Static props if they're set
export let staticProp = null
</script>
