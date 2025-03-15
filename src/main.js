const { app, BrowserWindow, dialog, Menu, shell } = require('electron'); 
const fs = require('fs'); 
const https = require('https');
const os = require("os");
const path = require("path");

const { Client, register } = require('discord-rpc');

let mainWindow; 
let themes = {}; 
const themeInstallPath = path.join(__dirname, 'themeinstall.json'); 

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 600,
        height: 475,
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
        },
        //autoHideMenuBar: true,
    });

    mainWindow.loadFile('index.html');

    checkForUpdates();
    loadRPC();
}

const currentVersion = '1.1.0-b1';
const versionUrl = 'https://termi-hub-app.github.io/assets/app-database/version.json';

app.whenReady().then(() => {
    loadThemes(); 
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function checkForUpdates() {
    https.get(versionUrl, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            try {
                const { version: serverVersion, message, updateLink: link } = JSON.parse(data);

                if (serverVersion !== currentVersion) {
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        buttons: ['Update', 'Cancel and continue'],
                        title: 'Update available',
                        message: `${message}\nActual version: ${currentVersion}\nNew version: ${serverVersion}`,
                        detail: 'Click "Update" to download the newest version.',
                        noLink: true
                    }).then(result => {
                        if (result.response === 0) {
                            shell.openExternal(link);
                        }
                    });
                }
            } catch (error) {
                console.error('Erreur lors de l\'analyse des données de version:', error);
                dialog.showMessageBox(mainWindow, {
                    type: 'error',
                    title: 'Erreur',
                    message: `An error has occured, there possible solutions\n1. Verify your internet connection\n2. Reinstall TermiHub`,
                    detail: 'If the error occurs again, please contact our developers (@liveweeeb13 or @befaci.coolate on Discord)',
                    noLink: true
                });
            }
        });
    }).on('error', (err) => {
        console.error('Erreur lors de la vérification de la version:', err);
    });
}

const menuTemplate = [
    {
        label: 'App',
        submenu: [
            {
                label: 'Settings',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Settings',
                        message: 'Settings are not available yet.',
                    });
                }
            },
            {
                label: 'Quit',
                click: () => {
                    app.quit();
                },
            },
            {
                label: 'Reload',
                click: () => {
                    mainWindow.reload();
                }
            }
        ],
    },
    {
        label: 'Informations',
        submenu: [
            {
                label: 'Website',
                click: () => {
                    shell.openExternal('https://termi-hub-app.github.io/');
                },
            },
            {
                label: 'Discord',
                click: () => {
                    shell.openExternal('https://discord.gg/4baaMs9Mnt');
                },
            },
            {
                label: 'About',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'About TermiHub',
                        message: 'TermiHub is a terminal emulator developed by the TermiHub team.\n\nVersion: 1.0.0-b4',    //     pas mtn la license uwuw...     \n\nThis software is under the MIT license.
                    });
                },
            },
        ],
    },
    {
        label: 'Theme',
        submenu: [
            {
                label: 'Import a theme configuration',
                click: async () => {
                    const result = await dialog.showOpenDialog(mainWindow, {
                        properties: ['openFile'],
                        filters: [
                            { name: 'TermiHub Theme File', extensions: ['termtheme'] },
                            { name: 'JSON Theme File', extensions: ['json'] },
                        ],
                    });

                    if (!result.canceled && result.filePaths.length > 0) {
                        const filePath = result.filePaths[0];
                        importThemes(filePath);
                    }
                },
            },
            {
                label: 'Export a theme',
                click: async () => {
                    const result = await dialog.showSaveDialog(mainWindow, {
                        title: 'Export themes',
                        defaultPath: path.join(app.getPath('home'), 'termitheme.termtheme'),
                        filters: [
                            { name: 'TermiHub Theme File', extensions: ['termtheme'] },
                            { name: 'JSON Theme File', extensions: ['json'] },
                        ],
                    });

                    if (!result.canceled && result.filePath) {
                        exportThemes(result.filePath);
                    }
                },
            }
        ],
    }
];
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

function importThemes(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const themeData = JSON.parse(data);

        if (Array.isArray(themeData.installedThemes)) {
            themes = {}; 
            themeData.installedThemes.forEach(theme => {
                themes[theme.name] = theme.properties;
            });

            fs.writeFileSync(themeInstallPath, JSON.stringify(themeData, null, 2), 'utf-8');
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Import successfull',
                message: 'Les thèmes ont été importés avec succès.',
            });
        } else {
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Error while import',
                message: 'The Theme file does not contain valid themes.',
            });
        }
    } catch (error) {
        console.error('Erreur d\'importation :', error);
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Error',
            message: `An error has occured while importing the theme: ${error.message}`,
        });
    }
}

const themesDirPath = path.join(__dirname, 'STORAGE', 'themes');

function loadThemes() {
    try {
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
            console.log("Thèmes chargés avec succès:", themes);
        } else {
            console.log("Themes directory not found, creating the default theme.");
            fs.mkdirSync(themesDirPath, { recursive: true });
            exportThemes();
        }
    } catch (error) {
        console.error('Error while loading theme(s):', error);
    }
}

function exportThemes() {
    for (const [name, properties] of Object.entries(themes)) {
        const themeFilePath = path.join(themesDirPath, `${name}.json`);
        const themeData = { name, properties };
        fs.writeFile(themeFilePath, JSON.stringify(themeData, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error(`Error when exporting the theme ${name}:`, err);
            } else {
                console.log(`Theme ${name} exported successfully.`);
            }
        });
    }
}

function loadRPC() {
    const clientId = "1301104881687334922";

    register(clientId);

    const rpc = new Client({ transport: 'ipc' });
    rpc.on('ready', () => {
        rpc.setActivity({
            details: 'v1.0.1-b1',
            state: 'Using the terminal',
            largeImageKey: 'logo2',
            largeImageText: 'TermiHub\'s logo',
            instance: false
        });
    });
}
