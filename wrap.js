/**
 * @typedef {Object} WrappedRoute
 */

/**
 * @callback RoutePrecondition
 * @param {RouteDetail} detail - Route detail object
 * @returns {boolean} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the route (and won't process other pre-condition callbacks)
 */

/**
 * @typedef {Object} WrapOptions
 * @property {SvelteComponent} [route] - Svelte component to load (this is incompatible with `asyncRoute`)
 * @property {function(): Promise<SvelteComponent>} [asyncRoute] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncRoute: () => import('Foo.svelte')}`)
 * @property {SvelteComponent} [loadingRoute] - Svelte component to be displayed while the async route is loading; when unset or false-y, no route is shown while loading
 * @property {Object} [loadingParams] - Optional dictionary passed to the `loadingRoute` component as params (for an exported prop called `params`)
 * @property {Object} [userData] - Optional object that will be passed to each `conditionsFailed` event (can be omitted)
 * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to add, which will be executed in order
 */

/**
 * Wraps a route to enable multiple capabilities:
 * 1. Using dynamically-imported routes, with (e.g. `{asyncRoute: () => import('Foo.svelte')}`), which also allows bundlers to enable code-splitting.
 * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
 * 3. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
 * 
 * @param {WrapOptions} args - Arguments object
 * @returns {WrappedRoute} Wrapped route
 */
export function wrap(args) {
    if (!args) {
        throw Error('Parameter args is required')
    }

    // We need to have one and only one of route and asyncRoute
    // This does a "XNOR"
    if (!args.route == !args.asyncRoute) {
        throw Error('One and only one of route and asyncRoute is required')
    }

    // If the route is not async, wrap it into a function returning a Promise
    if (args.route) {
        args.asyncRoute = () => Promise.resolve(args.route)
    }

    // Parameter asyncRoute and each item of conditions must be functions
    if (typeof args.asyncRoute != 'function') {
        throw Error('Parameter asyncRoute must be a function')
    }
    if (args.conditions && args.conditions.length) {
        for (let i = 0; i < args.conditions.length; i++) {
            if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                throw Error('Invalid parameter conditions[' + i + ']')
            }
        }
    }

    // Check if we have a loading route
    if (args.loadingRoute) {
        args.asyncRoute.loading = args.loadingRoute
        args.asyncRoute.loadingParams = args.loadingParams || undefined
    }

    // Returns an object that contains all the functions to execute too
    // The _sveltesparouter flag is to confirm the object was created by this router
    const obj = {
        route: args.asyncRoute,
        userData: args.userData,
        conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
        _sveltesparouter: true
    }

    return obj
}

export default wrap
