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

async function install(themeName) {
    const themeUrl = 'https://termi-hub-app.github.io/assets/themes.json';
    const startTime = Date.now();
    try {
        const response = await fetch(themeUrl);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        const data = await response.json();
        terminal.innerHTML += formatText(`\n\n<purple>Installation du theme ${themeName}...</purple>`);
        if (data.themes && data.themes[themeName]) {
            const newTheme = {
                name: themeName,
                properties: data.themes[themeName]
            };

            if (themes[themeName]) {
                terminal.innerHTML += formatText(`\n\n<red>Erreur :</red> Le thème <italic>${themeName}</italic> est déjà installé.`);
                scrollToBottom();
                return;
            }

            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2); 
            themes[themeName] = newTheme.properties;
            terminal.innerHTML += formatText(`\n\nThème <green><strong>${themeName}</strong></green> installé avec succès !`);

            const themeFilePath = path.join(themesDirPath, `${themeName}.json`);
            fs.writeFileSync(themeFilePath, JSON.stringify(newTheme, null, 2), 'utf8');
        } else {
            terminal.innerHTML += formatText(`\n\n<red>Erreur :</red> Thème non trouvé : <italic>${themeName}</italic>`);
        }
    } catch (error) {
        terminal.innerHTML += formatText(`\n\n<red>Erreur :</red> Impossible de récupérer le thème : ${error.message}`);
    }
    scrollToBottom();
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
        const themeName = client.cmdin.args[1];
        const themePath = path.join(__dirname, '..', 'STORAGE', 'themes');
        
        switch (cmd) {
            case 'list':
                const themes = Object.keys(client.THEME.themes);
                logSys.log(`Available themes: ${themes.join(', ')}`);
                break;
                
            case 'apply':
                if (!themeName) {
                    logSys.error("Please provide a theme name");
                    return;
                }
                if (!client.THEME.themes[themeName]) {
                    logSys.error(`Theme '${themeName}' not found`);
                    return;
                }
                client.THEME.setTheme(themeName);
                localStorage.setItem('themeMode', themeName);
                logSys.success(`Applied theme: ${themeName}`);
                break;
            default:
                logSys.error("Usage: theme [list|apply] [theme-name]");
        }
    }
};