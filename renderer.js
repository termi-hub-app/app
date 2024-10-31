const terminal = document.getElementById('terminal');
const path = require('path');
const fs = require('fs');
const input = document.getElementById('input');
const formatTextWithStyles = require('./src/utils/formatTextWithStyles');


let commandHistory = [];
let historyIndex = -1;

function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

function showWelcomeMessage() {
    terminal.innerHTML += formatTextWithStyles(`<br><strong>Bienvenue sur <underline>TermHub <italic>1.0.0-b3</italic></underline></strong> !<br><strong>Mode actuel :</strong> <green>${currentMode}</green><br><strong>Tapez <green>?</green> pour avoir de l\'aide</strong>`);
    scrollToBottom(); 
}

document.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('themeMode') || 'default';
    applyTheme(themes,savedMode); 
    showWelcomeMessage()
});

const commands = {
    clear: ['clear', 'clean', 'cls'],
    echo: ['echo', 'say'],
    help: ['help', '?'],
    os: ['os'],
    info: ['info', 'i'],
    file: ['file'],
    net: ['net'],
    cpuusage: ["cpuusage", "cpu"],
    mode: ['mode-view', 'mode-set', 'mode-liste']
};

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = input.value.trim();

        if (command === '') return;

        commandHistory.push(command);
        historyIndex = commandHistory.length;

        executeCommand(command);
        input.value = '';
    } else if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (event.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            input.value = '';
            historyIndex = commandHistory.length;
        }
    }
});

