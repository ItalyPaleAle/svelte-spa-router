import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Wild from './routes/Wild.svelte'
import Regex from './routes/Regex.svelte'
import NotFound from './routes/NotFound.svelte'

/*export default {
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
}*/

const routes = new Map()

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
routes.set(/\/regex\/(.*?)/i, Regex)
routes.set(/\/(pattern|match)/i, Regex)

// Catch-all, must be last
routes.set('*', NotFound)

export default routes
