<h2>Wildcard</h2>

<p>Anything in the URL after <code>/wild/</code> is shown below as message. That's found in the <code>params.wild</code> prop.</p>

<p>Your message is: {params.wild}</p>

<p>Note that this route was artificially delayed for 5 seconds to let us see the <code>Loading</code> component even when the network is fast (such as testing on localhost).</p>

<script>
/**
 * @typedef {Object} Props
 * @property {any} [params] - The params prop contains values matched from the URL
 */

/** @type {Props} */
const {params = {}} = $props()
</script>
