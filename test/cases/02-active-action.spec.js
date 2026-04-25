import {test, expect} from '@playwright/test'

test.describe('use:active action', () => {
    test('active link', async ({page}) => {
        await page.goto('/#/')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await expect(page.locator('ul.navigation-links li a')).toHaveCount(4)
        await expect(page.locator('ul.navigation-links li a.active[href="#/"]')).toHaveCount(1)
    })

    test('active link with custom path', async ({page}) => {
        await page.goto('/#/hello/world')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        await expect(page.locator('ul.navigation-links li a')).toHaveCount(4)
        // The href on the link is different from the path making the link active
        await expect(page.locator('ul.navigation-links li a.active[href="#/hello/svelte"]')).toHaveCount(1)
    })

    test('active dynamic links', async ({page}) => {
        await page.goto('/#/')
        await expect(page.locator('ul.navigation-dynamic-links')).toBeVisible()

        // Delete second link
        await page.locator('i#delete-link-2').click()
        // Click first link
        await page.locator('a#dynamic-link-1').click()
        // Check for active class on link-1
        await expect(page.locator('a#dynamic-link-1')).toHaveClass(/active/)
    })

    test('inactive class', async ({page}) => {
        await page.goto('/#/hello/world')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        // There should be no inactive class when link is active
        await expect(page.locator('ul.navigation-links li a.inactive')).toHaveCount(0)

        await page.goto('/#/notfound')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        // There should be an inactive class when link is not active
        await expect(page.locator('ul.navigation-links li a.inactive')).toHaveCount(1)
    })

    test('navigating pages', async ({page}) => {
        await page.goto('/#/hello/world')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        // There should be just one element active
        await expect(page.locator('ul.navigation-links li a.active[href="#/hello/svelte"]')).toHaveCount(1)

        await page.goto('/#/notfound')
        await expect(page.locator('ul.navigation-links')).toBeVisible()
        // There should be no active links
        await expect(page.locator('ul.navigation-links li a.active')).toHaveCount(0)
    })
})
