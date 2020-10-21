import { SvelteComponent } from 'svelte'
import { RouteDetail } from './Router'

interface WrappedComponent {
    component: SvelteComponent;
    conditions?: RoutePrecondition[];
    props?: {};
    userData?: {};
    _sveltesparouter: boolean;
}

type RoutePrecondition = (detail: any) => boolean

interface WarpOptions {
    component?: SvelteComponent;
    asyncComponent?: () => Promise<SvelteComponent>;
    loadingComponent?: SvelteComponent;
    loadingParams?: SvelteComponent;
    userData?: {};
    props?: {};
    conditions?: ((detail: RouteDetail) => boolean)[] | ((detail: RouteDetail) => boolean);
}
/**
 * Wraps a component to enable multiple capabilities:
 * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
 * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
 * 3. Adding static props that are passed to the component
 * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
 * 
 * @param args - Arguments object
 * @returns Wrapped component
 */
export declare function warp(args:WarpOptions):WrappedComponent;
export default warp;