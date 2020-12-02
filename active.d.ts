/** Options for the `active` action */
interface ActiveOptions {
    /** Path to match; if empty, will default to the link's target */
    path?: string | RegExp

    /** Name of the CSS class to add when the route is active; default is "active" */
    className?: string

    /** Name of the CSS class to add when the route is inactive; nothing added by default */
    inactiveClassName?: string
}

/**
 * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
 * 
 * @param node - The target node (automatically set by Svelte)
 * @param opts - Can be an object of type `ActiveOptions`, or a string (or regular expressions) representing `ActiveOptions.path`.
 * @returns Destroy function
 */
export default function active(
    node: HTMLElement,
    opt?: ActiveOptions | string | RegExp
): {destroy: () => void}
