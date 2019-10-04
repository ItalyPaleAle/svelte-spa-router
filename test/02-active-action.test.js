/*eslint-env mocha */

const assert = require('assert')

describe('use:active action', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(3000)

    it('active link', (browser) => {
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('ul.navigation-links')
            .elements('css selector', 'ul.navigation-links li a', (elements) => {
                assert(elements)
                assert.equal(elements.value.length, 4)

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
                assert.equal(elements.value.length, 4)

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

    it('active dynamic links', (browser) => {

        // Check if elements are still tagged active after one is removed
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('ul.navigation-dynamic-links')
            // delete second link
            .click('i[id=delete-link-2]')
            .pause(1000)
            // click second link
            .click('a[id=dynamic-link-1]')
            .pause(1000)
            //check for active class on link-1
            .expect.element('a[id=dynamic-link-1]').to.have.attribute('class').which.contains('active')
        browser.end()
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
