<script module>
import {readable, writable, derived} from 'svelte/store'
import {tick} from 'svelte'

class Router {
    /**
     * The current full location (incl. querystring)
     */
    _loc = $state.raw(getLocation())
    /**
     * The current location (excluding querystring)
     */
    _location = $derived(this._loc.location)
    /**
     * The current querystring
     */
    _querystring = $derived(this._loc.querystring)
    _params = $state.raw(undefined)

    /**
     * The current full location (incl. querystring)
     */
    get loc() {
        return this._loc
    }
    /**
     * The current location (excluding querystring)
     */
    get location() {
        return this._location
    }
    /**
     * The current querystring
     */
    get querystring() {
        return this._querystring
    }
    get params() {
        return this._params
    }

    constructor() {
        window.addEventListener('hashchange', () => {
            this.loc = getLocation()
        })
    }
}

/**
 * Router state object, containing the current location, querystring and params.
 */
export const router = new Router()

/**
 * @typedef {Object} Location
 * @property {string} location - Location (page/view), for example `/book`
 * @property {string} [querystring] - Querystring from the hash, as a string not parsed
 */
/**
 * Returns the current location from the hash.
 *
 * @returns {Location} Location object
 * @private
 */
function getLocation() {
    const hashPosition = window.location.href.indexOf('#/')
    let location = (hashPosition > -1) ? window.location.href.substr(hashPosition + 1) : '/'

    // Check if there's a querystring
    const qsPosition = location.indexOf('?')
    let querystring = ''
    if (qsPosition > -1) {
        querystring = location.substr(qsPosition + 1)
        location = location.substr(0, qsPosition)
    }

    return {location, querystring}
}

/**
 * Readable store that returns the current full location (incl. querystring)
 * @deprecated Use router.loc instead
 */
export const loc = readable(
    null,
    // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
        set(getLocation())

        const update = () => {
            set(getLocation())
        }
        window.addEventListener('hashchange', update, false)

        return function stop() {
            window.removeEventListener('hashchange', update, false)
        }
    }
)

/**
 * Readable store that returns the current location
 * @deprecated Use router.location instead
 */
export const location = derived(
    loc,
    (_loc) => _loc.location
)

/**
 * Readable store that returns the current querystring
 * @deprecated Use router.querystring instead
 */
export const querystring = derived(
    loc,
    (_loc) => _loc.querystring
)

/**
 * Store that returns the currently-matched params.
 * Despite this being writable, consumers should not change the value of the store.
 * It is exported as a readable store only (in the typings file)
 * @deprecated Use router.params instead
 */
export const params = writable(undefined)

/**
 * Navigates to a new page programmatically.
 *
 * @param {string} location - Path to navigate to (must start with `/` or '#/')
 * @return {Promise<void>} Promise that resolves after the page navigation has completed
 */
export async function push(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    await tick()

    // Note: this will include scroll state in history even when restoreScrollState is false
    history.replaceState({...history.state, __svelte_spa_router_scrollX: window.scrollX, __svelte_spa_router_scrollY: window.scrollY}, undefined)      
    window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 * 
 * @return {Promise<void>} Promise that resolves after the page navigation has completed
 */
export async function pop() {
    // Execute this code when the current call stack is complete
    await tick()

    window.history.back()
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param {string} location - Path to navigate to (must start with `/` or '#/')
 * @return {Promise<void>} Promise that resolves after the page navigation has completed
 */
export async function replace(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    await tick()

    const dest = (location.charAt(0) == '#' ? '' : '#') + location
    try {
        const newState = {
            ...history.state
        }
        delete newState['__svelte_spa_router_scrollX']
        delete newState['__svelte_spa_router_scrollY']
        window.history.replaceState(newState, undefined, dest)
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.')
    }

    // The method above doesn't trigger the hashchange event, so let's do that manually
    window.dispatchEvent(new Event('hashchange'))
}

/**
 * Dictionary with options for the link action.
 * @typedef {Object} LinkActionOpts
 * @property {string} href - A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively.
 * @property {boolean} disabled - If true, link is disabled
 */

/**
 * Svelte Action that enables a link element (`<a>`) to use our history management.
 *
 * For example:
 *
 * ````html
 * <a href="/books" use:link>View books</a>
 * ````
 *
 * @param {HTMLElement} node - The target node (automatically set by Svelte). Must be an anchor tag (`<a>`) with a href attribute starting in `/`
 * @param {string|LinkActionOpts} opts - Options object. For legacy reasons, we support a string too which will be the value for opts.href
 */
export function link(node, opts) {
    opts = linkOpts(opts)

    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
        throw Error('Action "link" can only be used with <a> tags')
    }

    // Store current opts in a mutable reference so the click handler always sees the latest value
    let currentOpts = opts

    // Set initial href
    updateLinkHref(node, currentOpts)

    // Add click handler once, using currentOpts reference
    const clickHandler = (event) => {
        event.preventDefault()
        if (!currentOpts.disabled) {
            scrollstateHistoryHandler(event.currentTarget.getAttribute('href'))
        }
    }
    node.addEventListener('click', clickHandler)

    return {
        update(updated) {
            currentOpts = linkOpts(updated)
            updateLinkHref(node, currentOpts)
        },
        destroy() {
            node.removeEventListener('click', clickHandler)
        }
    }
}

/**
 * Tries to restore the scroll state from the given history state.
 *
 * @param {{__svelte_spa_router_scrollX: number, __svelte_spa_router_scrollY: number}} [state] - The history state to restore from.
 */
export function restoreScroll(state) {
    // If this exists, then this is a back navigation: restore the scroll position
    if (state) {
        window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY)
    }
    else {
        // Otherwise this is a forward navigation: scroll to top
        window.scrollTo(0, 0)
    }
}

