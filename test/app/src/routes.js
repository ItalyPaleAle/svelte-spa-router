/* eslint-disable */

// Import the "wrap" function
// Normally, this would be: `import {wrap} from 'svelte-spa-router/wrap'`
import {wrap} from '../../../wrap.js'

// Components
import Catalog from './routes/Catalog.svelte'
import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Loading from './routes/Loading.svelte'
import Wild from './routes/Wild.svelte'
import Foo from './routes/Foo.svelte'
import Regex from './routes/Regex.svelte'
import NotFound from './routes/NotFound.svelte'

const wrappedLuckyRoute = wrap({
    // Add an artificial delay so we can experience the component loading
    asyncComponent: () => import('./routes/Lucky.svelte')
        .then((res) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(res), 2000)
            })
        }),
    // Component to show while the module is being downloaded
    loadingComponent: Loading,
    // Props for the loading component
    loadingParams: {message: 'secret'},
    // Set some user data
    userData: {foo: 'bar'},
    // Route pre-conditions, which are executed in order
    conditions: [
        (detail) => {
            // If there's a querystring parameter, override the random choice (tests need to be deterministic)
            if (detail.querystring == 'pass=1') {
                return true
            }
            else if (detail.querystring == 'pass=0') {
                return false
            }
            // Random
            return (Math.random() > 0.5)
        },
        // This is an async condition
        async (detail) => {
            // This pre-condition is executed only if the first one succeeded
            // eslint-disable-next-line no-console
            console.log('Pre-condition 2 executed', detail.location, detail.querystring, detail.userData)

            // eslint-disable-next-line no-console
            console.log('Pre-condition 2 started waiting')

            // Pause this
            await new Promise((resolve) => setTimeout(resolve, 100))

            // eslint-disable-next-line no-console
            console.log('Pre-condition 2 done waiting')

            // Always succeed (after the delay)
            return true
        }
    ]
})

// This demonstrates how to pass routes as a POJO (Plain Old JavaScript Object) or a JS Map
// In this code sample we're using both (controlling at runtime what's enabled, by checking for the 'routemap=1' querystring parameter) just because we are using this code sample for tests too
// In your code, you'll likely want to choose one of the two options only
let routes
const urlParams = new URLSearchParams(window.location.search)
if (!urlParams.has('routemap')) {
    // The simples way to define routes is to use a dictionary.
    // This is a key->value pair in which the key is a string of the path.
    // The path is passed to regexparam that does some transformations allowing the use of params and wildcards
    routes = {
        // Exact path
        '/': Home,

        // Allow children to also signal link activation
        '/brand': Home,

        // Using named parameters, with last being optional
        '/hello/:first/:last?': Name,

        // Using named parameters, with last being optional
        '/catalog/:id?': Catalog,

        // Wildcard parameter
        '/wild': Wild,
        // Special route that has custom data that will be passed to the `routeLoaded` event
        '/wild/data': wrap({
            component: Wild,
            userData: {hello: 'world'}
        }),
        '/wild/*': Wild,

        // This route has a pre-condition function that lets people in only 50% of times, and a second pre-condition that is always true
        // The second argument is a custom data object that will be passed to the `conditionsFailed` event if the pre-conditions fail
        '/lucky': wrappedLuckyRoute,

        // This route has a static prop that is passed to it
        '/foo': wrap({
            component: Foo,
            props: {
                staticProp: 'this is static',
                dynamicProp: async () => Promise.resolve(`this is dynamic - ${new Date}`),
            }
        }),

        // This component contains a nested router
        // Note that we must match both '/nested' and '/nested/*' for the nested router to work (or look below at doing this with a Map and a regular expression)
        '/nested': wrap({
            asyncComponent: () => import('./routes/Nested.svelte')
        }),
        '/nested/*': wrap({
            asyncComponent: () => import('./routes/Nested.svelte')
        }),

        // Catch-all, must be last
        '*': NotFound,
    }
}
else {
    routes = new Map()

    // Exact path
    routes.set('/', Home)

    // Allow children to also signal link activation
    routes.set('/brand', Home)

    // Using named parameters, with last being optional
    routes.set('/hello/:first/:last?', Name)

    // Wildcard parameter
    routes.set('/wild', Wild)
    // Special route that has custom data that will be passed to the `routeLoaded` event
    routes.set('/wild/data', wrap({
        component: Wild,
        userData: {hello: 'world'}
    }))
    routes.set('/wild/*', Wild)

    // This route has a pre-condition function that lets people in only 50% of times (and a second pre-condition that is always true)
    // The second argument is a custom data object that will be passed to the `conditionsFailed` event if the pre-conditions fail
    routes.set('/lucky', wrappedLuckyRoute)

    // This route has a static prop that is passed to it
    routes.set('/foo', wrap({
        component: Foo,
        props: {staticProp: 'this is static'}
    }))

    // Regular expressions
    routes.set(/^\/regex\/(.*)?/i, Regex)
    routes.set(/^\/(pattern|match)(\/[a-z0-9]+)?/i, Regex)

    // This component contains a nested router
    // Thanks to being able to define routes via regular expressions, this allows us to use a single line rather than 2 ('/nested' and '/nested/*')
    routes.set(/^\/nested(\/(.*))?/, wrap({
        asyncComponent: () => import('./routes/Nested.svelte')
    }))

    // Catch-all, must be last
    routes.set('*', NotFound)
}

export default routes
