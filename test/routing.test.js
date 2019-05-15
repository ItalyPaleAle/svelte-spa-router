/*eslint-env mocha */

const assert = require('assert')

describe('<Router> component', () => {
    it.skip('renders on the page', (browser) => {
        browser
            .url('http://localhost:5000')
            .expect.element('body').to.be.present.before(1000)

        browser
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')

        browser.end()
    })

    it.skip('current path appears', (browser) => {
        browser
            .url('http://localhost:5000')
            .waitForElementVisible('#currentpath')
            .expect.element('#currentpath').text.to.equal('/')

        browser.end()
    })

    it.skip('selecting route from hash', (browser) => {
        // Main route
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')
            .expect.element('#currentpath').text.to.equal('/')

        // /wild
        browser
            .url('http://localhost:5000/#/wild')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild')

        // /hello/svelte
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')

        browser.end()
    })

    it.skip('loading page with hash', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')

        browser.end()
    })

    it.skip('refreshing page', (browser) => {
        // /hello/svelte
        browser
            .url('http://localhost:5000/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')

                browser.end()
            })
    })

    it.skip('catch-all route', (browser) => {
        browser
            .url('http://localhost:5000/#/does/not/exist')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'NotFound')
            .expect.element('#currentpath').text.to.equal('/does/not/exist')

        browser.end()
    })

    it.skip('clicking on link', (browser) => {
        browser
            .url('http://localhost:5000/#/')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')

                browser
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                browser.end()
            })
    })

    it.skip('back and forward buttons', (browser) => {
        browser
            .url('http://localhost:5000/#/hello/svelte/user')
            .waitForElementVisible('ul.navigation-links')
            .expect.element('#nameparams').text.to.equal('Your name is: svelte user')

        // Click on link
        browser
            .click('.navigation-links a[href="/hello/svelte"]', () => {
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

    it.skip('push method', (browser) => {
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

    it.skip('pop method', (browser) => {
        // Click on link
        browser
            .url('http://localhost:5000/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="/hello/svelte"]', () => {
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

    it.skip('replace method', (browser) => {
        // Click on link
        browser
            .url('http://localhost:5000/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="/hello/svelte"]', () => {
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
})

