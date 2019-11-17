<script context="module">
// Something's wrong with eslint on this file
/* eslint-disable no-multiple-empty-lines */

import {readable, derived} from 'svelte/store'

/**
 * Wraps a route to add route pre-conditions.
 * 
 * @param {SvelteComponent} route - Svelte component for the route
 * @param {Object} [userData] - Optional object that will be passed to each `conditionsFailed` event
 * @param {...Function} conditions - Route pre-conditions to add, which will be executed in order
 * @returns {Object} Wrapped route
 */
export function wrap(route, userData, ...conditions) {
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
    getLocation(),
    // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
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
 */
export function push(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    setTimeout(() => {
        window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location
    }, 0)
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 */
export function pop() {
    // Execute this code when the current call stack is complete
    setTimeout(() => {
        window.history.back()
    }, 0)
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param {string} location - Path to navigate to (must start with `/` or '#/')
 */
export function replace(location) {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    setTimeout(() => {
        const dest = (location.charAt(0) == '#' ? '' : '#') + location
        history.replaceState(undefined, undefined, dest)

        // The method above doesn't trigger the hashchange event, so let's do that manually
        window.dispatchEvent(new Event('hashchange'))
    }, 0)
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
 */
export function link(node) {
    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
        throw Error('Action "link" can only be used with <a> tags')
    }

    // Destination must start with '/'
    const href = node.getAttribute('href')
    if (!href || href.length < 1 || href.charAt(0) != '/') {
        throw Error('Invalid value for "href" attribute')
    }

    // Add # to every href attribute
    node.setAttribute('href', '#' + href)
}
</script>

<svelte:component this="{component}" params="{componentParams}" />

<script>
import {createEventDispatcher} from 'svelte'
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
            this.component = component
            this.conditions = []
            this.userData = undefined
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
            out[this._keys[i]] = matches[++i] || null
        }
        return out
    }

    /**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {SvelteComponent} component - Svelte component
     * @property {string} name - Name of the Svelte component
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
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

// We need an iterable: if it's not a Map, use Object.entries
const routesIterable = (routes instanceof Map) ? routes : Object.entries(routes)

// Set up all routes
const routesList = []
for (const [path, route] of routesIterable) {
    routesList.push(new RouteItem(path, route))
}

// Props for the component to render
let component = null
let componentParams = {}

// Event dispatcher from Svelte
const dispatch = createEventDispatcher()

// Just like dispatch, but executes on the next iteration of the event loop
const dispatchNextTick = (name, detail) => {
    // Execute this code when the current call stack is complete
    setTimeout(() => {
        dispatch(name, detail)
    }, 0)
}

// Handle hash change events
// Listen to changes in the $loc store and update the page
$: {
    // Find a route matching the location
    component = null
    let i = 0
    while (!component && i < routesList.length) {
        const match = routesList[i].match($loc.location)
        if (match) {
            const detail = {
                component: routesList[i].component,
                name: routesList[i].component.name,
                location: $loc.location,
                querystring: $loc.querystring,
                userData: routesList[i].userData
            }

            // Check if the route can be loaded - if all conditions succeed
            if (!routesList[i].checkConditions(detail)) {
                // Trigger an event to notify the user
                dispatchNextTick('conditionsFailed', detail)
                break
            }
            component = routesList[i].component
            componentParams = match

            dispatchNextTick('routeLoaded', detail)
        }
        i++
    }
}
</script>
