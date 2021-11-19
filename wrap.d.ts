import {SvelteComponent} from 'svelte'
import {AsyncSvelteComponent, RoutePrecondition, WrappedComponent} from './Router'

/** Options object for the call to `wrap` */
export interface WrapOptions {
    /** Svelte component to load (this is incompatible with `asyncComponent`) */ 
    component?: typeof SvelteComponent

    /** Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)  */
    asyncComponent?: AsyncSvelteComponent

    /** Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component */
    loadingComponent?: typeof SvelteComponent

    /** Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`) */
    loadingParams?: object

    /** Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed` */
    userData?: object

    /** Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop. */
    props?: object

    /** Route pre-conditions to add, which will be executed in order */
    conditions?: RoutePrecondition[] | RoutePrecondition
}

/**
 * Wraps a component to enable multiple capabilities:
 *
 * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
 * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
 * 3. Adding static props that are passed to the component
 * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
 * 
 * @param args Arguments object
 * @returns Wrapped component
 */
export function wrap(args: WrapOptions): WrappedComponent
export default wrap
