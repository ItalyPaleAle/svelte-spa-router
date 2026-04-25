import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    build: {
        // Tests assert on Svelte component class names that the router exposes
        // via the `name` field of routeLoaded events. Minification mangles
        // these to single letters, so disable it for the test app build.
        minify: false,
        sourcemap: true
    }
})
