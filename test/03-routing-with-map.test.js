/*eslint-env mocha */

describe('<Router> component with routes in a Map', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(3000)

    it('renders on the page', (browser) => {
        browser
            .url('http://localhost:5000/?routemap=1')
            .expect.element('body').to.be.present.before(1000)

        browser
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')

        browser.end()
    })

    it('current path appears', (browser) => {
        browser
            .url('http://localhost:5000/?routemap=1')
            .waitForElementVisible('#currentpath')
            .expect.element('#currentpath').text.to.equal('/')

        browser.end()
    })

    it('route defined as string', (browser) => {
        // Main route
        browser
            .url('http://localhost:5000/?routemap=1#/')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')
            .expect.element('#currentpath').text.to.equal('/')
        browser.expect.element('#currentqs').text.to.equal('')

        // /hello/svelte
        browser
            .url('http://localhost:5000/?routemap=1#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('route defined as RegExp', (browser) => {
        // /^\/regex\/(.*)?/i
        browser
            .url('http://localhost:5000/?routemap=1#/REGEX/1')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Regex route')
            .expect.element('#currentpath').text.to.equal('/REGEX/1')
        browser.expect.element('#currentqs').text.to.equal('')
        browser.expect.element('#regexmatch').text.to.equal('["/REGEX/1","1"]')

        // /^\/(pattern|match)(\/[a-z0-9]+)?/i
        browser
            .url('http://localhost:5000/?routemap=1#/Match/hello/world')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Regex route')
            .expect.element('#currentpath').text.to.equal('/Match/hello/world')
        browser.expect.element('#currentqs').text.to.equal('')
        // This will end at /hello because /world starts with a slash. Since the regexp doesn't have a $ character, it still matches
        browser.expect.element('#regexmatch').text.to.equal('["/Match/hello","Match","/hello"]')

        // Should not match
        browser
            .url('http://localhost:5000/?routemap=1#/REGEX')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'NotFound')
            .expect.element('#currentpath').text.to.equal('/REGEX')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('querystring from hash', (browser) => {
        // /^\/(pattern|match)(\/[a-z0-9]+)?/i with querystring
        // Should only match ?hello=world and not ?routemap=1
        browser
            .url('http://localhost:5000/?routemap=1#/Match/hola?hello=world')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Regex route')
            .expect.element('#currentpath').text.to.equal('/Match/hola')
        browser.expect.element('#currentqs').text.to.equal('hello=world')
        browser.expect.element('#regexmatch').text.to.equal('["/Match/hola","Match","/hola"]')

        browser.end()
    })
})

