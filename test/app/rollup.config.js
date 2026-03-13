import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-css-only'

export default {
    input: 'src/main.js',
    output: {
        sourcemap: true,
        name: 'app',
        format: 'esm',
        dir: 'dist/',
        chunkFileNames: '[name].js'
    },
    plugins: [
        svelte({
            // enable run-time checks when not in production
            dev: true,
        }),
        // we'll extract any component CSS out into
        // a separate file better for performance
        css({
            output: 'bundle.css'
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration 
        // consult the documentation for details:
        // https://github.com/rollup/rollup-plugin-commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs()
    ]
}
