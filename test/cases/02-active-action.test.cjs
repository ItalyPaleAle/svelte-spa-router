/*eslint-env mocha */

const assert = require('assert')

describe('use:active action', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(3000)

    it('active link', (browser) => {
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('ul.navigation-links')
            .elements('css selector', 'ul.navigation-links li a', (elements) => {
                assert(elements)
                assert.strictEqual(elements.value.length, 4)

                // Check which elements are active
                browser
                    .elements('css selector', 'ul.navigation-links li a.active[href="#/"]', (elements) => {
                        assert(elements)
                        assert.strictEqual(elements.value.length, 1)
                    })
            })
    })

    it('active link with custom path', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            .elements('css selector', 'ul.navigation-links li a', (elements) => {
                assert(elements)
                assert.strictEqual(elements.value.length, 4)

                // Check which elements are active
                // The href on the link is different from the path making the link active
                browser
                    .elements('css selector', 'ul.navigation-links li a.active[href="#/hello/svelte"]', (elements) => {
                        assert(elements)
                        assert.strictEqual(elements.value.length, 1)
                    })
            })
    })

    it('active dynamic links', (browser) => {
        // Check if elements are still tagged active after one is removed
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('ul.navigation-dynamic-links')
            // delete second link
            .click('i[id=delete-link-2]')
            .pause(1000)
            // click second link
            .click('a[id=dynamic-link-1]')
            .pause(1000)
            //check for active class on link-1
          .expect.element('a[id=dynamic-link-1]').to.have.attribute('class').which.contains('active')
    })

    it('inactive class', (browser) => {
        // Check if inactive class is toggled
        browser
            .url(browser.launchUrl + '/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            // There should be no inactive class when link is active
            .elements('css selector', 'ul.navigation-links li a.inactive', (elements) => {
                assert(elements)
                assert.strictEqual(elements.value.length, 0)

                browser
                    .url(browser.launchUrl + '/#/notfound')
                    .waitForElementVisible('ul.navigation-links')
                    // There should an inactive class when link is not active
                    .elements('css selector', 'ul.navigation-links li a.inactive', (elements) => {
                        assert(elements)
                        assert.strictEqual(elements.value.length, 1)
                    })
            })
    })

    it('navigating pages', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            // There should be just one element active
            .elements('css selector', 'ul.navigation-links li a.active[href="#/hello/svelte"]', (elements) => {
                assert(elements)
                assert.strictEqual(elements.value.length, 1)

                browser
                    .url(browser.launchUrl + '/#/notfound')
                    .waitForElementVisible('ul.navigation-links')
                    // There should be no active links
                    .elements('css selector', 'ul.navigation-links li a.active', (elements) => {
                        assert(elements)
                        assert.strictEqual(elements.value.length, 0)
                    })
            })
    })
})
