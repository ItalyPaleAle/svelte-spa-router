import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'dist/bundle.js'
    },
    plugins: [
        svelte({
            // enable run-time checks when not in production
            dev: true,
            // we'll extract any component CSS out into
            // a separate file  better for performance
            css: css => {
                css.write('bundle.css')
            }
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration 
        // consult the documentation for details:
        // https://github.com/rollup/rollup-plugin-commonjs
        resolve(),
        commonjs()
    ]
}
