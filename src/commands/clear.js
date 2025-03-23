module.exports = {
    COMMAND: "clear",
    helpModal: {
        description: "Clear the terminal"
    },
    execute: (client, logSys, input, terminal, formatText) => {
        logSys.clear();
    }
}