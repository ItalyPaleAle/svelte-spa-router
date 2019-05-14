<script context="module">
import {readable} from 'svelte/store'

/**
 * Returns the current location from the hash.
 * 
 * @returns {string} Current location
 */
export function getLocation() {
    const hashPosition = window.location.href.indexOf('#/')
    return (hashPosition > -1) ? window.location.href.substr(hashPosition + 1) : '/'
}

/**
 * Readable store that returns the current location
 */
export const location = readable(
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
 * Navigates to a new page programmatically.
 * 
 * @param {string} location - Path to navigate to (must start with `/`)
 */
export function push(location) {
    if (!location || location.length < 1 || location.charAt(0) != '/') {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    setTimeout(() => {
        window.location.hash = '#' + location
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
 * @param {string} location - Path to navigate to (must start with `/`)
 */
export function replace(location) {
    if (!location || location.length < 1 || location.charAt(0) != '/') {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    setTimeout(() => {
        history.replaceState(undefined, undefined, '#' + location)

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

    // onclick event handler
    node.addEventListener('click', (event) => {
        // Disable normal click event
        event.preventDefault()

        // Push link click
        push(href)

        return false
    })
}
</script>

<svelte:component this="{component}" params="{componentParams}" />

<script>
import regexparam from 'regexparam'
import {onDestroy} from 'svelte'

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
        // Path must start with '/' or '*'
        if (!path || path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*')) {
            throw Error('Invalid value for "path" argument')
        }

        const {pattern, keys} = regexparam(path)

        this.path = path
        this.component = component

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
        const matches = this._pattern.exec(path)
        if (matches === null) {
            return null
        }

        const out = {}
        let i = 0
        while (i < this._keys.length) {
            out[this._keys[i]] = matches[++i] || null
        }
        return out
    }
}

// Set up all routes
const routesList = Object.keys(routes).map((path) => {
    return new RouteItem(path, routes[path])
})

// Props for the component to render
let component = null
let componentParams = {}

// Handle hash change events
function locationHashChanged() {
    const location = getLocation()

    // Find a route matching the location
    component = null
    let i = 0
    while (!component && i < routesList.length) {
        const match = routesList[i].match(location)
        if (match) {
            component = routesList[i].component
            componentParams = match
        }
        i++
    }
}

// Listen to "hashChange" events, and trigger it right away
window.addEventListener('hashchange', locationHashChanged, false)
locationHashChanged()

// When the component is destroyed, remove the event listener
onDestroy(() => {
    window.removeEventListener('hashchange', locationHashChanged, false)
})
</script>
