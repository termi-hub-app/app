const _APP = require('../_APPINFO');

module.exports = {
    COMMAND: "about",
    helpModal: {
        description: "Show information about TermiHub",
        tags: [""]
    },
    execute: (client, logSys, input, terminal, formatText) => {
        logSys.log(
            formatText(
                `\n<bold>Version: <lime>${_APP.version.full}</lime></bold>\n` +
                `Website: <bold>${_APP.website}</bold>\n` +
                `GitHub: ${_APP.github}\n` +
                `<italic>Author(s): ${_APP.authors}</italic>\n`
            )
        );
    }
};
