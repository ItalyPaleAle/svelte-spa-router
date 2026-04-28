import {test, expect} from '@playwright/test'

test.describe('<Router> component', () => {
    test('renders on the page', async ({page}) => {
        await page.goto('/')
        await expect(page.locator('body')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Home!')
    })

    test('current path appears', async ({page}) => {
        await page.goto('/')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('#currentpath')).toHaveText('/')
    })

    test('selecting route from hash', async ({page}) => {
        // Main route
        await page.goto('/#/')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Home!')
        await expect(page.locator('#currentpath')).toHaveText('/')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('null')

        // /wild
        await page.goto('/#/wild')
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('null')

        // /hello/svelte
        await page.goto('/#/hello/svelte')
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('{"first":"svelte","last":null}')
    })

    test('loading page with hash', async ({page}) => {
        await page.goto('/#/hello/svelte')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('{"first":"svelte","last":null}')
    })

    test('refreshing page', async ({page}) => {
        await page.goto('/#/hello/svelte')
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('{"first":"svelte","last":null}')

        await page.reload()
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('{"first":"svelte","last":null}')
    })

    test('catch-all route', async ({page}) => {
        await page.goto('/#/does/not/exist')
        await expect(page.locator('h2.routetitle')).toContainText('NotFound')
        await expect(page.locator('#currentpath')).toHaveText('/does/not/exist')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('{"wild":"does/not/exist"}')
    })

    test('clicking on link', async ({page}) => {
        await page.goto('/#/')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await page.locator('.navigation-links a[href="#/hello/svelte"]').click()
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#nameparams')).toHaveText('Your name is: svelte')
    })

    test('clicking link with children', async ({page}) => {
        await page.goto('/#/hello/world')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await page.locator('.navigation-links li a b').first().click()
        await expect(page.locator('h2.routetitle')).toContainText('Home!')
        await expect(page.locator('#currentpath')).toHaveText('/brand')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#currentparams')).toHaveText('null')
    })

    test('back and forward buttons', async ({page}) => {
        await page.goto('/#/hello/svelte/user')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await expect(page.locator('#nameparams')).toHaveText('Your name is: svelte user')

        await page.locator('.navigation-links a[href="#/hello/svelte"]').click()
        await expect(page.locator('#nameparams')).toHaveText('Your name is: svelte')

        await page.goBack()
        await expect(page.locator('#nameparams')).toHaveText('Your name is: svelte user')

        await page.goForward()
        await expect(page.locator('#nameparams')).toHaveText('Your name is: svelte')
    })

    test('push method', async ({page}) => {
        await page.goto('/#/')
        await expect(page.locator('p.navigation-buttons')).toBeVisible()
        await page.locator('.navigation-buttons button:nth-of-type(1)').click()
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild/something')
        await expect(page.locator('#currentparams')).toHaveText('{"wild":"something"}')
        await expect(page).toHaveURL(/#\/wild\/something$/)
    })

    test('pop method', async ({page}) => {
        await page.goto('/#/wild/something')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await page.locator('.navigation-links a[href="#/hello/svelte"]').click()
        await expect(page.locator('p.navigation-buttons')).toBeVisible()
        await page.locator('.navigation-buttons button:nth-of-type(2)').click()
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild/something')
        await expect(page).toHaveURL(/#\/wild\/something$/)
    })

    test('replace method', async ({page}) => {
        await page.goto('/#/wild/something')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await page.locator('.navigation-links a[href="#/hello/svelte"]').click()
        await expect(page.locator('p.navigation-buttons')).toBeVisible()

        // Replace button
        await page.locator('.navigation-buttons button:nth-of-type(3)').click()
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild/replaced')
        await expect(page).toHaveURL(/#\/wild\/replaced$/)

        // Pop should skip the replaced entry and go back to /hello/svelte's predecessor (/wild/something)
        await page.locator('.navigation-buttons button:nth-of-type(2)').click()
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild/something')
        await expect(page).toHaveURL(/#\/wild\/something$/)
    })

    test('querystring from hash', async ({page}) => {
        await page.goto('/#/hello/svelte?search=query&sort=0')
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('search=query&sort=0')

        await page.reload()
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('search=query&sort=0')
    })

    test('routeLoaded event', async ({page}) => {
        await page.goto('/')
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/","location":"/","querystring":"","params":null}\n' +
                'routeLoaded - {"route":"/","location":"/","querystring":"","params":null,"name":"Home"}'
        )

        await page.goto('/#/hello/svelte')
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/","location":"/","querystring":"","params":null}\n' +
                'routeLoaded - {"route":"/","location":"/","querystring":"","params":null,"name":"Home"}\n' +
                'routeLoading - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null}}\n' +
                'routeLoaded - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null},"name":"Name"}'
        )
    })

    test('routeEvent event', async ({page}) => {
        await page.goto('/#/hello/svelte')
        await expect(page.locator('p#nameparams')).toBeVisible()
        await page.locator('p#nameparams').click()
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null}}\n' +
                'routeLoaded - {"route":"/hello/:first/:last?","location":"/hello/svelte","querystring":"","params":{"first":"svelte","last":null},"name":"Name"}\n' +
                'routeEvent - {"action":"hi","params":{"first":"svelte","last":null}}'
        )
    })

    test('routeEvent callback prop on wrapped route', async ({page}) => {
        await page.goto('/#/foo')
        await expect(page.locator('#fooeventtrigger')).toBeVisible()
        await page.locator('#fooeventtrigger').click()
        await expect(page.locator('#logbox')).toContainText(
            'routeEvent - {"action":"foo","staticProp":"this is static"}'
        )
    })

    test('route conditions', async ({page}) => {
        // Condition always passes (the route has an artificial 2 second delay)
        await page.goto('/#/lucky?pass=1')
        await expect(page.locator('#pleasewait')).toHaveText('Please wait…')
        await expect(page.locator('#loadingmessage')).toHaveText('Message is secret')
        await expect(page.locator('#lucky')).toBeVisible({timeout: 10_000})
        await expect(page.locator('#currentpath')).toHaveText('/lucky')
        await expect(page.locator('#lucky')).toHaveText("You're in!")

        // Condition always fails
        await page.goto('/#/lucky?pass=0')
        await expect(page.locator('h2.routetitle')).toContainText('Wild')
        await expect(page.locator('#currentpath')).toHaveText('/wild/conditions-failed')
        await expect(page.locator('#currentqs')).toHaveText('')
    })

    test('conditionsFailed event', async ({page}) => {
        // Condition always passes
        await page.goto('/#/lucky?pass=1')
        await expect(page.locator('#pleasewait')).toHaveText('Please wait…')
        await expect(page.locator('#loadingmessage')).toHaveText('Message is secret')
        await expect(page.locator('#lucky')).toBeVisible({timeout: 10_000})
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null}\n' +
                'routeLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":{"message":"secret"},"name":"Loading"}\n' +
                'routeLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null,"name":"Lucky"}'
        )

        // Condition always fails
        await page.goto('/#/lucky?pass=0')
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null}\n' +
                'routeLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":{"message":"secret"},"name":"Loading"}\n' +
                'routeLoaded - {"route":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"},"params":null,"name":"Lucky"}\n' +
                'conditionsFailed - {"route":"/lucky","location":"/lucky","querystring":"pass=0","userData":{"foo":"bar"},"params":null}\n' +
                'routeLoading - {"route":"/wild/*","location":"/wild/conditions-failed","querystring":"","params":{"wild":"conditions-failed"}}\n' +
                'routeLoaded - {"route":"/wild/*","location":"/wild/conditions-failed","querystring":"","params":{"wild":"conditions-failed"},"name":"Wild"}'
        )
    })

    test('parameter URL-decoding', async ({page}) => {
        await page.goto('/#/hello/Mr%20Smith')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toBeVisible()
        await expect(page.locator('#currentpath')).toHaveText('/hello/Mr%20Smith')
        await expect(page.locator('#nameparams')).toHaveText('Your name is: Mr Smith')

        // Invalid URL-encoded characters, should catch the exception
        await page.goto('/#/hello/Mr%2%0Smith')
        await expect(page.locator('#currentpath')).toHaveText('/hello/Mr%2%0Smith')
        await expect(page.locator('#nameparams')).toHaveText('Your name is: null')
    })

    test('use:link vars', async ({page}) => {
        await page.goto('/#/catalog/3')
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"}}\n' +
                'routeLoaded - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"},"name":"Catalog"}'
        )
        await expect(page.locator('#previous')).toHaveAttribute('href', /#\/catalog\/2$/)
        await expect(page.locator('#next')).toHaveAttribute('href', /#\/catalog\/4$/)

        await page.locator('#next').click()
        await expect(page.locator('#logbox')).toHaveText(
            'routeLoading - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"}}\n' +
                'routeLoaded - {"route":"/catalog/:id?","location":"/catalog/3","querystring":"","params":{"id":"3"},"name":"Catalog"}\n' +
                'routeLoading - {"route":"/catalog/:id?","location":"/catalog/4","querystring":"","params":{"id":"4"}}\n' +
                'routeLoaded - {"route":"/catalog/:id?","location":"/catalog/4","querystring":"","params":{"id":"4"},"name":"Catalog"}'
        )
        await expect(page.locator('#previous')).toHaveAttribute('href', /#\/catalog\/3$/)
        await expect(page.locator('#next')).toHaveAttribute('href', /#\/catalog\/5$/)
    })

    test('static props', async ({page}) => {
        await page.goto('/#/foo')
        await expect(page.locator('#staticprop')).toBeVisible()
        await expect(page.locator('#staticprop')).toHaveText('this is static')
    })

    test('scroll restoration with route conditions does not cause infinite loop', async ({page}) => {
        test.setTimeout(15_000)

        // Capture reactivity-loop console errors
        const reactivityErrors = []
        page.on('console', (msg) => {
            if (msg.type() !== 'error') {
                return
            }
            const text = msg.text()
            if (text.includes('effect_update_depth_exceeded') || text.includes('Maximum update depth exceeded')) {
                reactivityErrors.push(text)
            }
        })

        // Navigate to a route with conditions while scroll restoration is enabled
        await page.goto('/?scroll=1#/lucky?pass=1')
        await expect(page.locator('#lucky')).toBeVisible({timeout: 8000})
        await expect(page.locator('#currentpath')).toHaveText('/lucky')

        // Navigate to another route and back
        await page.locator('.navigation-links a[href="#/hello/svelte"]').click()
        await expect(page.locator('#nameparams')).toBeVisible()
        await page.goBack()
        await expect(page.locator('#lucky')).toBeVisible({timeout: 8000})
        await expect(page.locator('#currentpath')).toHaveText('/lucky')

        expect(reactivityErrors, 'No reactivity loop errors').toEqual([])
    })
})
