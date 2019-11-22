/*eslint-env mocha */

const assert = require('assert')

describe('<Router> component', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(3000)

    it('renders on the page', (browser) => {
        browser
            .url('http://localhost:5000')
            .expect.element('body').to.be.present.before(1000)

        browser
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')

        browser.end()
    })

    it('current path appears', (browser) => {
        browser
            .url('http://localhost:5000')
            .waitForElementVisible('#currentpath')
            .expect.element('#currentpath').text.to.equal('/')

        browser.end()
    })

    it('selecting route from hash', (browser) => {
        // Main route
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')
            .expect.element('#currentpath').text.to.equal('/')
        browser.expect.element('#currentqs').text.to.equal('')

        // /wild
        browser
            .url('http://localhost:5000/#/wild')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild')
        browser.expect.element('#currentqs').text.to.equal('')

        // /hello/svelte
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('loading page with hash', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('refreshing page', (browser) => {
        // /hello/svelte
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')
        
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('')

                browser.end()
            })
    })

    it('catch-all route', (browser) => {
        browser
            .url('http://localhost:5000/#/does/not/exist')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'NotFound')
            .expect.element('#currentpath').text.to.equal('/does/not/exist')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('clicking on link', (browser) => {
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')

                browser
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                browser.end()
            })
    })

    it('clicking link with children', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links li a b', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Home!')
                    .expect.element('#currentpath').text.to.equal('/brand')
                browser.expect.element('#currentqs').text.to.equal('')
            })
    })

    it('back and forward buttons', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/svelte/user')
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

                                browser.end()
                            })
                    })
            })
    })

    it('push method', (browser) => {
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('p.navigation-buttons')
            .click('.navigation-buttons button:nth-of-type(1)', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Wild')
                    .expect.element('#currentpath').text.to.equal('/wild/something')

                browser.url((url) => {
                    assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                    browser.end()
                })
            })
    })

    it('pop method', (browser) => {
        // Click on link
        browser
            .url('http://localhost:5000/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Pop button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(2)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.containsText('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/something')

                        browser.url((url) => {
                            assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                            browser.end()
                        })
                    })
            })
    })

    it('replace method', (browser) => {
        // Click on link
        browser
            .url('http://localhost:5000/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Replace button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(3)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.containsText('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/replaced')

                        browser.url((url) => {
                            assert.equal(url.value, 'http://localhost:5000/#/wild/replaced')

                            // Pop button
                            browser
                                .waitForElementVisible('p.navigation-buttons')
                                .click('.navigation-buttons button:nth-of-type(2)', () => {
                                    browser
                                        .waitForElementVisible('h2.routetitle')
                                        .assert.containsText('h2.routetitle', 'Wild')
                                        .expect.element('#currentpath').text.to.equal('/wild/something')

                                    browser.url((url) => {
                                        assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                                        // Ugh the callback hell...
                                        browser.end()
                                    })
                                })
                        })
                    })
            })
    })

    it('querystring from hash', (browser) => {
        // /hello/svelte?search=query&sort=0
        browser
            .url('http://localhost:5000/#/hello/svelte?search=query&sort=0')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')

        // Refresh the page
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')

                browser.end()
            })
    })

    it('routeLoaded event', (browser) => {
        browser
            .url('http://localhost:5000')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Home","location":"/","querystring":""}')

        browser.url('http://localhost:5000/#/hello/svelte')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Home","location":"/","querystring":""}\nrouteLoaded - {"name":"Name","location":"/hello/svelte","querystring":""}')

        browser.end()
    })

    it('route conditions', (browser) => {
        // Condition always passes
        browser
            .url('http://localhost:5000/#/lucky?pass=1')
            .waitForElementVisible('#lucky')
            .expect.element('#currentpath').text.to.equal('/lucky')
        browser.expect.element('#lucky').text.to.equal('You\'re in!')

        // Condition always fails
        browser.url('http://localhost:5000/#/lucky?pass=0')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild/conditions-failed')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('conditionsFailed event', (browser) => {
        // Condition always passes
        browser
            .url('http://localhost:5000/#/lucky?pass=1')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"}}')

        // Condition always fails
        browser.url('http://localhost:5000/#/lucky?pass=0')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"}}\nconditionsFailed - {"name":"Lucky","location":"/lucky","querystring":"pass=0","userData":{"foo":"bar"}}\nrouteLoaded - {"name":"Wild","location":"/wild/conditions-failed","querystring":""}')

        browser.end()
    })
})

