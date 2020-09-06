// Increase max listeners to avoid a warning
require('events').EventEmitter.defaultMaxListeners = 100

module.exports = {
    src_folders: [
        'test/'
    ],

    output_folder: 'result',

    webdriver: {
        start_process: true,
        // Use the platform's ChromeDriver if available
        server_path: process.env.CHROMEWEBDRIVER || 'node_modules/.bin/chromedriver',
        port: 9515
    },

    test_runner: {
        type: 'mocha',
        options: {
            ui: 'bdd',
            reporter: 'list'
        }
    },

    test_settings: {
        default: {
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: [
                        '--headless',
                        '--no-sandbox',
                        '--disable-gpu'
                    ]
                }
            }
        }
    }
}
