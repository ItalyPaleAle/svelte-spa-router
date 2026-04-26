import type {Component} from 'svelte'
import type {AsyncSvelteComponent, RoutePrecondition, WrappedComponent} from './types.js'

export type {AsyncSvelteComponent, RoutePrecondition, WrappedComponent} from './types.js'

/** Options object for the call to `wrap` */
export interface WrapOptions {
    /** Svelte component to load (this is incompatible with `asyncComponent`) */
    component?: Component<any, any>

    /** Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`) */
    asyncComponent?: AsyncSvelteComponent

    /** Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown */
    loadingComponent?: Component<any, any>

    /** Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`) */
    loadingParams?: Record<string, unknown>

    /** Optional object that will be passed to callback props such as `onRouteLoading`, `onRouteLoaded`, `onConditionsFailed` */
    userData?: object

    /** Optional key-value dictionary of static props that will be passed to the component */
    props?: Record<string, unknown>

    /** Route pre-conditions to add, which will be executed in order */
    conditions?: RoutePrecondition[] | RoutePrecondition
}

/**
 * Wraps a component to enable multiple capabilities:
 *
 * 1. Using dynamically-imported components (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
 * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`).
 * 3. Adding static props that are passed to the component.
 * 4. Adding custom userData, which is passed to callback props (e.g. `onRouteLoaded`) or to route pre-conditions.
 */
export function wrap(args: WrapOptions): WrappedComponent {
    if (!args) {
        throw Error('Parameter args is required')
    }

    // We need to have one and only one of component and asyncComponent
    // This does a "XNOR"
    if (!args.component == !args.asyncComponent) {
        throw Error('One and only one of component and asyncComponent is required')
    }

    // If the component is not async, wrap it into a function returning a Promise
    if (args.component) {
        const sync = args.component
        args.asyncComponent = () => Promise.resolve(sync)
    }

    // Parameter asyncComponent and each item of conditions must be functions
    if (typeof args.asyncComponent != 'function') {
        throw Error('Parameter asyncComponent must be a function')
    }
    let conditions: RoutePrecondition[] | undefined
    if (args.conditions) {
        // Ensure it's an array
        const arr = Array.isArray(args.conditions) ? args.conditions : [args.conditions]
        for (let i = 0; i < arr.length; i++) {
            if (!arr[i] || typeof arr[i] != 'function') {
                throw Error('Invalid parameter conditions[' + i + ']')
            }
        }
        conditions = arr
    }

    // Check if we have a placeholder component
    const asyncComponent = args.asyncComponent as AsyncSvelteComponent & {
        loading?: Component<any, any>
        loadingParams?: Record<string, unknown>
    }
    if (args.loadingComponent) {
        asyncComponent.loading = args.loadingComponent
        asyncComponent.loadingParams = args.loadingParams || undefined
    }

    // Build the wrapped component
    // _sveltesparouter is defined as a read-only, non-enumerable, non-configurable property so callers can't tamper with the marker the router uses to detect wrapped routes
    const wrapped: WrappedComponent = {
        component: asyncComponent,
        userData: args.userData,
        conditions: conditions?.length ? conditions : undefined,
        props: args.props && Object.keys(args.props).length ? args.props : {}
    }

    Object.defineProperty(wrapped, '_sveltesparouter', {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    })

    return wrapped
}

export default wrap