// Internal function used by the link function to update href attribute
function updateLinkHref(node, opts) {
    let href = opts.href || node.getAttribute('href')

    // Destination must start with '/' or '#/'
    if (href && href.charAt(0) == '/') {
        // Add # to the href attribute
        href = '#' + href
    }
    else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
        throw Error('Invalid value for "href" attribute: ' + href)
    }

    node.setAttribute('href', href)
}

// Internal function that ensures the argument of the link action is always an object
function linkOpts(val) {
    if (val && typeof val == 'string') {
        return {
            href: val
        }
    }
    else {
        return val || {}
    }
}

/**
 * The handler attached to an anchor tag responsible for updating the
 * current history state with the current scroll state
 *
 * @param {string} href - Destination
 */
function scrollstateHistoryHandler(href) {
    // Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    history.replaceState({...history.state, __svelte_spa_router_scrollX: window.scrollX, __svelte_spa_router_scrollY: window.scrollY}, undefined)
    // This will force an update as desired, but this time our scroll state will be attached
    window.location.hash = href
}
</script>

{#if component}
    {@const Component = component}
    {#if componentParams}
        <Component
            params={componentParams}
            onRouteEvent={onRouteEvent}
            {...props}
        />
    {:else}
        <Component
            onRouteEvent={onRouteEvent}
            {...props}
        />
    {/if}
{/if}

<script>
import {onDestroy} from 'svelte'
import {parse} from 'regexparam'

const {
    /**
     * Dictionary of all routes, in the format `'/path': component`.
     *
     * For example:
     * ````js
     * import HomeRoute from './routes/HomeRoute.svelte'
     * import BooksRoute from './routes/BooksRoute.svelte'
     * import NotFoundRoute from './routes/NotFoundRoute.svelte'
     * routes = {
     *     '/': HomeRoute,
     *     '/books': BooksRoute,
     *     '*': NotFoundRoute
     * }
     * ````
     */
    routes = {},
    /**
     * Optional prefix for the routes in this router. This is useful for example in the case of nested routers.
     */
    prefix = '',
    /**
     * If set to true, the router will restore scroll positions on back navigation
     * and scroll to top on forward navigation.
     */
    restoreScrollState = false,
    onConditionsFailed = () => {},
    onRouteLoaded = () => {},
    onRouteLoading = () => {},
    onRouteEvent = () => {},
} = $props()

/**
 * Container for a route: path, component
 */
class RouteItem {
    /**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    constructor(path, component) {
        if (!component || (typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true))) {
            throw Error('Invalid component object')
        }

        // Path must be a regular or expression, or a string starting with '/' or '*'
        if (!path || 
            (typeof path == 'string' && (path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*'))) ||
            (typeof path == 'object' && !(path instanceof RegExp))
        ) {
            throw Error('Invalid value for "path" argument - strings must start with / or *')
        }

        const {pattern, keys} = parse(path)

        this.path = path

        // Check if the component is wrapped and we have conditions
        if (typeof component == 'object' && component._sveltesparouter === true) {
            this.component = component.component
            this.conditions = component.conditions || []
            this.userData = component.userData
            this.props = component.props || {}
        }
        else {
            // Convert the component to a function that returns a Promise, to normalize it
            this.component = () => Promise.resolve(component)
            this.conditions = []
            this.props = {}
        }

        this._pattern = pattern
        this._keys = keys
    }

    /**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    match(path) {
        // If there's a prefix, check if it matches the start of the path.
        // If not, bail early, else remove it before we run the matching.
        if (prefix) {
            if (typeof prefix == 'string') {
                if (path.startsWith(prefix)) {
                    path = path.substr(prefix.length) || '/'
                }
                else {
                    return null
                }
            }
            else if (prefix instanceof RegExp) {
                const match = path.match(prefix)
                if (match && match[0]) {
                    path = path.substr(match[0].length) || '/'
                }
                else {
                    return null
                }
            }
        }

        // Check if the pattern matches
        const matches = this._pattern.exec(path)
        if (matches === null) {
            return null
        }

        // If the input was a regular expression, this._keys would be false, so return matches as is
        if (this._keys === false) {
            return matches
        }

        const out = {}
        let i = 0
        while (i < this._keys.length) {
            // In the match parameters, URL-decode all values
            try {
                out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null
            }
            catch (e) {
                out[this._keys[i]] = null
            }
            i++
        }
        return out
    }

    /**
     * Dictionary with route details passed to pre-conditions and callback props.
     * DOM custom events (`routeLoading`, `routeLoaded`, `conditionsFailed`) are still emitted for backwards compatibility.
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `onRouteLoaded`)
     * @property {string} [name] - Name of the Svelte component (only in `onRouteLoaded`)
     */

    /**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    async checkConditions(detail) {
        for (let i = 0; i < this.conditions.length; i++) {
            if (!(await this.conditions[i](detail))) {
                return false
            }
        }

        return true
    }
}

// Set up all routes
const routesList = []
// svelte-ignore state_referenced_locally
// routes are static, initial capture is intended
if (routes instanceof Map) {
    // If it's a map, iterate on it right away
    routes.forEach((route, path) => {
        routesList.push(new RouteItem(path, route))
    })
}
else {
    // We have an object, so iterate on its own properties
    Object.keys(routes).forEach((path) => {
        routesList.push(new RouteItem(path, routes[path]))
    })
}

// State declarations for the currently-rendered route
let component = $state.raw(null)
let componentParams = $state.raw(null)
let props = $state.raw({})

let previousScrollState = $state(null)
let lastLoc = null
let componentObj = null
let popStateChanged = null


// Effects
$effect(() => {
    history.scrollRestoration = restoreScrollState ? 'manual' : 'auto'
})

$effect(() => {
    if (restoreScrollState) {
        popStateChanged = (event) => {
            if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
                previousScrollState = event.state
            }
            else {
                previousScrollState = null
            }
        }

        window.addEventListener('popstate', popStateChanged)
        return () => window.removeEventListener('popstate', popStateChanged)
    }
})

$effect(() => {
    if (previousScrollState !== null) {
        restoreScroll(previousScrollState)
    }
})

async function dispatchNextTick(event, detail) {
    // Execute this code when the current call stack is complete
    await tick()
    event(detail)
}

// Main routing effect
const unsubscribeLoc = loc.subscribe(async (newLoc) => {
    lastLoc = newLoc

    // Find a route matching the location
    let i = 0
    while (i < routesList.length) {
        const match = routesList[i].match(newLoc.location)
        if (!match) {
            i++
            continue
        }

        const detail = {
            route: routesList[i].path,
            location: newLoc.location,
            querystring: newLoc.querystring,
            userData: routesList[i].userData,
            params: (match && typeof match == 'object' && Object.keys(match).length) ? match : null
        }

        if (!(await routesList[i].checkConditions(detail))) {
            component = null
            componentObj = null
            dispatchNextTick(onConditionsFailed, detail)
            return
        }

        dispatchNextTick(onRouteLoading, {...detail})

        const obj = routesList[i].component
        if (componentObj != obj) {
            if (obj.loading) {
                component = obj.loading
                componentObj = obj
                componentParams = obj.loadingParams
                props = {}
                const comp = obj.loading
                dispatchNextTick(onRouteLoaded, {
                    ...detail,
                    component: comp,
                    name: comp.name,
                    params: obj.loadingParams
                })
            }
            else {
                component = null
                componentObj = null
            }

            const loaded = await obj()

            if (newLoc != lastLoc) {
                return
            }

            component = (loaded && loaded.default) || loaded
            componentObj = obj
        }

        // Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
        // Of course, this assumes that developers always add a "params" prop when they are expecting parameters
        let matchParams = null
        if (match && typeof match == 'object' && Object.keys(match).length) {
            matchParams = match
        }
        componentParams = matchParams
        props = routesList[i].props

        const comp = component
        dispatchNextTick(onRouteLoaded, {
            ...detail,
            component: comp,
            name: comp.name,
            params: matchParams
        })

        params.set(matchParams)
        router._params = matchParams
        return
    }

    component = null
    componentObj = null
    params.set(undefined)
    router._params = undefined
})

onDestroy(() => {
    unsubscribeLoc()
    popStateChanged && window.removeEventListener('popstate', popStateChanged)
})
</script>
