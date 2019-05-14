import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Wild from './routes/Wild.svelte'
import NotFound from './routes/NotFound.svelte'

export default {
    // Exact path
    '/': Home,

    // Using named parameters, with last being optional
    '/hello/:first/:last?': Name,

    // Wildcard parameter
    '/wild': Wild,
    '/wild/*': Wild,

    // Catch-all, must be last
    '*': NotFound,
}
