///<reference types="svelte" />

import {SvelteComponent} from 'svelte'
import {Readable} from 'svelte/store'

/** Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading` and `conditionsFailed` events */
export interface RouteDetail {
    /** Route matched as defined in the route definition (could be a string or a regular expression object) */
    route: string | RegExp

    /** Location path */
    location: string

    /** Querystring from the hash */
    querystring: string

    /** Params matched in the route */
    params: Record<string, string> | null

    /** Custom data passed by the user */
    userData?: object
}

/** Detail object for the `routeLoaded` event */
export interface RouteDetailLoaded extends RouteDetail {
     /** Svelte component */
     component: typeof SvelteComponent

     /** Name of the Svelte component that was loaded (note: might be minified in production) */
     name: string
}

/**
 * This is a Svelte component loaded asynchronously.
 * It's meant to be used with the `import()` function, such as `() => import('Foo.svelte')}`
 */
export type AsyncSvelteComponent = () => Promise<{default: typeof SvelteComponent}>

/**
 * Route pre-condition function. This is a callback that receives a RouteDetail object as argument containing information on the route that we're trying to load.
 * The function must return a boolean indicating whether the route can be loaded. If the function returns `false`, the route is not loaded, and no other pre-condition function is executed.
 *
 * The pre-condition function can be asynchronous too, returning a boolean asynchronously.
 *
 * @param detail Route detail object
 * @returns If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
 */
export type RoutePrecondition = (detail: RouteDetail) => (boolean | Promise<boolean>)

/** Object returned by the `wrap` method */
export interface WrappedComponent {
    /** Component to load (this is always asynchronous) */
    component: typeof SvelteComponent

    /** Route pre-conditions to validate */
    conditions?: RoutePrecondition[]

    /** Optional dictionary of static props */
    props?: object

    /** Optional user data dictionary */
    userData?: object

    /**
     * Internal flag used by the router to identify wrapped routes
     * @internal
     */
    //_sveltesparouter?: boolean
}

/**
 * Wraps a component to add route pre-conditions.
 *
 * @deprecated Use `wrap` from `svelte-spa-router/wrap` instead. This function will be removed in a later version.
 * 
 * @param component Svelte component for the route
 * @param userData Optional object that will be passed to each `conditionsFailed` event
 * @param conditions Route pre-conditions to add, which will be executed in order
 * @returns Wrapped component
 */
export function wrap(
    component: typeof SvelteComponent,
    userData?: object,
    ...conditions: RoutePrecondition[]
): WrappedComponent

/**
 * Navigates to a new page programmatically.
 *
 * @param location Path to navigate to (must start with `/` or '#/')
 * @returns Promise that resolves after the page navigation has completed
 */
export function push(location: string): Promise<void>

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 * 
 * @returns Promise that resolves after the page navigation has completed
 */
export function pop(): Promise<void>

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param location - Path to navigate to (must start with `/` or '#/')
 * @returns Promise that resolves after the page navigation has completed
 */
export function replace(location: string): Promise<void>

/** Type for the opts parameter of the link action */
export type LinkActionOpts = {
    /** A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively. */
    href?: string
    /** If true, link is disabled */
    disabled?: boolean
}

/** Type for the update function of the link action */
export type LinkActionUpateFunc = ((opts?: LinkActionOpts) => void) | 
    ((hrefVar?: string) => void)

/**
 * Svelte Action that enables a link element (`<a>`) to use our history management.
 *
 * For example:
 *
 * ````html
 * <a href="/books" use:link>View books</a>
 * ````
 *
 * @param node - The target node (automatically set by Svelte). Must be an anchor tag (`<a>`) with a href attribute starting in `/`
 * @param opts - Dictionary with options for the link
 * @param hrefVar - A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively. This is a shorthand for opts.href
 */
export function link(node: HTMLElement, opts?: LinkActionOpts): {update: LinkActionUpateFunc}
export function link(node: HTMLElement, hrefVar?: string): {update: LinkActionUpateFunc}

/** Full location from the hash: page and querystring */
interface Location {
    /** Location (page/view), for example `/book` */
    location: string

    /** Querystring from the hash, as a string not parsed */
    querystring?: string
}

/**
 * Readable store that returns the current full location (incl. querystring)
 */
export const loc: Readable<Location>

/**
 * Readable store that returns the current location
 */
export const location: Readable<string>

/**
 * Readable store that returns the current querystring
 */
export const querystring: Readable<string | undefined>

/**
 * Readable store that returns the current list of params
 */
export const params: Readable<Record<string, string> | undefined>
// Note: the above is implemented as writable but exported as readable because consumers should not modify the value

/** List of routes */
export type RouteDefinition = Record<string, typeof SvelteComponent | WrappedComponent> |
    Map<string | RegExp, typeof SvelteComponent | WrappedComponent>

/** Generic interface for events from the router */
interface RouterEvent<T> {
    detail: T
}

/** Event type for conditionsFailed */
export type ConditionsFailedEvent = RouterEvent<RouteDetail>

/** Event type for routeLoading */
export type RouteLoadingEvent = RouterEvent<RouteDetail>

/** Event type for routeLoaded */
export type RouteLoadedEvent = RouterEvent<RouteDetailLoaded>

/**
 * Router component
 */
export default class Router extends SvelteComponent {
    // Props
    $$prop_def: {
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
        routes: RouteDefinition,
        /**
         * Optional prefix for the routes in this router. This is useful for example in the case of nested routers.
         */
        prefix?: string | RegExp,
        /**
         * If set to true, the router will restore scroll positions on back navigation
         * and scroll to top on forward navigation.
         */
        restoreScrollState?: boolean
    }

    $on(event: 'routeEvent', callback: (event: CustomEvent) => void): () => void
    $on(event: 'conditionsFailed', callback: (event: ConditionsFailedEvent) => void): () => void
    $on(event: 'routeLoading', callback: (event: RouteLoadingEvent) => void): () => void
    $on(event: 'routeLoaded', callback: (event: RouteLoadedEvent) => void): () => void
}
