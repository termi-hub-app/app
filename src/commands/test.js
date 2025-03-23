module.exports = {
    COMMAND: "test",
    helpModalIgnore: true,
    execute: (client, logSys, input, terminal, formatText) => {
        logSys.info("This is a test command");
        logSys.success("This is a test command");
        logSys.error("This is a test command");
        logSys.debug("This is a test command");
        logSys.log("This is a test command, LOG");
    }
};
