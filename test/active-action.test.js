/*eslint-env mocha */

const assert = require('assert')

describe('use:active action', () => {
    it('active link', (browser) => {
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('ul.navigation-links')
            .elements('css selector', 'ul.navigation-links li a', (elements) => {
                assert(elements)
                assert.equal(elements.value.length, 3)

                // Check which elements are active
                browser
                    .elements('css selector', 'ul.navigation-links li a.active[href="/"]', (elements) => {
                        assert(elements)
                        assert.equal(elements.value.length, 1)

                        browser.end()
                    })
            })
    })

    it('active link with custom path', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            .elements('css selector', 'ul.navigation-links li a', (elements) => {
                assert(elements)
                assert.equal(elements.value.length, 3)

                // Check which elements are active
                // The href on the link is different from the path making the link active
                browser
                    .elements('css selector', 'ul.navigation-links li a.active[href="/hello/svelte"]', (elements) => {
                        assert(elements)
                        assert.equal(elements.value.length, 1)

                        browser.end()
                    })
            })
    })

    it('navigating pages', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            // There should be just one element active
            .elements('css selector', 'ul.navigation-links li a.active[href="/hello/svelte"]', (elements) => {
                assert(elements)
                assert.equal(elements.value.length, 1)

                browser
                    .url('http://localhost:5000/#/notfound')
                    .waitForElementVisible('ul.navigation-links')
                    // There should be no active links
                    .elements('css selector', 'ul.navigation-links li a.active', (elements) => {
                        assert(elements)
                        assert.equal(elements.value.length, 0)

                        browser.end()
                    })
            })
    })
})
