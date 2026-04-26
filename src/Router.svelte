<script module lang="ts">
import {tick, untrack} from 'svelte'
import type {Component} from 'svelte'
import type {Location} from './types.js'

import type {RouteDetail, RouteDetailLoaded, RouteDefinition, WrappedComponent} from './types.js'

export type {
    ActiveOptions,
    AsyncSvelteComponent,
    LinkActionOpts,
    LinkActionUpateFunc,
    LinkActionUpdateFunc,
    Location,
    RouteDefinition,
    RouteDetail,
    RouteDetailLoaded,
    RoutePrecondition,
    RouterState,
    WrappedComponent
} from './types.js'

/** Props for the Router component */
export interface RouterProps {
    /**
     * Dictionary of all routes, in the format `'/path': component`.
     *
     * For example:
     * ```js
     * import HomeRoute from './routes/HomeRoute.svelte'
     * import BooksRoute from './routes/BooksRoute.svelte'
     * import NotFoundRoute from './routes/NotFoundRoute.svelte'
     * routes = {
     *     '/': HomeRoute,
     *     '/books': BooksRoute,
     *     '*': NotFoundRoute
     * }
     * ```
     */
    routes: RouteDefinition

    /** Optional prefix for the routes in this router. Useful for nested routers. */
    prefix?: string | RegExp

    /** If true, the router restores scroll positions on back navigation and scrolls to the top on forward navigation. */
    restoreScrollState?: boolean

    /** Callback fired when route pre-conditions fail. */
    onConditionsFailed?: (detail: RouteDetail) => void

    /** Callback fired when a route starts loading. */
    onRouteLoading?: (detail: RouteDetail) => void

    /** Callback fired when a route has loaded. */
    onRouteLoaded?: (detail: RouteDetailLoaded) => void

    /** Callback for events bubbled up from child components. */
    onRouteEvent?: (detail: unknown) => void
}

class RouterStateImpl {
    /** The current full location (incl. querystring) */
    _loc: Location = $state.raw(getLocation())
    /** The current location (excluding querystring) */
    _location: string = $derived(this._loc.location)
    /** The current querystring */
    _querystring: string | undefined = $derived(this._loc.querystring)
    _params: Record<string, string> | null | undefined = $state.raw(undefined)

    /** The current full location (incl. querystring) */
    get loc(): Location {
        return this._loc
    }
    /** The current location (excluding querystring) */
    get location(): string {
        return this._location
    }
    /** The current querystring */
    get querystring(): string | undefined {
        return this._querystring
    }
    get params(): Record<string, string> | null | undefined {
        return this._params
    }

    constructor() {
        window.addEventListener('hashchange', () => {
            this._loc = getLocation()
        })
    }
}

/** Router state object, containing the current location, querystring and params. */
export const router = new RouterStateImpl()

