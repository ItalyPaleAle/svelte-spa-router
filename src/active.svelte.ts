import {parse} from 'regexparam'
import {router} from './Router.svelte'
import type {ActiveOptions} from './types.js'

export type {ActiveOptions} from './types.js'

interface ActiveNode {
    node: HTMLElement
    className: string
    inactiveClassName?: string
    pattern: RegExp
}

// List of nodes to update
const nodes: ActiveNode[] = []

// Current location
let location = ''

// Function that updates all nodes marking the active ones
function checkActive(el: ActiveNode): void {
    const matchesLocation = el.pattern.test(location)
    toggleClasses(el, el.className, matchesLocation)
    toggleClasses(el, el.inactiveClassName, !matchesLocation)
}

function toggleClasses(el: ActiveNode, className: string | undefined, shouldAdd: boolean): void {
    ;(className || '').split(' ').forEach((cls) => {
        if (!cls) {
            return
        }
        // Remove the class first
        el.node.classList.remove(cls)

        // If the pattern matches, then set the class
        if (shouldAdd) {
            el.node.classList.add(cls)
        }
    })
}

// Listen to changes in the location
$effect.root(() => {
    $effect(() => {
        const value = router.loc
        // Update the location
        location = value.location + (value.querystring ? '?' + value.querystring : '')

        // Update all nodes
        nodes.map(checkActive)
    })
})

/**
 * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
 *
 * @param node - The target node (automatically set by Svelte)
 * @param opts - Can be an object of type `ActiveOptions`, or a string (or regular expression) representing `ActiveOptions.path`.
 * @returns Destroy function
 */
export default function active(node: HTMLElement, opts?: ActiveOptions | string | RegExp): {destroy(): void} {
    // Normalize opts: strings and regular expressions become opts.path
    let options: ActiveOptions
    if (typeof opts == 'string' || opts instanceof RegExp) {
        options = {path: opts}
    } else {
        options = opts ?? {}
    }

    // Path defaults to link target
    if (!options.path && node.hasAttribute('href')) {
        const href = node.getAttribute('href')
        if (href) {
            options.path = href.length > 1 && href.charAt(0) == '#' ? href.substring(1) : href
        }
    }

    // Default class name
    if (!options.className) {
        options.className = 'active'
    }

    // If path is a string, it must start with '/' or '*'
    if (
        !options.path ||
        (typeof options.path == 'string' &&
            (options.path.length < 1 || (options.path.charAt(0) != '/' && options.path.charAt(0) != '*')))
    ) {
        throw Error('Invalid value for "path" argument')
    }

    // If path is not a regular expression already, make it
    const pattern = typeof options.path == 'string' ? parse(options.path).pattern : options.path

    // Add the node to the list
    const el: ActiveNode = {
        node,
        className: options.className,
        inactiveClassName: options.inactiveClassName,
        pattern
    }
    nodes.push(el)

    // Trigger the action right away
    checkActive(el)

    return {
        // When the element is destroyed, remove it from the list
        destroy(): void {
            nodes.splice(nodes.indexOf(el), 1)
        }
    }
}
