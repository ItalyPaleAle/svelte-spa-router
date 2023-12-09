// Selenium configuration
const seleniumHost = process.env.SELENIUM_HOST || '127.0.0.1'
const seleniumPort = parseInt(process.env.SELENIUM_PORT || '4444', 10)

// Launch URL - where the server is
const launchUrl = process.env.LAUNCH_URL || 'http://localhost:5050'

// Increase max listeners to avoid a warning
require('events').EventEmitter.defaultMaxListeners = 100

module.exports = {
    src_folders: [
        'test/cases/'
    ],

    output_folder: 'result',

    test_runner: {
        type: 'mocha',
        options: {
            ui: 'bdd',
            reporter: 'list'
        }
    },

    test_settings: {
        default: {
            launch_url: launchUrl
        },
        'selenium.chrome': {
            selenium: {
                start_process: false,
                host: seleniumHost,
                port: seleniumPort
            },
            webdriver: {
                start_process: false
            },
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: [
                        '--headless',
                        '--no-sandbox',
                        '--disable-gpu'
                    ]
                },
                acceptSslCerts: true
            }
        }
    }
}
