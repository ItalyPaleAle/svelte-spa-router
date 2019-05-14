import regexparam from 'regexparam'
import {getLocation} from './router.svelte'

// List of nodes to update
let nodes = []

// Current location
let location = getLocation()

// Function that updates all nodes marking the active ones
function checkActive(el) {
    // Remove the active class from all elements
    el.node.classList.remove(el.className)

    // If the pattern matches, then set the active class
    if (el.pattern.test(location)) {
        el.node.classList.add(el.className)
    }
}

// Listener that records the current active hash
window.addEventListener('hashchange', () => {
    // Get the updated value for location
    location = getLocation()

    // Update all nodes
    nodes.map(checkActive)
}, false)

/**
 * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
 * 
 * @param {HTMLElement} node - The target node (automatically set by Svelte)
 * @param {string} path - Path expression that makes the link active when matched (must start with '/' or '*')
 * @param {string} [className] - CSS class to apply to the element when active; default value is "active"
 */
export default function active(node, path, className) {
    // Default class name
    if (!className) {
        className = 'active'
    }

    // Path must start with '/' or '*'
    if (!path || path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*')) {
        throw Error('Invalid value for "path" argument')
    }

    // Get the regular expression
    const {pattern} = regexparam(path)

    // Add the node to the list
    const el = {
        node,
        className,
        pattern
    }
    nodes.push(el)

    // Trigger the action right away
    checkActive(el)

    return {
        // When the element is destroyed, remove it from the list
        destroy() {
            nodes = nodes.splice(nodes.indexOf(el), 1)
        }
    }
}
