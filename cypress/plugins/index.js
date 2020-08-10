const getCompareSnapshotsPlugin = require("cypress-visual-regression/dist/plugin");

module.exports = (on, config) => {
    require("@cypress/code-coverage/task")(on, config);

    getCompareSnapshotsPlugin(on);

    return config;
};
