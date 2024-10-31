const { app, BrowserWindow, dialog, Menu, shell } = require('electron'); 
const path = require('path');
const fs = require('fs'); 
const https = require('https');

let mainWindow; 
let themes = {}; 
const themeInstallPath = path.join(__dirname, 'themeinstall.json'); 

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
        },
        autoHideMenuBar: true,
    });

    mainWindow.loadFile('index.html');

    checkForUpdates();
    loadDiscordRPC();
    setActivity();
}

const update = true;
app.whenReady().then(createWindow);

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

const currentVersion = '1.0.0-b2';
const versionUrl = 'https://termi-hub-app.github.io/assets/ver.json';

function checkForUpdates() {
    https.get(versionUrl, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            try {
                const { version: serverVersion, message, updateLink } = JSON.parse(data);

                if (serverVersion !== currentVersion) {
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        buttons: ['Mettre à jour', 'Annuler'],
                        title: 'Mise à jour requise',
                        message: `${message}\nVersion actuelle: ${currentVersion}\nNouvelle version: ${serverVersion}`,
                        detail: 'Cliquez sur "Mettre à jour" pour télécharger la nouvelle version.',
                        noLink: true
                    }).then(result => {
                        if (result.response === 0) {
                            shell.openExternal(updateLink);
                        }
                    });
                }
            } catch (error) {
                console.error('Erreur lors de l\'analyse des données de version:', error);
                dialog.showMessageBox(mainWindow, {
                    type: 'error',
                    title: 'Erreur',
                    message: `Une erreur est survenue, voici les solutions disponibles\n1. Vérifiez votre connexion internet\n2. Réinstallez TermiHub`,
                    detail: 'Si l\'erreur persiste veuillez contacter le développeur (@liveweeeb13 sur discord)',
                    noLink: true
                }).then(result => {
                    if (result.response === 0) {
                        shell.openExternal(updateLink);
                    }
                });
            }
        });
    }).on('error', (err) => {
        console.error('Erreur lors de la vérification de la version:', err);
    });
}

const clientId = '1301104881687334922';
const startTimestamp = Date.now();
let DiscordRPC = null;

async function loadDiscordRPC() {
    try {
        DiscordRPC = require('discord-rpc');
    } catch (error) {
        console.error('Impossible de charger discord-rpc');
        DiscordRPC = null;
    }
}

async function setActivity() {
    if (!DiscordRPC || !mainWindow) {
        return;
    }

    const url = mainWindow.webContents.getURL();

    const rpc = new DiscordRPC.Client({ transport: 'ipc' });
    try {
        await rpc.login({ clientId });
        await rpc.setActivity({
            startTimestamp,
            largeImageKey: 'logo2',
            largeImageText: `TermiHub ${currentVersion}`,
            smallImageKey: 'small_image',
            smallImageText: 'Status',
            instance: false,
        });
    } catch (err) {
        console.error('Erreur lors de la définition de l\'activité Discord:', err);
    }
}

const menuTemplate = [
    {
        label: 'Info',
        submenu: [
            {
                label: 'Discord',
                click: () => {
                    shell.openExternal('https://discord.gg/4baaMs9Mnt');
                },
            },
        ],
    },
    {
        label: 'Thème',
        submenu: [
            {
                label: 'Importer la config thème',
                click: async () => {
                    const result = await dialog.showOpenDialog(mainWindow, {
                        properties: ['openFile'],
                        filters: [
                            { name: 'JSON Files', extensions: ['json'] },
                        ],
                    });

                    if (!result.canceled && result.filePaths.length > 0) {
                        const filePath = result.filePaths[0];
                        importThemes(filePath);
                    }
                },
            },
            {
                label: 'Exporter un Thème',
                click: async () => {
                    const result = await dialog.showSaveDialog(mainWindow, {
                        title: 'Exporter les Thèmes',
                        defaultPath: path.join(app.getPath('desktop'), 'themeinstall.json'),
                        filters: [
                            { name: 'JSON Files', extensions: ['json'] },
                        ],
                    });

                    if (!result.canceled && result.filePath) {
                        exportThemes(result.filePath);
                    }
                },
            }
        ],
    },
];
const menu = Menu.buildFromTemplate(menuTemplate);
// Menu.setApplicationMenu(menu);

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
       //     console.log('Thèmes importés avec succès.');
            app.quit();
            createWindow()
        } else {
     //       console.error('Format de données incorrect, attendu un tableau de themes.');
        }
    } catch (error) {
     //   console.error('Erreur d\'importation :', error);
    }
}

const themeFilePath = path.join(__dirname, 'themeinstall.json');

function loadThemes() {
    try {
        if (fs.existsSync(themeFilePath)) {
            const data = fs.readFileSync(themeFilePath, 'utf-8');
            const themeData = JSON.parse(data);
            if (Array.isArray(themeData.installedThemes)) {
                themeData.installedThemes.forEach(theme => {
                    themes[theme.name] = theme.properties;
                });
           //    console.log("Thèmes chargés avec succès:", themes);
            }
        } else {
      //      console.log("Aucun fichier de thème trouvé, création d'un fichier par défaut.");
            exportThemes(themeFilePath);
        }
    } catch (error) {
  //      console.error('Erreur lors du chargement des thèmes:', error);
    }
}

function exportThemes(filePath) {
    const themesToExport = { installedThemes: [] };

    for (const [name, properties] of Object.entries(themes)) {
        themesToExport.installedThemes.push({ name, properties });
    }

    fs.writeFile(filePath, JSON.stringify(themesToExport, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Erreur lors de l\'exportation des thèmes :', err);
        } else {
   //         console.log('Thèmes exportés avec succès dans', filePath);
        }
    });
}

loadThemes()