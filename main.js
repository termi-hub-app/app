const { app, BrowserWindow, dialog, shell } = require('electron'); 
const path = require('path');
const https = require('https');

let mainWindow; 
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
                  title: 'Erreur Provided',
                  message: `Une erreur est survenue, voici les solutions disponibles\n1. Vérifiez votre connection internet\n2. Réinstallez TermiHub`,
                  detail: 'Si l\'erreur persiste veuillez contacter le développeur (@liveweeeb13 sur discord) ',
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