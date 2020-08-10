import "@cypress/code-coverage/support";

const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

compareSnapshotCommand();
