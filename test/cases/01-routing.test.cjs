/*eslint-env mocha */

const assert = require('assert')

describe('<Router> component', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(4000)

    it('renders on the page', (browser) => {
        browser
            .url(browser.launchUrl)
            .expect.element('body').to.be.present.before(1000)

        browser
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Home!')
    })

    it('current path appears', (browser) => {
        browser
            .url(browser.launchUrl)
            .waitForElementVisible('#currentpath')
            .expect.element('#currentpath').text.to.equal('/')
    })

    it('selecting route from hash', (browser) => {
        // Main route
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Home!')
            .expect.element('#currentpath').text.to.equal('/')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('null')

        // /wild
        browser
            .url(browser.launchUrl + '/#/wild')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('null')

        // /hello/svelte
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('{"first":"svelte","last":null}')
    })

    it('loading page with hash', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('{"first":"svelte","last":null}')
    })

    it('refreshing page', (browser) => {
        // /hello/svelte
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('{"first":"svelte","last":null}')
        
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.textContains('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('')
                browser.expect.element('#currentparams').text.to.equal('{"first":"svelte","last":null}')
            })
    })

    it('catch-all route', (browser) => {
        browser
            .url(browser.launchUrl + '/#/does/not/exist')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'NotFound')
            .expect.element('#currentpath').text.to.equal('/does/not/exist')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#currentparams').text.to.equal('{"wild":"does/not/exist"}')
    })

    it('clicking on link', (browser) => {
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.textContains('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')

                browser
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')
            })
    })

    it('clicking link with children', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links li a b', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.textContains('h2.routetitle', 'Home!')
                    .expect.element('#currentpath').text.to.equal('/brand')
                browser.expect.element('#currentqs').text.to.equal('')
                browser.expect.element('#currentparams').text.to.equal('null')
            })
    })

    it('back and forward buttons', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/svelte/user')
            .waitForElementVisible('ul.navigation-links')
            .expect.element('#nameparams').text.to.equal('Your name is: svelte user')

        // Click on link
        browser
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('#nameparams')
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                // Hit back button
                browser
                    .back(() => {
                        browser
                            .waitForElementVisible('#nameparams')
                            .expect.element('#nameparams').text.to.equal('Your name is: svelte user')

                        // Hit the forward button
                        browser
                            .forward(() => {
                                browser
                                    .waitForElementVisible('#nameparams')
                                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')
                            })
                    })
            })
    })

    it('push method', (browser) => {
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('p.navigation-buttons')
            .click('.navigation-buttons button:nth-of-type(1)', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.textContains('h2.routetitle', 'Wild')
                    .expect.element('#currentpath').text.to.equal('/wild/something')
                browser.expect.element('#currentparams').text.to.equal('{"wild":"something"}')

                browser.url((url) => {
                    assert.strictEqual(url.value, browser.launchUrl + '/#/wild/something')
                })
            })
    })

    it('pop method', (browser) => {
        // Click on link
        browser
            .url(browser.launchUrl + '/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Pop button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(2)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.textContains('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/something')

                        browser.url((url) => {
                            assert.strictEqual(url.value, browser.launchUrl + '/#/wild/something')
                        })
                    })
            })
    })

    it('replace method', (browser) => {
        // Click on link
        browser
            .url(browser.launchUrl + '/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Replace button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(3)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.textContains('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/replaced')

                        browser.url((url) => {
                            assert.strictEqual(url.value, browser.launchUrl + '/#/wild/replaced')

                            // Pop button
                            browser
                                .waitForElementVisible('p.navigation-buttons')
                                .click('.navigation-buttons button:nth-of-type(2)', () => {
                                    browser
                                        .waitForElementVisible('h2.routetitle')
                                        .assert.textContains('h2.routetitle', 'Wild')
                                        .expect.element('#currentpath').text.to.equal('/wild/something')

                                    browser.url((url) => {
                                        assert.strictEqual(url.value, browser.launchUrl + '/#/wild/something')

                                      // Ugh the callback hell...
                                    })
                                })
                        })
                    })
            })
    })

    it('querystring from hash', (browser) => {
        // /hello/svelte?search=query&sort=0
        browser
            .url(browser.launchUrl + '/#/hello/svelte?search=query&sort=0')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')

        // Refresh the page
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.textContains('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')
            })
    })

    it('routeLoaded event', (browser) => {
        browser
            .url(browser.launchUrl)
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/","location":"/","querystring":"","params":null}\nrouteLoaded - {"route":"/","location":"/","querystring":"","params":null,"name":"Home"}')

        browser.url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/","location":"/","querystring":"","params":null}\nrouteLoaded - {"route":"/","location":"/","querystring":"","params":null,"name":"Home"}\nrouteLoading - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null}}\nrouteLoaded - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null},"name":"Name"}')
    })

    it('routeEvent event', async (browser) => {
        await browser.url('about:blank')

        // Click on the p that triggers a "routeEvent" event
        browser.url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementPresent('p#nameparams')
            .waitForElementPresent('#logbox')
            .click('p#nameparams', () => {
                browser
                    .waitForElementPresent('#logbox')
                    .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null}}\nrouteLoaded - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null},"name":"Name"}\nrouteEvent - {"action":"hi","params":{"first":"svelte","last":null}}')
            })
    })

    it('route conditions', (browser) => {
        // The route has an artificial 2 second delay that should only happen when the condition passes
        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/lucky?pass=1')
            .expect.element('#pleasewait').text.to.equal('Please wait…')
        browser.expect.element('#loadingmessage').text.to.equal('Message is secret')
        browser.waitForElementVisible('#lucky')
            .expect.element('#currentpath').text.to.equal('/lucky')
        browser.expect.element('#lucky').text.to.equal('You\'re in!')

        // Condition always fails
        browser.url(browser.launchUrl + '/#/lucky?pass=0')
            .waitForElementVisible('h2.routetitle')
            .assert.textContains('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild/conditions-failed')
        browser.expect.element('#currentqs').text.to.equal('')
    })

    it('conditionsFailed event', async (browser) => {
        await browser.url('about:blank')

        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/lucky?pass=1')
            .expect.element('#pleasewait').text.to.equal('Please wait…')
        browser.expect.element('#loadingmessage').text.to.equal('Message is secret')
        browser.waitForElementPresent('#lucky')
            .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null}\nrouteLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":{"message":"secret"},"name":"Loading"}\nrouteLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null,"name":"Lucky"}')

        // Condition always fails
        browser.url(browser.launchUrl + '/#/lucky?pass=0')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null}\nrouteLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":{"message":"secret"},"name":"Loading"}\nrouteLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null,"name":"Lucky"}\nconditionsFailed - {"route":"/lucky","location":"/lucky","querystring":"pass=0","userData":{"foo":"bar"},"params":null}\nrouteLoading - {"route":"/wild/*","location":"/wild/conditions-failed","querystring":"","params":{"wild":"conditions-failed"}}\nrouteLoaded - {"route":"/wild/*","location":"/wild/conditions-failed","querystring":"","params":{"wild":"conditions-failed"},"name":"Wild"}')
    })

    it('parameter URL-decoding', async (browser) => {
        await browser.url('about:blank')

        browser
            .url(browser.launchUrl + '/#/hello/Mr%20Smith')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
        browser.expect.element('#currentpath').text.to.equal('/hello/Mr%20Smith')
        browser.expect.element('#nameparams').text.to.equal('Your name is: Mr Smith')

        // Invalid URL-encoded characters, should catch the exception
        browser
            .url(browser.launchUrl + '/#/hello/Mr%2%0Smith')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
        browser.expect.element('#currentpath').text.to.equal('/hello/Mr%2%0Smith')
      browser.expect.element('#nameparams').text.to.equal('Your name is: null')
    })

    it('use:link vars', async (browser) => {
        await browser.url('about:blank')

        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/catalog/3')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"}}\nrouteLoaded - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"},"name":"Catalog"}')
        browser.expect.element('#previous').attribute('href').to.endsWith('#/catalog/2')
        browser.expect.element('#next').attribute('href').to.endsWith('#/catalog/4')
        browser.click('#next', () => {
            browser.waitForElementVisible('#logbox')
                .expect.element('#logbox').text.to.equal('routeLoading - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"}}\nrouteLoaded - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"},"name":"Catalog"}\nrouteLoading - {"route":"/catalog/:id?","location":"/catalog/4","querystring":"","params":{"id":"4"}}\nrouteLoaded - {"route":"/catalog/:id?","location":"/catalog/4","querystring":"","params":{"id":"4"},"name":"Catalog"}')
            browser.expect.element('#previous').attribute('href').to.endsWith('#/catalog/3')
            browser.expect.element('#next').attribute('href').to.endsWith('#/catalog/5')
      })
    })

    it('static props', (browser) => {
        browser
            .url(browser.launchUrl + '/#/foo')
            .waitForElementVisible('#staticprop')
            .expect.element('#staticprop').text.to.equal('this is static')
    })
})
