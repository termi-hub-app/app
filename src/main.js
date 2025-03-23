const { app, BrowserWindow, dialog, Menu, shell, ipcMain } = require('electron'); 
const fs = require('fs'); 
const https = require('https');
const os = require("os");
const path = require("path");

const _APPINFO = require('./_APPINFO');

let mainWindow;
let SettingsWindow;
let themes = {}; 
const themeInstallPath = path.join(__dirname, 'themeinstall.json'); 

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 750,
        height: 550,
        icon: path.join(__dirname, 'logo.png'),
        frame: false,
        center: true,
        transparent: false,
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
            sandbox: false,
            devTools: true,
            disableHtmlFullscreenWindowResize: true
        },
    });

    ipcMain.on('window-minimize-MAIN', () => {
        mainWindow.minimize();
    });

    ipcMain.on('window-maximize-MAIN', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('window-close-MAIN', () => {
        if (SettingsWindow) {
            SettingsWindow.close();
        }
        SettingsWindow ? setTimeout(() => { app.quit(); }, 200) : app.quit();
    });

    mainWindow.loadFile(path.join(__dirname, 'window', 'index.html'));
    
    ipcMain.on('show-settings-dialog', () => {
            if (SettingsWindow) {
                closeSettings();
                openSettings();
            }

            openSettings();
        });

        ipcMain.on('open-website', () => {
            shell.openExternal(_APPINFO.website);
        });
        ipcMain.on('open-discord', () => {
            shell.openExternal(_APPINFO.discord);
        });
        ipcMain.on('show-about-dialog', () => {
            dialog.showMessageBox(
                mainWindow,
                {
                    type: 'info',
                    textWidth: 10,

                    title: "About TermiHub",
                    detail: `Version: ${_APPINFO.version.full}`,
                    message: `Website:${_APP.website}\nGitHub: ${_APP.github}\nAuthor(s): ${_APP.authors}\nLicense: ${_APP.license[1]}`,

                    buttons: ['Close']
                }
            );
        });

        ipcMain.on('app-quit', () => {
            app.quit();
        });
        ipcMain.on('app-reload', () => {
            mainWindow.reload();
            if (SettingsWindow || SettingsWindow !== undefined) SettingsWindow.reload();
        });

        ipcMain.on('import-theme', async () => {
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
        });
        ipcMain.on('export-theme', async () => {
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
        });

    /*// */   mainWindow.webContents.openDevTools()//DEBUGMODE ONLY

    checkForUpdates();
    loadRPC();
}

function openSettings() {
    SettingsWindow = new BrowserWindow({
        width: 475,
        height: 775,
        icon: path.join(__dirname, 'logo.png'),
        frame: false,
        center: true,
        transparent: false,
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
            sandbox: false,
            devTools: true,
            disableHtmlFullscreenWindowResize: true
        },
        resizable: false,
        //movable: false      c pas sur linux, donc c injuste
    });

    ipcMain.on('window-minimize-SETTING', () => {
        SettingsWindow.minimize();
    });

    ipcMain.on('window-maximize-SETTING', () => {
        if (SettingsWindow.isMaximized()) {
            SettingsWindow.unmaximize();
        } else {
            SettingsWindow.maximize();
        }
    });

    ipcMain.on('window-close-SETTING', () => {
        closeSettings();
    });

    SettingsWindow.loadFile(path.join(__dirname, 'window', 'settings', 'index.html'));
}

function closeSettings() {
    SettingsWindow.close();
    SettingsWindow = undefined;
}

const currentVersion = '1.1.0-b1';
const versionUrl = 'https://termi-hub-app.github.io/assets/app-database/version.json';

app.whenReady().then(() => {
    createWindow();
    loadThemes();
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
                    title: 'Error',
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

const RPCManager = require('./utils/DiscordRPC');
let rpcManager = null;

async function loadRPC() {
    try {
        rpcManager = new RPCManager();
        await rpcManager.initialize(_APPINFO.version.full);

        mainWindow.on('focus', () => {
            if (rpcManager) rpcManager.updatePresence(true, _APPINFO.version.full);
        });
        mainWindow.on('blur', () => {
            if (rpcManager) rpcManager.updatePresence(false, _APPINFO.version.full);
        });

    } catch (error) {
        console.error('Failed to initialize Discord RPC:', error);
        rpcManager = null;
    }
}

app.on('before-quit', () => {
    if (rpcManager) {
        rpcManager.destroy();
        rpcManager = null;
    }
});