function executeCommand(command) {
    const [cmd, ...args] = command.split(' ');

 /*   const commandeFile = require('./src/commands/' + cmd + '.js');
    if (commandeFile == null) {
        terminal.innerHTML += `<br><br>Commande non trouvée: <red>${cmd}</red>`;
    }else{
        commandeFile.execute(terminal, args);
    }
    scrollToBottom();
  */ 
    if (commands.clear.includes(cmd)) {
        terminal.innerHTML = ''; // Efface
        scrollToBottom();
    } else if (commands.echo.includes(cmd)) {
        const formattedText = formatTextWithStyles(args.join(' '));
        terminal.innerHTML += '<br>' + formattedText;
        scrollToBottom();
    } else if (commands.help.includes(cmd)) {
        import('./src/commands/help.js').then(module => {
            terminal.innerHTML += formatTextWithStyles(module.help());
            scrollToBottom();
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de l'aide : ${err.message}`;
            scrollToBottom();
        });
    } else if (commands.os.includes(cmd)) {
        import('./src/commands/os.js').then(module => {
            module.osCommand(terminal); 
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });

    } else if (commands.info.includes(cmd)) {
        import('./src/commands/info.js').then(module => {
            module.infoCommand(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });    

    } else if (cmd === 'file-cd') {
        import('./src/commands/file.js').then(module => {
            module.cd(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-create') {
        import('./src/commands/file.js').then(module => {
            module.create(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-open') {
        import('./src/commands/file.js').then(module => {
            module.open(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-view') {
        import('./src/commands/file.js').then(module => {
            module.view(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-folder') {
        import('./src/commands/file.js').then(module => {
            module.folder(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-ls') {
        import('./src/commands/file.js').then(module => {
            module.file_ls(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === "top") {
        scrollToBottom();
    
    } else if (commands.cpuusage.includes(cmd)) {
        import('./src/commands/cpuusage.js').then(module => {
            module.cpuUsage(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ip') {
        import('./src/commands/net.js').then(module => {
            module.netIp(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ping') {
        import('./src/commands/net.js').then(module => {
            module.netPing(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'mode-view') {
        terminal.innerHTML += formatTextWithStyles(`<br><br>Mode actuel : <green>${currentMode}</green>`);
        scrollToBottom();
    } else if (cmd === 'mode-set') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun mode spécifié pour 'mode-set'.`);
        } else {
            const newMode = args[0].toLowerCase();
            if (themes[newMode] !== undefined) {
                currentMode = newMode;
                localStorage.setItem('themeMode', currentMode); 
                applyTheme(themes, currentMode);
                terminal.innerHTML += formatTextWithStyles(`<br><br>Mode changé en : <green>${currentMode}</green>`);
            } else {
                terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Mode non trouvé : ${newMode}`);
            }
        }
        scrollToBottom();
    } else if (cmd === 'mode-liste') {
        displayAvailableThemes()
        scrollToBottom();
    }  else if (cmd === 'apt-install') {
        import('./src/commands/file.js').then(module => {
            module.aptInstall(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'mode-install') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de thème spécifié.`);
        } else {
            const themeName = args[0].toLowerCase();
            installTheme(themeName);
        }
    } else if (cmd === 'mode-uninstall') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de thème spécifié.`);
        } else {
            const themeName = args[0].toLowerCase();
            uninstallTheme(themeName);
        }
    } else {
        terminal.innerHTML += `<br><br>Commande non trouvée: <red>${cmd}</red>`;
               scrollToBottom();
    }
}
















//MOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOODE


const themeInstallPath = path.join(__dirname, 'themeinstall.json');
let currentMode = localStorage.getItem('themeMode') || 'default';


function loadThemes() {
    const themes = {};
    
    if (fs.existsSync(themeInstallPath)) {
        const fileData = fs.readFileSync(themeInstallPath, 'utf8');
        const jsonContent = JSON.parse(fileData);
        
        jsonContent.installedThemes.forEach(theme => {
            themes[theme.name] = theme.properties;
        });
    }

    return themes;
}

let themes = loadThemes(); 

function updateThemeInstallFile() {
    const installedThemes = Object.keys(themes).map(themeName => ({
        name: themeName,
        properties: themes[themeName],
    }));
    
    fs.writeFileSync(themeInstallPath, JSON.stringify({ installedThemes: installedThemes }, null, 2), 'utf8');
}

function displayAvailableThemes() {
    const themeNames = Object.keys(themes);
    
    terminal.innerHTML += formatTextWithStyles(`<br><br>Thèmes disponibles :`);
    themeNames.forEach(theme => {
        terminal.innerHTML += formatTextWithStyles(`<br><br>- <green>${theme}</green>`);
    });
    
    updateThemeInstallFile();
    
    scrollToBottom();
}



function applyTheme(themes, mode) {
    console.log(themes, mode)
    if (mode === 'cook') {
        document.body.style.backgroundColor = getRandomColor();
        document.body.style.color = getRandomColor();
        document.documentElement.style.setProperty('--scrollbar-track', getRandomColor());
        document.documentElement.style.setProperty('--scrollbar-thumb', getRandomColor());
    } else {
        const theme = themes[mode] || themes.default;
        document.body.style.backgroundColor = theme.backgroundColor;
        document.body.style.color = theme.color;
        document.documentElement.style.setProperty('--scrollbar-track', theme['--scrollbar-track']);
        document.documentElement.style.setProperty('--scrollbar-thumb', theme['--scrollbar-thumb']);
        document.documentElement.style.setProperty('--input-background', theme['--input-background']);
        document.documentElement.style.setProperty('--input-color', theme['--input-color']);
    }
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

async function installTheme(themeName) {
    const themeUrl = 'https://termi-hub-app.github.io/assets/themes.json';

    try {
        const response = await fetch(themeUrl);
        const data = await response.json();

        if (data.themes && data.themes[themeName]) {
            // Ajouter le thème
            const newTheme = {
                name: themeName,
                properties: data.themes[themeName]
            };
            themes[themeName] = newTheme.properties;
            terminal.innerHTML += formatTextWithStyles(`<br><br>Thème <green>${themeName}</green> installé avec succès !`);

            // Charger les thèmes
            let installedThemes = [];
            if (fs.existsSync(themeInstallPath)) {
                const fileData = fs.readFileSync(themeInstallPath, 'utf8');
                const jsonContent = JSON.parse(fileData);
                installedThemes = jsonContent.installedThemes || [];
            }

            // Ajoute le thème a la liste
            if (!installedThemes.some(theme => theme.name === themeName)) {
                installedThemes.push(newTheme);

                // Met a jour le fichier themeinstall.json
                fs.writeFileSync(themeInstallPath, JSON.stringify({ installedThemes: installedThemes }, null, 2), 'utf8');
            }
        } else {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Thème non trouvé : ${themeName}`);
        }
    } catch (error) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de récupérer le thème depuis le fichier JSON : ${error.message}`);
    }
    scrollToBottom();
}


async function uninstallTheme(themeName) {
    if (!(themeName in themes) || (themeName === 'default' || themeName === 'halloween')) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de désinstaller le thème : ${themeName}.` +
            ` Ce thème ne peut pas être désinstallé.`);
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
    terminal.innerHTML += formatTextWithStyles(`<br><br>Thème <green>${themeName}</green> désinstallé avec succès !`);
}

