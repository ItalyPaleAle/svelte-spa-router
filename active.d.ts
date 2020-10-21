interface ActiveOptions {
    path: string | RegExp;
    className: string;
}

/**
 * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
 * 
 * @param node - The target node (automatically set by Svelte)
 * @param opts - Can be an object of type ActiveOptions, or a string (or regular expressions) representing ActiveOptions.path.
 * @returns Destroy function
 */
export declare function active(node: HTMLElement,opt?: ActiveOptions | string | RegExp): {destroy: () => void};