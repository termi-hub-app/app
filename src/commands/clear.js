module.exports = {
    COMMAND: "clear",
    execute: (client, logSys, input, terminal, formatText) => {
        logSys.log("Available commands:");
        
        const cmdFiles = fs.readdirSync(path.join(__dirname))
            .filter(file => file.endsWith('.js'));
        
        for (const file of cmdFiles) {
            const module = require(`./${file}`);
            if (module.helpModal) logSys.log(`- ${module.helpModal.tags[0]} ${module.COMMAND}: ${module.helpModal.description}`);
            else logSys.log(`- ${module.COMMAND}`);
        }
    }
}