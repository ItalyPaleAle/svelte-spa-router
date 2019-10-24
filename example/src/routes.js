// Import the "wrap" function
// Normally, this would be import: `import {wrap} from 'svelte-spa-router'`
import {wrap} from '../../Router.svelte'

// Components
import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Wild from './routes/Wild.svelte'
import Regex from './routes/Regex.svelte'
import Lucky from './routes/Lucky.svelte'
import NotFound from './routes/NotFound.svelte'

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
    
        // Wildcard parameter
        '/wild': Wild,
        '/wild/*': Wild,

        // This route has a pre-condition function that lets people in only 50% of times (and a second pre-condition that is always true)
        '/lucky': wrap(Lucky,
            () => {
                return (Math.random() > 0.5)
            },
            () => {
                return true
            }
        ),
    
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
    routes.set('/wild/*', Wild)

    // This route has a pre-condition function that lets people in only 50% of times (and a second pre-condition that is always true)
    routes.set('/lucky', wrap(Lucky,
        () => {
            return (Math.random() > 0.5)
        },
        () => {
            return true
        }
    ))

    // Regular expressions
    routes.set(/^\/regex\/(.*)?/i, Regex)
    routes.set(/^\/(pattern|match)(\/[a-z0-9]+)?/i, Regex)

    // Catch-all, must be last
    routes.set('*', NotFound)
}

export default routes
