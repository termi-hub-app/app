const terminal = document.getElementById('terminal');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron')
const input = document.getElementById('input');
const formatTextWithStyles = require('./src/utils/formatTextWithStyles');


let commandHistory = [];
let historyIndex = -1;

function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

function showWelcomeMessage() {
    terminal.innerHTML += formatTextWithStyles(`<br><strong>Bienvenue sur <underline>TermiHub <italic>1.0.0-b4</italic></underline></strong> !<br><strong>Mode actuel :</strong> <green>${currentMode}</green><br><strong>Tapez <green>?</green> pour avoir de l\'aide</strong>`);
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
    mode: ['mode-view', 'mode-set', 'mode-liste'],
    whois: ['whois'],
    test: ['test' ,'t'],
    ramusage: ["ram", 'ru'],
    diskUsage: ['disk', 'du']
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


document.addEventListener('keydown', (event) => {
    if (document.activeElement !== input && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        input.focus();
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
        terminal.innerHTML = ''; 
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

    } else if (cmd === 'file-cd' || cmd === 'cd') {
        import('./src/commands/file.js').then(module => {
            module.cd(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-create' || cmd === 'create') {
        import('./src/commands/file.js').then(module => {
            module.create(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-open' || cmd === 'open') {
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
    } else if (cmd === 'file-folder' || cmd === 'folder') {
        import('./src/commands/file.js').then(module => {
            module.folder(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-ls' || cmd === 'ls') {
        import('./src/commands/file.js').then(module => {
            module.file_ls(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === "scroll") {
        scrollToBottom();
    
    } else if (commands.cpuusage.includes(cmd)) {
        import('./src/commands/cpuusage.js').then(module => {
            module.cpuUsage(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ip' || cmd === 'ip') {
        import('./src/commands/net.js').then(module => {
            module.netIp(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ping' || cmd === 'ping') {
        import('./src/commands/net.js').then(module => {
            module.netPing(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'theme-view') {
        terminal.innerHTML += formatTextWithStyles(`<br><br>Mode actuel : <green>${currentMode}</green>`);
        scrollToBottom();
    } else if (cmd === 'theme-set') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun mode spécifié pour 'theme-set'.`);
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
    } else if (cmd === 'liste' || cmd === 'theme-liste') {
        displayAvailableThemes();
        scrollToBottom();
    }  else if (cmd === 'apt-install') {
        import('./src/commands/file.js').then(module => {
            module.aptInstall(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'theme-install'|| cmd === 'theme-add') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de thème spécifié.`);
        } else {
            const themeName = args[0].toLowerCase();
            installTheme(themeName);
        }
    } else if (cmd === 'theme-uninstall' || cmd === 'theme-remove') {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de thème spécifié.`);
        } else {
            const themeName = args[0].toLowerCase();
            uninstallTheme(themeName);
        }    
    } else if (commands.whois.includes(cmd)) {
        if (args.length === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun domaine spécifié. Utilisation : whois <url> [-4 | -6 | -ping]<br>`);
        } else {
            const url = args[0]; 
            const options = {
                ipv4: args.includes('-4'), 
                ipv6: args.includes('-6'), 
                ping: args.includes('-ping') 
            };
            import('./src/commands/whois.js').then(module => {
                module.whoisCommand(terminal, url, options);
            }).catch(err => {
                terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
                scrollToBottom()
            });
        }
        
     } else if (commands.ramusage.includes(cmd)) {
        import('./src/commands/ramusage.js').then(module => {
            module.memUsage(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom();
        });

    } else if (commands.diskUsage.includes(cmd)) {
        import('./src/commands/diskusage.js').then(module => {
            module.getDiskUsage(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom();
        });

    } else if (commands.test.includes(cmd)) {
        import('./src/commands/test.js').then(module => {
            module.testCommand(terminal) 
            scrollToBottom()
        });
        } else if (cmd === 'pingouin') {
            shell.openExternal('pingouin');
            scrollToBottom();
        } else {
        terminal.innerHTML += `<br><br>Commande non trouvée: <red>${cmd}</red>`;
               scrollToBottom();
    }
}
















//MOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOODE


const localeDir = path.join(process.env.APPDATA || path.join(process.env.HOME, '.config'), 'termihub', 'locales');
const themeInstallPath = path.join(localeDir, 'themeinstall.json');

function createDefaultThemeFile() {
    if (!fs.existsSync(themeInstallPath)) {
        const defaultThemes = {
            "installedThemes": [
                {
                    "name": "default",
                    "properties": {
                        "backgroundColor": "black",
                        "color": "white",
                        "--scrollbar-track": "#1b1b1b",
                        "--scrollbar-thumb": "#555",
                        "--input-background": "#333",
                        "--input-color": "white"
                    }
                },
                {
                    "name": "light",
                    "properties": {
                        "backgroundColor": "white",
                        "color": "black",
                        "--scrollbar-track": "#555",
                        "--scrollbar-thumb": "#1b1b1b",
                        "--input-background": "white",
                        "--input-color": "#333"
                    }
                },
                {
                    "name": "halloween",
                    "properties": {
                        "backgroundColor": "#1a1a1a",
                        "color": "#ff7518",
                        "--scrollbar-track": "#2c2c2c",
                        "--scrollbar-thumb": "#ff7518",
                        "--input-background": "#333",
                        "--input-color": "white"
                    }
                }
            ]
        };
        
        fs.mkdirSync(localeDir, { recursive: true });
        fs.writeFileSync(themeInstallPath, JSON.stringify(defaultThemes, null, 2), 'utf8');
        console.log(`Fichier ${themeInstallPath} créé avec les thèmes par défaut.`);
    } else {
        console.log(`Le fichier ${themeInstallPath} existe déjà, pas de création nécessaire.`);
    }
}

createDefaultThemeFile(); 

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
    
    terminal.innerHTML += formatTextWithStyles(`<br><br><strong>Thèmes disponibles :</strong>`);
    themeNames.forEach(theme => {
        terminal.innerHTML += formatTextWithStyles(`<br><br><strong>-</strong> <green>${theme}</green>`);
    });
    
    updateThemeInstallFile();
    
    scrollToBottom();
}


function applyTheme(themes, mode) {
    console.log(themes, mode);

    if (mode === 'cook') {
        document.body.style.backgroundColor = getRandomColor();
        document.body.style.color = getRandomColor();
        document.documentElement.style.setProperty('--scrollbar-track', getRandomColor());
        document.documentElement.style.setProperty('--scrollbar-thumb', getRandomColor());
    } else {
        const theme = themes[mode] || themes.default;

        if (theme) {
            Object.keys(theme).forEach(property => {
                if (property.startsWith('--')) {
                    document.documentElement.style.setProperty(property, theme[property]);
                } else {
                    document.body.style[property] = theme[property];
                }
            });
        } else {
            console.error(`Le thème '${mode}' n'existe pas et aucun thème par défaut n'a été défini.`);
        }
    }
}
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

async function installTheme(themeName) {
    const themeUrl = 'https://termi-hub-app.github.io/assets/themes.json';
    const startTime = Date.now()
    try {
        const response = await fetch(themeUrl);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        const data = await response.json();
            terminal.innerHTML += formatTextWithStyles(`<br><br><purple>Installation du theme ${themeName}...</puple>`)
        if (data.themes && data.themes[themeName]) {
            const newTheme = {
                name: themeName,
                properties: data.themes[themeName]
            };


            if (themes[themeName]) {
                terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Le thème <italic>${themeName}</italic> est déjà installé.`);
                scrollToBottom();
                return;
            }

            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2); 
            themes[themeName] = newTheme.properties;
            terminal.innerHTML += formatTextWithStyles(`<br><br>Thème <green><strong>${themeName}</strong></green> installé avec succès !`);

            let installedThemes = [];
            if (fs.existsSync(themeInstallPath)) {
                const fileData = fs.readFileSync(themeInstallPath, 'utf8');
                const jsonContent = JSON.parse(fileData);
                installedThemes = jsonContent.installedThemes || [];
            }

            installedThemes.push(newTheme);
            fs.writeFileSync(themeInstallPath, JSON.stringify({ installedThemes: installedThemes }, null, 2), 'utf8');
        } else {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Thème non trouvé : <italic>${themeName}</italic>`);
        }
    } catch (error) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de récupérer le thème : ${error.message}`);
    }
    scrollToBottom();
}

async function uninstallTheme(themeName) {
    if (!(themeName in themes) || (['default', 'halloween', 'light'].includes(themeName))) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de désinstaller le thème <italic>${themeName}</italic>.` +
            ` Ce thème ne peut pas être désinstallé.`);
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
    terminal.innerHTML += formatTextWithStyles(`<br><br>Thème <green><strong>${themeName}</strong></green> désinstallé avec succès !`);
    scrollToBottom();
}