import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Wild from './routes/Wild.svelte'
import Regex from './routes/Regex.svelte'
import NotFound from './routes/NotFound.svelte'

// Use an object for routes unless we have the "routemap=1" querystring param
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

    // Regular expressions
    routes.set(/^\/regex\/(.*)?/i, Regex)
    routes.set(/^\/(pattern|match)(\/[a-z0-9]+)?/i, Regex)

    // Catch-all, must be last
    routes.set('*', NotFound)
}

export default routes
