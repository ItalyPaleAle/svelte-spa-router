// Increase max listeners to avoid a warning
require('events').EventEmitter.defaultMaxListeners = 100

module.exports = {
    src_folders: [
        'test/'
    ],

    webdriver: {
        start_process: true,
        server_path: 'node_modules/.bin/chromedriver',
        port: 9515
    },

    test_runner: {
        type: 'mocha',
        options: {
            ui: 'bdd'
        }
    },

    test_settings: {
        default: {
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: [
                        '--headless',
                        '--disable-gpu'
                    ]
                }
            }
        }
    }
}
