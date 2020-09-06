<script context="module">
import {readable, derived} from 'svelte/store'
import {tick} from 'svelte'

/**
 * Wraps a route to add route pre-conditions.
 * 
 * @param {SvelteComponent} route - Svelte component for the route
 * @param {Object} [userData] - Optional object that will be passed to each `conditionsFailed` event
 * @param {...Function} conditions - Route pre-conditions to add, which will be executed in order
 * @returns {Object} Wrapped route
 */
export function wrap(route, userData, ...conditions) {
    // Wrap the route inside a function that returns a Promise
    return wrapAsync(() => Promise.resolve(route), userData, ...conditions)
}

export function wrapAsync(route, userData, ...conditions) {
    // Check if we don't have userData
    if (userData && typeof userData == 'function') {
        conditions = (conditions && conditions.length) ? conditions : []
        conditions.unshift(userData)
        userData = undefined
    }

    // Parameter route and each item of conditions must be functions
    if (!route || typeof route != 'function') {
        throw Error('Invalid parameter route')
    }
    if (conditions && conditions.length) {
        for (let i = 0; i < conditions.length; i++) {
            if (!conditions[i] || typeof conditions[i] != 'function') {
                throw Error('Invalid parameter conditions[' + i + ']')
            }
        }
    }

    // Returns an object that contains all the functions to execute too
    const obj = {route, userData}
    if (conditions && conditions.length) {
        obj.conditions = conditions
    }

    // The _sveltesparouter flag is to confirm the object was created by this router
    Object.defineProperty(obj, '_sveltesparouter', {
        value: true
    })

    return obj
}

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
 */
export const location = derived(
    loc,
    ($loc) => $loc.location
)

/**
 * Readable store that returns the current querystring
 */
export const querystring = derived(
    loc,
    ($loc) => $loc.querystring
)

/**
 * Navigates to a new page programmatically.
 *
 * @param {string} location - Path to navigate to (must start with `/` or '#/')
 * @return {Promise} Promise that resolves after the page navigation has completed
 */
