import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

// `svelte-package` uses this config when building the `dist` output.
// `script: true` transpiles the TypeScript in `.svelte` `<script>` blocks down to plain JavaScript, so the published components don't ship TS-only syntax.
export default {
    preprocess: vitePreprocess({script: true})
}
