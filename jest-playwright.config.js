module.exports = {
    devices: [
        {
            name: "Desktop",
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false,
            userAgent: "Chrome",
            viewport: {
                width: 800,
                height: 600,
            },
        },
        "iPhone 6",
    ],
    launchOptions: {
        headless: true,
        chromiumSandbox: false,
    },
    collectCoverage: true,
};
