async function uninstall(themeName) {
    if (!(themeName in themes) || (['default', 'halloween', 'light'].includes(themeName))) {
        terminal.innerHTML += formatText(
        `\n\n<red>Erreur :</red> Impossible de désinstaller le thème <italic>${themeName}</italic>.` +
        `Ce thème ne peut pas être désinstallé.`
        );
        scrollToBottom();
        return;
    }

    delete themes[themeName];

    let installedThemes = [];
    if (fs.existsSync(themeInstallPath)) {
        const fileData = fs.readFileSync(themeInstallPath, 'utf8');
        const jsonContent = JSON.parse(fileData);
        installedThemes = jsonContent.installedThemes || [];
    }

    installedThemes = installedThemes.filter(theme => theme.name !== themeName);
    fs.writeFileSync(themeInstallPath, JSON.stringify({ installedThemes: installedThemes }, null, 2), 'utf8');
    terminal.innerHTML += formatText(`\n\nThème <green><strong>${themeName}</strong></green> désinstallé avec succès !`);
    scrollToBottom();
}

async function install(themeSource, logSys) {
    try {
        let themeData;
        const isTermTheme = themeSource.toLowerCase().endsWith('.termtheme');
        
        if (themeSource.startsWith('http')) {
            logSys.info(`Downloading theme from ${themeSource}...`);
            const response = await fetch(themeSource);
            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
            themeData = await response.json();
        } else {
            if (!fs.existsSync(themeSource)) {
                throw new Error('Theme file not found');
            }
            themeData = JSON.parse(fs.readFileSync(themeSource, 'utf8'));
        }

        if (!themeData.name || !themeData.properties) {
            throw new Error('Invalid theme format');
        }

        const themeName = themeData.name;
        if (client.THEME.themes[themeName]) {
            logSys.error(`Theme '${themeName}' is already installed`);
            return;
        }

        // Get base filename without extension
        const baseFilename = path.basename(themeSource).replace(/\.(termtheme|json)$/i, '');
        const themeFilePath = path.join(__dirname, '..', 'STORAGE', 'themes', `${baseFilename}.json`);
        
        fs.writeFileSync(themeFilePath, JSON.stringify(themeData, null, 2));
        client.THEME.themes[themeName] = themeData.properties;
        
        if (isTermTheme) {
            logSys.info(`Converted ${baseFilename}.termtheme to ${baseFilename}.json`);
        }
        logSys.success(`Theme '${themeName}' installed successfully`);

    } catch (error) {
        logSys.error(`Failed to install theme: ${error.message}`);
    }
}

function apply(themes, mode) {
    const theme = themes[mode];
    if (theme) {
        Object.keys(theme).forEach(property => {
            document.documentElement.style.setProperty(property, theme[property]);
        });
    }
}

function installedThemes() {
    const themeNames = Object.keys(themes);
    return themeNames.filter(theme => !['default', 'halloween', 'light'].includes(theme));
}

function load(andReturn = false) {
    if (fs.existsSync(themesDirPath)) {
        const themeFiles = fs.readdirSync(themesDirPath);
        themeFiles.forEach(file => {
            const filePath = path.join(themesDirPath, file);
            const data = fs.readFileSync(filePath, 'utf-8');
            const themeData = JSON.parse(data);
            if (themeData.name && themeData.properties) {
                themes[themeData.name] = themeData.properties;
            }
        });
    }

    if (andReturn) return themes;
}

module.exports = {
    COMMAND: "theme",
    execute: (client, logSys, input, terminal, formatText) => {
        const cmd = client.cmdin.args[0];
        const themeArg = client.cmdin.args[1];
        
        switch (cmd) {
            case 'list':
                const themes = Object.keys(client.THEME.themes);
                logSys.log(`Available themes: ${themes.join(', ')}`);
                break;
                
            case 'apply':
                if (!themeArg) {
                    logSys.error("Please provide a theme name");
                    return;
                }
                if (!client.THEME.themes[themeArg]) {
                    logSys.error(`Theme '${themeArg}' not found`);
                    return;
                }
                client.THEME.setTheme(themeArg);
                localStorage.setItem('themeMode', themeArg);
                logSys.success(`Applied theme: ${themeArg}`);
                break;

            case 'install':
                if (!themeArg) {
                    logSys.error("Please provide a theme URL or file path");
                    logSys.info("Usage: theme install <url|file>");
                    logSys.info("Examples:");
                    logSys.info("  theme install https://example.com/theme.json");
                    logSys.info("  theme install ./mytheme.termtheme");
                    return;
                }
                install(themeArg, logSys);
                break;
            default:
                logSys.error("Usage: theme <list|apply|install> [theme-name|url]");
        }
    }
};