import regexparam from 'regexparam'
import {loc} from './Router.svelte'

// List of nodes to update
const nodes = []

// Current location
let location

// Function that updates all nodes marking the active ones
function checkActive(el) {
    // Remove the active class from all elements
    el.node.classList.remove(el.className)

    // If the pattern matches, then set the active class
    if (el.pattern.test(location)) {
        el.node.classList.add(el.className)
    }
}

// Listen to changes in the location
loc.subscribe((value) => {
    // Update the location
    location = value.location + (value.querystring ? '?' + value.querystring : '')

    // Update all nodes
    nodes.map(checkActive)
})

/**
 * @typedef {Object} ActiveOptions
 * @property {string} [path] - Path expression that makes the link active when matched (must start with '/' or '*'); default is the link's href
 * @property {string} [className] - CSS class to apply to the element when active; default value is "active"
 */

/**
 * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
 * 
 * @param {HTMLElement} node - The target node (automatically set by Svelte)
 * @param {ActiveOptions|string} [opts] - Can be an object of type ActiveOptions, or a string representing ActiveOptions.path.
 */
export default function active(node, opts) {
    // Check options
    if (opts && typeof opts == 'string') {
        // Interpret strings as opts.path
        opts = {
            path: opts
        }
    }
    else {
        // Ensure opts is a dictionary
        opts = opts || {}
    }

    // Path defaults to link target
    if (!opts.path && node.hasAttribute('href')) {
        opts.path = node.getAttribute('href')
        if (opts.path && opts.path.length > 1 && opts.path.charAt(0) == '#') {
            opts.path = opts.path.substring(1)
        }
    }

    // Default class name
    if (!opts.className) {
        opts.className = 'active'
    }

    // Path must start with '/' or '*'
    if (!opts.path || opts.path.length < 1 || (opts.path.charAt(0) != '/' && opts.path.charAt(0) != '*')) {
        throw Error('Invalid value for "path" argument')
    }

    // Get the regular expression
    const {pattern} = regexparam(opts.path)

    // Add the node to the list
    const el = {
        node,
        className: opts.className,
        pattern
    }
    nodes.push(el)

    // Trigger the action right away
    checkActive(el)

    return {
        // When the element is destroyed, remove it from the list
        destroy() {
            nodes.splice(nodes.indexOf(el), 1)
        }
    }
}