export function push(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    return tick().then(() => {
        // Note: this will include scroll state in history even when restoreScrollState is false
        history.replaceState({scrollX: window.scrollX, scrollY: window.scrollY}, undefined, undefined)      
        window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location
    })
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 * 
 * @return {Promise} Promise that resolves after the page navigation has completed
 */
export function pop() {
    // Execute this code when the current call stack is complete
    return tick().then(() => {
        window.history.back()
    })
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param {string} location - Path to navigate to (must start with `/` or '#/')
 * @return {Promise} Promise that resolves after the page navigation has completed
 */
export function replace(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    return tick().then(() => {
        const dest = (location.charAt(0) == '#' ? '' : '#') + location
        try {
            window.history.replaceState(undefined, undefined, dest)
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.')
        }

        // The method above doesn't trigger the hashchange event, so let's do that manually
        window.dispatchEvent(new Event('hashchange'))
    })
}

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
 * @param {string} hrefVar - A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively.
 */
export function link(node, hrefVar) {
    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
        throw Error('Action "link" can only be used with <a> tags')
    }

    updateLink(node, hrefVar || node.getAttribute('href'))

    return {
        update(updated) {
            updateLink(node, updated)
        }
    }
}

// Internal function used by the link function
function updateLink(node, href) {
    // Destination must start with '/'
    if (!href || href.length < 1 || href.charAt(0) != '/') {
        throw Error('Invalid value for "href" attribute: ' + href)
    }

    // Add # to the href attribute
    node.setAttribute('href', '#' + href)
    node.addEventListener('click', scrollstateHistoryHandler)
}

/**
 * The handler attached to an anchor tag responsible for updating the
 * current history state with the current scroll state
 *
 * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
 */
function scrollstateHistoryHandler(event) {
    // Prevent default anchor onclick behaviour
    event.preventDefault()
    const href = event.currentTarget.getAttribute('href')
    // Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    history.replaceState({scrollX: window.scrollX, scrollY: window.scrollY}, undefined, undefined)
    // This will force an update as desired, but this time our scroll state will be attached
    window.location.hash = href
}
</script>

{#if componentParams}
  <svelte:component this="{component}" params="{componentParams}" on:routeEvent />
{:else}
  <svelte:component this="{component}" on:routeEvent />
{/if}

<script>
import {createEventDispatcher, afterUpdate} from 'svelte'
import regexparam from 'regexparam'

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
export let routes = {}

/**
 * Optional prefix for the routes in this router. This is useful for example in the case of nested routers.
 */
export let prefix = ''

/**
 * If set to true, the router will restore scroll positions on back navigation
 * and scroll to top on forward navigation.
 */
export let restoreScrollState = false

/**
 * Container for a route: path, component
 */
class RouteItem {
    /**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
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
            throw Error('Invalid value for "path" argument')
        }

        const {pattern, keys} = regexparam(path)

        this.path = path

        // Check if the component is wrapped and we have conditions
        if (typeof component == 'object' && component._sveltesparouter === true) {
            this.component = component.route
            this.conditions = component.conditions || []
            this.userData = component.userData
        }
        else {
            // Convert the component to a function that returns a Promise, to normalize it
            this.component = () => Promise.resolve(component)
            this.conditions = []
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
        // If there's a prefix, remove it before we run the matching
        if (prefix && path.startsWith(prefix)) {
            path = path.substr(prefix.length) || '/'
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
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|Object} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */

    /**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    checkConditions(detail) {
        for (let i = 0; i < this.conditions.length; i++) {
            if (!this.conditions[i](detail)) {
                return false
            }
        }

        return true
    }
}

// Set up all routes
const routesList = []
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

// Props for the component to render
let component = null
let componentParams = null

// Event dispatcher from Svelte
const dispatch = createEventDispatcher()

// Just like dispatch, but executes on the next iteration of the event loop
function dispatchNextTick(name, detail) {
    // Execute this code when the current call stack is complete
    tick().then(() => {
        dispatch(name, detail)
    })
}

// If this is set, then that means we have popped into this var the state of our last scroll position
let previousScrollState = null

// Update history.scrollRestoration depending on restoreScrollState
$: history.scrollRestoration = restoreScrollState ? 'manual' : 'auto'

if (restoreScrollState) {
    window.addEventListener('popstate', (event) => {
        // If this event was from our history.replaceState, event.state will contain
        // our scroll history. Otherwise, event.state will be null (like on forward
        // navigation)
        if (event.state && event.state.scrollY) {
            previousScrollState = event.state
        }
        else {
            previousScrollState = null
        }
    })

    afterUpdate(() => {
        // If this exists, then this is a back navigation: restore the scroll position
        if (previousScrollState) {
            window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY)
        }
        else {
            // Otherwise this is a forward navigation: scroll to top
            window.scrollTo(0, 0)
        }
    })
}

// Handle hash change events
// Listen to changes in the $loc store and update the page
// Do not use the $: syntax because it gets triggered by too many things
loc.subscribe((newLoc) => {
    // Find a route matching the location
    component = null
    let i = 0
    while (!component && i < routesList.length) {
        const match = routesList[i].match(newLoc.location)
        if (match) {
            const detail = {
                route: routesList[i].path,
                location: newLoc.location,
                querystring: newLoc.querystring,
                userData: routesList[i].userData
            }

            // Check if the route can be loaded - if all conditions succeed
            if (!routesList[i].checkConditions(detail)) {
                // Trigger an event to notify the user
                dispatchNextTick('conditionsFailed', detail)
                break
            }

            // Trigger an event to alert that we're loading the route
            dispatchNextTick('routeLoading', detail)

            // Invoke the Promise
            routesList[i].component().then((loaded) => {
                // If there is a "default" property, which is used by async routes, then pick that
                component = (loaded && loaded.default) || loaded
                
                // Add the component object and name to the detail object
                detail.component = component
                detail.name = component.name

                // Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
                // Of course, this assumes that developers always add a "params" prop when they are expecting parameters
                if (match && typeof match == 'object' && Object.keys(match).length) {
                    componentParams = match
                }
                else {
                    componentParams = null
                }

                dispatchNextTick('routeLoaded', detail)
            })
            break
        }
        i++
    }
})
</script>
