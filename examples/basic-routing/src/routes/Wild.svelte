<h2>Wildcard</h2>

<p>Anything in the URL after <code>/wild/</code> is shown below as message. That's found in the <code>params.wild</code> prop.</p>

<p>Your message is: {params.wild}</p>

<script>
/**
 * @typedef {Object} Props
 * @property {any} [params] - The params prop contains values matched from the URL
 */

/** @type {Props} */
const {params = {}} = $props()
</script>
