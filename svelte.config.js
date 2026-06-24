import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

// `svelte-package` uses this config when building the `dist` output.
// `script: true` transpiles the TypeScript in `.svelte` `<script>` blocks down
// to plain JavaScript, so the published components don't ship TS-only syntax.
// Without this, tools that parse the component script as JavaScript (such as
// Vite 8's rolldown-based dependency optimizer) fail on TypeScript syntax like
// the optional parameter in `link(node, opts?)`.
export default {
    preprocess: vitePreprocess({script: true})
}
