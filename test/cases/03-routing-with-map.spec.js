import {test, expect} from '@playwright/test'

test.describe('<Router> component with routes in a Map', () => {
    test('renders on the page', async ({page}) => {
        await page.goto('/?routemap=1')
        await expect(page.locator('body')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Home!')
    })

    test('current path appears', async ({page}) => {
        await page.goto('/?routemap=1')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('#currentpath')).toHaveText('/')
    })

    test('route defined as string', async ({page}) => {
        // Main route
        await page.goto('/?routemap=1#/')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Home!')
        await expect(page.locator('#currentpath')).toHaveText('/')
        await expect(page.locator('#currentqs')).toHaveText('')

        // /hello/svelte
        await page.goto('/?routemap=1#/hello/svelte')
        await expect(page.locator('h2.routetitle')).toContainText('Hi there!')
        await expect(page.locator('#currentpath')).toHaveText('/hello/svelte')
        await expect(page.locator('#currentqs')).toHaveText('')
    })

    test('route defined as RegExp', async ({page}) => {
        // /^\/regex\/(.*)?/i
        await page.goto('/?routemap=1#/REGEX/1')
        await expect(page.locator('#currentpath')).toBeVisible()
        await expect(page.locator('h2.routetitle')).toContainText('Regex route')
        await expect(page.locator('#currentpath')).toHaveText('/REGEX/1')
        await expect(page.locator('#currentqs')).toHaveText('')
        await expect(page.locator('#regexmatch')).toHaveText('["/REGEX/1","1"]')
        await expect(page.locator('#currentparams')).toHaveText('["/REGEX/1","1"]')

        // /^\/(pattern|match)(\/[a-z0-9]+)?/i
        await page.goto('/?routemap=1#/Match/hello/world')
        await expect(page.locator('h2.routetitle')).toContainText('Regex route')
        await expect(page.locator('#currentpath')).toHaveText('/Match/hello/world')
        await expect(page.locator('#currentqs')).toHaveText('')
        // Ends at /hello because /world starts with a slash and the regex has no $
        await expect(page.locator('#regexmatch')).toHaveText('["/Match/hello","Match","/hello"]')

        // Should not match
        await page.goto('/?routemap=1#/REGEX')
        await expect(page.locator('h2.routetitle')).toContainText('NotFound')
        await expect(page.locator('#currentpath')).toHaveText('/REGEX')
        await expect(page.locator('#currentqs')).toHaveText('')
    })

    test('querystring from hash', async ({page}) => {
        // /^\/(pattern|match)(\/[a-z0-9]+)?/i with querystring
        // Should only match ?hello=world and not ?routemap=1
        await page.goto('/?routemap=1#/Match/hola?hello=world')
        await expect(page.locator('h2.routetitle')).toContainText('Regex route')
        await expect(page.locator('#currentpath')).toHaveText('/Match/hola')
        await expect(page.locator('#currentqs')).toHaveText('hello=world')
        await expect(page.locator('#regexmatch')).toHaveText('["/Match/hola","Match","/hola"]')
    })
})
