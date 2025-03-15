module.exports = {
    COMMAND: "test",
    helpModal: {
        description: "This is a test command",
        tags: ["LOREM"]
    },
    execute: (client, logSys, input, terminal, formatText) => {
        logSys.info("This is a test command");
    }
};
