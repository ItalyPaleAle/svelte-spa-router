import type {Component} from 'svelte'

/** Full location from the hash: page and querystring */
export interface Location {
    /** Location (page/view), for example `/book` */
    location: string

    /** Querystring from the hash, as a string not parsed */
    querystring?: string
}

/** Dictionary with route details passed to pre-conditions and callback props */
export interface RouteDetail {
    /** Route matched as defined in the route definition (could be a string or a regular expression object) */
    route: string | RegExp

    /** Location path */
    location: string

    /** Querystring from the hash */
    querystring: string

    /** Params matched in the route */
    params: Record<string, string> | null // TODO the real type is `Record<string, string | null> | RegExpExecArray | null` - adjust in next major or keep for convenience?

    /** Custom data passed by the user */
    userData?: object
}

/** Detail object for `onRouteLoaded` */
export interface RouteDetailLoaded extends RouteDetail {
    /** Svelte component */
    component: Component<any, any>

    /** Name of the Svelte component that was loaded (note: might be minified in production) */
    name: string
}

/**
 * This is a Svelte component loaded asynchronously.
 * It's meant to be used with the `import()` function, such as `() => import('Foo.svelte')`.
 */
export type AsyncSvelteComponent = () => Promise<{default: Component<any, any>} | Component<any, any>>

/**
 * Route pre-condition function. This is a callback that receives a RouteDetail object as argument containing information on the route that we're trying to load.
 * The function must return a boolean indicating whether the route can be loaded. If the function returns `false`, the route is not loaded, and no other pre-condition function is executed.
 *
 * The pre-condition function can be asynchronous too, returning a boolean asynchronously.
 */
export type RoutePrecondition = (detail: RouteDetail) => boolean | Promise<boolean>

/** Object returned by the `wrap` method */
export interface WrappedComponent {
    /** Component to load (this is always asynchronous) */
    component: AsyncSvelteComponent

    /** Route pre-conditions to validate */
    conditions?: RoutePrecondition[]

    /** Optional dictionary of static props */
    props?: Record<string, unknown>

    /** Optional user data dictionary */
    userData?: object
}

/** Type for the opts parameter of the link action */
export interface LinkActionOpts {
    /** A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively. */
    href?: string

    /** If true, link is disabled */
    disabled?: boolean
}

/** Type for the update function of the link action */
export type LinkActionUpdateFunc = ((opts?: LinkActionOpts) => void) | ((hrefVar?: string) => void)

/** Backwards-compatible alias (kept for the historical typo) */
export type LinkActionUpateFunc = LinkActionUpdateFunc

/** Router state object, containing the current location, querystring and params. */
export interface RouterState {
    /** The current full location (incl. querystring) */
    readonly loc: Location

    /** The current location (excluding querystring) */
    readonly location: string

    /** The current querystring */
    readonly querystring: string | undefined

    /** The currently-matched params */
    readonly params: Record<string, string> | null | undefined  // TODO the real type is `Record<string, string | null> | RegExpExecArray | null | undefined` - adjust in next major or keep for convenience?
}

/** Options for the `active` action */
export interface ActiveOptions {
    /** Path to match; if empty, will default to the link's target */
    path?: string | RegExp

    /** Name of the CSS class to add when the route is active; default is "active" */
    className?: string

    /** Name of the CSS class to add when the route is inactive; nothing added by default */
    inactiveClassName?: string
}

/** List of routes */
export type RouteDefinition =
    | Record<string, Component<any, any> | WrappedComponent>
    | Map<string | RegExp, Component<any, any> | WrappedComponent>

// Note: `RouterProps` is intentionally defined inline in Router.svelte rather than here
// svelte2tsx (used by @sveltejs/package to emit .d.ts) can't follow cross-file type aliases when typing `$props()`, so the interface must live in the same file as the component to surface correctly to consumers
