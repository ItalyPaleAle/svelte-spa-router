import {defineConfig, devices} from '@playwright/test'

const PORT = 5050
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
    testDir: './test/cases',
    testMatch: '**/*.spec.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI ? [['github'], ['html']] : 'list',
    use: {
        baseURL,
        trace: 'on-first-retry'
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']}
        }
    ],
    webServer: {
        command: `pnpm --dir test/app preview --port ${PORT} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