/** Returns the current location from the hash. */
function getLocation(): Location {
    const hashPosition = window.location.href.indexOf('#/')
    let location = hashPosition > -1 ? window.location.href.substr(hashPosition + 1) : '/'

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
 * Navigates to a new page programmatically.
 *
 * @param location - Path to navigate to (must start with `/` or `#/`)
 * @returns Promise that resolves after the page navigation has completed
 */
export async function push(location: string): Promise<void> {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    await tick()

    // Note: this will include scroll state in history even when restoreScrollState is false
    history.replaceState(
        {
            ...history.state,
            __svelte_spa_router_scrollX: window.scrollX,
            __svelte_spa_router_scrollY: window.scrollY
        },
        ''
    )

    window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 *
 * @returns Promise that resolves after the page navigation has completed
 */
export async function pop(): Promise<void> {
    // Execute this code when the current call stack is complete
    await tick()

    window.history.back()
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param location - Path to navigate to (must start with `/` or `#/`)
 * @returns Promise that resolves after the page navigation has completed
 */
export async function replace(location: string): Promise<void> {
    if (!location || location.length < 1 || (location.charAt(0) != '/' && location.indexOf('#/') !== 0)) {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    await tick()

    const dest = (location.charAt(0) == '#' ? '' : '#') + location
    try {
        const newState = {...history.state}
        delete newState['__svelte_spa_router_scrollX']
        delete newState['__svelte_spa_router_scrollY']
        window.history.replaceState(newState, '', dest)
    }
    catch {
        // eslint-disable-next-line no-console
        console.warn(
            'Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.'
        )
    }

    // The method above doesn't trigger the hashchange event, so let's do that manually
    window.dispatchEvent(new Event('hashchange'))
}

interface LinkActionInternalOpts {
    href?: string
    disabled?: boolean
}

/**
 * Svelte Action that enables a link element (`<a>`) to use our history management.
 *
 * For example:
 *
 * ```html
 * <a href="/books" use:link>View books</a>
 * ```
 */
export function link(node: HTMLElement, opts?: LinkActionInternalOpts | string): {
    update(updated?: LinkActionInternalOpts | string): void
    destroy(): void
} {
    let currentOpts = linkOpts(opts)

    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
        throw Error('Action "link" can only be used with <a> tags')
    }

    // Set initial href
    updateLinkHref(node, currentOpts)

    // Add click handler once, using currentOpts reference
    const clickHandler = (event: MouseEvent): void => {
        event.preventDefault()
        if (!currentOpts.disabled) {
            const target = event.currentTarget as HTMLElement | null
            const href = target ? target.getAttribute('href') : null
            if (href) {
                scrollstateHistoryHandler(href)
            }
        }
    }
    node.addEventListener('click', clickHandler)

    return {
        update(updated?: LinkActionInternalOpts | string): void {
            currentOpts = linkOpts(updated)
            updateLinkHref(node, currentOpts)
        },
        destroy(): void {
            node.removeEventListener('click', clickHandler)
        }
    }
}

interface ScrollHistoryState {
    __svelte_spa_router_scrollX?: number
    __svelte_spa_router_scrollY?: number
}

/** Tries to restore the scroll state from the given history state. */
export function restoreScroll(state: ScrollHistoryState | null): void {
    // If this exists, then this is a back navigation: restore the scroll position
    if (state) {
        window.scrollTo(state.__svelte_spa_router_scrollX || 0, state.__svelte_spa_router_scrollY || 0)
    }
    else {
        // Otherwise this is a forward navigation: scroll to top
        window.scrollTo(0, 0)
    }
}

// Internal function used by the link function to update href attribute
function updateLinkHref(node: HTMLElement, opts: LinkActionInternalOpts): void {
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
function linkOpts(val: LinkActionInternalOpts | string | undefined): LinkActionInternalOpts {
    if (typeof val == 'string') {
        return {href: val}
    }
    return val || {}
}

/**
 * The handler attached to an anchor tag responsible for updating the
 * current history state with the current scroll state.
 */
function scrollstateHistoryHandler(href: string): void {
    // Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    history.replaceState(
        {
            ...history.state,
            __svelte_spa_router_scrollX: window.scrollX,
            __svelte_spa_router_scrollY: window.scrollY
        },
        ''
    )
    // This will force an update as desired, but this time our scroll state will be attached
    window.location.hash = href
}
</script>

<script lang="ts">
import {parse} from 'regexparam'

const {
    routes = {},
    prefix = '',
    restoreScrollState = false,
    onConditionsFailed = () => {},
    onRouteLoaded = () => {},
    onRouteLoading = () => {},
    onRouteEvent = () => {}
}: RouterProps = $props()

type AsyncRouteComponent = (() => Promise<{default: Component<any, any>} | Component<any, any>>) & {
    loading?: Component<any, any>
    loadingParams?: Record<string, unknown>
}

interface PopStateScrollEvent extends PopStateEvent {
    state: ScrollHistoryState | null
}

/** Container for a route: path, component */
class RouteItem {
    path: string | RegExp
    component: AsyncRouteComponent
    conditions: NonNullable<WrappedComponent['conditions']>
    userData: WrappedComponent['userData']
    props: NonNullable<WrappedComponent['props']>
    _pattern: RegExp
    _keys: string[] | false

    constructor(path: string | RegExp, component: Component<any, any> | WrappedComponent) {
        if (
            !component ||
            (typeof component != 'function' &&
                (typeof component != 'object' || (component as WrappedComponent)._sveltesparouter !== true))
        ) {
            throw Error('Invalid component object')
        }

        // Path must be a regular expression, or a string starting with '/' or '*'
        if (
            !path ||
            (typeof path == 'string' && (path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*'))) ||
            (typeof path == 'object' && !(path instanceof RegExp))
        ) {
            throw Error('Invalid value for "path" argument - strings must start with / or *')
        }

        const parsed = typeof path == 'string' ? parse(path) : parse(path)
        this.path = path

        // Check if the component is wrapped and we have conditions
        if (typeof component == 'object' && (component as WrappedComponent)._sveltesparouter === true) {
            const wrapped = component as WrappedComponent
            this.component = wrapped.component as AsyncRouteComponent
            this.conditions = wrapped.conditions || []
            this.userData = wrapped.userData
            this.props = wrapped.props || {}
        }
        else {
            const sync = component as Component<any, any>
            this.component = (() => Promise.resolve(sync)) as AsyncRouteComponent
            this.conditions = []
            this.props = {}
        }

        this._pattern = parsed.pattern
        this._keys = parsed.keys
    }

    /**
     * Checks if `path` matches the current route.
     * Returns the list of parameters from the URL, or `null` if no match.
     */
    match(path: string): Record<string, string | null> | RegExpExecArray | null {
        // If there's a prefix, check if it matches the start of the path
        // If not, bail early, else remove it before we run the matching
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
                const m = path.match(prefix)
                if (m && m[0]) {
                    path = path.substr(m[0].length) || '/'
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

        // If the input was a regular expression, _keys is false; return matches as is
        if (this._keys === false) {
            return matches
        }

        const out: Record<string, string | null> = {}
        let i = 0
        while (i < this._keys.length) {
            // URL-decode all values
            try {
                out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null
            }
            catch {
                out[this._keys[i]] = null
            }
            i++
        }
        return out
    }

    /** Executes all conditions in order; returns false at the first failure. */
    async checkConditions(detail: RouteDetail): Promise<boolean> {
        for (let i = 0; i < this.conditions.length; i++) {
            if (!(await this.conditions[i](detail))) {
                return false
            }
        }
        return true
    }
}

// Set up all routes
const routesList: RouteItem[] = []
// svelte-ignore state_referenced_locally
// routes are static, initial capture is intended
if (routes instanceof Map) {
    routes.forEach((route, path) => {
        routesList.push(new RouteItem(path, route))
    })
}
else {
    Object.keys(routes).forEach((path) => {
        const map = routes as Record<string, Component<any, any> | WrappedComponent>
        routesList.push(new RouteItem(path, map[path]))
    })
}

// State declarations for the currently-rendered route
let component = $state.raw<Component<any, any> | null>(null)
let componentParams = $state.raw<Record<string, string | null> | RegExpExecArray | null>(null)
let routeProps = $state.raw<Record<string, unknown>>({})

let previousScrollState: ScrollHistoryState | null = null
let componentObj: AsyncRouteComponent | null = null

// Effects
$effect(() => {
    history.scrollRestoration = restoreScrollState ? 'manual' : 'auto'
})

$effect(() => {
    if (!restoreScrollState) {
        return
    }

    const popStateChanged = (event: PopStateScrollEvent): void => {
        if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
            previousScrollState = event.state
        }
        else {
            previousScrollState = null
        }
    }

    window.addEventListener('popstate', popStateChanged as (e: PopStateEvent) => void)
    return () => window.removeEventListener('popstate', popStateChanged as (e: PopStateEvent) => void)
})

async function dispatchNextTick<T>(event: (detail: T) => void, detail: T): Promise<void> {
    // Execute this code when the current call stack is complete
    await tick()
    event(detail)
}

$effect(() => {
    // React to loc changing and untrack everything else to prevent accidental dependencies
    // Cancel operation after async work in case a new loc change happened in the meantime
    const newLoc = router.loc
    let cancelled = false

    untrack(async () => {
        let i = 0
        while (i < routesList.length) {
            const match = routesList[i].match(newLoc.location)
            if (!match) {
                i++
                continue
            }

            const matchParams = matchToParams(match)
            const detail: RouteDetail = {
                route: routesList[i].path,
                location: newLoc.location,
                querystring: newLoc.querystring || '',
                userData: routesList[i].userData,
                params: matchParams
            }

            if (!(await routesList[i].checkConditions(detail))) {
                if (cancelled) {
                    return
                }
                component = null
                componentObj = null
                dispatchNextTick(onConditionsFailed, detail)
                return
            }

            if (cancelled) {
                return
            }

            dispatchNextTick(onRouteLoading, {...detail})

            const obj = routesList[i].component
            if (componentObj != obj) {
                if (obj.loading) {
                    component = obj.loading
                    componentObj = obj
                    componentParams = (obj.loadingParams as Record<string, string | null>) || null
                    routeProps = {}
                    const comp = obj.loading
                    dispatchNextTick(onRouteLoaded, {
                        ...detail,
                        component: comp,
                        name: comp.name,
                        params: (obj.loadingParams as Record<string, string>) || null
                    })
                }
                else {
                    component = null
                    componentObj = null
                }

                const loaded = await obj()

                if (cancelled) {
                    return
                }

                component =
                    loaded && typeof loaded == 'object' && 'default' in loaded ? loaded.default : (loaded as Component<any, any>)
                componentObj = obj
            }

            componentParams = match
            routeProps = routesList[i].props

            const comp = component
            if (comp) {
                dispatchNextTick(onRouteLoaded, {
                    ...detail,
                    component: comp,
                    name: comp.name,
                    params: matchParams
                })
            }

            router._params = matchParams
            if (restoreScrollState) {
                restoreScroll(previousScrollState)
                previousScrollState = null
            }
            return
        }

        component = null
        componentObj = null
        router._params = undefined
        if (restoreScrollState) {
            restoreScroll(previousScrollState)
            previousScrollState = null
        }
    })

    return () => {
        cancelled = true
    }
})

function matchToParams(
    match: Record<string, string | null> | RegExpExecArray
): Record<string, string> | null {
    if (Array.isArray(match) || !Object.keys(match).length) {
        return null
    }
    // Preserve all keys, including null values for unmatched optional params
    return match as unknown as Record<string, string>
}
</script>

{#if component}
    {@const Component = component}
    {#if componentParams}
        <Component
            params={componentParams}
            onRouteEvent={onRouteEvent}
            {...routeProps}
        />
    {:else}
        <Component
            onRouteEvent={onRouteEvent}
            {...routeProps}
        />
    {/if}
{/if}
